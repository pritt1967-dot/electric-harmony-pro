export type PendingPhoto = {
  id: string; project_id: string; storage_path: string; image_url: string;
  sort_order: number; stored: boolean; complete: boolean;
};
type Result = { error: unknown; data?: unknown };
export type PhotoSaveIO = {
  upload: () => Promise<Result>;
  exists: () => Promise<boolean>;
  insert: () => Promise<Result>;
  read: () => Promise<boolean>;
  persist: (photo: PendingPhoto) => void;
  log: (event: string) => void;
};

/** Recover by reads, never by an automatic second write across the two services. */
export async function saveProjectPhoto(photo: PendingPhoto, io: PhotoSaveIO, resumed: boolean) {
  if (photo.complete) return;
  if (!photo.stored) {
    if (resumed) {
      io.log("STORAGE_VERIFY_START");
      if (!await io.exists()) throw new Error("Предыдущая загрузка не подтверждена. Файл повторно не отправлен; проверьте журнал сервера.");
    } else {
      io.log("STORAGE_UPLOAD_START");
      const result = await io.upload();
      if (result.error) {
        io.log("STORAGE_UPLOAD_ERROR");
        // An upload can commit before its response is lost.
        let exists = false;
        try { exists = await io.exists(); } catch { /* Keep the pending operation. */ }
        if (!exists) throw result.error;
      }
    }
    photo.stored = true;
    io.persist(photo);
    io.log("STORAGE_UPLOAD_SUCCESS");
  }
  // A resumed metadata request may have committed despite a lost response.
  if (resumed && await io.read()) {
    photo.complete = true;
    io.persist(photo);
    io.log("DB_INSERT_SUCCESS");
    return;
  }
  io.log("DB_INSERT_START");
  const result = await io.insert();
  if (result.error || !result.data) {
    io.log("DB_INSERT_ERROR");
    let found = false;
    try { found = await io.read(); } catch { /* Leave recoverable, never repeat insert automatically. */ }
    if (!found) throw result.error ?? new Error("Сохранение записи фотографии не подтверждено");
  }
  photo.complete = true;
  io.persist(photo);
  io.log("DB_INSERT_SUCCESS");
}