import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronDown,
  ChevronUp,
  History,
  Loader2,
  Package,
  Trash2,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { money, formatDate, unpackItems, type EstimateItem } from "@/lib/estimates";
import {
  ORDER_STATUS_FLOW,
  ORDER_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
  derivePaymentStatus,
  orderStatusLabel,
  paymentStatusLabel,
  remainingAmount,
  type PaymentStatus,
} from "@/lib/orders";

type OrderRow = {
  id: string;
  number: string;
  estimate_id: string | null;
  estimate_number: string;
  estimate_version: number;
  customer_name: string;
  address: string;
  object_name: string;
  phone: string;
  total: number;
  paid_amount: number;
  payment_status: string;
  approved_at: string | null;
  created_at: string;
  status: string;
  items: EstimateItem[];
};

type EventRow = {
  id: string;
  order_id: string | null;
  kind: string;
  message: string;
  from_status: string;
  to_status: string;
  actor: string;
  created_at: string;
};

export function OrdersList() {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [payInput, setPayInput] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      const [orders, log] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase
          .from("order_events")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(500),
      ]);
      setRows(
        (orders.data ?? []).map((r) => ({
          ...r,
          total: Number(r.total),
          paid_amount: Number((r as { paid_amount?: number }).paid_amount ?? 0),
          items: unpackItems(r.items).items,
        })) as unknown as OrderRow[],
      );
      setEvents((log.data ?? []) as unknown as EventRow[]);
      setLoading(false);
    })();
  }, []);

  async function logEvent(order: OrderRow, event: Record<string, unknown>) {
    const { data } = await supabase
      .from("order_events")
      .insert({
        order_id: order.id,
        estimate_id: order.estimate_id,
        actor: "admin",
        ...event,
      } as never)
      .select("*")
      .single();
    if (data) setEvents((e) => [data as unknown as EventRow, ...e]);
  }

  async function setStatus(order: OrderRow, status: string) {
    const from = order.status;
    setRows((r) => r.map((x) => (x.id === order.id ? { ...x, status } : x)));
    const { error } = await supabase.from("orders").update({ status }).eq("id", order.id);
    if (error) {
      toast.error("Ошибка: " + error.message);
      return;
    }
    await logEvent(order, {
      kind: "status",
      message: `Статус заказа изменён: ${orderStatusLabel(from)} → ${orderStatusLabel(status)}`,
      from_status: from,
      to_status: status,
    });
  }

  async function setPaid(order: OrderRow, amountRaw: string) {
    const amount = Math.max(Number(amountRaw.replace(",", ".")) || 0, 0);
    const payment_status: PaymentStatus = derivePaymentStatus(order.total, amount);
    setRows((r) =>
      r.map((x) => (x.id === order.id ? { ...x, paid_amount: amount, payment_status } : x)),
    );
    const { error } = await supabase
      .from("orders")
      .update({ paid_amount: amount, payment_status } as never)
      .eq("id", order.id);
    if (error) {
      toast.error("Ошибка: " + error.message);
      return;
    }
    await logEvent(order, {
      kind: "payment",
      message: `Оплата обновлена: ${money(amount)} ₽ из ${money(order.total)} ₽ — ${paymentStatusLabel(payment_status)}`,
      from_status: order.payment_status,
      to_status: payment_status,
    });
    toast.success("Оплата обновлена");
  }

  async function remove(id: string) {
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) {
      toast.error("Ошибка: " + error.message);
      return;
    }
    setRows((r) => r.filter((x) => x.id !== id));
    toast.success("Заказ удалён");
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin text-brand" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Заказов пока нет. Заказ создаётся автоматически, когда заказчик согласует смету
        по ссылке или QR-коду.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const rest = remainingAmount(row.total, row.paid_amount);
        const history = events.filter((e) => e.order_id === row.id);
        const expanded = openId === row.id;
        return (
          <div key={row.id} className="rounded-xl border border-border bg-background p-4">
            <div className="flex flex-wrap items-center gap-x-2 font-semibold">
              <Package className="size-4 shrink-0 text-brand" />
              <span>Заказ № {row.number || "—"}</span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {orderStatusLabel(row.status)}
              </span>
            </div>

            <dl className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
              <Field
                label="Смета"
                value={`№ ${row.estimate_number || "—"} (версия ${row.estimate_version ?? 1})`}
              />
              <Field label="Заказчик" value={row.customer_name || "—"} />
              <Field label="Объект" value={row.object_name || row.address || "—"} />
              <Field label="Адрес" value={row.address || "—"} />
              {row.phone && <Field label="Телефон" value={row.phone} />}
              <Field
                label="Согласовано"
                value={
                  row.approved_at ? new Date(row.approved_at).toLocaleString("ru-RU") : "—"
                }
              />
              <Field label="Позиций" value={String(row.items.length)} />
              <Field label="Сумма" value={`${money(row.total)} ₽`} />
            </dl>

            <div className="mt-3 rounded-xl border border-border bg-secondary/40 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Wallet className="size-4 text-brand" /> Оплата ·{" "}
                {paymentStatusLabel(row.payment_status)}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Оплачено {money(row.paid_amount)} ₽ · остаток {money(rest)} ₽
              </p>
              <div className="mt-2 flex flex-wrap items-end gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Оплачено, ₽</Label>
                  <Input
                    className="h-11 w-36"
                    inputMode="decimal"
                    value={payInput[row.id] ?? String(row.paid_amount)}
                    onChange={(e) =>
                      setPayInput((p) => ({ ...p, [row.id]: e.target.value }))
                    }
                  />
                </div>
                <Button
                  className="h-11"
                  onClick={() => setPaid(row, payInput[row.id] ?? String(row.paid_amount))}
                >
                  Сохранить оплату
                </Button>
                <Button
                  variant="outline"
                  className="h-11"
                  onClick={() => {
                    setPayInput((p) => ({ ...p, [row.id]: String(row.total) }));
                    void setPaid(row, String(row.total));
                  }}
                >
                  Оплачено полностью
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Статусы оплаты: {Object.values(PAYMENT_STATUS_LABEL).join(" · ")}.
              </p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Select value={row.status} onValueChange={(v) => setStatus(row, v)}>
                <SelectTrigger className="h-11 w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUS_FLOW.map((v) => (
                    <SelectItem key={v} value={v}>
                      {ORDER_STATUS_LABEL[v]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {row.estimate_id && (
                <Button size="sm" variant="outline" className="h-11" asChild>
                  <Link to="/estimate/$id" params={{ id: row.estimate_id }}>
                    Открыть смету
                  </Link>
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="h-11"
                onClick={() => setOpenId(expanded ? null : row.id)}
              >
                <History className="mr-2 size-4" />
                История ({history.length})
                {expanded ? (
                  <ChevronUp className="ml-2 size-4" />
                ) : (
                  <ChevronDown className="ml-2 size-4" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-11 text-destructive hover:text-destructive"
                onClick={() => remove(row.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>

            {expanded && (
              <ol className="mt-3 space-y-2 border-t border-border pt-3">
                {history.length === 0 && (
                  <li className="text-sm text-muted-foreground">Событий пока нет.</li>
                )}
                {history.map((e) => (
                  <li key={e.id} className="text-sm">
                    <span className="text-muted-foreground">
                      {new Date(e.created_at).toLocaleString("ru-RU")} ·{" "}
                      {e.actor === "customer"
                        ? "заказчик"
                        : e.actor === "admin"
                          ? "администратор"
                          : "система"}
                      :{" "}
                    </span>
                    {e.message}
                  </li>
                ))}
                <li className="text-xs text-muted-foreground">
                  Заказ создан {formatDate(row.created_at)}
                </li>
              </ol>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 text-muted-foreground">{label}:</dt>
      <dd className="min-w-0 font-medium">{value}</dd>
    </div>
  );
}
