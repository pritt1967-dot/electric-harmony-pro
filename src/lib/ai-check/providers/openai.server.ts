import { AiCheckResultSchema, type AiCheckProvider, type AiCheckResult, type PanelSnapshot } from "../types";

/** Ошибка провайдера с безопасным для пользователя кодом (без деталей ключа). */
export class AiProviderError extends Error {
  constructor(public code: "unavailable" | "rate_limited" | "error", message: string) {
    super(message);
  }
}

const DEFAULT_MODEL = "gpt-6-luna";
const TIMEOUT_MS = 45_000;
const MAX_RESPONSE_CHARS = 60_000;

const SYSTEM = `Ты — инженер-проектировщик электрощитов (ПУЭ, ГОСТ Р 50571, IEC 60364).
Тебе передан технический снимок модульного щита и результаты программной проверки.
Программная проверка первична, ты — дополнительный анализатор. Не выдумывай данные:
если чего-то не хватает — укажи это в warnings. Пиши по-русски, кратко, с обозначениями аппаратов.
errors — явные инженерные ошибки; warnings — риски и недостающие данные;
recommendations — улучшения; explanations — пояснения к схеме.
suggested_change: только {"action":"set_label","key":<key аппарата>,"value":<маркировка>} для исправления маркировки,
иначе {"action":"none","key":null,"value":null}. Проект напрямую не меняешь.`;

const item = {
  type: "object",
  additionalProperties: false,
  required: ["id", "text", "related_marks", "suggested_change"],
  properties: {
    id: { type: "string" },
    text: { type: "string" },
    related_marks: { type: "array", items: { type: "string" } },
    suggested_change: {
      type: "object",
      additionalProperties: false,
      required: ["action", "key", "value"],
      properties: {
        action: { type: "string", enum: ["set_label", "none"] },
        key: { type: ["string", "null"] },
        value: { type: ["string", "null"] },
      },
    },
  },
};
const list = { type: "array", items: item };
const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["errors", "warnings", "recommendations", "explanations"],
  properties: { errors: list, warnings: list, recommendations: list, explanations: list },
};

export function createOpenAiProvider(apiKey: string, model?: string): AiCheckProvider {
  return {
    async check(snapshot: PanelSnapshot): Promise<AiCheckResult> {
      let res: Response;
      try {
        res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          signal: AbortSignal.timeout(TIMEOUT_MS),
          body: JSON.stringify({
            model: model || DEFAULT_MODEL,
            messages: [
              { role: "system", content: SYSTEM },
              { role: "user", content: JSON.stringify(snapshot) },
            ],
            response_format: {
              type: "json_schema",
              json_schema: { name: "panel_check", strict: true, schema: SCHEMA },
            },
          }),
        });
      } catch {
        throw new AiProviderError("unavailable", "ИИ-проверка временно недоступна");
      }
      if (res.status === 429) throw new AiProviderError("rate_limited", "Превышен лимит запросов к ИИ. Попробуйте позже.");
      if (!res.ok) {
        console.error("[ai-check] OpenAI status", res.status);
        throw new AiProviderError("unavailable", "ИИ-проверка временно недоступна");
      }
      const text = await res.text();
      if (text.length > MAX_RESPONSE_CHARS * 2) throw new AiProviderError("error", "Слишком большой ответ ИИ");
      try {
        const body = JSON.parse(text) as { choices?: { message?: { content?: string; refusal?: string } }[] };
        const content = body.choices?.[0]?.message?.content ?? "";
        if (!content || content.length > MAX_RESPONSE_CHARS) throw new Error("empty");
        return AiCheckResultSchema.parse(JSON.parse(content));
      } catch {
        throw new AiProviderError("error", "ИИ вернул некорректный ответ");
      }
    },
  };
}
