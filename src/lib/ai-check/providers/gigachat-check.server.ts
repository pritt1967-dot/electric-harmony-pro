import { AiCheckResultSchema, type AiCheckProvider, type AiCheckResult, type PanelSnapshot } from "../types";
import { extractJson, gigaChat, GigaChatError } from "./gigachat-client.server";

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
Ответь строго одним JSON-объектом без текста вокруг:
{"errors":[ITEM],"warnings":[ITEM],"recommendations":[ITEM],"explanations":[ITEM]}
где ITEM = {"id":"строка","text":"строка","related_marks":["QF1"],"suggested_change":{"action":"none","key":null,"value":null}}`;

export function createGigaChatCheckProvider(): AiCheckProvider {
  return {
    async check(snapshot: PanelSnapshot): Promise<AiCheckResult> {
      let content: string;
      try {
        content = await gigaChat(
          [
            { role: "system", content: SYSTEM },
            { role: "user", content: JSON.stringify(snapshot) },
          ],
          { timeoutMs: 60_000 },
        );
      } catch (e) {
        const g = e instanceof GigaChatError ? e : null;
        console.error("[ai-check] GigaChat", g?.message ?? "ошибка");
        if (g?.status === 429) throw new AiProviderError("rate_limited", "Превышен лимит запросов к ИИ. Попробуйте позже.");
        throw new AiProviderError("unavailable", `ИИ-проверка недоступна: GigaChat ${g?.message ?? "ошибка"}`);
      }
      try {
        return AiCheckResultSchema.parse(extractJson(content));
      } catch {
        throw new AiProviderError("error", "ИИ вернул некорректный ответ");
      }
    },
  };
}
