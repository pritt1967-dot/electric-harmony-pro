import { createMiddleware } from "@tanstack/react-start";

import { supabase } from "@/integrations/supabase/browser-client";

/**
 * Attaches the Supabase bearer token to every server-function call.
 * The token is read from the same browser client used by the admin panel.
 */
export const attachAdminAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
);
