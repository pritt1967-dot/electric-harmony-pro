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
      const supabase = createPublicSupabaseClient();
      const { error } = await supabase.from("submissions").insert({
        name: data.name,
        phone: data.phone,
        comment: data.comment ?? "",
      });
      if (error) {
        saveError = error.message;
        console.error("[createSubmission] db insert failed:", error.message);
      } else {
        saved = true;
        console.log("SUBMISSION_SAVED");
      }
    } catch (e) {
      saveError = e instanceof Error ? e.message : String(e);
      console.error("[createSubmission] db insert threw:", saveError);
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

