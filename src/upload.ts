import { randomUUID } from "node:crypto";
import { open, stat } from "node:fs/promises";
import { basename } from "node:path";

import type { CreastieApiClient } from "./client.js";

export const CHUNK_SIZE_DEFAULT = 2 * 1024 * 1024;

export const UPLOAD_ENDPOINT = "/my/media/upload";

export type FileChunk = {
  buffer: Buffer;
  /** 1-based chunk number (ResumableJS convention). */
  number: number;
  total: number;
};

export type UploadProgress = {
  doneChunks: number;
  totalChunks: number;
  percent: number;
};

type ProgressState = {
  doneChunks: number;
  totalChunks: number;
  /** Last percent reported by the server (`done` field), if any. */
  serverPercent?: number;
  complete: boolean;
};

const progressById = new Map<string, ProgressState>();

/** Read a file sequentially in slices of `chunkSizeBytes`. */
export async function* splitFileIntoChunks(
  path: string,
  chunkSizeBytes: number,
): AsyncGenerator<FileChunk> {
  if (!Number.isInteger(chunkSizeBytes) || chunkSizeBytes <= 0) {
    throw new Error("chunkSizeBytes must be a positive integer");
  }

  const { size } = await stat(path);
  const total = Math.ceil(size / chunkSizeBytes);
  const handle = await open(path, "r");

  try {
    for (let index = 0; index < total; index += 1) {
      const length = Math.min(chunkSizeBytes, size - index * chunkSizeBytes);
      const buffer = Buffer.alloc(length);
      let offset = 0;
      while (offset < length) {
        const { bytesRead } = await handle.read(
          buffer,
          offset,
          length - offset,
          index * chunkSizeBytes + offset,
        );
        if (bytesRead === 0) break;
        offset += bytesRead;
      }
      yield { buffer: offset === length ? buffer : buffer.subarray(0, offset), number: index + 1, total };
    }
  } finally {
    await handle.close();
  }
}

export function getUploadProgress(resumableId: string): UploadProgress | null {
  const state = progressById.get(resumableId);
  if (!state) return null;

  const computed =
    state.totalChunks === 0 ? 100 : Math.round((state.doneChunks / state.totalChunks) * 100);
  const percent = state.complete ? 100 : Math.min(100, Math.max(computed, state.serverPercent ?? 0));

  return { doneChunks: state.doneChunks, totalChunks: state.totalChunks, percent };
}

function buildChunkForm(args: {
  chunk: FileChunk;
  chunkSize: number;
  totalSize: number;
  resumableId: string;
  filename: string;
}): FormData {
  const { chunk, chunkSize, totalSize, resumableId, filename } = args;
  const form = new FormData();

  form.append("resumableChunkNumber", String(chunk.number));
  form.append("resumableTotalChunks", String(chunk.total));
  form.append("resumableChunkSize", String(chunkSize));
  form.append("resumableTotalSize", String(totalSize));
  form.append("resumableIdentifier", resumableId);
  form.append("resumableFilename", filename);
  form.append("resumableRelativePath", filename);
  // File field goes last so servers parsing streams see metadata first.
  form.append("media", new Blob([new Uint8Array(chunk.buffer)]), filename);

  return form;
}

function readServerPercent(response: unknown): number | undefined {
  if (response && typeof response === "object" && "done" in response) {
    const done = Number((response as { done: unknown }).done);
    if (Number.isFinite(done)) return Math.min(100, Math.max(0, done));
  }
  return undefined;
}

/**
 * Upload a local file to `POST /my/media/upload` using the ResumableJS chunk protocol.
 * Resolves with the response of the final chunk (the created media payload).
 */
export async function uploadResumableFile(
  client: CreastieApiClient,
  path: string,
  opts: { resumableId?: string; chunkSize?: number } = {},
): Promise<unknown> {
  const chunkSize = opts.chunkSize ?? CHUNK_SIZE_DEFAULT;
  const resumableId = opts.resumableId ?? randomUUID();
  const filename = basename(path);
  const { size: totalSize } = await stat(path);
  const totalChunks = Math.ceil(totalSize / chunkSize);

  if (totalSize === 0) {
    throw new Error(`Cannot upload empty file: ${path}`);
  }

  const state: ProgressState = { doneChunks: 0, totalChunks, complete: false };
  progressById.set(resumableId, state);

  let lastResponse: unknown = null;

  for await (const chunk of splitFileIntoChunks(path, chunkSize)) {
    const form = buildChunkForm({ chunk, chunkSize, totalSize, resumableId, filename });
    lastResponse = await client.uploadMultipart(UPLOAD_ENDPOINT, form);

    state.doneChunks = chunk.number;
    state.serverPercent = readServerPercent(lastResponse);
  }

  state.complete = true;
  state.serverPercent = 100;

  return lastResponse;
}
