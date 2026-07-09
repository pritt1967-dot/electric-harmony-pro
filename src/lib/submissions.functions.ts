import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { notifyTelegram } from "./submissions.server";

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
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      {
        auth: {
          storage: undefined,
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    const { error } = await supabase.from("submissions").insert({
      name: data.name,
      phone: data.phone,
      comment: data.comment ?? "",
    });

    if (error) throw new Error(error.message);

    await notifyTelegram({
      name: data.name,
      phone: data.phone,
      comment: data.comment ?? "",
    });

    return { ok: true };
  });
