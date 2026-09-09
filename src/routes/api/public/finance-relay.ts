import { createFileRoute } from "@tanstack/react-router";

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

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const Route = createFileRoute("/api/public/finance-relay")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const relaySecret = process.env["AI_RELAY_SECRET"];
        if (!relaySecret) {
          return Response.json({ error: "Relay is not configured" }, { status: 503 });
        }
        const provided = request.headers.get("x-relay-secret") ?? "";
        if (!provided || !safeEqual(provided, relaySecret)) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const key =
          process.env["FINANCE_SUPABASE_SERVICE_ROLE_KEY"] ??
          process.env["FINANCE_SUPABASE_PUBLISHABLE_KEY"];
        if (!key) {
          return Response.json({ error: "Нет ключа финансовой базы" }, { status: 503 });
        }

        let body: { path?: unknown; method?: unknown; body?: unknown; prefer?: unknown };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return Response.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const path = typeof body.path === "string" ? body.path : "";
        if (!ALLOWED.test(path)) {
          return Response.json({ error: "Unsupported path" }, { status: 400 });
        }
        const method = typeof body.method === "string" ? body.method : "GET";
        if (!["GET", "POST", "DELETE", "PATCH"].includes(method)) {
          return Response.json({ error: "Unsupported method" }, { status: 400 });
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
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
