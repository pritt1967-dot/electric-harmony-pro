import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { EstimateItem, EstimateStatus } from "./estimates";

export type PublicEstimate = {
  token: string;
  number: string;
  doc_date: string;
  customer_name: string;
  address: string;
  work_period: string;
  valid_until: string;
  note: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  status: EstimateStatus;
  total: number;
  items: EstimateItem[];
  approved_at: string | null;
  approved_by_name: string;
};

const tokenSchema = z.string().uuid();

type Row = {
  public_token: string;
  number: string;
  doc_date: string;
  customer_name: string;
  address: string;
  work_period: string;
  valid_until: string;
  note: string;
  discount_type: string;
  discount_value: number | string;
  status: string;
  total: number | string;
  items: unknown;
  approved_at: string | null;
  approved_by_name: string;
  approved_snapshot: unknown;
};

function toPublic(row: Row, useSnapshot: boolean): PublicEstimate {
  const snapshot =
    useSnapshot && row.approved_snapshot
      ? (row.approved_snapshot as {
          items?: EstimateItem[];
          total?: number;
          discount_type?: string;
          discount_value?: number;
        })
      : null;
  return {
    token: row.public_token,
    number: row.number,
    doc_date: row.doc_date,
    customer_name: row.customer_name,
    address: row.address,
    work_period: row.work_period,
    valid_until: row.valid_until,
    note: row.note,
    discount_type: ((snapshot?.discount_type ?? row.discount_type) === "fixed"
      ? "fixed"
      : "percent") as "percent" | "fixed",
    discount_value: Number(snapshot?.discount_value ?? row.discount_value),
    status: row.status as EstimateStatus,
    total: Number(snapshot?.total ?? row.total),
    items: (snapshot?.items ?? (row.items as EstimateItem[]) ?? []) as EstimateItem[],
    approved_at: row.approved_at,
    approved_by_name: row.approved_by_name ?? "",
  };
}

const SELECT =
  "public_token, number, doc_date, customer_name, address, work_period, valid_until, note, discount_type, discount_value, status, total, items, approved_at, approved_by_name, approved_snapshot";

/** Public: read one estimate by its unguessable token. */
export const getPublicEstimate = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ token: tokenSchema }).parse(data))
  .handler(async ({ data }): Promise<PublicEstimate | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("estimates")
      .select(SELECT)
      .eq("public_token", data.token)
      .maybeSingle();
    if (!row) return null;
    const r = row as unknown as Row;
    return toPublic(r, Boolean(r.approved_at));
  });

/** Public: customer approves the estimate; freezes the approved version. */
export const approvePublicEstimate = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        token: tokenSchema,
        name: z.string().trim().max(120).optional().default(""),
      })
      .parse(data),
  )
  .handler(async ({ data }): Promise<PublicEstimate | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("estimates")
      .select(`id, phone, email, ${SELECT}`)
      .eq("public_token", data.token)
      .maybeSingle();
    if (!row) throw new Error("Смета не найдена");
    const r = row as unknown as Row & { id: string; phone: string; email: string };
    if (r.approved_at) return toPublic(r, true);

    const approvedAt = new Date().toISOString();
    const snapshot = {
      items: r.items,
      total: Number(r.total),
      discount_type: r.discount_type,
      discount_value: Number(r.discount_value),
      frozen_at: approvedAt,
    };

    const { error } = await supabaseAdmin
      .from("estimates")
      .update({
        status: "approved",
        approved_at: approvedAt,
        approved_by_name: data.name ?? "",
        approved_snapshot: snapshot as never,
      })
      .eq("id", r.id);
    if (error) throw new Error(error.message);

    // Create the linked order (one per estimate).
    await supabaseAdmin.from("orders").insert({
      number: r.number,
      estimate_id: r.id,
      estimate_number: r.number,
      customer_name: r.customer_name,
      address: r.address,
      phone: r.phone ?? "",
      email: r.email ?? "",
      items: r.items as never,
      total: Number(r.total),
      approved_at: approvedAt,
      status: "new",
    });

    try {
      const { notifyTelegram } = await import("./submissions.server");
      await notifyTelegram({
        name: `Согласование сметы № ${r.number}${data.name ? ` (${data.name})` : ""}`,
        phone: r.phone ?? "",
        comment: `Заказчик согласовал смету на сумму ${Number(r.total).toLocaleString("ru-RU")} ₽. Объект: ${r.address || "—"}`,
      });
    } catch {
      /* notification is best-effort */
    }

    return toPublic({ ...r, approved_at: approvedAt, approved_snapshot: snapshot }, true);
  });
