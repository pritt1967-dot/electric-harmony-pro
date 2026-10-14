import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { requirePanelAuth } from "@/lib/panel-auth.middleware";

type Ctx = { supabase: { rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }> }; userId: string };

/** Выдаёт номер и подпись для нового финансового отчёта (только админ). */
export const issueFinanceReportDocument = createServerFn({ method: "POST" })
  .middleware([requirePanelAuth])
  .inputValidator((d: { projectId: string }) => {
    if (!d?.projectId || typeof d.projectId !== "string") throw new Error("Выберите проект");
    return { projectId: d.projectId };
  })
  .handler(async ({ data, context }) => {
    const c = context as unknown as Ctx;
    const { data: isAdmin, error } = await c.supabase.rpc("has_role", { _user_id: c.userId, _role: "admin" });
    if (error || !isAdmin) throw new Error("Недостаточно прав для финансовых данных");
    const { issueReportDocument } = await import("@/lib/finance-documents.server");
    return issueReportDocument(data.projectId);
  });

/** Публичная проверка: возвращает только статус, тип, дату и контрольный код. */
export const verifyFinanceDocument = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string; s: string }) => ({ id: String(d?.id ?? "").slice(0, 40), s: String(d?.s ?? "").slice(0, 64) }))
  .handler(async ({ data }) => {
    const { verifyDocument, rateLimited } = await import("@/lib/finance-documents.server");
    const ip = (getRequestHeader("x-forwarded-for") ?? getRequestHeader("x-real-ip") ?? "local").split(",")[0]!.trim();
    if (rateLimited(ip)) return { status: "rate_limited" as const };
    return verifyDocument(data.id, data.s);
  });
