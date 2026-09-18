import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, Loader2, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/browser-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { deleteClientReview } from "@/lib/client-reviews.functions";
import {
  REVIEW_STATUS_LABEL,
  type ReviewStatus,
} from "@/lib/client-reviews.schemas";

type Row = {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  photo_path: string;
  status: string;
  created_at: string;
  published_at: string | null;
};

const FILTERS: { value: ReviewStatus | "all"; label: string }[] = [
  { value: "pending", label: "На модерации" },
  { value: "published", label: "Опубликованные" },
  { value: "rejected", label: "Отклонённые" },
  { value: "all", label: "Все" },
];

export function ClientReviewsModeration() {
  const removeReview = useServerFn(deleteClientReview);
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState<ReviewStatus | "all">("pending");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("client_reviews")
      .select(
        "id, name, location, rating, text, photo_path, status, created_at, published_at",
      )
      .order("created_at", { ascending: false });
    if (error) toast.error("Ошибка: " + error.message);
    setRows(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function patch(id: string, field: keyof Row, value: string | number) {
    setRows((r) => r.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  }

  async function setStatus(row: Row, status: ReviewStatus) {
    setBusyId(row.id);
    const { error } = await supabase
      .from("client_reviews")
      .update({
        status,
        published_at:
          status === "published"
            ? (row.published_at ?? new Date().toISOString())
            : null,
      })
      .eq("id", row.id);
    setBusyId(null);
    if (error) return toast.error("Ошибка: " + error.message);
    toast.success(`Статус: ${REVIEW_STATUS_LABEL[status]}`);
    load();
  }

  async function saveRow(row: Row) {
    setBusyId(row.id);
    const { error } = await supabase
      .from("client_reviews")
      .update({
        name: row.name,
        location: row.location,
        rating: Math.min(5, Math.max(1, Number(row.rating) || 5)),
        text: row.text,
      })
      .eq("id", row.id);
    setBusyId(null);
    if (error) toast.error("Ошибка: " + error.message);
    else toast.success("Сохранено");
  }

  async function remove(row: Row) {
    setBusyId(row.id);
    try {
      await removeReview({ data: { id: row.id } });
      setRows((r) => r.filter((x) => x.id !== row.id));
      toast.success("Отзыв удалён");
    } catch (e) {
      toast.error("Ошибка: " + (e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  const shown = rows.filter((r) => filter === "all" || r.status === filter);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`rounded-lg border px-3.5 py-2 text-sm font-semibold transition-colors ${
              filter === f.value
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-muted-foreground hover:border-brand"
            }`}
          >
            {f.label}
            {f.value !== "all" && (
              <span className="ml-1.5 text-xs opacity-70">
                {rows.filter((r) => r.status === f.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {shown.length === 0 && (
        <p className="py-10 text-center text-muted-foreground">
          Отзывов в этой категории нет.
        </p>
      )}

      {shown.map((row) => (
        <div
          key={row.id}
          className="rounded-xl border border-border bg-background p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold">
              {REVIEW_STATUS_LABEL[row.status as ReviewStatus] ?? row.status}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(row.created_at).toLocaleString("ru-RU")}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-end gap-3">
            <div className="min-w-40 flex-1 space-y-1.5">
              <Label>Имя</Label>
              <Input
                value={row.name}
                onChange={(e) => patch(row.id, "name", e.target.value)}
              />
            </div>
            <div className="min-w-40 flex-1 space-y-1.5">
              <Label>Посёлок / район</Label>
              <Input
                value={row.location}
                onChange={(e) => patch(row.id, "location", e.target.value)}
              />
            </div>
            <div className="w-24 space-y-1.5">
              <Label>Оценка</Label>
              <Input
                type="number"
                min={1}
                max={5}
                value={row.rating}
                onChange={(e) => patch(row.id, "rating", Number(e.target.value))}
              />
            </div>
          </div>

          <div className="mt-3 space-y-1.5">
            <Label>Текст отзыва</Label>
            <Textarea
              rows={4}
              value={row.text}
              onChange={(e) => patch(row.id, "text", e.target.value)}
            />
          </div>

          {row.photo_path && (
            <img
              src={`/api/public/photo/${row.photo_path}`}
              alt="Фото из отзыва"
              className="mt-3 h-40 rounded-lg border border-border object-cover"
            />
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => saveRow(row)} disabled={busyId === row.id}>
              {busyId === row.id ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Save className="mr-2 size-4" />
              )}
              Сохранить
            </Button>
            {row.status !== "published" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setStatus(row, "published")}
                disabled={busyId === row.id}
              >
                <Check className="mr-2 size-4" /> Опубликовать
              </Button>
            )}
            {row.status !== "rejected" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setStatus(row, "rejected")}
                disabled={busyId === row.id}
              >
                <X className="mr-2 size-4" /> Отклонить
              </Button>
            )}
            {row.status !== "pending" && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setStatus(row, "pending")}
                disabled={busyId === row.id}
              >
                Вернуть на модерацию
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => remove(row)}
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
