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
    const supabase = createPublicSupabaseClient();

    const { error } = await supabase.from("submissions").insert({
      name: data.name,
      phone: data.phone,
      comment: data.comment ?? "",
    });

    if (error) throw new Error(error.message);

    const notify = await notifyTelegram({
      name: data.name,
      phone: data.phone,
      comment: data.comment ?? "",
    });

    if (!notify.sent) {
      console.error("[createSubmission] telegram not sent:", notify.reason, notify.detail ?? "");
    }

    return { ok: true, notified: notify.sent };
  });
