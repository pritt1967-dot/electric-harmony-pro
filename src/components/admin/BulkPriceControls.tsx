import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Download, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/browser-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { priceChangeSchema, readPriceBatch, type PriceChangeBatch } from "@/lib/bulk-prices";
import { money } from "@/lib/estimates";

export function BulkPriceControls({ categories, selected, onApplied, disabled }: {
  categories: string[]; selected: string[]; onApplied: () => Promise<void>; disabled: boolean;
}) {
  const queryClient = useQueryClient();
  const [percent, setPercent] = useState("");
  const [scope, setScope] = useState<"all" | "selected" | "category">("all");
  const [category, setCategory] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [preview, setPreview] = useState<PriceChangeBatch | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [history, setHistory] = useState<PriceChangeBatch[]>([]);

  async function loadHistory() {
    const { data, error } = await supabase.from("price_change_batches")
      .select("id,direction,percent,scope,category,items,status,created_at")
      .in("status", ["applied", "restored"]).order("created_at", { ascending: false }).limit(10);
    if (error) throw error;
    setHistory((data ?? []).map(readPriceBatch));
  }
  useEffect(() => { void loadHistory().catch(() => toast.error("Не удалось загрузить историю изменения цен")); }, []);

  async function openPreview(direction: "increase" | "decrease") {
    if (lock.current) return;
    const parsed = priceChangeSchema.safeParse({ direction, percent: Number(percent.replace(",", ".")), scope, category, ids: selected });
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message ?? "Проверьте процент"); return; }
    lock.current = true; setBusy(true);
    try {
      const { data, error } = await supabase.rpc("preview_price_change", {
        p_id: crypto.randomUUID(), p_direction: direction, p_percent: parsed.data.percent,
        p_scope: scope, p_category: category, p_ids: selected,
      });
      if (error) throw error;
      setRestoring(false); setPreview(readPriceBatch(data));
    } catch (error) { toast.error(error instanceof Error ? error.message : "Не удалось подготовить изменение цен"); }
    finally { lock.current = false; setBusy(false); }
  }

  async function apply() {
    if (!preview || lock.current) return;
    lock.current = true; setBusy(true);
    try {
      const { data, error } = await supabase.rpc("apply_price_change", { p_id: preview.id, p_restore: restoring });
      if (error) throw error;
      const result = readPriceBatch(data);
      // Read back every affected price before claiming success.
      const { data: actual, error: readError } = await supabase.from("price_items").select("id,price").in("id", result.items.map(i => i.id));
      if (readError) throw readError;
      if (actual?.length !== result.items.length || result.items.some(i => actual.find(r => r.id === i.id)?.price !== (restoring ? i.old_price : i.new_price)))
        throw new Error("Операция выполнена, но цены уже изменились. Обновите прайс");
      setPreview(null);
      await onApplied();
      await queryClient.invalidateQueries({ predicate: q => q.queryKey[0] === "public-prices" || q.queryKey[0] === "public-work-prices" || q.queryKey[0] === "public-price-minimums" });
      await loadHistory();
      toast.success(restoring ? "Исходные цены восстановлены" : `Цены сохранены: ${result.items.length} позиций`);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Не удалось применить цены"); }
    finally { lock.current = false; setBusy(false); }
  }

  async function downloadBackup(id: string) {
    const { data, error } = await supabase.from("price_change_batches").select("backup").eq("id", id).single();
    if (error || !data) { toast.error("Не удалось скачать резервную копию"); return; }
    const url = URL.createObjectURL(new Blob([JSON.stringify(data.backup, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = `price-backup-${id}.json`; link.click(); URL.revokeObjectURL(url);
  }

  return <section className="space-y-3 border-y border-border py-4" aria-label="Массовое изменение цен">
    <h3 className="font-semibold">Изменение цен на процент</h3>
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1.5"><Label htmlFor="price-percent">Процент, %</Label><Input id="price-percent" className="w-32" inputMode="decimal" value={percent} onChange={e => setPercent(e.target.value)} disabled={busy || disabled} /></div>
      <div className="min-w-56 space-y-1.5"><Label>Область применения</Label><Select value={scope} onValueChange={v => setScope(v as typeof scope)} disabled={busy || disabled}><SelectTrigger aria-label="Область применения"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Все позиции прайса</SelectItem><SelectItem value="selected">Только выбранные ({selected.length})</SelectItem><SelectItem value="category">Отдельная категория работ</SelectItem></SelectContent></Select></div>
      {scope === "category" && <Select value={category} onValueChange={setCategory} disabled={busy || disabled}><SelectTrigger className="w-64" aria-label="Категория для изменения цен"><SelectValue placeholder="Выберите категорию" /></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>}
      <Button disabled={busy || disabled} onClick={() => openPreview("increase")}><ArrowUp className="mr-2 size-4" />Увеличить цены</Button>
      <Button variant="outline" disabled={busy || disabled} onClick={() => openPreview("decrease")}><ArrowDown className="mr-2 size-4" />Уменьшить цены</Button>
      {busy && <Loader2 className="size-4 animate-spin" />}
    </div>
    {disabled && <p role="alert" className="text-sm text-destructive">Сначала сохраните изменения отдельных позиций.</p>}
    {history.length > 0 && <details><summary className="cursor-pointer text-sm font-semibold">История изменений и резервные копии</summary><div className="mt-3 space-y-2">{history.map(b => <div key={b.id} className="flex flex-wrap items-center gap-2 border-b border-border py-2 text-sm"><span className="min-w-48 flex-1">{new Date(b.created_at).toLocaleString("ru-RU")} · {b.direction === "increase" ? "+" : "−"}{b.percent}% · {b.items.length} позиций · {b.status === "restored" ? "восстановлено" : "применено"}</span><Button variant="ghost" size="sm" disabled={busy} onClick={() => downloadBackup(b.id)}><Download className="mr-2 size-4" />Копия</Button>{b.status === "applied" && <Button variant="outline" size="sm" disabled={busy || disabled} onClick={() => { setRestoring(true); setPreview(b); }}><RotateCcw className="mr-2 size-4" />Восстановить</Button>}</div>)}</div></details>}
    <Dialog open={!!preview} onOpenChange={open => { if (!open && !busy) setPreview(null); }}><DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>{restoring ? "Восстановление исходных цен" : "Подтверждение изменения цен"}</DialogTitle><DialogDescription>Позиций: {preview?.items.length}. {restoring ? "Будут возвращены цены до этой операции." : "Резервная копия исходного прайса сохранена. Изменяется только цена работ."}</DialogDescription></DialogHeader><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border"><th className="p-2 text-left">Позиция</th><th className="p-2 text-right">Старая цена</th><th className="p-2 text-right">Новая цена</th></tr></thead><tbody>{preview?.items.map(i => <tr key={i.id} className="border-b border-border"><td className="p-2">{i.name}</td><td className="whitespace-nowrap p-2 text-right">{money(restoring ? i.new_price : i.old_price)} ₽</td><td className="whitespace-nowrap p-2 text-right font-semibold">{money(restoring ? i.old_price : i.new_price)} ₽</td></tr>)}</tbody></table></div><DialogFooter><Button variant="outline" disabled={busy} onClick={() => setPreview(null)}>Отмена</Button><Button disabled={busy} onClick={apply}>{busy && <Loader2 className="mr-2 size-4 animate-spin" />}{restoring ? "Подтвердить восстановление" : "Подтвердить изменение"}</Button></DialogFooter></DialogContent></Dialog>
  </section>;
}