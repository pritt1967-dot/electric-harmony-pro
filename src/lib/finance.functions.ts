import { createServerFn } from "@tanstack/react-start";
import { requirePanelAuth } from "@/lib/panel-auth.middleware";

/**
 * Финансовый модуль работает напрямую с финансовой базой (nppincxonqwajdoxqbla)
 * из серверных функций Node/Nitro. Никаких внешних relay-сервисов.
 */

type FinanceContext = { supabase: { rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }> }; userId: string };

async function financeRest(path: string, init: { method?: string; body?: unknown; prefer?: string } = {}) {
  const { financeRest: call } = await import("@/lib/finance-db.server");
  return call(path, init);
}

/** Финансовые данные доступны только администраторам основного сайта. */
async function assertAdmin(context: FinanceContext) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Недостаточно прав для финансовых данных");
}

/** Приход, расход, перевод между участниками и возврат. */
export type FinanceOperationType = "income" | "expense" | "transfer" | "refund";

export type FinanceOperation = {
  id: string;
  operation_date: string;
  operation_type: FinanceOperationType;
  from_name: string | null;
  to_name: string | null;
  from_participant_id?: string | null;
  to_participant_id?: string | null;
  amount: number;
  category_id: string | null;
  comment: string | null;
};
export type FinanceParticipant = { id: string; name: string };
export type FinanceCategory = { id: string; name: string; affects_project_balance: boolean };
export type FinanceProject = { customer_name: string | null; project_name: string | null; status: string | null };
export type FinanceProjectRow = { id: string; project_name: string | null; customer_name: string | null; status: string | null };
export type FinancePayload = { ok: boolean; error: string | null; source: "direct"; operations: FinanceOperation[]; participants: FinanceParticipant[]; categories: FinanceCategory[]; project: FinanceProject | null };

export const loadFinanceData = createServerFn({ method: "POST" })
  .middleware([requirePanelAuth])
  .inputValidator((d: { projectId: string }) => d)
  .handler(async ({ data, context }): Promise<FinancePayload> => {
    await assertAdmin(context as unknown as FinanceContext);
    const pid = encodeURIComponent(data.projectId);
    const [operations, participants, categories, projects, links] = await Promise.all([
      financeRest(`operations?select=id,operation_date,operation_type,from_name,to_name,from_participant_id,to_participant_id,amount,category_id,comment,created_at&project_id=eq.${pid}&order=operation_date.desc,created_at.desc`),
      financeRest("participants?select=id,name&order=name.asc"),
      financeRest("categories?select=id,name,affects_project_balance&order=name.asc"),
      financeRest(`projects?select=customer_name,project_name,status&id=eq.${pid}&limit=1`),
      financeRest(`project_participants?select=project_id,participant_id&project_id=eq.${pid}`),
    ]);
    const ids = new Set(((links ?? []) as { participant_id: string }[]).map(x => x.participant_id));
    const all = (participants ?? []) as FinanceParticipant[];
    return {
      ok: true,
      error: null,
      source: "direct",
      operations: (operations ?? []) as FinanceOperation[],
      participants: ids.size ? all.filter(x => ids.has(x.id)) : all,
      categories: (categories ?? []) as FinanceCategory[],
      project: ((projects ?? []) as FinanceProject[])[0] ?? null,
    };
  });

export const listFinanceProjects = createServerFn({ method: "POST" })
  .middleware([requirePanelAuth])
  .handler(async ({ context }): Promise<FinanceProjectRow[]> => {
    await assertAdmin(context as unknown as FinanceContext);
    const rows = await financeRest("projects?select=id,project_name,customer_name,status&order=created_at.asc");
    return (rows ?? []) as FinanceProjectRow[];
  });

export const createFinanceProject = createServerFn({ method: "POST" })
  .middleware([requirePanelAuth])
  .inputValidator((d: { projectName: string; customerName: string }) => d)
  .handler(async ({ data, context }): Promise<FinanceProjectRow> => {
    await assertAdmin(context as unknown as FinanceContext);
    const projectName = data.projectName.trim();
    if (!projectName) throw new Error("Введите название проекта");
    const rows = await financeRest("projects", {
      method: "POST",
      body: { project_name: projectName, customer_name: data.customerName.trim(), status: "active" },
    }) as FinanceProjectRow[];
    const project = rows?.[0];
    if (!project) throw new Error("Не удалось создать проект");
    return project;
  });

