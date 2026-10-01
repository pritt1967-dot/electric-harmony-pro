import { createServerFn } from "@tanstack/react-start";
import { requirePanelAuth } from "./panel-auth.middleware";
import { validatePanel } from "./panel-validator";

/** Серверная инженерная проверка JSON щита. Только чтение, без LLM. */
export const validatePanelProject = createServerFn({ method: "POST" })
  .middleware([requirePanelAuth])
  .inputValidator((data: unknown) => {
    if (!data || typeof data !== "object") throw new Error("Ожидается JSON проекта щита");
    if (JSON.stringify(data).length > 500_000) throw new Error("Слишком большой проект");
    return data as Record<string, unknown>;
  })
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await (context as any).supabase.rpc("has_role", {
      _user_id: (context as any).userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Доступ только для администратора");
    return validatePanel(data);
  });

/**
 * Валидатор + необязательный разбор GigaChat. Итоговый status и checks — только от валидатора;
 * советы GigaChat возвращаются отдельно с пометкой «не проверено» и не меняют проект.
 */
export const validatePanelWithAdvice = createServerFn({ method: "POST" })
  .middleware([requirePanelAuth])
  .inputValidator((data: unknown) => {
    if (!data || typeof data !== "object") throw new Error("Ожидается JSON проекта щита");
    if (JSON.stringify(data).length > 500_000) throw new Error("Слишком большой проект");
    return data as Record<string, unknown>;
  })
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await (context as any).supabase.rpc("has_role", {
      _user_id: (context as any).userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Доступ только для администратора");
    const validation = validatePanel(data);
    const { analyzeWithGigaChat } = await import("./ai-check/providers/gigachat.server");
    const giga = await analyzeWithGigaChat(structuredClone(data), structuredClone(validation));
    return {
      validation, // неизменённый результат валидатора
      ai: {
        available: giga.available,
        model: giga.model,
        note: "Советы ИИ не проверены и не влияют на status.",
        advice: giga.advice.map((a) => ({ ...a, verified: false as const })),
        diagnostic: giga.diagnostic,
      },
    };
  });
