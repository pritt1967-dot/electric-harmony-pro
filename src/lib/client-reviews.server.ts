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

/** Уведомление администратору о новом отзыве (не блокирует сохранение). */
export async function notifyTelegramReview(review: {
  name: string;
  location: string;
  rating: number;
  text: string;
  hasPhoto: boolean;
}): Promise<void> {
  const { getTelegramConfig } = await import("./submissions.server");
  const { token, chatId } = getTelegramConfig();
  if (!token || !chatId) return;

  const esc = (v: string) =>
    v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const text = [
    "⭐ <b>Новый отзыв на сайте S&amp;M electric</b>",
    "",
    `👤 <b>Имя:</b> ${esc(review.name)}`,
    `📍 <b>Район:</b> ${esc(review.location)}`,
    `⭐ <b>Оценка:</b> ${review.rating}/5`,
    `📷 <b>Фото:</b> ${review.hasPhoto ? "есть" : "нет"}`,
    "",
    esc(review.text).slice(0, 800),
    "",
    "Отзыв ожидает модерации в админке.",
  ].join("\n");

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      signal: AbortSignal.timeout(8000),
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
  } catch (error) {
    console.error("REVIEW_TELEGRAM_ERROR", error);
  }
}
