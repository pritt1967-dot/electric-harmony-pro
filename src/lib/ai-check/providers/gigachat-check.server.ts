import { AiCheckResultSchema, type AiCheckItem, type AiCheckProvider, type AiCheckResult, type PanelSnapshot } from "../types";
import { gigaChat, GigaChatError, type GigaMeta } from "./gigachat-client.server";

/** Ошибка провайдера с безопасным для пользователя кодом (без деталей ключа). */
export class AiProviderError extends Error {
  constructor(public code: "unavailable" | "rate_limited" | "error", message: string) {
    super(message);
  }
}

const SYSTEM = `Ты — инженер-проектировщик электрощитов (ПУЭ, ГОСТ Р 50571, IEC 60364).
Тебе передан технический снимок модульного щита и результаты программной проверки.
Программная проверка первична, ты — дополнительный анализатор. Не выдумывай данные:
если чего-то не хватает — укажи это в warnings. Пиши по-русски, кратко, с обозначениями аппаратов.
errors — явные инженерные ошибки; warnings — риски и недостающие данные;
recommendations — улучшения; explanations — пояснения к схеме.
suggested_change: только {"action":"set_label","key":<key аппарата>,"value":<маркировка>} для исправления маркировки,
иначе {"action":"none","key":null,"value":null}. Проект напрямую не меняешь.
Ответь ТОЛЬКО валидным JSON без markdown и без пояснений вне JSON. Ключи разделов строго на английском:
{"errors":[],"warnings":[],"recommendations":[],"explanations":[]}
Формат:
{"errors":[ITEM],"warnings":[ITEM],"recommendations":[ITEM],"explanations":[ITEM]}
где ITEM = {"id":"строка","text":"строка","related_marks":["QF1"],"suggested_change":{"action":"none","key":null,"value":null}}`;

const SECTIONS = ["errors", "warnings", "recommendations", "explanations"] as const;
const ALIASES: Record<(typeof SECTIONS)[number], string[]> = {
  errors: ["errors", "ошибки", "error"],
  warnings: ["warnings", "предупреждения", "warning"],
  recommendations: ["recommendations", "рекомендации", "recommendation"],
  explanations: ["explanations", "пояснения", "explanation"],
};

/** Находит первый сбалансированный JSON-объект в тексте (учитывает строки и экранирование). */
function findJsonObject(text: string): string | null {
  for (let s = text.indexOf("{"); s >= 0; s = text.indexOf("{", s + 1)) {
    let depth = 0, inStr = false, esc = false;
    for (let i = s; i < text.length; i++) {
      const ch = text[i];
      if (inStr) {
        if (esc) esc = false;
        else if (ch === "\\") esc = true;
        else if (ch === '"') inStr = false;
        continue;
      }
      if (ch === '"') inStr = true;
      else if (ch === "{") depth++;
      else if (ch === "}" && --depth === 0) {
        const cand = text.slice(s, i + 1);
        try {
          JSON.parse(cand);
          return cand;
        } catch {
          break;
        }
      }
    }
  }
  return null;
}

const cut = (v: unknown, max: number) => String(v ?? "").slice(0, max);

function normItem(raw: unknown, sec: string, idx: number): AiCheckItem | null {
  if (typeof raw === "string") return raw.trim() ? { id: `${sec}-${idx + 1}`, text: cut(raw, 1000) } : null;
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, any>;
  const text = o.text ?? o.message ?? o.description ?? o.detail ?? o.title;
  if (!text) return null;
  const marks = Array.isArray(o.related_marks) ? o.related_marks : typeof o.related_marks === "string" ? [o.related_marks] : [];
  const sc = o.suggested_change;
  const suggested =
    sc && sc.action === "set_label" && sc.key && sc.value
      ? { action: "set_label" as const, key: cut(sc.key, 64), value: cut(sc.value, 80) }
      : { action: "none" as const, key: null, value: null };
  return {
    id: cut(o.id ?? `${sec}-${idx + 1}`, 40) || `${sec}-${idx + 1}`,
    text: cut(text, 1000),
    related_marks: marks.slice(0, 30).map((m: unknown) => cut(m, 80)),
    suggested_change: suggested,
  };
}

/** Нормализует content GigaChat в AiCheckResult. Бросает Error с безопасным описанием. */
export function normalizeGigaChatResponse(content: string): AiCheckResult {
  if (!content.trim()) throw new Error("пустой content");
  let t = content.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  let obj: any;
  try {
    obj = JSON.parse(t);
  } catch {
    const a = t.indexOf("{"), b = t.lastIndexOf("}");
    let parsed = false;
    if (a >= 0 && b > a) {
      try {
        obj = JSON.parse(t.slice(a, b + 1));
        parsed = true;
      } catch {}
    }
    if (!parsed) {
      const found = findJsonObject(t) ?? findJsonObject(content);
      if (!found) throw new Error("JSON-объект не найден");
      obj = JSON.parse(found);
    }
  }
  if (typeof obj === "string") obj = JSON.parse(obj);
  if (obj && typeof obj === "object" && !Array.isArray(obj) && obj.result && typeof obj.result === "object") obj = obj.result;
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) throw new Error("JSON не является объектом");
  console.info("[ai-check] разобран JSON", JSON.stringify({ typeofParsed: typeof obj, keys: Object.keys(obj).slice(0, 20) }));
  const lower: Record<string, unknown> = {};
  for (const k of Object.keys(obj)) lower[k.toLowerCase()] = obj[k];
  const out = {} as AiCheckResult;
  for (const sec of SECTIONS) {
    const key = ALIASES[sec].find((k) => k in lower);
    const arr = key ? lower[key] : [];
    const list = Array.isArray(arr) ? arr : arr ? [arr] : [];
    out[sec] = list.map((x, i) => normItem(x, sec, i)).filter((x): x is AiCheckItem => !!x).slice(0, 40);
  }
  return AiCheckResultSchema.parse(out);
}

export function createGigaChatCheckProvider(): AiCheckProvider {
  return {
    async check(snapshot: PanelSnapshot): Promise<AiCheckResult> {
      let content: string;
      let meta: GigaMeta | null = null;
      try {
        content = await gigaChat(
          [
            { role: "system", content: SYSTEM },
            { role: "user", content: JSON.stringify(snapshot) },
          ],
          { timeoutMs: 60_000, onMeta: (m) => (meta = m) },
        );
      } catch (e) {
        const g = e instanceof GigaChatError ? e : null;
        console.error("[ai-check] GigaChat", g?.message ?? "ошибка");
        if (g?.status === 429) throw new AiProviderError("rate_limited", "Превышен лимит запросов к ИИ. Попробуйте позже.");
        throw new AiProviderError("unavailable", `ИИ-проверка недоступна: GigaChat ${g?.message ?? "ошибка"}`);
      }
      try {
        return normalizeGigaChatResponse(content);
      } catch (e) {
        const m = meta as GigaMeta | null;
        const reason = e instanceof Error ? e.message.slice(0, 200) : "ошибка разбора";
        console.error("[ai-check] разбор ответа GigaChat:", reason, JSON.stringify(m));
        throw new AiProviderError(
          "error",
          `GigaChat ответил, но сервер не смог распознать JSON. HTTP: ${m?.status ?? "?"}. Причина: ${reason}. Проверьте формат ответа.`,
        );
      }
    },
  };
}
