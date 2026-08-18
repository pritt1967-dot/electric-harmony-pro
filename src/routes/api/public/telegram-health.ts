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
    },
  },
});
