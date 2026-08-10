import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

import { formatOrderNumber } from "./orders";
import type { EstimateItem, EstimateStatus } from "./estimates";

export type PublicEstimate = {
  token: string;
  number: string;
  doc_date: string;
  customer_name: string;
  address: string;
  object_name: string;
  work_period: string;
  valid_until: string;
  note: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  status: EstimateStatus;
  total: number;
  items: EstimateItem[];
  version: number;
  approved_at: string | null;
  approved_by_name: string;
  /** Linked order, present once the estimate is approved. */
  order: {
    number: string;
    status: string;
    payment_status: string;
    paid_amount: number;
  } | null;
};

const tokenSchema = z.string().uuid();

type Row = {
  public_token: string;
  number: string;
  doc_date: string;
  customer_name: string;
  address: string;
  object_name: string;
  work_period: string;
  valid_until: string;
  note: string;
  discount_type: string;
  discount_value: number | string;
  status: string;
  total: number | string;
  items: unknown;
  version: number;
  approved_at: string | null;
  approved_by_name: string;
  approved_snapshot: unknown;
};

function toPublic(
  row: Row,
  useSnapshot: boolean,
  order: PublicEstimate["order"],
): PublicEstimate {
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
    object_name: row.object_name ?? "",
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
    version: Number(row.version ?? 1),
    approved_at: row.approved_at,
    approved_by_name: row.approved_by_name ?? "",
    order,
  };
}

const SELECT =
  "public_token, number, doc_date, customer_name, address, object_name, work_period, valid_until, note, discount_type, discount_value, status, total, items, version, approved_at, approved_by_name, approved_snapshot";

type AdminClient = Awaited<
  typeof import("@/integrations/supabase/client.server")
>["supabaseAdmin"];

async function loadOrder(
  supabaseAdmin: AdminClient,
  estimateId: string,
): Promise<PublicEstimate["order"]> {
  const { data } = await supabaseAdmin
    .from("orders")
    .select("number, status, payment_status, paid_amount")
    .eq("estimate_id", estimateId)
    .maybeSingle();
  if (!data) return null;
  return {
    number: data.number ?? "",
    status: data.status ?? "new",
    payment_status: data.payment_status ?? "unpaid",
    paid_amount: Number(data.paid_amount ?? 0),
  };
}

/** Sequential order number: ORD-YYYY-00001. */
async function nextOrderNumber(supabaseAdmin: AdminClient) {
  const year = new Date().getFullYear();
  const { data } = await supabaseAdmin
    .from("orders")
    .select("number")
    .like("number", `ORD-${year}-%`)
    .order("number", { ascending: false })
    .limit(1);
  const last = data?.[0]?.number ?? "";
  const seq = Number(/ORD-\d{4}-(\d+)/.exec(last)?.[1] ?? 0) + 1;
  return formatOrderNumber(year, seq);
}

/** Public: read one estimate by its unguessable token. */
export const getPublicEstimate = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ token: tokenSchema }).parse(data))
  .handler(async ({ data }): Promise<PublicEstimate | null> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("estimates")
      .select(`id, ${SELECT}`)
      .eq("public_token", data.token)
      .maybeSingle();
    if (!row) return null;
    const r = row as unknown as Row & { id: string };
    const order = r.approved_at ? await loadOrder(supabaseAdmin, r.id) : null;
    return toPublic(r, Boolean(r.approved_at), order);
  });

