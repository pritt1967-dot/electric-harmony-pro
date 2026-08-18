import { createServerFn } from "@tanstack/react-start";
import { notifyTelegram } from "./submissions.server";
import { submissionSchema } from "./submissions.schemas";
import { createPublicSupabaseClient } from "@/lib/supabase-public";

/** Public endpoint: saves a request from the site form + notifies Telegram. */
export const createSubmission = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => submissionSchema.parse(data))
  .handler(async ({ data }) => {
    console.log("SUBMISSION_START");
    let saved = false;
    let saveError: string | null = null;

    try {
      console.log("SUBMISSION_DB_START");
      const supabase = createPublicSupabaseClient();
      const insertPromise = supabase.from("submissions").insert({
        name: data.name,
        phone: data.phone,
        comment: data.comment ?? "",
      });
      // Жёсткий таймаут, чтобы запись в БД не блокировала уведомление.
      const result = await Promise.race([
        insertPromise.then((r) => ({ timedOut: false as const, error: r.error })),
        new Promise<{ timedOut: true }>((resolve) =>
          setTimeout(() => resolve({ timedOut: true }), 8000),
        ),
      ]);

      if (result.timedOut) {
        saveError = "db_timeout";
        console.error("SUBMISSION_DB_ERROR", "timeout_8000ms");
      } else if (result.error) {
        saveError = result.error.message;
        console.error("SUBMISSION_DB_ERROR", result.error.message);
      } else {
        saved = true;
        console.log("SUBMISSION_DB_SUCCESS");
      }
    } catch (e) {
      saveError = e instanceof Error ? e.message : String(e);
      console.error("SUBMISSION_DB_ERROR", saveError);
    }

    // Уведомление отправляется всегда, даже если запись в БД не удалась.
    const notify = await notifyTelegram({
      name: data.name,
      phone: data.phone,
      comment: data.comment ?? "",
    });

    console.log(
      "[createSubmission] result:",
      JSON.stringify({
        saved,
        saveError,
        notified: notify.sent,
        reason: notify.sent ? "sent" : notify.reason,
        detail: notify.sent ? undefined : notify.detail,
      }),
    );

    if (!saved && !notify.sent) {
      throw new Error(saveError ?? "Не удалось отправить заявку");
    }

    return {
      ok: true,
      saved,
      notified: notify.sent,
      reason: notify.sent ? "sent" : notify.reason,
    };
  });

