import { createFileRoute } from "@tanstack/react-router";
import { getTelegramConfig } from "@/lib/submissions.server";

/**
 * Диагностика доставки заявок в Telegram.
 * Возвращает ТОЛЬКО признаки наличия/валидности настроек — без самих значений.
 */
export const Route = createFileRoute("/api/public/telegram-health")({
  server: {
    handlers: {
      GET: async () => {
        const { token, chatId } = getTelegramConfig();
        const hasToken = Boolean(token);
        const hasChatId = Boolean(chatId);

        if (!hasToken || !hasChatId) {
          return Response.json({
            hasToken,
            hasChatId,
            botOk: false,
            reason: "missing_env",
          });
        }

        let botOk = false;
        let status = 0;
        try {
          const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
          status = res.status;
          botOk = res.ok;
        } catch {
          botOk = false;
        }

        return Response.json({ hasToken, hasChatId, botOk, status });
      },
      // Проверка реальной доставки: отправляет тестовое сообщение в чат.
      POST: async () => {
        const { token, chatId } = getTelegramConfig();
        if (!token || !chatId) {
          return Response.json({ sent: false, reason: "missing_env" }, { status: 200 });
        }
        try {
          const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: "✅ Тестовое сообщение: проверка доставки заявок с сайта.",
            }),
          });
          const body = (await res.json().catch(() => ({}))) as {
            ok?: boolean;
            description?: string;
            error_code?: number;
          };
          return Response.json({
            sent: res.ok && body.ok === true,
            status: res.status,
            error_code: body.error_code ?? null,
            description: body.description ?? null,
          });
        } catch (error) {
          return Response.json({
            sent: false,
            reason: "request_failed",
            detail: error instanceof Error ? error.message : String(error),
          });
        }
      },
    },
  },
});

