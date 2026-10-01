/**
 * GigaChat — необязательный вспомогательный анализатор результата panel-validator.
 * Только сервер. Не изменяет проект и не влияет на итоговый status.
 *
 * Переменные окружения (все серверные, все необязательные):
 *  GIGACHAT_AUTH_KEY   — Authorization key (base64 client_id:secret). Нет ключа → GigaChat недоступен.
 *  GIGACHAT_MODEL      — модель, по умолчанию GigaChat-3-Ultra.
 *  GIGACHAT_API_URL    — база API, по умолчанию https://api.giga.chat/v1
 *  GIGACHAT_OAUTH_URL  — получение токена, по умолчанию https://ngw.devices.sberbank.ru:9443/api/v2/oauth
 *  GIGACHAT_SCOPE      — по умолчанию GIGACHAT_API_PERS
 */
import { z } from "zod";
import type { ValidationResult } from "../../panel-validator";

export const DEFAULT_GIGACHAT_MODEL = "GigaChat-3-Ultra";
const DEFAULT_API_URL = "https://api.giga.chat/v1";
const DEFAULT_OAUTH_URL = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth";
const TIMEOUT_MS = 40_000;

export const GigaAdviceSchema = z.object({
  advice: z
    .array(
      z.object({
        title: z.string().min(1).max(200),
        detail: z.string().min(1).max(1500),
        severity: z.enum(["INFO", "WARNING", "UNVERIFIED"]),
      }),
    )
    .max(20),
});
export type GigaAdvice = z.infer<typeof GigaAdviceSchema>["advice"];

export type GigaResult = {
  available: boolean;
  model: string;
  advice: GigaAdvice;
  diagnostic: string | null; // безопасная диагностика, без секретов
};

const SYSTEM_PROMPT = `Ты вспомогательный инженерный анализатор.
Не изменяй исходные данные.
Не придумывай отсутствующие параметры.
Не заменяй решения серверного валидатора.
Проанализируй найденные проверки и объясни возможные технические проблемы.
Если данных недостаточно — укажи это.
Любой совет считать непроверенным до проверки серверным валидатором.
Ответь строго JSON без пояснений вокруг: {"advice":[{"title":"...","detail":"...","severity":"INFO | WARNING | UNVERIFIED"}]}. Не более 10 пунктов.`;

const redact = (s: string) =>
  s.replace(/(Bearer|Basic)\s+[A-Za-z0-9._\-+/=]+/gi, "$1 ***").replace(/[A-Za-z0-9+/=_\-]{40,}/g, "***");

/** Только технические поля щита. Клиент, адрес, телефоны, email, user ID, финансы, промпты картинок — исключены. */
export function technicalSnapshot(project: unknown) {
  const p = (project ?? {}) as Record<string, any>;
  const d = (p.design ?? p) as Record<string, any>;
  const i = (p.input ?? {}) as Record<string, any>;
  const pick = (o: any, keys: string[]) =>
    Object.fromEntries(keys.filter((k) => o?.[k] !== undefined).map((k) => [k, o[k]]));
  return {
    input: pick(i, ["phases", "grounding", "input_type", "input_cable", "main_breaker_a", "power_kw", "ip", "object_type"]),
    summary: pick(d.summary ?? {}, [
      "supply", "grounding", "main_breaker", "enclosure_modules", "used_modules", "reserve_modules",
      "ip", "calculated_power_kw", "total_power_kw", "object_type",
    ]),
    lines: (Array.isArray(d.lines) ? d.lines : []).slice(0, 80).map((l: any) =>
      pick(l, ["mark", "name", "power_kw", "current_a", "breaker", "curve", "poles", "phase", "rcd", "cable", "modules", "n_bus", "installation"]),
    ),
    rcd_groups: (Array.isArray(d.rcd_groups) ? d.rcd_groups : []).slice(0, 40).map((r: any) =>
      pick(r, ["mark", "rating", "type", "leakage", "lines", "n_bus"]),
    ),
    buses: d.buses ?? null,
    pen: d.pen ?? null,
  };
}

async function getToken(authKey: string, signal: AbortSignal): Promise<string> {
  const res = await fetch(process.env["GIGACHAT_OAUTH_URL"] || DEFAULT_OAUTH_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authKey}`,
      RqUID: crypto.randomUUID(),
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: `scope=${encodeURIComponent(process.env["GIGACHAT_SCOPE"] || "GIGACHAT_API_PERS")}`,
    signal,
  });
  if (!res.ok) throw new Error(`OAuth HTTP ${res.status}`);
  const j = (await res.json()) as { access_token?: string };
  if (!j.access_token) throw new Error("OAuth: нет access_token");
  return j.access_token;
}

function extractJson(text: string): unknown {
  const t = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "");
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  return JSON.parse(a >= 0 && b > a ? t.slice(a, b + 1) : t);
}

export async function analyzeWithGigaChat(project: unknown, validation: ValidationResult): Promise<GigaResult> {
  const model = process.env["GIGACHAT_MODEL"] || DEFAULT_GIGACHAT_MODEL;
  const authKey = process.env["GIGACHAT_AUTH_KEY"];
  if (!authKey) return { available: false, model, advice: [], diagnostic: "GIGACHAT_AUTH_KEY не задан" };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const token = await getToken(authKey, ctrl.signal);
    const payload = {
      project: technicalSnapshot(project),
      validator: {
        status: validation.status,
        summary: validation.summary,
        checks: validation.checks.filter((c) => c.status !== "OK").slice(0, 60),
        missing_data: validation.missing_data,
      },
    };
    const res = await fetch(`${(process.env["GIGACHAT_API_URL"] || DEFAULT_API_URL).replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: JSON.stringify(payload) },
        ],
      }),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const body = redact((await res.text()).slice(0, 300));
      throw new Error(`HTTP ${res.status}: ${body}`);
    }
    const j = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = j.choices?.[0]?.message?.content ?? "";
    const parsed = GigaAdviceSchema.safeParse(extractJson(content));
    if (!parsed.success) throw new Error("ответ не соответствует формату advice");
    return { available: true, model, advice: parsed.data.advice, diagnostic: null };
  } catch (e) {
    const msg = ctrl.signal.aborted ? "таймаут" : redact(e instanceof Error ? e.message : String(e));
    console.warn(`[gigachat] недоступен: ${msg}`);
    return { available: false, model, advice: [], diagnostic: msg };
  } finally {
    clearTimeout(timer);
  }
}
