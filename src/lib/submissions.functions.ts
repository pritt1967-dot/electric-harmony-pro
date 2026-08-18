import { createServerFn } from "@tanstack/react-start";
import { notifyTelegram } from "./submissions.server";
import { submissionSchema } from "./submissions.schemas";
import { createPublicSupabaseClient } from "@/lib/supabase-public";

/** Public endpoint: saves a request from the site form + notifies Telegram. */
export const createSubmission = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => submissionSchema.parse(data))
  .handler(async ({ data }) => {
    console.log("[createSubmission] START");

    const payload = {
      name: data.name,
      phone: data.phone,
      comment: data.comment ?? "",
    };

    // 1. Сохраняем заявку.
    let saveError: string | null = null;
    try {
      const supabase = createPublicSupabaseClient();
      const result = await Promise.race([
        supabase
          .from("submissions")
          .insert(payload)
          .then((r) => ({ timedOut: false as const, error: r.error })),
        new Promise<{ timedOut: true }>((resolve) =>
          setTimeout(() => resolve({ timedOut: true }), 8000),
        ),
      ]);
      if (result.timedOut) saveError = "db_timeout";
      else if (result.error) saveError = result.error.message;
    } catch (e) {
      saveError = e instanceof Error ? e.message : String(e);
    }

    if (saveError) {
      console.error("[createSubmission] DB_ERROR", saveError);
    } else {
      console.log("[createSubmission] DB_SUCCESS");
    }

    // 2. Уведомление в Telegram — всегда после сохранения, с ожиданием результата.
    console.log("[createSubmission] TELEGRAM_START");
    const notify = await notifyTelegram(payload);
    console.log(
      "[createSubmission] TELEGRAM_RESULT",
      JSON.stringify({
        sent: notify.sent,
        reason: notify.sent ? "sent" : notify.reason,
        detail: notify.sent ? undefined : notify.detail,
      }),
    );

    console.log("[createSubmission] END");

    if (saveError && !notify.sent) {
      throw new Error(saveError);
    }

    return {
      ok: true,
      saved: !saveError,
      notified: notify.sent,
      reason: notify.sent ? "sent" : notify.reason,
    };
  });
