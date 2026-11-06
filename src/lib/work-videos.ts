export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

const ALLOWED: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
};

export const VIDEO_ACCEPT = ".mp4,.webm,.mov,video/mp4,video/webm,video/quicktime";

export type VideoCheck =
  | { ok: true; ext: string; mime: string }
  | { ok: false; error: string };

/** Validates extension, MIME type and size before uploading a work video. */
export function checkVideoFile(file: { name: string; type: string; size: number }): VideoCheck {
  const ext = (file.name.split(".").pop() ?? "").toLowerCase();
  const mime = ALLOWED[ext];
  if (!mime) return { ok: false, error: "Разрешены только MP4, WebM или MOV" };
  const type = (file.type || "").toLowerCase();
  // Some phones report an empty type; otherwise it must match the extension.
  if (type && type !== mime && !(ext === "mp4" && type === "video/x-m4v")) {
    return { ok: false, error: "Тип файла не соответствует видео MP4, WebM или MOV" };
  }
  if (file.size <= 0) return { ok: false, error: "Файл пустой" };
  if (file.size > MAX_VIDEO_BYTES) return { ok: false, error: "Видео больше 100 МБ" };
  return { ok: true, ext, mime };
}

export function formatBytes(n: number): string {
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} КБ`;
  return `${(n / 1024 / 1024).toFixed(1).replace(".", ",")} МБ`;
}
