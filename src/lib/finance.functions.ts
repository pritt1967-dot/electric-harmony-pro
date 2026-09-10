import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requirePanelAuth } from "@/lib/panel-auth.middleware";

const FINANCE_RELAY_URL = "https://electric-9117335567.lovable.app/api/public/finance-relay";

async function rest(path: string, init: { method?: string; body?: string; prefer?: string } = {}): Promise<any> {
  const authorization = getRequest()?.headers.get("authorization") ?? "";
  if (!authorization) throw new Error("Не удалось получить авторизацию администратора");

  const response = await fetch(FINANCE_RELAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authorization,
    },
    body: JSON.stringify({
      path,
      method: init.method ?? "GET",
      body: init.body ? JSON.parse(init.body) : undefined,
      prefer: init.prefer ?? "return=representation",
    }),
  });

  const text = await response.text();
  if (!response.ok) {
    let message = text.slice(0, 300);
    try {
      const parsed = JSON.parse(text) as { error?: unknown };
      if (typeof parsed.error === "string") message = parsed.error;
    } catch {
      // Keep the upstream response text for diagnostics.
    }
    if (response.status === 401) throw new Error("Ошибка авторизации финансового сервера");
    if (response.status === 403) throw new Error("Недостаточно прав для финансовых данных");
    if (response.status === 404) throw new Error("Финансовый endpoint не найден");
    if (response.status >= 500) throw new Error(`Финансовый сервер недоступен: ${message}`);
    throw new Error(`Финансовая база: ${response.status} ${message}`);
  }

  return text ? JSON.parse(text) : null;
}

export type FinanceOperation = {
  id: string;
  operation_date: string;
  operation_type: "income" | "expense" | "transfer";
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
export type FinancePayload = { ok: boolean; error: string | null; source: "relay"; operations: FinanceOperation[]; participants: FinanceParticipant[]; categories: FinanceCategory[]; project: FinanceProject | null };

export const loadFinanceData = createServerFn({ method: "POST" })
  .middleware([requirePanelAuth])
  .inputValidator((d: { projectId: string }) => d)
  .handler(async ({ data }): Promise<FinancePayload> => {
    try {
      const pid = encodeURIComponent(data.projectId);
      const [operations, participants, categories, projects, links] = await Promise.all([
        rest(`operations?select=id,operation_date,operation_type,from_name,to_name,from_participant_id,to_participant_id,amount,category_id,comment,created_at&project_id=eq.${pid}&order=operation_date.desc,created_at.desc`),
        rest("participants?select=id,name&order=name.asc"),
        rest("categories?select=id,name,affects_project_balance&order=name.asc"),
        rest(`projects?select=customer_name,project_name,status&id=eq.${pid}&limit=1`),
        rest(`project_participants?select=project_id,participant_id&project_id=eq.${pid}`),
      ]);
      const ids = new Set(((links ?? []) as { participant_id: string }[]).map(x => x.participant_id));
      const all = (participants ?? []) as FinanceParticipant[];
      return {
        ok: true,
        error: null,
        source: "relay",
        operations: (operations ?? []) as FinanceOperation[],
        participants: ids.size ? all.filter(x => ids.has(x.id)) : all,
        categories: (categories ?? []) as FinanceCategory[],
        project: ((projects ?? []) as FinanceProject[])[0] ?? null,
      };
    } catch (e) {
      throw e;
    }
  });

export const createFinanceOperation = createServerFn({ method: "POST" })
  .middleware([requirePanelAuth])
  .inputValidator((d: { projectId: string; operation_date: string; operation_type: "income" | "expense" | "transfer"; from_name: string; to_name: string; from_participant_id?: string | null; to_participant_id?: string | null; amount: number; category_id: string | null; comment: string | null }) => d)
  .handler(async ({ data }) => {
    if (!Number.isFinite(data.amount) || data.amount <= 0) throw new Error("Укажите сумму больше нуля");
    if (data.operation_type === "transfer" && (!data.from_participant_id || !data.to_participant_id || data.from_participant_id === data.to_participant_id)) {
      throw new Error("Для перевода выберите двух разных участников из базы");
    }
    const rows = await rest("operations", {
      method: "POST",
      body: JSON.stringify({
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
      }),
    });
    return { id: rows?.[0]?.id ?? null };
  });

export const deleteFinanceOperation = createServerFn({ method: "POST" })
  .middleware([requirePanelAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    await rest(`operations?id=eq.${encodeURIComponent(data.id)}`, { method: "DELETE" });
    return { ok: true };
  });

export const createFinanceParticipant = createServerFn({ method: "POST" })
  .middleware([requirePanelAuth])
  .inputValidator((d: { projectId: string; name: string }) => d)
  .handler(async ({ data }) => {
    const name = data.name.trim();
    if (!name) throw new Error("Введите имя участника");
    const existing = await rest(`participants?select=id,name&name=ilike.${encodeURIComponent(name)}&limit=1`) as FinanceParticipant[];
    if (existing?.[0]) throw new Error("Такой участник уже есть");
    const rows = await rest("participants", { method: "POST", body: JSON.stringify({ name }) }) as FinanceParticipant[];
    const participant = rows?.[0];
    if (!participant) throw new Error("Не удалось создать участника");
    await rest("project_participants", { method: "POST", body: JSON.stringify({ project_id: data.projectId, participant_id: participant.id }) });
    return { id: participant.id };
  });