export const listAllFinanceParticipants = createServerFn({ method: "POST" })
  .middleware([requirePanelAuth])
  .handler(async ({ context }): Promise<FinanceParticipant[]> => {
    await assertAdmin(context as unknown as FinanceContext);
    const rows = await financeRest("participants?select=id,name&order=name.asc");
    return (rows ?? []) as FinanceParticipant[];
  });

export const attachFinanceParticipant = createServerFn({ method: "POST" })
  .middleware([requirePanelAuth])
  .inputValidator((d: { projectId: string; participantId: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context as unknown as FinanceContext);
    await financeRest("project_participants", {
      method: "POST",
      body: { project_id: data.projectId, participant_id: data.participantId },
    });
    return { ok: true };
  });

export const detachFinanceParticipant = createServerFn({ method: "POST" })
  .middleware([requirePanelAuth])
  .inputValidator((d: { projectId: string; participantId: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context as unknown as FinanceContext);
    await financeRest(
      `project_participants?project_id=eq.${encodeURIComponent(data.projectId)}&participant_id=eq.${encodeURIComponent(data.participantId)}`,
      { method: "DELETE" },
    );
    return { ok: true };
  });

export const createFinanceOperation = createServerFn({ method: "POST" })
  .middleware([requirePanelAuth])
  .inputValidator((d: { projectId: string; operation_date: string; operation_type: FinanceOperationType; from_name: string; to_name: string; from_participant_id?: string | null; to_participant_id?: string | null; amount: number; category_id: string | null; comment: string | null }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context as unknown as FinanceContext);
    if (!Number.isFinite(data.amount) || data.amount <= 0) throw new Error("Укажите сумму больше нуля");
    if (data.operation_type === "transfer" && (!data.from_participant_id || !data.to_participant_id || data.from_participant_id === data.to_participant_id)) {
      throw new Error("Для перевода выберите двух разных участников из базы");
    }
    const rows = await financeRest("operations", {
      method: "POST",
      body: {
        project_id: data.projectId,
        operation_date: data.operation_date,
        operation_type: data.operation_type,
        from_name: data.from_name,
        to_name: data.to_name,
        from_participant_id: data.from_participant_id ?? null,
        to_participant_id: data.to_participant_id ?? null,
        amount: data.amount,
        category_id: data.operation_type === "transfer" ? null : data.category_id,
        comment: data.comment,
      },
    });
    return { id: rows?.[0]?.id ?? null };
  });

export const deleteFinanceOperation = createServerFn({ method: "POST" })
  .middleware([requirePanelAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context as unknown as FinanceContext);
    await financeRest(`operations?id=eq.${encodeURIComponent(data.id)}`, { method: "DELETE" });
    return { ok: true };
  });

/** Новая статья расходов в существующей таблице categories. */
export const createFinanceCategory = createServerFn({ method: "POST" })
  .middleware([requirePanelAuth])
  .inputValidator((d: { name: string; affectsProjectBalance?: boolean }) => d)
  .handler(async ({ data, context }): Promise<FinanceCategory> => {
    await assertAdmin(context as unknown as FinanceContext);
    const name = data.name.trim();
    if (!name) throw new Error("Введите название категории");
    const existing = await financeRest(`categories?select=id,name,affects_project_balance&name=ilike.${encodeURIComponent(name)}&limit=1`) as FinanceCategory[];
    if (existing?.[0]) return existing[0];
    const rows = await financeRest("categories", {
      method: "POST",
      body: { name, affects_project_balance: data.affectsProjectBalance ?? true },
    }) as FinanceCategory[];
    const category = rows?.[0];
    if (!category) throw new Error("Не удалось создать категорию");
    return category;
  });

export const createFinanceParticipant = createServerFn({ method: "POST" })
  .middleware([requirePanelAuth])
  .inputValidator((d: { projectId: string; name: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context as unknown as FinanceContext);
    const name = data.name.trim();
    if (!name) throw new Error("Введите имя участника");
    const existing = await financeRest(`participants?select=id,name&name=ilike.${encodeURIComponent(name)}&limit=1`) as FinanceParticipant[];
    if (existing?.[0]) throw new Error("Такой участник уже есть");
    const rows = await financeRest("participants", { method: "POST", body: { name } }) as FinanceParticipant[];
    const participant = rows?.[0];
    if (!participant) throw new Error("Не удалось создать участника");
    await financeRest("project_participants", { method: "POST", body: { project_id: data.projectId, participant_id: participant.id } });
    return { id: participant.id, name: participant.name };
  });
