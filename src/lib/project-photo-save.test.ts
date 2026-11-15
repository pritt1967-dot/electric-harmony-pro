import { test } from "node:test";
import assert from "node:assert/strict";
import { saveProjectPhoto, type PendingPhoto, type PhotoSaveIO } from "./project-photo-save";

function setup() {
  const photo: PendingPhoto = { id: "fixed-id", project_id: "p", storage_path: "p/a.jpg", image_url: "/api/public/photo/p/a.jpg", sort_order: 11, stored: false, complete: false };
  const calls = { upload: 0, insert: 0 };
  const io: PhotoSaveIO = {
    upload: async () => { calls.upload++; return { error: null }; },
    exists: async () => false,
    insert: async () => { calls.insert++; return { error: null, data: { id: photo.id } }; },
    read: async () => false, persist: () => {}, log: () => {},
  };
  return { photo, calls, io };
}
test("one photo uploads once and requires a returned database row", async () => {
  const { photo, calls, io } = setup();
  await saveProjectPhoto(photo, io, false);
  await saveProjectPhoto(photo, io, true);
  assert.deepEqual(calls, { upload: 1, insert: 1 });
  assert.equal(photo.complete, true);
});
test("metadata failure resumes without uploading the stored file again", async () => {
  const { photo, calls, io } = setup();
  const insert = io.insert;
  io.insert = async () => { calls.insert++; return { error: new Error("504") }; };
  await assert.rejects(saveProjectPhoto(photo, io, false), /504/);
  assert.equal(photo.stored, true);
  io.insert = insert;
  await saveProjectPhoto(photo, io, true);
  assert.deepEqual(calls, { upload: 1, insert: 2 });
});
test("lost insert response reads committed row without a duplicate write", async () => {
  const { photo, calls, io } = setup();
  io.insert = async () => { calls.insert++; return { error: new Error("TIMEOUT") }; };
  io.read = async () => true;
  await saveProjectPhoto(photo, io, false);
  assert.deepEqual(calls, { upload: 1, insert: 1 });
  assert.equal(photo.complete, true);
});
test("unknown upload outcome never sends the same file again", async () => {
  const { photo, calls, io } = setup();
  io.upload = async () => { calls.upload++; return { error: new Error("TIMEOUT") }; };
  await assert.rejects(saveProjectPhoto(photo, io, false), /TIMEOUT/);
  await assert.rejects(saveProjectPhoto(photo, io, true), /повторно не отправлен/);
  assert.deepEqual(calls, { upload: 1, insert: 0 });
});
test("uploaded file with lost response is recovered by storage read", async () => {
  const { photo, calls, io } = setup();
  io.upload = async () => { calls.upload++; return { error: new Error("TIMEOUT") }; };
  io.exists = async () => true;
  await saveProjectPhoto(photo, io, false);
  assert.equal(photo.complete, true);
  assert.deepEqual(calls, { upload: 1, insert: 1 });
});