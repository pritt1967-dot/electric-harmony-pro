import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2, Package, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { money, type EstimateItem } from "@/lib/estimates";

const ORDER_STATUS: Record<string, string> = {
  new: "Новый",
  in_progress: "В работе",
  done: "Выполнен",
  cancelled: "Отменён",
};

type OrderRow = {
  id: string;
  number: string;
  estimate_id: string | null;
  estimate_number: string;
  customer_name: string;
  address: string;
  phone: string;
  total: number;
  approved_at: string | null;
  status: string;
  items: EstimateItem[];
};

export function OrdersList() {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setRows(
          (data ?? []).map((r) => ({
            ...r,
            total: Number(r.total),
            items: (r.items ?? []) as unknown as EstimateItem[],
          })) as OrderRow[],
        );
        setLoading(false);
      });
  }, []);

  async function setStatus(id: string, status: string) {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error("Ошибка: " + error.message);
  }

  async function remove(id: string) {
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) return toast.error("Ошибка: " + error.message);
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
        Заказов пока нет. Заказ создаётся автоматически, когда заказчик согласует
        смету по ссылке или QR-коду.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.id} className="rounded-xl border border-border bg-background p-4">
          <div className="flex flex-wrap items-center gap-x-2 font-semibold">
            <Package className="size-4 shrink-0 text-brand" />
            <span>Заказ по смете № {row.estimate_number || "—"}</span>
          </div>
          <p className="mt-1 text-sm">{row.customer_name || "Без заказчика"}</p>
          <p className="text-sm text-muted-foreground">
            {row.address || "Объект не указан"}
            {row.phone ? ` · ${row.phone}` : ""}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Позиций: {row.items.length}
            {row.approved_at
              ? ` · согласовано ${new Date(row.approved_at).toLocaleString("ru-RU")}`
              : ""}
          </p>
          <p className="mt-1 font-bold">{money(row.total)} ₽</p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Select value={row.status} onValueChange={(v) => setStatus(row.id, v)}>
              <SelectTrigger className="h-11 w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ORDER_STATUS).map(([v, label]) => (
                  <SelectItem key={v} value={v}>
                    {label}
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
              variant="ghost"
              className="h-11 text-destructive hover:text-destructive"
              onClick={() => remove(row.id)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
