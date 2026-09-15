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

const ALLOWED_PREFIXES = ["auth/v1/", "rest/v1/", "storage/v1/", "functions/v1/"];

const FORWARD_REQUEST_HEADERS = [
  "authorization",
  "apikey",
  "content-type",
  "accept",
  "accept-language",
  "accept-profile",
  "content-profile",
  "prefer",
  "range",
  "x-client-info",
  "x-upsert",
  "x-supabase-api-version",
  "cache-control",
];

const SKIP_RESPONSE_HEADERS = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
  "keep-alive",
]);

async function proxy(request: Request, splat: string) {
  const path = splat.replace(/^\/+/, "");
  if (!path || path.includes("..") || !ALLOWED_PREFIXES.some((p) => path.startsWith(p))) {
    return new Response("Not found", { status: 404 });
  }

  const { getPublicSupabaseConfig } = await import("@/lib/public-supabase-config");
  const { url: backendUrl, key: publishableKey } = getPublicSupabaseConfig();

  const incoming = new URL(request.url);
  const target = new URL(`${backendUrl.replace(/\/+$/, "")}/${path}`);
  target.search = incoming.search;

  const headers = new Headers();
  for (const name of FORWARD_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  if (!headers.has("apikey")) headers.set("apikey", publishableKey);

  const method = request.method.toUpperCase();
  const body =
    method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);

  try {
    const upstream = await fetch(target, {
      method,
      headers,
      body,
      redirect: "manual",
      signal: controller.signal,
    });

    const responseHeaders = new Headers();
    upstream.headers.forEach((value, name) => {
      if (!SKIP_RESPONSE_HEADERS.has(name.toLowerCase())) responseHeaders.set(name, value);
    });
    responseHeaders.set("cache-control", "no-store");

    return new Response(upstream.body ? await upstream.arrayBuffer() : null, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    const reason = error instanceof Error && error.name === "AbortError" ? "TIMEOUT" : "NETWORK";
    return new Response(
      JSON.stringify({ error: `Backend unreachable from the site server (${reason})` }),
      { status: 504, headers: { "content-type": "application/json", "cache-control": "no-store" } },
    );
  } finally {
    clearTimeout(timer);
  }
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
