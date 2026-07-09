import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { notifyTelegram } from "./submissions.server";

export type SubmissionRow = {
  id: string;
  name: string;
  phone: string;
  comment: string;
  status: string;
  created_at: string;
};

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

/** Admin only: lists all requests, newest first. */
export const getSubmissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SubmissionRow[]> => {
    const { data, error } = await context.supabase
      .from("submissions")
      .select("id, name, phone, comment, status, created_at")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  });

/** Admin only: updates a request status (new / done). */
export const updateSubmissionStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: string }) => data)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("submissions")
      .update({ status: data.status })
      .eq("id", data.id);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Admin only: deletes a request. */
export const deleteSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("submissions")
      .delete()
      .eq("id", data.id);

    if (error) throw new Error(error.message);
    return { ok: true };
  });
