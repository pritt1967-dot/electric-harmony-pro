import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { notifyTelegram } from "./submissions.server";
import { createPublicSupabaseClient } from "@/lib/supabase-public";

const submissionSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z
    .string()
    .trim()
    .min(6)
    .max(30)
    .regex(/^[0-9+()\-\s]+$/),
  comment: z.string().trim().max(600).optional().default(""),
});

/** Public endpoint: saves a request from the site form + notifies Telegram. */
export const createSubmission = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => submissionSchema.parse(data))
  .handler(async ({ data }) => {
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

