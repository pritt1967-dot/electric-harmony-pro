import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Copy,
  Download,
  FileText,
  Link2,
  Loader2,
  Plus,
  QrCode,
  Trash2,
} from "lucide-react";
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
  packItems,
  unpackItems,
} from "@/lib/estimates";
import { downloadQrPng, estimatePublicUrl, qrDataUrl } from "@/lib/estimate-qr";
import { downloadEstimatePdf } from "@/lib/estimate-pdf";

type Row = Estimate & { id: string; public_token: string };

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
    ...unpackItems(r.items),
  })) as Row[];
}

export function EstimatesList() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [qr, setQr] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchEstimates().then((r) => {
      setRows(r);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const entries = await Promise.all(
        rows
          .filter((r) => r.public_token)
          .map(
            async (r) =>
              [r.id, await qrDataUrl(estimatePublicUrl(r.public_token), 160)] as const,
          ),
      );
      if (active) setQr(Object.fromEntries(entries));
    })();
    return () => {
      active = false;
    };
  }, [rows]);

  async function setStatus(id: string, status: EstimateStatus) {
    const row = rows.find((r) => r.id === id);
    if (row?.approved_at && status !== "approved" && status !== "done") {
      return toast.error("Смета согласована заказчиком — статус нельзя понизить");
    }
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
    const { error } = await supabase.from("estimates").update({ status }).eq("id", id);
    if (error) toast.error("Ошибка: " + error.message);
  }

  async function duplicate(row: Row) {
    setBusyId(row.id);
    const number = nextNumber(rows.map((r) => r.number));
    const {
      id: _id,
      public_token: _t,
      approved_at: _a,
      approved_by_name: _n,
      ...rest
    } = row;
    const { data, error } = await supabase
      .from("estimates")
      .insert({
        ...rest,
        approved_snapshot: null,
        number,
        status: "draft",
        items: packItems(row.items, row.surcharges) as never,
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
          ...unpackItems(data.items),
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

  async function copyLink(row: Row) {
    const url = estimatePublicUrl(row.public_token);
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Ссылка скопирована");
    } catch {
      toast.error(url);
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
      <Button asChild className="h-11">
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
            className="rounded-xl border border-border bg-background p-4"
          >
            <div className="flex flex-wrap items-start gap-4">
              {qr[row.id] && (
                <img
                  src={qr[row.id]}
                  alt={`QR-код сметы № ${row.number}`}
                  className="size-20 shrink-0 rounded-lg border border-border bg-white p-1"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 flex-wrap items-center gap-x-2 font-semibold">
                  <FileText className="size-4 shrink-0 text-brand" />
                  <span>№ {row.number || "—"}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    от {formatDate(row.doc_date)}
                  </span>
                </div>
                <p className="mt-1 text-sm">
                  {row.customer_name || "Без заказчика"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {row.address || "Объект не указан"}
                </p>
                <p className="mt-1 font-bold">{money(row.total)} ₽</p>
                {row.approved_at && (
                  <p className="mt-1 text-xs text-brand">
                    Согласована {new Date(row.approved_at).toLocaleString("ru-RU")}
                  </p>
                )}
              </div>
              <Select
                value={row.status}
                onValueChange={(v) => setStatus(row.id, v as EstimateStatus)}
              >
                <SelectTrigger className="h-11 w-40">
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
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="h-11" asChild>
                <Link to="/estimate/$id" params={{ id: row.id }}>
                  Открыть
                </Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-11"
                onClick={() =>
                  downloadEstimatePdf(
                    row,
                    undefined,
                    estimatePublicUrl(row.public_token),
                  ).catch(() => toast.error("Не удалось сформировать PDF"))
                }
              >
                <Download className="mr-2 size-4" /> PDF
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-11"
                onClick={() => copyLink(row)}
              >
                <Link2 className="mr-2 size-4" /> Ссылка
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-11"
                onClick={() =>
                  downloadQrPng(
                    estimatePublicUrl(row.public_token),
                    `QR-smeta-${row.number || row.id}.png`,
                  )
                }
              >
                <QrCode className="mr-2 size-4" /> QR
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-11"
                onClick={() => duplicate(row)}
                disabled={busyId === row.id}
              >
                <Copy className="size-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-11 text-destructive hover:text-destructive"
                onClick={() => remove(row.id)}
                disabled={busyId === row.id}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
