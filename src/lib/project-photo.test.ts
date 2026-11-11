import { test } from "node:test";
import assert from "node:assert/strict";
import { photoFormat, prepareProjectPhoto } from "./project-photo";

test("fallback PNG keeps its bytes, png extension and MIME instead of masquerading as JPEG", async () => {
  const file = new File([new Uint8Array([137,80,78,71,13,10,26,10,0])], "photo.png", { type: "image/png" });
  const result = await prepareProjectPhoto(file);
  assert.equal(result.blob, file);
  assert.equal(result.ext, "png");
  assert.equal(result.mime, "image/png");
});
test("JPEG bytes determine format even with empty or incorrect reported MIME", async () => {
  const file = new File([new Uint8Array([255,216,255,224])], "photo", { type: "image/png" });
  assert.deepEqual(await photoFormat(file), { mime: "image/jpeg", ext: "jpg" });
});
test("non-image bytes are rejected before Storage upload", async () => {
  await assert.rejects(photoFormat(new Blob(["executable"], { type: "image/jpeg" })));
});