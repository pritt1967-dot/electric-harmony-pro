import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Grants the `admin` role to the current user ONLY when no admin exists yet
 * (first-run bootstrap). If an admin already exists, it succeeds only for that
 * same admin — nobody else can self-promote. Runs under the user's own session
 * via the `claim_first_admin` database function (no service key needed).
 */
export const claimAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("claim_first_admin");
    if (error) throw new Error(error.message);
    const reason = (data as string) ?? "exists";
    return { granted: reason === "ok" || reason === "bootstrapped", reason };
  });
