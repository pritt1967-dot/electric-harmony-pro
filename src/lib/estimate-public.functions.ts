import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";

import { unpackItems, type EstimateItem, type EstimateStatus, type Surcharges } from "./estimates";

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
  surcharges?: Surcharges;
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
    ...unpackItems(snapshot?.items ?? row.items),
    version: Number(row.version ?? 1),
    approved_at: row.approved_at,
    approved_by_name: row.approved_by_name ?? "",
    order,
  };
}

type RpcResult = { data: unknown; error: { message: string } | null };

/**
 * Публичные страницы работают через SECURITY DEFINER функции базы и
 * publishable-ключ: служебный ключ сервера в проде недоступен.
 */
async function rpc(name: string, args: Record<string, unknown>): Promise<unknown> {
  const { createPublicSupabaseClient } = await import("./supabase-public");
  const client = createPublicSupabaseClient();
  const call = (fn: string, params: Record<string, unknown>): Promise<RpcResult> =>
    (client.rpc as never as (f: string, p: Record<string, unknown>) => Promise<RpcResult>).call(
      client,
      fn,
      params,
    );
  const { data, error } = await call(name, args);
  if (error) throw new Error(error.message);
  return data;
}

type RpcEstimate = {
  estimate: (Row & { id: string; phone?: string; email?: string }) | null;
  order: PublicEstimate["order"];
} | null;

function fromRpc(payload: unknown): PublicEstimate | null {
  const p = payload as RpcEstimate;
  if (!p?.estimate) return null;
  const row = p.estimate;
  return toPublic(row, Boolean(row.approved_at), p.order ?? null);
}

/** Public: read one estimate by its unguessable token. */
export const getPublicEstimate = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ token: tokenSchema }).parse(data))
  .handler(async ({ data }): Promise<PublicEstimate | null> =>
    fromRpc(await rpc("public_estimate_by_token", { p_token: data.token })),
  );

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
    const ip =
      (getRequestHeader("x-forwarded-for") ?? "").split(",")[0]?.trim() ||
      getRequestHeader("cf-connecting-ip") ||
      "";
    const before = fromRpc(
      await rpc("public_estimate_by_token", { p_token: data.token }),
    );
    const result = fromRpc(
      await rpc("approve_public_estimate", {
        p_token: data.token,
        p_name: data.name ?? "",
        p_session: data.session ?? "",
        p_ip: ip,
      }),
    );

    if (result && !before?.approved_at) {
      try {
        const { notifyTelegram } = await import("./submissions.server");
        await notifyTelegram({
          name: `Согласование сметы № ${result.number}${data.name ? ` (${data.name})` : ""}`,
          phone: "",
          comment: `Заказчик согласовал смету на сумму ${result.total.toLocaleString("ru-RU")} ₽. Создан заказ № ${result.order?.number ?? "—"}. Объект: ${result.object_name || result.address || "—"}`,
        });
      } catch {
        /* notification is best-effort */
      }
    }
    return result;
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
    const res = (await rpc("request_public_order_payment", {
      p_token: data.token,
      p_kind: data.kind,
    })) as { amount?: number; order_number?: string } | null;

    try {
      const { notifyTelegram } = await import("./submissions.server");
      await notifyTelegram({
        name: `Запрос оплаты по заказу № ${res?.order_number ?? "—"}`,
        phone: "",
        comment: `Сумма к оплате: ${Number(res?.amount ?? 0).toLocaleString("ru-RU")} ₽.`,
      });
    } catch {
      /* best-effort */
    }

    // No acquiring provider is connected yet — the admin confirms payment manually.
    return { ok: true, paymentUrl: null };
  });
