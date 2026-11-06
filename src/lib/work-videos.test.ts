import { test } from "node:test";
import assert from "node:assert/strict";
import { checkVideoFile, MAX_VIDEO_BYTES } from "./work-videos";

test("accepts MP4, WebM and MOV", () => {
  assert.equal(checkVideoFile({ name: "a.mp4", type: "video/mp4", size: 10 }).ok, true);
  assert.equal(checkVideoFile({ name: "a.WEBM", type: "video/webm", size: 10 }).ok, true);
  assert.equal(checkVideoFile({ name: "a.mov", type: "video/quicktime", size: 10 }).ok, true);
});

test("rejects executables and unknown types", () => {
  assert.equal(checkVideoFile({ name: "a.exe", type: "application/octet-stream", size: 10 }).ok, false);
  assert.equal(checkVideoFile({ name: "a.avi", type: "video/x-msvideo", size: 10 }).ok, false);
});

test("rejects MIME that does not match the extension", () => {
  assert.equal(checkVideoFile({ name: "a.mp4", type: "application/x-msdownload", size: 10 }).ok, false);
});

test("limits size to 100 MB", () => {
  assert.equal(checkVideoFile({ name: "a.mp4", type: "video/mp4", size: MAX_VIDEO_BYTES }).ok, true);
  assert.equal(checkVideoFile({ name: "a.mp4", type: "video/mp4", size: MAX_VIDEO_BYTES + 1 }).ok, false);
});
