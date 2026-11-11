import { createFileRoute } from "@tanstack/react-router";

/**
 * Same-origin reverse proxy to the site backend (Supabase REST/Auth/Storage).
 *
 * The admin panel runs in the browser and must never talk to
 * *.supabase.co directly: on some networks that host is unreachable, which
 * left /admin hanging on supabase.auth.getUser().
 *
 * Only public endpoints are forwarded and only the caller's own credentials
 * are passed through, so RLS still applies exactly as before. No service-role
 * key is used or exposed here.
 */

async function proxy(request: Request, splat: string) {
  const { getPublicSupabaseConfig } = await import("@/lib/public-supabase-config");
  const { proxySiteBackend } = await import("@/lib/site-backend-proxy.server");
  return proxySiteBackend(request, splat, getPublicSupabaseConfig());
}

export const Route = createFileRoute("/api/public/sb/$")({
  server: {
    handlers: {
      GET: ({ request, params }) => proxy(request, (params as { _splat?: string })._splat ?? ""),
      HEAD: ({ request, params }) => proxy(request, (params as { _splat?: string })._splat ?? ""),
      POST: ({ request, params }) => proxy(request, (params as { _splat?: string })._splat ?? ""),
      PUT: ({ request, params }) => proxy(request, (params as { _splat?: string })._splat ?? ""),
      PATCH: ({ request, params }) => proxy(request, (params as { _splat?: string })._splat ?? ""),
      DELETE: ({ request, params }) => proxy(request, (params as { _splat?: string })._splat ?? ""),
    },
  },
});
