import { test } from "node:test";
import assert from "node:assert/strict";
import { proxySiteBackend } from "./site-backend-proxy.server";
import { projectRequestError } from "./project-request-error";

const config = { url: "https://backend.example", key: "public-test-key" };

test("project PATCH forwards only caller credentials and text, preserves returned row", async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async (input, init) => {
    calls++;
    assert.equal(String(input), "https://backend.example/rest/v1/projects?id=eq.test&select=id");
    assert.equal(init?.method, "PATCH");
    const headers = new Headers(init?.headers);
    assert.equal(headers.get("authorization"), "Bearer caller-token");
    assert.equal(headers.get("cookie"), null);
    assert.equal(headers.get("apikey"), config.key);
    assert.equal(new TextDecoder().decode(init?.body as ArrayBuffer), '{"title":"changed","seo_description":"updated"}');
    return Response.json([{ id: "test" }]);
  };
  try {
    const response = await proxySiteBackend(new Request("https://site.example/api/public/sb/rest/v1/projects?id=eq.test&select=id", { method: "PATCH", headers: { authorization: "Bearer caller-token", cookie: "private=1" }, body: '{"title":"changed","seo_description":"updated"}' }), "rest/v1/projects", config);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), [{ id: "test" }]);
    assert.equal(calls, 1);
  } finally { globalThis.fetch = original; }
});

test("15-second timeout returns structured 504 and never retries a write", async () => {
  const original = globalThis.fetch;
  const originalTimer = globalThis.setTimeout;
  const originalLog = console.error;
  let calls = 0;
  let limit = 0;
  const logs: string[] = [];
  globalThis.setTimeout = ((callback: () => void, delay: number) => { limit = delay; return originalTimer(callback, 0); }) as typeof setTimeout;
  console.error = (...args) => { logs.push(JSON.stringify(args)); };
  globalThis.fetch = async (_input, init) => {
    calls++;
    return await new Promise<Response>((_resolve, reject) => init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError"))));
  };
  try {
    const response = await proxySiteBackend(new Request("https://site.example/api/public/sb/rest/v1/projects?id=eq.private-id", { method: "PATCH", headers: { authorization: "Bearer private-token" }, body: '{"title":"private-name"}' }), "rest/v1/projects", config);
    const body = await response.json();
    assert.equal(response.status, 504);
    assert.equal(body.code, "TIMEOUT");
    assert.equal(limit, 15_000);
    assert.equal(calls, 1);
    assert.equal(typeof body.message, "string");
    assert.equal(body.request_id, response.headers.get("x-request-id"));
    assert.match(logs.join(), /upstream-headers/);
    assert.doesNotMatch(logs.join(), /private-token|private-id|private-name/);
  } finally { globalThis.fetch = original; globalThis.setTimeout = originalTimer; console.error = originalLog; }
});

test("plain SDK timeout objects are surfaced and empty errors remain unconfirmed", () => {
  assert.match(projectRequestError({ error: "Backend unreachable from the site server (TIMEOUT)" }), /Сохранение не подтверждено/);
  assert.match(projectRequestError({ message: "", code: "" }), /Сохранение не подтверждено/);
  assert.equal(projectRequestError({ message: "Permission denied" }), "Permission denied");
});

test("proxy denies non-backend paths without outbound calls", async () => {
  assert.equal((await proxySiteBackend(new Request("https://site.example/api/public/sb/private"), "private", config)).status, 404);
  assert.equal((await proxySiteBackend(new Request("https://site.example/api/public/sb/rest/v1/../private"), "rest/v1/../private", config)).status, 404);
});

test("photo Storage rejection keeps real HTTP response and logs diagnostic status", async () => {
  const original = globalThis.fetch;
  const log = console.error;
  const messages: string[] = [];
  console.error = (...args) => { messages.push(JSON.stringify(args)); };
  globalThis.fetch = async () => Response.json({ statusCode: "403", error: "Unauthorized", message: "new row violates row-level security policy" }, { status: 400 });
  try {
    const response = await proxySiteBackend(new Request("https://site.example/api/public/sb/storage/v1/object/projects/test/photo.jpg", { method: "POST", body: "bytes" }), "storage/v1/object/projects/test/photo.jpg", config);
    assert.equal(response.status, 400);
    assert.equal((await response.json()).statusCode, "403");
    assert.match(messages.join(), /row-level security policy/);
    assert.match(messages.join(), /400/);
  } finally { globalThis.fetch = original; console.error = log; }
});