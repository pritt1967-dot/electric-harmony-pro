import { createFileRoute } from "@tanstack/react-router";

/**
 * AI-реле: выполняется в инфраструктуре Lovable, где LOVABLE_API_KEY доступен
 * как управляемый секрет. Внешний деплой (Vercel) вызывает этот маршрут
 * вместо прямого обращения к AI Gateway, поэтому ключ никогда не покидает Lovable
 * и не попадает в браузер.
 *
 * Доступ закрыт общим секретом AI_RELAY_SECRET (заголовок X-Relay-Secret).
 * Разрешены только два фиксированных сценария проектировщика щита.
 */

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

type RelayBody = {
  kind?: unknown;
  system?: unknown;
  prompt?: unknown;
};

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const Route = createFileRoute("/api/public/ai-relay")({
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

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) {
          return Response.json({ error: "AI недоступен: нет ключа" }, { status: 503 });
        }

        let body: RelayBody;
        try {
          body = (await request.json()) as RelayBody;
        } catch {
          return Response.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const prompt = typeof body.prompt === "string" ? body.prompt : "";
        if (!prompt || prompt.length > 40000) {
          return Response.json({ error: "Invalid prompt" }, { status: 400 });
        }

        let payload: Record<string, unknown>;
        if (body.kind === "design") {
          const system = typeof body.system === "string" ? body.system : "";
          if (!system || system.length > 40000) {
            return Response.json({ error: "Invalid system prompt" }, { status: 400 });
          }
          payload = {
            model: "google/gemini-3.6-flash",
            temperature: 0.2,
            messages: [
              { role: "system", content: system },
              { role: "user", content: prompt },
            ],
          };
        } else if (body.kind === "image") {
          payload = {
            model: "google/gemini-3-pro-image",
            messages: [{ role: "user", content: prompt }],
            modalities: ["image", "text"],
          };
        } else {
          return Response.json({ error: "Unsupported kind" }, { status: 400 });
        }

        const upstream = await fetch(GATEWAY, {
          method: "POST",
          headers: { "Lovable-API-Key": key, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        return new Response(await upstream.text(), {
          status: upstream.status,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