/** Public: customer approves the estimate; freezes the approved version. */
export const approvePublicEstimate = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        token: tokenSchema,
        name: z.string().trim().max(120).optional().default(""),
        session: z.string().trim().max(64).optional().default(""),
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
    if (r.approved_at) {
      return toPublic(r, true, await loadOrder(supabaseAdmin, r.id));
    }

    const approvedAt = new Date().toISOString();
    const ip =
      (getRequestHeader("x-forwarded-for") ?? "").split(",")[0]?.trim() ||
      getRequestHeader("cf-connecting-ip") ||
      "";
    const snapshot = {
      items: r.items,
      total: Number(r.total),
      discount_type: r.discount_type,
      discount_value: Number(r.discount_value),
      version: Number(r.version ?? 1),
      approved_by_name: data.name ?? "",
      frozen_at: approvedAt,
    };

    const { error } = await supabaseAdmin
      .from("estimates")
      .update({
        status: "approved",
        approved_at: approvedAt,
        approved_by_name: data.name ?? "",
        approved_ip: ip,
        approved_session: data.session ?? "",
        approved_snapshot: snapshot as never,
      })
      .eq("id", r.id);
    if (error) throw new Error(error.message);

    // Create the linked order (one per estimate).
    const orderNumber = await nextOrderNumber(supabaseAdmin);
    const { data: order } = await supabaseAdmin
      .from("orders")
      .insert({
        number: orderNumber,
        estimate_id: r.id,
        estimate_number: r.number,
        customer_name: r.customer_name,
        address: r.address,
        object_name: r.object_name ?? "",
        phone: r.phone ?? "",
        email: r.email ?? "",
        items: r.items as never,
        total: Number(r.total),
        approved_at: approvedAt,
        estimate_version: Number(r.version ?? 1),
        approved_snapshot: snapshot as never,
        status: "approved",
        payment_status: "unpaid",
      })
      .select("id, number, status, payment_status, paid_amount")
      .single();

    if (order) {
      await supabaseAdmin.from("order_events").insert([
        {
          order_id: order.id,
          estimate_id: r.id,
          kind: "approved",
          message: `Заказчик согласовал смету № ${r.number} (версия ${r.version ?? 1})${
            data.name ? `, имя: ${data.name}` : ""
          }`,
          to_status: "approved",
          actor: "customer",
          meta: { ip, session: data.session ?? "", total: Number(r.total) } as never,
        },
        {
          order_id: order.id,
          estimate_id: r.id,
          kind: "order_created",
          message: `Создан заказ № ${orderNumber} на основании согласованной сметы`,
          to_status: "approved",
          actor: "system",
        },
      ]);
    }

    try {
      const { notifyTelegram } = await import("./submissions.server");
      await notifyTelegram({
        name: `Согласование сметы № ${r.number}${data.name ? ` (${data.name})` : ""}`,
        phone: r.phone ?? "",
        comment: `Заказчик согласовал смету на сумму ${Number(r.total).toLocaleString("ru-RU")} ₽. Создан заказ № ${orderNumber}. Объект: ${r.object_name || r.address || "—"}`,
      });
    } catch {
      /* notification is best-effort */
    }

    return toPublic(
      { ...r, approved_at: approvedAt, approved_snapshot: snapshot },
      true,
      order
        ? {
            number: order.number ?? orderNumber,
            status: order.status ?? "approved",
            payment_status: order.payment_status ?? "unpaid",
            paid_amount: Number(order.paid_amount ?? 0),
          }
        : null,
    );
  });

/**
 * Public: request payment for an approved order.
 * Architecture placeholder — moves the order into "awaiting payment" and records
 * the intent. A Russian acquiring provider can be plugged in here later by
 * returning a real payment URL instead of null.
 */
export const requestOrderPayment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        token: tokenSchema,
        kind: z.enum(["full", "prepay", "rest"]).default("full"),
      })
      .parse(data),
  )
  .handler(async ({ data }): Promise<{ ok: boolean; paymentUrl: string | null }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: est } = await supabaseAdmin
      .from("estimates")
      .select("id, number, approved_at")
      .eq("public_token", data.token)
      .maybeSingle();
    if (!est?.approved_at) throw new Error("Смета не согласована");

    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id, number, total, paid_amount, prepayment_percent, status")
      .eq("estimate_id", est.id)
      .maybeSingle();
    if (!order) throw new Error("Заказ не найден");

    const total = Number(order.total);
    const paid = Number(order.paid_amount ?? 0);
    const percent = Number(order.prepayment_percent ?? 0) || 30;
    const amount =
      data.kind === "prepay"
        ? Math.round(total * percent) / 100
        : data.kind === "rest"
          ? Math.max(total - paid, 0)
          : total;

    await supabaseAdmin
      .from("orders")
      .update({ payment_status: "awaiting", status: "awaiting_payment" })
      .eq("id", order.id);

    await supabaseAdmin.from("order_events").insert({
      order_id: order.id,
      estimate_id: est.id,
      kind: "payment_requested",
      message: `Заказчик запросил оплату (${
        data.kind === "prepay" ? "предоплата" : data.kind === "rest" ? "остаток" : "полная оплата"
      }) на сумму ${amount.toLocaleString("ru-RU")} ₽`,
      from_status: order.status ?? "",
      to_status: "awaiting_payment",
      actor: "customer",
      meta: { amount, kind: data.kind } as never,
    });

    try {
      const { notifyTelegram } = await import("./submissions.server");
      await notifyTelegram({
        name: `Запрос оплаты по заказу № ${order.number}`,
        phone: "",
        comment: `Сумма к оплате: ${amount.toLocaleString("ru-RU")} ₽. Смета № ${est.number}.`,
      });
    } catch {
      /* best-effort */
    }

    // No acquiring provider is connected yet — the admin confirms payment manually.
    return { ok: true, paymentUrl: null };
  });
