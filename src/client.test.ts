import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import { CreastieApiClient } from "./client.js";

describe("CreastieApiClient.uploadMultipart", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("sends auth + accept headers, no Content-Type, FormData body", async () => {
    let captured: { url: string; init: RequestInit } | undefined;
    globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
      captured = { url: String(url), init: init ?? {} };
      return new Response(JSON.stringify({ done: 50, status: true }), { status: 200 });
    }) as typeof fetch;

    const client = new CreastieApiClient({ baseUrl: "https://api.test/", token: "tok" });
    const form = new FormData();
    form.append("media", new Blob(["x"]), "a.png");

    const result = await client.uploadMultipart("/my/media/upload", form);

    assert.deepEqual(result, { done: 50, status: true });
    assert.equal(captured?.url, "https://api.test/my/media/upload");
    assert.equal(captured?.init.method, "POST");
    assert.equal(captured?.init.body, form);
    const headers = captured?.init.headers as Record<string, string>;
    assert.equal(headers.Authorization, "Bearer tok");
    assert.equal(headers.Accept, "application/json");
    assert.ok(!Object.keys(headers).some((k) => k.toLowerCase() === "content-type"));
  });

  it("throws on HTTP error", async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ message: "nope" }), { status: 422 })) as typeof fetch;
    const client = new CreastieApiClient({ baseUrl: "https://api.test", token: "tok" });
    await assert.rejects(client.uploadMultipart("/x", new FormData()), /HTTP 422: nope/);
  });
});
