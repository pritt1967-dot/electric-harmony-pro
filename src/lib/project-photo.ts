/** Derive MIME from bytes, not a potentially empty or incorrect File.type. */
export async function photoFormat(blob: Blob): Promise<{ mime: string; ext: string }> {
  const bytes = new Uint8Array(await blob.slice(0, 12).arrayBuffer());
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return { mime: "image/jpeg", ext: "jpg" };
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((b, i) => bytes[i] === b)) return { mime: "image/png", ext: "png" };
  if (new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP") return { mime: "image/webp", ext: "webp" };
  throw new Error("Не удалось определить формат фотографии. Выберите JPG, PNG или WebP.");
}

export async function prepareProjectPhoto(file: File) {
  const originalFormat = await photoFormat(file);
  try {
    const bitmap = await createImageBitmap(file);
    try {
      const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        const compressed = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
        if (compressed && compressed.size < file.size) return { blob: compressed, ...await photoFormat(compressed) };
      }
    } finally { bitmap.close(); }
  } catch {
    // Preserve original bytes, extension and MIME when decoding is unavailable.
  }
  return { blob: file, ...originalFormat };
}

export type PhotoUploadInfo = { sizeBytes?: number; mime?: string; elapsedMs?: number };

export function photoUploadError(error: unknown, stage: string, info: PhotoUploadInfo = {}) {
  const value = error && typeof error === "object" ? error as Record<string, unknown> : {};
  const message = typeof value.message === "string" && value.message ? value.message : typeof value.error === "string" ? value.error : "Не удалось загрузить фотографию";
  const status = value.statusCode ?? value.status ?? "unknown";
  // Diagnostic fields only: no tokens, file names or object paths.
  console.error("[project-photo-upload]", {
    stage, method: stage === "storage-upload" ? "POST" : undefined,
    endpoint: stage === "storage-upload" ? "/api/public/sb/storage/v1/object/projects/<object>" : undefined,
    bucket: "projects", ...info, status, message,
  });
  return `Фотография не добавлена: ${message}${status === "unknown" ? "" : ` (HTTP ${status})`}`;
}