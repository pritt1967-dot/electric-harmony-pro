import { createServerFn } from "@tanstack/react-start";

import { requirePanelAuth } from "@/lib/panel-auth.middleware";

/**
 * Finance module data layer.
 *
 * The finance tables (operations, categories, participants, projects,
 * project_participants) live in a SEPARATE Supabase project from the website.
 * The website's own Supabase connection is untouched: these server functions
 * talk to the finance project using credentials that exist only as server
 * environment variables, so no finance key ever reaches the browser.
 */

const FINANCE_PROJECT_REF = "nppincxonqwajdoxqbla";

function financeUrl(): string {
  return (
    process.env["FINANCE_SUPABASE_URL"] ??
    `https://${FINANCE_PROJECT_REF}.supabase.co`
  ).replace(/\/+$/, "");
}

function financeKey(): string {
  const key =
    process.env["FINANCE_SUPABASE_SERVICE_ROLE_KEY"] ??
    process.env["FINANCE_SUPABASE_PUBLISHABLE_KEY"];
  if (!key) {
    throw new Error(
      "Финансовое подключение не настроено: отсутствует ключ финансового проекта.",
    );
  }
  return key;
}

async function rest(
  path: string,
  init: RequestInit & { method?: string } = {},
): Promise<unknown> {
  const key = financeKey();
  const headers = new Headers(init.headers);
  headers.set("apikey", key);
  headers.set("Authorization", `Bearer ${key}`);
  if (init.body) headers.set("Content-Type", "application/json");
  if (!headers.has("Prefer")) headers.set("Prefer", "return=representation");

  const response = await fetch(`${financeUrl()}/rest/v1/${path}`, {
    ...init,
    headers,
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(
      `Финансовая база (${path.split("?")[0]}): ${response.status} ${text.slice(0, 300)}`,
    );
  }
  return text ? JSON.parse(text) : null;
}

export type FinanceOperation = {
  id: string;
  operation_date: string;
  operation_type: "income" | "expense" | "transfer";
  from_name: string | null;
  to_name: string | null;
  amount: number;
  category_id: string | null;
  comment: string | null;
};
export type FinanceParticipant = { id: string; name: string };
export type FinanceCategory = {
  id: string;
  name: string;
  affects_project_balance: boolean;
};
export type FinanceProject = {
  customer_name: string | null;
  project_name: string | null;
  status: string | null;
};

/** Loads everything the money tab needs, without nested PostgREST selects. */
export const loadFinanceData = createServerFn({ method: "POST" })
  .middleware([requirePanelAuth])
  .inputValidator((data: { projectId: string }) => data)
  .handler(async ({ data }) => {
    const projectId = encodeURIComponent(data.projectId);

    const [operations, participants, categories, projects, links] =
      await Promise.all([
        rest(
          `operations?select=id,operation_date,operation_type,from_name,to_name,amount,category_id,comment,created_at&project_id=eq.${projectId}&order=operation_date.desc,created_at.desc`,
        ),
        rest(`participants?select=id,name&order=name.asc`),
        rest(`categories?select=id,name,affects_project_balance&order=name.asc`),
        rest(
          `projects?select=customer_name,project_name,status&id=eq.${projectId}&limit=1`,
        ),
        rest(
          `project_participants?select=project_id,participant_id&project_id=eq.${projectId}`,
        ),
      ]);

    const projectLinks = (links ?? []) as { participant_id: string }[];
    const linkedIds = new Set(projectLinks.map((l) => l.participant_id));
    const allParticipants = (participants ?? []) as FinanceParticipant[];

    return {
      operations: (operations ?? []) as FinanceOperation[],
      participants: linkedIds.size
        ? allParticipants.filter((p) => linkedIds.has(p.id))
        : allParticipants,
      categories: (categories ?? []) as FinanceCategory[],
      project: ((projects ?? []) as FinanceProject[])[0] ?? null,
    };
  });

export const createFinanceOperation = createServerFn({ method: "POST" })
  .middleware([requirePanelAuth])
  .inputValidator(
    (data: {
      projectId: string;
      operation_date: string;
      operation_type: "income" | "expense" | "transfer";
      from_name: string;
      to_name: string;
      amount: number;
      category_id: string | null;
      comment: string | null;
    }) => data,
  )
  .handler(async ({ data }) => {
    if (!Number.isFinite(data.amount) || data.amount <= 0) {
      throw new Error("Укажите сумму больше нуля");
    }
    const rows = (await rest("operations", {
      method: "POST",
      body: JSON.stringify({
        project_id: data.projectId,
        operation_date: data.operation_date,
        operation_type: data.operation_type,
        from_name: data.from_name,
        to_name: data.to_name,
        amount: data.amount,
        category_id: data.category_id,
        comment: data.comment,
      }),
    })) as FinanceOperation[] | null;
    return { id: rows?.[0]?.id ?? null };
  });

export const deleteFinanceOperation = createServerFn({ method: "POST" })
  .middleware([requirePanelAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await rest(`operations?id=eq.${encodeURIComponent(data.id)}`, {
      method: "DELETE",
    });
    return { ok: true };
  });

export const createFinanceParticipant = createServerFn({ method: "POST" })
  .middleware([requirePanelAuth])
  .inputValidator((data: { projectId: string; name: string }) => data)
  .handler(async ({ data }) => {
    const name = data.name.trim();
    if (!name) throw new Error("Введите имя участника");

    const existing = (await rest(
      `participants?select=id,name&name=eq.${encodeURIComponent(name)}&limit=1`,
    )) as FinanceParticipant[] | null;

    const participant =
      existing?.[0] ??
      (
        (await rest("participants", {
          method: "POST",
          body: JSON.stringify({ name }),
        })) as FinanceParticipant[]
      )?.[0];

    if (!participant?.id) throw new Error("Не удалось создать участника");

    await rest("project_participants", {
      method: "POST",
      headers: { Prefer: "return=representation,resolution=ignore-duplicates" },
      body: JSON.stringify({
        project_id: data.projectId,
        participant_id: participant.id,
      }),
    });

    return { id: participant.id, name: participant.name };
  });
