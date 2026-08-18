/**
 * Server-only helper: sends a Telegram notification about a new request.
 * Silently no-ops when the bot token / chat id are not configured, so the
 * form keeps working even before notifications are set up.
 */
export type TelegramNotifyResult =
  | { sent: true }
  | { sent: false; reason: "missing_env" | "api_error" | "request_failed"; detail?: string };

/** Reads the Telegram credentials from the server runtime (never exposed to the client). */
export function getTelegramConfig(): { token?: string; chatId?: string } {
  const env = process.env;
  return {
    token: env.TELEGRAM_BOT_TOKEN || env.TELEGRAM_TOKEN || undefined,
    chatId: env.TELEGRAM_CHAT_ID || env.TELEGRAM_CHATID || undefined,
  };
}

export async function notifyTelegram(submission: {
  name: string;
  phone: string;
  comment: string;
}): Promise<TelegramNotifyResult> {
  const { token, chatId } = getTelegramConfig();
  if (!token || !chatId) {
    console.error("TELEGRAM_ERROR", "missing_env", {
      hasToken: Boolean(token),
      hasChatId: Boolean(chatId),
    });
    return { sent: false, reason: "missing_env" };
  }

  const lines = [
    "🔔 <b>Новая заявка с сайта S&amp;M electric</b>",
    "",
    `👤 <b>Имя:</b> ${escapeHtml(submission.name)}`,
    `📞 <b>Телефон:</b> ${escapeHtml(submission.phone)}`,
  ];
  if (submission.comment.trim()) {
    lines.push(`💬 <b>Комментарий:</b> ${escapeHtml(submission.comment)}`);
  }

  const text = lines.join("\n");
  if (!text.trim()) {
    console.error("TELEGRAM_ERROR", "empty_message");
    return { sent: false, reason: "request_failed", detail: "empty_message" };
  }

  try {
    console.log("TELEGRAM_CALL_START", {
      method: "sendMessage",
      hasChatId: true,
      textLength: text.length,
    });
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      signal: AbortSignal.timeout(10000),
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    const responseText = await res.text();
    console.log("TELEGRAM_RESPONSE_STATUS", res.status);
    console.log(
      "TELEGRAM_RESPONSE_BODY_WITHOUT_SECRETS",
      sanitizeTelegramResponse(responseText),
    );

    if (!res.ok) {
      console.error("TELEGRAM_ERROR", "api_error", { status: res.status });
      // Фолбэк: если Telegram не смог разобрать HTML — шлём обычным текстом.
      const plain = text.replace(/<\/?b>/g, "");
      const retry = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        signal: AbortSignal.timeout(10000),
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: plain, disable_web_page_preview: true }),
      });
      const retryBody = (await retry.json().catch(() => ({}))) as { ok?: boolean };
      if (retry.ok && retryBody.ok === true) {
        console.log("TELEGRAM_SENT", "plain_fallback");
        return { sent: true };
      }
      return { sent: false, reason: "api_error", detail: `${res.status}` };
    }

    let telegramOk = false;
    try {
      const parsed = JSON.parse(responseText) as { ok?: boolean };
      telegramOk = parsed.ok === true;
    } catch {
      console.error("TELEGRAM_ERROR", "invalid_json", { status: res.status });
      return { sent: false, reason: "api_error", detail: "invalid_json" };
    }

    if (!telegramOk) {
      console.error("TELEGRAM_ERROR", "telegram_ok_false", { status: res.status });
      return { sent: false, reason: "api_error", detail: "telegram_ok_false" };
    }

    console.log("TELEGRAM_SENT");
    return { sent: true };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("TELEGRAM_ERROR", "request_failed", detail);
    return { sent: false, reason: "request_failed", detail };
  }
}

function sanitizeTelegramResponse(responseText: string): string {
  try {
    const body = JSON.parse(responseText) as {
      ok?: boolean;
      error_code?: number;
      description?: string;
      result?: { message_id?: number; chat?: { type?: string } };
    };
    return JSON.stringify({
      ok: body.ok === true,
      error_code: body.error_code ?? null,
      description: body.description ?? null,
      result: body.result
        ? {
            message_id: body.result.message_id ?? null,
            chat_type: body.result.chat?.type ?? null,
          }
        : null,
    });
  } catch {
    return JSON.stringify({ parseable: false, bodyLength: responseText.length });
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
