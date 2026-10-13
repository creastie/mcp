import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, describe, it } from "node:test";

import type { CreastieApiClient } from "./client.js";
import {
  CHUNK_SIZE_DEFAULT,
  getUploadProgress,
  splitFileIntoChunks,
  uploadResumableFile,
} from "./upload.js";

const MB = 1024 * 1024;

describe("upload", () => {
  let dir: string;
  let file5mb: string;
  let file1kb: string;
  let emptyFile: string;

  before(async () => {
    dir = await mkdtemp(join(tmpdir(), "creastie-mcp-upload-"));
    file5mb = join(dir, "video.mp4");
    file1kb = join(dir, "small.png");
    emptyFile = join(dir, "empty.bin");
    const big = Buffer.alloc(5 * MB);
    for (let i = 0; i < big.length; i += 1) big[i] = i % 251;
    await writeFile(file5mb, big);
    await writeFile(file1kb, Buffer.alloc(1024, 7));
    await writeFile(emptyFile, Buffer.alloc(0));
  });

  after(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("default chunk size is 2MB", () => {
    assert.equal(CHUNK_SIZE_DEFAULT, 2 * 1024 * 1024);
  });

  it("splits 5MB file into 3 chunks at 2MB", async () => {
    const chunks = [];
    for await (const chunk of splitFileIntoChunks(file5mb, 2 * MB)) {
      chunks.push(chunk);
    }
    assert.equal(chunks.length, 3);
    assert.deepEqual(
      chunks.map((c) => [c.number, c.total, c.buffer.length]),
      [
        [1, 3, 2 * MB],
        [2, 3, 2 * MB],
        [3, 3, 1 * MB],
      ],
    );
  });

  it("chunks reassemble to original content", async () => {
    const parts: Buffer[] = [];
    for await (const chunk of splitFileIntoChunks(file5mb, 2 * MB)) {
      parts.push(chunk.buffer);
    }
    const joined = Buffer.concat(parts);
    assert.equal(joined.length, 5 * MB);
    assert.equal(joined[0], 0);
    assert.equal(joined[5 * MB - 1], (5 * MB - 1) % 251);
  });

  it("small file yields single chunk", async () => {
    const chunks = [];
    for await (const chunk of splitFileIntoChunks(file1kb, CHUNK_SIZE_DEFAULT)) {
      chunks.push(chunk);
    }
    assert.equal(chunks.length, 1);
    assert.equal(chunks[0].total, 1);
  });

  it("empty file yields no chunks", async () => {
    const chunks = [];
    for await (const chunk of splitFileIntoChunks(emptyFile, MB)) {
      chunks.push(chunk);
    }
    assert.equal(chunks.length, 0);
  });

  it("rejects non-positive chunk size", async () => {
    await assert.rejects(async () => {
      for await (const _ of splitFileIntoChunks(file1kb, 0)) {
        // noop
      }
    });
  });

  it("uploads chunks with resumable fields and tracks progress", async () => {
    const calls: { path: string; form: FormData }[] = [];
    const progressSeen: (number | undefined)[] = [];
    const id = "test-resumable-id";
    const client = {
      async uploadMultipart(path: string, form: FormData) {
        calls.push({ path, form });
        progressSeen.push(getUploadProgress(id)?.doneChunks);
        if (calls.length < 3) {
          return { done: calls.length * 33, status: true };
        }
        return { id: 42, url: "https://cdn/x.mp4" };
      },
    } as unknown as CreastieApiClient;

    const result = await uploadResumableFile(client, file5mb, {
      resumableId: id,
      chunkSize: 2 * MB,
    });

    assert.deepEqual(result, { id: 42, url: "https://cdn/x.mp4" });
    assert.equal(calls.length, 3);
    for (const [i, call] of calls.entries()) {
      assert.equal(call.path, "/my/media/upload");
      assert.equal(call.form.get("resumableChunkNumber"), String(i + 1));
      assert.equal(call.form.get("resumableTotalChunks"), "3");
      assert.equal(call.form.get("resumableChunkSize"), String(2 * MB));
      assert.equal(call.form.get("resumableTotalSize"), String(5 * MB));
      assert.equal(call.form.get("resumableIdentifier"), id);
      assert.equal(call.form.get("resumableFilename"), "video.mp4");
      assert.equal(call.form.get("resumableRelativePath"), "video.mp4");
      const media = call.form.get("media");
      assert.ok(media instanceof Blob);
      assert.equal(media.size, i < 2 ? 2 * MB : MB);
    }
    // progress is registered before first request and advances per chunk
    assert.deepEqual(progressSeen, [0, 1, 2]);
    assert.deepEqual(getUploadProgress(id), {
      doneChunks: 3,
      totalChunks: 3,
      percent: 100,
    });
  });

  it("getUploadProgress returns null for unknown id", () => {
    assert.equal(getUploadProgress("nope"), null);
  });

  it("propagates upload errors and keeps partial progress", async () => {
    const id = "failing-id";
    let n = 0;
    const client = {
      async uploadMultipart() {
        n += 1;
        if (n === 2) throw new Error("HTTP 500: boom");
        return { done: 50, status: true };
      },
    } as unknown as CreastieApiClient;

    await assert.rejects(
      uploadResumableFile(client, file5mb, { resumableId: id, chunkSize: 2 * MB }),
      /boom/,
    );
    assert.equal(getUploadProgress(id)?.doneChunks, 1);
  });
});
