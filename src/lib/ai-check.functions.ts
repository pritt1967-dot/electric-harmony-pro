import { createServerFn } from "@tanstack/react-start";

import { requirePanelAuth } from "./panel-auth.middleware";
import {
  PanelSnapshotSchema,
  SNAPSHOT_MAX_BYTES,
  type AiCheckResponse,
  type AiCheckResult,
  type PanelSnapshot,
} from "./ai-check/types";

const PROMPT_VERSION = "ai-check-v1";
const PER_MINUTE = 3;
const PER_HOUR = 20;

function stable(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(stable).join(",")}]`;
  if (v && typeof v === "object") {
    return `{${Object.keys(v as object)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stable((v as Record<string, unknown>)[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(v);
}

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** «Проверка щита ИИ»: дополнительный анализ после программной проверки. */
export const aiCheckPanel = createServerFn({ method: "POST" })
  .middleware([requirePanelAuth])
  .inputValidator((input: unknown): PanelSnapshot => {
    if (JSON.stringify(input ?? null).length > SNAPSHOT_MAX_BYTES) throw new Error("Слишком большой снимок щита");
    return PanelSnapshotSchema.parse(input);
  })
  .handler(async ({ data, context }): Promise<AiCheckResponse> => {
    const { supabase, userId } = context as unknown as { supabase: any; userId: string };
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (!isAdmin) return { ok: false, code: "invalid", message: "Доступ только для администратора" };

    const model = process.env["AI_CHECK_MODEL"]?.trim() || "default";
    const fingerprint = await sha256(stable({ data, v: PROMPT_VERSION, model }));

    // Кэш: неизменённый щит не отправляется в ИИ повторно.
    const { data: cached } = await supabase
      .from("ai_check_log")
      .select("result")
      .eq("fingerprint", fingerprint)
      .eq("status", "ok")
      .order("created_at", { ascending: false })
      .limit(1);
    if (cached?.[0]?.result) return { ok: true, result: cached[0].result as AiCheckResult, cached: true };

    const { getAiCheckProvider } = await import("./ai-check/provider.server");
    const provider = getAiCheckProvider();
    if (!provider) return { ok: false, code: "unavailable", message: "ИИ-проверка временно недоступна" };

    // Rate limit по журналу запросов пользователя.
    const since = (ms: number) => new Date(Date.now() - ms).toISOString();
    const count = async (ms: number) => {
      const { count: c } = await supabase
        .from("ai_check_log")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", since(ms));
      return c ?? 0;
    };
    if ((await count(60_000)) >= PER_MINUTE || (await count(3_600_000)) >= PER_HOUR) {
      return { ok: false, code: "rate_limited", message: "Превышен лимит ИИ-проверок. Попробуйте позже." };
    }

    const { AiProviderError } = await import("./ai-check/providers/openai.server");
    try {
      const result = await provider.check(data);
      await supabase.from("ai_check_log").insert({ user_id: userId, fingerprint, status: "ok", result });
      return { ok: true, result, cached: false };
    } catch (e) {
      const code = e instanceof AiProviderError ? e.code : "error";
      await supabase.from("ai_check_log").insert({ user_id: userId, fingerprint, status: code, result: null });
      return {
        ok: false,
        code: code === "rate_limited" ? "rate_limited" : code === "unavailable" ? "unavailable" : "error",
        message: e instanceof AiProviderError ? e.message : "Ошибка ИИ-проверки",
      };
    }
  });
