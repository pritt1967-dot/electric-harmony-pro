import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/browser-client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // Never let a hanging/failing auth call keep the UI in a loading state:
    // anything other than a confirmed user sends the visitor to /auth.
    let user = null;
    try {
      const result = await Promise.race([
        supabase.auth.getUser(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 10000)),
      ]);
      if (result && !result.error) user = result.data.user;
    } catch {
      user = null;
    }
    if (!user) throw redirect({ to: "/auth", search: { next: undefined } });
    return { user };
  },
  component: () => <Outlet />,
});
