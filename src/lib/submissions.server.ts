/**
 * Server-only helper: sends a Telegram notification about a new request.
 * Silently no-ops when the bot token / chat id are not configured, so the
 * form keeps working even before notifications are set up.
 */
export async function notifyTelegram(submission: {
  name: string;
  phone: string;
  comment: string;
}): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const lines = [
    "🔔 <b>Новая заявка с сайта ВольтПро</b>",
    "",
    `👤 <b>Имя:</b> ${escapeHtml(submission.name)}`,
    `📞 <b>Телефон:</b> ${escapeHtml(submission.phone)}`,
  ];
  if (submission.comment.trim()) {
    lines.push(`💬 <b>Комментарий:</b> ${escapeHtml(submission.comment)}`);
  }

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: lines.join("\n"),
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
  } catch (error) {
    console.error("Telegram notification failed", error);
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
