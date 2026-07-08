import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type ReviewRow = {
  id: string;
  sort_order: number;
  name: string;
  role: string;
  text: string;
};

export function ReviewsEditor() {
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase
      .from("reviews")
      .select("id, sort_order, name, role, text")
      .order("sort_order", { ascending: true });
    setRows(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function patch(id: string, field: keyof ReviewRow, value: string | number) {
    setRows((r) => r.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  }

  async function saveRow(row: ReviewRow) {
    setBusyId(row.id);
    const { error } = await supabase
      .from("reviews")
      .update({
        sort_order: row.sort_order,
        name: row.name,
        role: row.role,
        text: row.text,
      })
      .eq("id", row.id);
    setBusyId(null);
    if (error) toast.error("Ошибка: " + error.message);
    else toast.success("Отзыв сохранён");
  }

  async function addRow() {
    const nextOrder = (rows.at(-1)?.sort_order ?? 0) + 1;
    const { data, error } = await supabase
      .from("reviews")
      .insert({ sort_order: nextOrder, name: "Имя Клиента", role: "", text: "" })
      .select("id, sort_order, name, role, text")
      .single();
    if (error) toast.error("Ошибка: " + error.message);
    else if (data) setRows((r) => [...r, data]);
  }

  async function deleteRow(id: string) {
    setBusyId(id);
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    setBusyId(null);
    if (error) toast.error("Ошибка: " + error.message);
    else {
      setRows((r) => r.filter((row) => row.id !== id));
      toast.success("Отзыв удалён");
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
    <div className="space-y-5">
      {rows.map((row) => (
        <div key={row.id} className="rounded-xl border border-border bg-background p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-24 space-y-1.5">
              <Label>Порядок</Label>
              <Input
                type="number"
                value={row.sort_order}
                onChange={(e) => patch(row.id, "sort_order", Number(e.target.value))}
              />
            </div>
            <div className="min-w-40 flex-1 space-y-1.5">
              <Label>Имя</Label>
              <Input
                value={row.name}
                onChange={(e) => patch(row.id, "name", e.target.value)}
              />
            </div>
            <div className="min-w-40 flex-1 space-y-1.5">
              <Label>Подпись (район / роль)</Label>
              <Input
                value={row.role}
                onChange={(e) => patch(row.id, "role", e.target.value)}
              />
            </div>
          </div>
          <div className="mt-3 space-y-1.5">
            <Label>Текст отзыва</Label>
            <Textarea
              rows={3}
              value={row.text}
              onChange={(e) => patch(row.id, "text", e.target.value)}
            />
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={() => saveRow(row)} disabled={busyId === row.id}>
              {busyId === row.id ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Save className="mr-2 size-4" />
              )}
              Сохранить
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => deleteRow(row.id)}
              disabled={busyId === row.id}
            >
              <Trash2 className="mr-2 size-4" /> Удалить
            </Button>
          </div>
        </div>
      ))}
      <Button variant="outline" onClick={addRow}>
        <Plus className="mr-2 size-4" /> Добавить отзыв
      </Button>
    </div>
  );
}
