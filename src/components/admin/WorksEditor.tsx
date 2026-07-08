import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WORK_IMAGES, imageFor } from "@/components/site/Works";

type WorkRow = {
  id: string;
  sort_order: number;
  image_key: string;
  title: string;
  text: string;
};

export function WorksEditor() {
  const [rows, setRows] = useState<WorkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase
      .from("works")
      .select("id, sort_order, image_key, title, text")
      .order("sort_order", { ascending: true });
    setRows(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function patch(id: string, field: keyof WorkRow, value: string | number) {
    setRows((r) => r.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  }

  async function saveRow(row: WorkRow) {
    setBusyId(row.id);
    const { error } = await supabase
      .from("works")
      .update({
        sort_order: row.sort_order,
        image_key: row.image_key,
        title: row.title,
        text: row.text,
      })
      .eq("id", row.id);
    setBusyId(null);
    if (error) toast.error("Ошибка: " + error.message);
    else toast.success("Работа сохранена");
  }

  async function addRow() {
    const nextOrder = (rows.at(-1)?.sort_order ?? 0) + 1;
    const { data, error } = await supabase
      .from("works")
      .insert({ sort_order: nextOrder, image_key: "panel", title: "Новый объект", text: "" })
      .select("id, sort_order, image_key, title, text")
      .single();
    if (error) toast.error("Ошибка: " + error.message);
    else if (data) setRows((r) => [...r, data]);
  }

  async function deleteRow(id: string) {
    setBusyId(id);
    const { error } = await supabase.from("works").delete().eq("id", id);
    setBusyId(null);
    if (error) toast.error("Ошибка: " + error.message);
    else {
      setRows((r) => r.filter((row) => row.id !== id));
      toast.success("Работа удалена");
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
          <div className="flex flex-wrap gap-4">
            <img
              src={imageFor(row.image_key)}
              alt={row.title}
              className="h-24 w-32 shrink-0 rounded-lg object-cover"
            />
            <div className="flex flex-1 flex-wrap items-end gap-3">
              <div className="space-y-1.5">
                <Label>Фото</Label>
                <Select
                  value={row.image_key}
                  onValueChange={(v) => patch(row.id, "image_key", v)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WORK_IMAGES.map((opt) => (
                      <SelectItem key={opt.key} value={opt.key}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-24 space-y-1.5">
                <Label>Порядок</Label>
                <Input
                  type="number"
                  value={row.sort_order}
                  onChange={(e) => patch(row.id, "sort_order", Number(e.target.value))}
                />
              </div>
              <div className="min-w-48 flex-1 space-y-1.5">
                <Label>Заголовок</Label>
                <Input
                  value={row.title}
                  onChange={(e) => patch(row.id, "title", e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="mt-3 space-y-1.5">
            <Label>Описание</Label>
            <Textarea
              rows={2}
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
        <Plus className="mr-2 size-4" /> Добавить работу
      </Button>
    </div>
  );
}
