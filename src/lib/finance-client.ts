import { supabase } from "@/integrations/supabase/client";
import type { FinanceCategory, FinanceOperation, FinanceParticipant, FinancePayload, FinanceProject } from "@/lib/finance.functions";

const FINANCE_RELAY_URL = "https://electric-9117335567.lovable.app/api/public/finance-relay";

async function rest(path: string, init: { method?: string; body?: unknown; prefer?: string } = {}) {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) throw new Error("Войдите в админку повторно");

  const response = await fetch(FINANCE_RELAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${data.session.access_token}`,
    },
    body: JSON.stringify({
      path,
      method: init.method ?? "GET",
      body: init.body,
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
      // Keep the response text when the relay did not return JSON.
    }
    if (response.status === 401) throw new Error("Сессия истекла. Войдите в админку повторно");
    if (response.status === 403) throw new Error("Недостаточно прав для финансовых данных");
    throw new Error(`Финансовый сервер: ${message}`);
  }
  return text ? JSON.parse(text) : null;
}

export async function loadFinanceDataClient(projectId: string): Promise<FinancePayload> {
  const pid = encodeURIComponent(projectId);
  const [operations, participants, categories, projects, links] = await Promise.all([
    rest(`operations?select=id,operation_date,operation_type,from_name,to_name,from_participant_id,to_participant_id,amount,category_id,comment,created_at&project_id=eq.${pid}&order=operation_date.desc,created_at.desc`),
    rest("participants?select=id,name&order=name.asc"),
    rest("categories?select=id,name,affects_project_balance&order=name.asc"),
    rest(`projects?select=customer_name,project_name,status&id=eq.${pid}&limit=1`),
    rest(`project_participants?select=project_id,participant_id&project_id=eq.${pid}`),
  ]);
  const ids = new Set(((links ?? []) as { participant_id: string }[]).map(row => row.participant_id));
  const all = (participants ?? []) as FinanceParticipant[];
  return {
    ok: true,
    error: null,
    source: "relay",
    operations: (operations ?? []) as FinanceOperation[],
    participants: ids.size ? all.filter(row => ids.has(row.id)) : all,
    categories: (categories ?? []) as FinanceCategory[],
    project: ((projects ?? []) as FinanceProject[])[0] ?? null,
  };
}

export async function createFinanceOperationClient(data: { projectId: string; operation_date: string; operation_type: "income" | "expense" | "transfer"; from_name: string; to_name: string; from_participant_id?: string | null; to_participant_id?: string | null; amount: number; category_id: string | null; comment: string | null }) {
  if (!Number.isFinite(data.amount) || data.amount <= 0) throw new Error("Укажите сумму больше нуля");
  if (data.operation_type === "transfer" && (!data.from_participant_id || !data.to_participant_id || data.from_participant_id === data.to_participant_id)) throw new Error("Для перевода выберите двух разных участников из базы");
  return rest("operations", { method: "POST", body: { project_id: data.projectId, operation_date: data.operation_date, operation_type: data.operation_type, from_name: data.from_name, to_name: data.to_name, from_participant_id: data.from_participant_id ?? null, to_participant_id: data.to_participant_id ?? null, amount: data.amount, category_id: data.operation_type === "transfer" ? null : data.category_id, comment: data.comment } });
}

export async function deleteFinanceOperationClient(id: string) {
  await rest(`operations?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function createFinanceParticipantClient(projectId: string, rawName: string) {
  const name = rawName.trim();
  if (!name) throw new Error("Введите имя участника");
  const existing = await rest(`participants?select=id,name&name=ilike.${encodeURIComponent(name)}&limit=1`) as FinanceParticipant[];
  if (existing?.[0]) throw new Error("Такой участник уже есть");
  const rows = await rest("participants", { method: "POST", body: { name } }) as FinanceParticipant[];
  const participant = rows?.[0];
  if (!participant) throw new Error("Не удалось создать участника");
  await rest("project_participants", { method: "POST", body: { project_id: projectId, participant_id: participant.id } });
  return participant;
}