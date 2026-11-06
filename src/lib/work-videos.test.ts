import { describe, expect, it } from "bun:test";
import { checkVideoFile, MAX_VIDEO_BYTES } from "./work-videos";

describe("checkVideoFile", () => {
  it("accepts MP4, WebM and MOV", () => {
    expect(checkVideoFile({ name: "a.mp4", type: "video/mp4", size: 10 })).toMatchObject({ ok: true, mime: "video/mp4" });
    expect(checkVideoFile({ name: "a.WEBM", type: "video/webm", size: 10 })).toMatchObject({ ok: true });
    expect(checkVideoFile({ name: "a.mov", type: "video/quicktime", size: 10 })).toMatchObject({ ok: true, mime: "video/quicktime" });
  });
  it("rejects executables and unknown types", () => {
    expect(checkVideoFile({ name: "a.exe", type: "application/octet-stream", size: 10 }).ok).toBe(false);
    expect(checkVideoFile({ name: "a.avi", type: "video/x-msvideo", size: 10 }).ok).toBe(false);
  });
  it("rejects mismatched MIME", () => {
    expect(checkVideoFile({ name: "a.mp4", type: "application/x-msdownload", size: 10 }).ok).toBe(false);
  });
  it("limits size to 100 MB", () => {
    expect(checkVideoFile({ name: "a.mp4", type: "video/mp4", size: MAX_VIDEO_BYTES }).ok).toBe(true);
    expect(checkVideoFile({ name: "a.mp4", type: "video/mp4", size: MAX_VIDEO_BYTES + 1 }).ok).toBe(false);
  });
});
