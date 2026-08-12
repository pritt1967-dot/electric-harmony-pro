import { useEffect, useMemo, useState } from "react";
import { FileDown, Loader2, Plus, Save, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { downloadPricePdf } from "@/lib/price-pdf";
import { UNITS, money } from "@/lib/estimates";

export type PriceRow = {
  id: string;
  category: string;
  name: string;
  unit: string;
  price: number;
  comment: string;
  description: string;
  public_category: string;
  price_from: boolean;
  sort_order: number;
  is_public: boolean;
  in_calculator: boolean;
};

const PRICE_SELECT =
  "id, category, name, unit, price, comment, description, public_category, price_from, sort_order, is_public, in_calculator";

export const PUBLIC_CATEGORY_OPTIONS = [
  "Электромонтажные работы",
  "Электрические щиты",
  "Освещение",
  "Розетки и выключатели",
  "Кабельные линии",
  "Заземление",
  "Поиск и устранение неисправностей",
  "Работы в квартире",
  "Работы в частном доме",
  "Дополнительные работы",
];

export async function fetchPriceItems(): Promise<PriceRow[]> {
  const { data } = await supabase
    .from("price_items")
    .select(PRICE_SELECT)
    .order("category")
    .order("name");
  return (data ?? []).map((r) => ({ ...r, price: Number(r.price) }));
}


export function PriceEditor() {
  const [rows, setRows] = useState<PriceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [pickedCats, setPickedCats] = useState<string[]>([]);
  const [pickedUnits, setPickedUnits] = useState<string[]>([]);

  useEffect(() => {
    fetchPriceItems().then((r) => {
      setRows(r);
      setLoading(false);
    });
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(rows.map((r) => r.category))).sort(),
    [rows],
  );

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (category === "all" || r.category === category) &&
          (r.name.toLowerCase().includes(query.toLowerCase()) ||
            r.comment.toLowerCase().includes(query.toLowerCase())),
      ),
    [rows, query, category],
  );

  const allUnits = useMemo(
    () => Array.from(new Set(rows.map((r) => r.unit))).sort(),
    [rows],
  );

  const exportRows = useMemo(
    () =>
      rows.filter(
        (r) => pickedCats.includes(r.category) && pickedUnits.includes(r.unit),
      ),
    [rows, pickedCats, pickedUnits],
  );

  function openExport() {
    setPickedCats(category === "all" ? categories : [category]);
    setPickedUnits(allUnits);
    setExportOpen(true);
  }

  function toggle(list: string[], value: string, set: (v: string[]) => void) {
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  async function exportPdf() {
    if (!exportRows.length) {
      toast.error("Нет позиций для экспорта");
      return;
    }
    setExporting(true);
    try {
      await downloadPricePdf(exportRows);
      setExportOpen(false);
    } catch (e) {
      toast.error("Ошибка PDF: " + (e as Error).message);
    } finally {
      setExporting(false);
    }
  }



  function patch(id: string, field: keyof PriceRow, value: string | number) {
    setRows((r) => r.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  }

  async function saveRow(row: PriceRow) {
    setBusyId(row.id);
    const { error } = await supabase
      .from("price_items")
      .update({
        category: row.category,
        name: row.name,
        unit: row.unit,
        price: row.price,
        comment: row.comment,
      })
      .eq("id", row.id);
    setBusyId(null);
    if (error) toast.error("Ошибка: " + error.message);
    else toast.success("Позиция сохранена");
  }

  async function addRow() {
    const { data, error } = await supabase
      .from("price_items")
      .insert({
        category: category === "all" ? "Общие" : category,
        name: "Новая работа",
        unit: "шт",
        price: 0,
      })
      .select("id, category, name, unit, price, comment")
      .single();
    if (error) toast.error("Ошибка: " + error.message);
    else if (data) setRows((r) => [{ ...data, price: Number(data.price) }, ...r]);
  }

  async function deleteRow(id: string) {
    setBusyId(id);
    const { error } = await supabase.from("price_items").delete().eq("id", id);
    setBusyId(null);
    if (error) toast.error("Ошибка: " + error.message);
    else {
      setRows((r) => r.filter((row) => row.id !== id));
      toast.success("Позиция удалена");
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
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Поиск по названию…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все категории</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={exportOpen} onOpenChange={setExportOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={openExport}>
              <FileDown className="mr-2 size-4" /> Экспорт в PDF
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Экспорт прайса в PDF</DialogTitle>
              <DialogDescription>
                Выберите категории и единицы измерения для выгрузки.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label>Категории</Label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setPickedCats(categories)}
                    >
                      Все
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setPickedCats([])}>
                      Снять
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {categories.map((c) => (
                    <label key={c} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={pickedCats.includes(c)}
                        onCheckedChange={() => toggle(pickedCats, c, setPickedCats)}
                      />
                      <span className="truncate">{c}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label>Единицы измерения</Label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setPickedUnits(allUnits)}
                    >
                      Все
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setPickedUnits([])}>
                      Снять
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {allUnits.map((u) => (
                    <label key={u} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={pickedUnits.includes(u)}
                        onCheckedChange={() => toggle(pickedUnits, u, setPickedUnits)}
                      />
                      {u}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:justify-between">
              <span className="text-sm text-muted-foreground">
                Позиций к выгрузке: {exportRows.length}
              </span>
              <Button onClick={exportPdf} disabled={exporting}>
                {exporting ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <FileDown className="mr-2 size-4" />
                )}
                Скачать PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button onClick={addRow}>
          <Plus className="mr-2 size-4" /> Добавить работу
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Позиций: {filtered.length} из {rows.length}
      </p>

      <div className="space-y-3">
        {filtered.map((row) => (
          <div key={row.id} className="rounded-xl border border-border bg-background p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5 lg:col-span-2">
                <Label>Наименование работы</Label>
                <Input
                  value={row.name}
                  onChange={(e) => patch(row.id, "name", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Категория</Label>
                <Input
                  value={row.category}
                  onChange={(e) => patch(row.id, "category", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Ед. изм.</Label>
                  <Select
                    value={row.unit}
                    onValueChange={(v) => patch(row.id, "unit", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(new Set([...UNITS, row.unit])).map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Цена, ₽</Label>
                  <Input
                    type="number"
                    value={row.price}
                    onChange={(e) => patch(row.id, "price", Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1.5">
              <Label>Комментарий</Label>
              <Input
                value={row.comment}
                onChange={(e) => patch(row.id, "comment", e.target.value)}
                placeholder="необязательно"
              />
            </div>
            <div className="mt-3 flex items-center gap-2">
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
              <span className="ml-auto text-sm text-muted-foreground">
                {money(row.price)} ₽ / {row.unit}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
