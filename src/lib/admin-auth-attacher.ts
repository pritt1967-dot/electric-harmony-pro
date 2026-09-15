import { createMiddleware } from "@tanstack/react-start";

import { supabase } from "@/integrations/supabase/browser-client";

/**
 * Attaches the Supabase bearer token to every server-function call.
 * Replaces the generated attacher so the token is read from the same client
 * the admin panel uses (same-origin proxy, no direct *.supabase.co calls).
 */
export const attachAdminAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return next({ headers: token ? { Authorization: `Bearer ${token}` } : {} });
  },
);
