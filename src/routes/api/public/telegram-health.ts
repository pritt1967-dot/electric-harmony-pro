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
        let botId: number | null = null;
        try {
          const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
          status = res.status;
          botOk = res.ok;
          const body = (await res.json().catch(() => ({}))) as {
            result?: { id?: number };
          };
          botId = body.result?.id ?? null;
        } catch {
          botOk = false;
        }

        // Проверяем, что chat_id указывает на реальный чат (а не на самого бота).
        let chatType: string | null = null;
        let chatOk = false;
        let chatError: string | null = null;
        try {
          const res = await fetch(`https://api.telegram.org/bot${token}/getChat`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ chat_id: chatId }),
          });
          const body = (await res.json().catch(() => ({}))) as {
            ok?: boolean;
            description?: string;
            result?: { id?: number; type?: string };
          };
          chatOk = body.ok === true;
          chatType = body.result?.type ?? null;
          chatError = body.description ?? null;
          if (chatOk && botId !== null && body.result?.id === botId) {
            chatOk = false;
            chatError = "chat_id указывает на самого бота";
          }
        } catch (error) {
          chatError = error instanceof Error ? error.message : String(error);
        }

        return Response.json({ hasToken, hasChatId, botOk, status, chatOk, chatType, chatError });
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

