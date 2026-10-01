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
