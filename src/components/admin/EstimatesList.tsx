import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Copy, FileText, Loader2, Plus, Trash2 } from "lucide-react";
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
import {
  STATUS_LABEL,
  type Estimate,
  type EstimateItem,
  type EstimateStatus,
  formatDate,
  money,
  nextNumber,
} from "@/lib/estimates";

type Row = Estimate & { id: string };

export async function fetchEstimates(): Promise<Row[]> {
  const { data } = await supabase
    .from("estimates")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []).map((r) => ({
    ...r,
    total: Number(r.total),
    discount_value: Number(r.discount_value),
    discount_type: r.discount_type as Estimate["discount_type"],
    status: r.status as EstimateStatus,
    items: (r.items ?? []) as unknown as EstimateItem[],
  })) as Row[];
}

export function EstimatesList() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    fetchEstimates().then((r) => {
      setRows(r);
      setLoading(false);
    });
  }, []);

  async function setStatus(id: string, status: EstimateStatus) {
    setRows((r) => r.map((row) => (row.id === id ? { ...row, status } : row)));
    const { error } = await supabase.from("estimates").update({ status }).eq("id", id);
    if (error) toast.error("Ошибка: " + error.message);
  }

  async function duplicate(row: Row) {
    setBusyId(row.id);
    const number = nextNumber(rows.map((r) => r.number));
    const { id: _id, ...rest } = row;
    const { data, error } = await supabase
      .from("estimates")
      .insert({
        ...rest,
        number,
        status: "draft",
        items: row.items as never,
      })
      .select("*")
      .single();
    setBusyId(null);
    if (error) toast.error("Ошибка: " + error.message);
    else if (data) {
      setRows((r) => [
        {
          ...(data as unknown as Row),
          total: Number(data.total),
          discount_value: Number(data.discount_value),
          items: (data.items ?? []) as unknown as EstimateItem[],
        },
        ...r,
      ]);
      toast.success("Смета продублирована");
    }
  }

  async function remove(id: string) {
    setBusyId(id);
    const { error } = await supabase.from("estimates").delete().eq("id", id);
    setBusyId(null);
    if (error) toast.error("Ошибка: " + error.message);
    else {
      setRows((r) => r.filter((row) => row.id !== id));
      toast.success("Смета удалена");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button asChild>
        <Link to="/estimate/$id" params={{ id: "new" }}>
          <Plus className="mr-2 size-4" /> Новая смета
        </Link>
      </Button>

      {rows.length === 0 && (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          Смет пока нет. Создайте первую — данные заказчика, работы из прайса и
          готовый PDF за пару минут.
        </p>
      )}

      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.id}
            className="rounded-xl border border-border bg-background p-4 sm:flex sm:flex-wrap sm:items-center sm:gap-3"
          >
            <div className="min-w-0 sm:min-w-52 sm:flex-1">
              <div className="flex min-w-0 flex-wrap items-center gap-x-2 font-semibold">
                <FileText className="size-4 shrink-0 text-brand" />
                <span>№ {row.number || "—"}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  от {formatDate(row.doc_date)}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {row.customer_name || "Без заказчика"}
                {row.address ? ` · ${row.address}` : ""}
              </p>
            </div>
            <div className="mt-2 font-bold sm:mt-0 sm:text-right">
              {money(row.total)} ₽
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 sm:mt-0 sm:contents">
              <Select
                value={row.status}
                onValueChange={(v) => setStatus(row.id, v as EstimateStatus)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_LABEL) as EstimateStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" asChild>
                  <Link to="/estimate/$id" params={{ id: row.id }}>
                    Открыть
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => duplicate(row)}
                  disabled={busyId === row.id}
                >
                  <Copy className="size-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => remove(row.id)}
                  disabled={busyId === row.id}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
