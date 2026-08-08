import { useEffect, useState } from "react";
import {
  Loader2,
  Trash2,
  Phone,
  MessageSquare,
  CheckCircle2,
  RotateCcw,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type SubmissionRow = {
  id: string;
  name: string;
  phone: string;
  comment: string;
  status: string;
  created_at: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SubmissionsEditor() {
  const [rows, setRows] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase
      .from("submissions")
      .select("id, name, phone, comment, status, created_at")
      .order("created_at", { ascending: false });
    setRows(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleStatus(row: SubmissionRow) {
    const next = row.status === "done" ? "new" : "done";
    setBusyId(row.id);
    const { error } = await supabase
      .from("submissions")
      .update({ status: next })
      .eq("id", row.id);
    setBusyId(null);
    if (error) {
      toast.error("Ошибка: " + error.message);
      return;
    }
    setRows((r) =>
      r.map((item) => (item.id === row.id ? { ...item, status: next } : item)),
    );
  }

  async function deleteRow(id: string) {
    setBusyId(id);
    const { error } = await supabase.from("submissions").delete().eq("id", id);
    setBusyId(null);
    if (error) {
      toast.error("Ошибка: " + error.message);
      return;
    }
    setRows((r) => r.filter((row) => row.id !== id));
    toast.success("Заявка удалена");
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
      <div className="rounded-xl border border-dashed border-border bg-background p-12 text-center">
        <Inbox className="mx-auto size-8 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">
          Заявок пока нет. Новые заявки с формы сайта появятся здесь.
        </p>
      </div>
    );
  }

  const newCount = rows.filter((r) => r.status !== "done").length;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Всего заявок: <span className="font-semibold text-foreground">{rows.length}</span>
        {newCount > 0 && (
          <>
            {" · "}
            новых: <span className="font-semibold text-brand">{newCount}</span>
          </>
        )}
      </p>

      {rows.map((row) => (
        <div
          key={row.id}
          className={`rounded-2xl border bg-background p-4 ${
            row.status === "done" ? "border-border opacity-70" : "border-brand/40"
          }`}
        >
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{row.name}</span>
                {row.status === "done" ? (
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                    Обработана
                  </span>
                ) : (
                  <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand">
                    Новая
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDate(row.created_at)}
              </p>
            </div>
            <a
              href={`tel:${row.phone.replace(/[^0-9+]/g, "")}`}
              className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-sm font-semibold text-brand hover:underline"
            >
              <Phone className="size-4 shrink-0" /> {row.phone}
            </a>
          </div>

          {row.comment.trim() && (
            <p className="mt-3 flex items-start gap-2 break-words text-sm text-muted-foreground">
              <MessageSquare className="mt-0.5 size-4 shrink-0" />
              <span className="min-w-0">{row.comment}</span>
            </p>
          )}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button
              size="sm"
              variant={row.status === "done" ? "outline" : "default"}
              onClick={() => toggleStatus(row)}
              disabled={busyId === row.id}
              className="min-h-11 w-full justify-center rounded-xl sm:w-auto"
            >
              {busyId === row.id ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : row.status === "done" ? (
                <RotateCcw className="mr-2 size-4" />
              ) : (
                <CheckCircle2 className="mr-2 size-4" />
              )}
              {row.status === "done" ? "Вернуть в новые" : "Отметить обработанной"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="min-h-11 w-full justify-center rounded-xl text-destructive hover:text-destructive sm:w-auto"
              onClick={() => deleteRow(row.id)}
              disabled={busyId === row.id}
            >
              <Trash2 className="mr-2 size-4" /> Удалить
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
