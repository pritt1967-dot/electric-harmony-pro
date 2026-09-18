/**
 * Серверные помощники для клиентских отзывов: очистка текста, хэш IP,
 * загрузка фотографии в приватный бакет. В браузер не попадает.
 */

/** Удаляет любую HTML/JS-разметку и схлопывает лишние переводы строк. */
export function sanitizeReviewText(value: string): string {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&(lt|gt|amp|quot|#\d+);/gi, " ")
    .replace(/(javascript|data|vbscript)\s*:/gi, " ")
    .replace(/[ \t\u00a0]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Короткий необратимый отпечаток IP — сам адрес не сохраняется. */
export async function hashIp(ip: string): Promise<string> {
  const salt = process.env["SUPABASE_PROJECT_ID"] ?? "sm-electric";
  const bytes = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .slice(0, 12)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function base64ToBytes(data: string): Uint8Array {
  const clean = data.includes(",") ? data.slice(data.indexOf(",") + 1) : data;
  const binary = atob(clean);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out;
}
