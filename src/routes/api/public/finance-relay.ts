import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

/**
 * Финансовое реле: выполняется в инфраструктуре Lovable, где хранится
 * FINANCE_SUPABASE_SERVICE_ROLE_KEY. Внешний деплой (Vercel) вызывает этот
 * маршрут вместо прямого обращения к финансовой базе, поэтому ключ никогда
 * не покидает Lovable и не попадает в браузер.
 *
 * Доступ закрыт общим секретом AI_RELAY_SECRET (заголовок X-Relay-Secret).
 * Разрешены только фиксированные таблицы финансового модуля.
 */

const FINANCE_PROJECT_REF = "nppincxonqwajdoxqbla";
const ALLOWED = /^(operations|participants|categories|projects|project_participants)(\?|$)/;

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("origin") ?? "";
  const allowed = origin === "https://sm-electric.ru" || origin === "https://www.sm-electric.ru" || origin === "http://localhost:8080" || /^https:\/\/[a-z0-9-]+\.lovable\.app$/.test(origin);
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "https://sm-electric.ru",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(request: Request, value: unknown, status: number) {
  return Response.json(value, { status, headers: corsHeaders(request) });
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function authenticatedFetch(apiKey: string, accessToken: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(init?.headers);
    if (headers.get("Authorization") === `Bearer ${apiKey}`) headers.delete("Authorization");
    headers.set("apikey", apiKey);
    headers.set("Authorization", `Bearer ${accessToken}`);
    return fetch(input, { ...init, headers });
  };
}

export const Route = createFileRoute("/api/public/finance-relay")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => new Response(null, { status: 204, headers: corsHeaders(request) }),
      POST: async ({ request }) => {
        const relaySecret = process.env["AI_RELAY_SECRET"];
        const provided = request.headers.get("x-relay-secret") ?? "";
        const hasSharedSecret = Boolean(relaySecret && provided && safeEqual(provided, relaySecret));
        if (!hasSharedSecret) {
          const authHeader = request.headers.get("authorization") ?? "";
          const accessToken = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length).trim() : "";
          const siteUrl = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
          const siteKey = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ?? process.env["VITE_SUPABASE_ANON_KEY"];
          if (!accessToken || !siteUrl || !siteKey) {
            return json(request, { error: "Unauthorized" }, 401);
          }
          const site = createClient(siteUrl, siteKey, {
            global: { fetch: authenticatedFetch(siteKey, accessToken) },
            auth: { persistSession: false, autoRefreshToken: false },
          });
          const { data: userData, error: userError } = await site.auth.getUser(accessToken);
          if (userError || !userData.user) {
            return json(request, { error: "Unauthorized" }, 401);
          }
          const { data: isAdmin, error: roleError } = await site.rpc("has_role", { _user_id: userData.user.id, _role: "admin" });
          if (roleError || !isAdmin) {
            return json(request, { error: "Forbidden" }, 403);
          }
        }

        const key =
          process.env["FINANCE_SUPABASE_SERVICE_ROLE_KEY"] ??
          process.env["FINANCE_SUPABASE_PUBLISHABLE_KEY"];
        if (!key) {
          return json(request, { error: "Нет ключа финансовой базы" }, 503);
        }

        let body: { path?: unknown; method?: unknown; body?: unknown; prefer?: unknown };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return json(request, { error: "Invalid JSON body" }, 400);
        }

        const path = typeof body.path === "string" ? body.path : "";
        if (!ALLOWED.test(path)) {
          return json(request, { error: "Unsupported path" }, 400);
        }
        const method = typeof body.method === "string" ? body.method : "GET";
        if (!["GET", "POST", "DELETE", "PATCH"].includes(method)) {
          return json(request, { error: "Unsupported method" }, 400);
        }

        const base = (
          process.env["FINANCE_SUPABASE_URL"] ?? `https://${FINANCE_PROJECT_REF}.supabase.co`
        ).replace(/\/+$/, "");

        const headers = new Headers();
        headers.set("apikey", key);
        headers.set("Authorization", `Bearer ${key}`);
        headers.set(
          "Prefer",
          typeof body.prefer === "string" ? body.prefer : "return=representation",
        );
        const payload = body.body === undefined || body.body === null ? undefined : JSON.stringify(body.body);
        if (payload) headers.set("Content-Type", "application/json");

        const upstream = await fetch(`${base}/rest/v1/${path}`, {
          method,
          headers,
          body: payload,
        });

        return new Response(await upstream.text(), {
          status: upstream.status,
          headers: { "Content-Type": "application/json", ...corsHeaders(request) },
        });
      },
    },
  },
});
