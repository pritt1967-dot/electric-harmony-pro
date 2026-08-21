import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Copy,
  Download,
  FileDown,
  Image as ImageIcon,
  Loader2,
  Plus,
  Printer,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import { Toaster, toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchPriceItems, type PriceRow } from "@/components/admin/PriceEditor";
import {
  STATUS_LABEL,
  SURCHARGE_KEYS,
  SURCHARGE_META,
  UNITS,
  type DiscountType,
  type Estimate,
  type EstimateItem,
  type EstimateStatus,
  type SurchargeKey,
  type Surcharges,
  type Markup,
  applyItemSurcharges,
  applyMarkup,
  emptyMarkup,
  computeEstimateTotals,
  defaultSurcharges,
  emptyEstimate,
  lineTotal,
  legacySurcharges,
  money,
  nextNumber,
  packItems,
  subtotal,
  unpackItems,
} from "@/lib/estimates";
import { fetchSurchargePercents } from "@/lib/surcharge-settings";
import { downloadEstimatePdf, printEstimatePdf } from "@/lib/estimate-pdf";
import { downloadQrPng, estimatePublicUrl, qrDataUrl } from "@/lib/estimate-qr";
import { downloadEstimateDocx } from "@/lib/estimate-docx";

export const Route = createFileRoute("/_authenticated/estimate/$id")({
  component: EstimateEditor,
});

const LOGO_KEY = "sm-electric-custom-logo";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Новая смета сразу применяет проценты из настроек: иначе администратор видит
 * проценты, но они не участвуют в расчёте. Высота и пусконаладка влияют только
 * на отмеченные позиции, поэтому включение по умолчанию безопасно.
 */
function activeSurcharges(percents: Record<SurchargeKey, number>): Surcharges {
  const base = defaultSurcharges(percents);
  for (const key of SURCHARGE_KEYS) base[key].enabled = true;
  return base;
}


function EstimateEditor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [price, setPrice] = useState<PriceRow[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | undefined>(undefined);
  const [qr, setQr] = useState<string | null>(null);
  const [publicUrl, setPublicUrl] = useState("");

  useEffect(() => {
    setLogo(localStorage.getItem(LOGO_KEY) ?? undefined);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const [items, existing, all, percents] = await Promise.all([
        fetchPriceItems(),
        id === "new"
          ? Promise.resolve(null)
          : supabase.from("estimates").select("*").eq("id", id).maybeSingle(),
        supabase.from("estimates").select("number"),
        fetchSurchargePercents(),
      ]);
      if (!active) return;
      setPrice(items);
      if (existing?.data) {
        const d = existing.data;
        const unpacked = unpackItems(d.items);
        setEstimate({
          ...d,
          total: Number(d.total),
          discount_value: Number(d.discount_value),
          discount_type: d.discount_type as DiscountType,
          status: d.status as EstimateStatus,
          // Редактор работает с исходными ценами, заказчик — с итоговыми.
          items: unpacked.baseItems,
          markup: unpacked.markup,
          // Уже созданная смета сохраняет свои фактические проценты.
          // Старые сметы без служебных полей открываются с 0/false. Значения
          // существуют только в памяти и не записываются без явного сохранения.
          surcharges: unpacked.surcharges ?? legacySurcharges(),
        } as Estimate);
      } else {
        setEstimate({
          ...emptyEstimate(nextNumber((all.data ?? []).map((r) => r.number))),
          surcharges: activeSurcharges(percents),
          markup: emptyMarkup(),
        });
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    const token = estimate?.public_token;
    if (!token) return;
    let active = true;
    const url = estimatePublicUrl(token);
    setPublicUrl(url);
    qrDataUrl(url, 220)
      .then((value) => {
        if (active) setQr(value);
      })
      .catch(() => {
        if (active) setQr(null);
      });
    return () => {
      active = false;
    };
  }, [estimate?.public_token]);

  const categories = useMemo(
    () => Array.from(new Set(price.map((p) => p.category))).sort(),
    [price],
  );
  const filteredPrice = useMemo(
    () =>
      price.filter(
        (p) =>
          (category === "all" || p.category === category) &&
          p.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [price, query, category],
  );

  if (!estimate) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-brand" />
      </div>
    );
  }

  const est = estimate;
  const set = <K extends keyof Estimate>(key: K, value: Estimate[K]) =>
    setEstimate((e) => (e ? { ...e, [key]: value } : e));

  function addFromPrice(p: PriceRow) {
    set("items", [
      ...est.items,
      { id: uid(), name: p.name, unit: p.unit, qty: 1, price: p.price, comment: "" },
    ]);
    toast.success("Добавлено: " + p.name);
  }

  function addCustom() {
    set("items", [
      ...est.items,
      { id: uid(), name: "Своя позиция", unit: "шт", qty: 1, price: 0, comment: "" },
    ]);
  }

  function patchItem(itemId: string, field: keyof EstimateItem, value: string | number) {
    set(
      "items",
      est.items.map((i) => (i.id === itemId ? { ...i, [field]: value } : i)),
    );
  }

  const markup = est.markup ?? emptyMarkup();
  /** Итоговые позиции со всеми внутренними увеличениями в цене позиции. */
  const markedUpItems = applyMarkup(est.items, markup);
  const heightOnlyItems = applyItemSurcharges(markedUpItems, {
    ...(est.surcharges ?? defaultSurcharges()),
    commissioning: {
      ...(est.surcharges ?? defaultSurcharges()).commissioning,
      enabled: false,
    },
  });
  const finalItems = applyItemSurcharges(markedUpItems, est.surcharges);
  const finalPrice = new Map(finalItems.map((i) => [i.id, i.price] as const));
  const totals = computeEstimateTotals(
    finalItems,
    est.discount_type,
    est.discount_value,
    est.surcharges,
  );
  const sub = totals.subtotal;
  const disc = totals.discount;
  const total = totals.total;
  const surcharges = est.surcharges ?? defaultSurcharges();
  /** Документы для заказчика — только итоговые цены. */
  const exportEstimate: Estimate = { ...est, items: finalItems, total: totals.total };

  function patchMarkup(patch: Partial<Markup>) {
    set("markup", { ...markup, ...patch });
  }

  function patchSurcharge(key: SurchargeKey, patch: Partial<Surcharges[SurchargeKey]>) {
    set("surcharges", { ...surcharges, [key]: { ...surcharges[key], ...patch } });
  }

  function toggleItemFlag(itemId: string, field: "at_height" | "commissioning") {
    set(
      "items",
      est.items.map((i) => (i.id === itemId ? { ...i, [field]: !i[field] } : i)),
    );
  }

  async function save(silent = false) {
    if (est.approved_at) {
      return toast.error("Смета согласована заказчиком и больше не редактируется");
    }
    setSaving(true);
    const payload = {
      number: est.number,
      doc_date: est.doc_date,
      customer_name: est.customer_name,
      address: est.address,
      object_name: est.object_name ?? "",
      phone: est.phone,
      email: est.email,
      work_period: est.work_period,
      valid_until: est.valid_until,
      note: est.note,
      discount_type: est.discount_type,
      discount_value: est.discount_value,
      status: est.status,
      total,
      items: packItems(finalItems, surcharges, markup, est.items) as never,
    };
    if (est.id) {
      const { error } = await supabase.from("estimates").update(payload).eq("id", est.id);
      setSaving(false);
      if (error) return toast.error("Ошибка: " + error.message);
    } else {
      const { data, error } = await supabase
        .from("estimates")
        .insert(payload)
        .select("id")
        .single();
      setSaving(false);
      if (error) return toast.error("Ошибка: " + error.message);
      if (data) {
        setEstimate((e) => (e ? { ...e, id: data.id } : e));
        navigate({ to: "/estimate/$id", params: { id: data.id }, replace: true });
      }
    }
    if (!silent) toast.success("Смета сохранена");
  }

  async function duplicate() {
    const { data: all } = await supabase.from("estimates").select("number");
    const number = nextNumber((all ?? []).map((r) => r.number));
    const { data, error } = await supabase
      .from("estimates")
      .insert({
        number,
        doc_date: est.doc_date,
        customer_name: est.customer_name,
        address: est.address,
        object_name: est.object_name ?? "",
        phone: est.phone,
        email: est.email,
        work_period: est.work_period,
        valid_until: est.valid_until,
        note: est.note,
        discount_type: est.discount_type,
        discount_value: est.discount_value,
        status: "draft",
        total,
        items: packItems(finalItems, surcharges, markup, est.items) as never,
      })
      .select("id")
      .single();
    if (error) return toast.error("Ошибка: " + error.message);
    if (data) {
      toast.success("Создана копия сметы");
      navigate({ to: "/estimate/$id", params: { id: data.id } });
    }
  }

  async function withBusy(key: string, fn: () => Promise<void>) {
    setBusy(key);
    try {
      await fn();
    } catch (e) {
      toast.error("Не удалось сформировать документ");
      console.error(e);
    }
    setBusy(null);
  }

  function onLogoUpload(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      localStorage.setItem(LOGO_KEY, url);
      setLogo(url);
      toast.success("Логотип обновлён");
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <Toaster richColors position="top-center" />
      <header className="sticky top-0 z-10 border-b border-border bg-background">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2">
            <Button variant="ghost" size="sm" className="shrink-0 px-2" asChild>
              <Link to="/admin">
                <ArrowLeft className="size-4 sm:mr-2" />
                <span className="hidden sm:inline">В админку</span>
              </Link>
            </Button>
            <span className="truncate font-bold">Смета № {est.number}</span>
          </div>
          <div className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:mt-3 sm:flex-wrap sm:overflow-visible sm:px-0">
            <Button
              size="sm"
              className="shrink-0"
              onClick={() => save()}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Save className="mr-2 size-4" />
              )}
              Сохранить
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0"
              onClick={() => withBusy("pdf", () => downloadEstimatePdf(exportEstimate, logo, publicUrl || undefined))}
              disabled={busy === "pdf"}
            >
              {busy === "pdf" ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Download className="mr-2 size-4" />
              )}
              PDF
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0"
              onClick={() => withBusy("print", () => printEstimatePdf(exportEstimate, logo, publicUrl || undefined))}
              disabled={busy === "print"}
            >
              <Printer className="mr-2 size-4" /> Печать
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0"
              onClick={() => withBusy("docx", () => downloadEstimateDocx(exportEstimate))}
              disabled={busy === "docx"}
            >
              <FileDown className="mr-2 size-4" /> Word
            </Button>
            <Button size="sm" variant="ghost" className="shrink-0" onClick={duplicate}>
              <Copy className="mr-2 size-4" /> Дублировать
            </Button>
          </div>
        </div>
      </header>


      {publicUrl && (
        <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4">
            {qr && (
              <img
                src={qr}
                alt="QR-код сметы"
                className="size-24 rounded-lg border border-border bg-white p-1"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                {est.approved_at
                  ? `Согласована заказчиком ${new Date(est.approved_at).toLocaleString("ru-RU")}`
                  : "Ссылка для заказчика"}
              </p>
              <p className="mt-1 break-all text-xs text-muted-foreground">{publicUrl}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-10"
                  onClick={() => {
                    navigator.clipboard
                      .writeText(publicUrl)
                      .then(() => toast.success("Ссылка скопирована"))
                      .catch(() => toast.error(publicUrl));
                  }}
                >
                  Копировать ссылку
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-10"
                  onClick={() =>
                    downloadQrPng(publicUrl, `QR-smeta-${est.number || "1"}.png`)
                  }
                >
                  Скачать QR
                </Button>
                <Button size="sm" variant="outline" className="h-10" asChild>
                  <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                    Открыть страницу
                  </a>
                </Button>
              </div>
              {est.approved_at && (
                <p className="mt-2 text-xs text-brand">
                  Смета зафиксирована: изменения заблокированы, заказ создан
                  автоматически.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* Данные заказчика */}
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-lg font-bold">Данные заказчика</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>ФИО заказчика</Label>
                <Input
                  value={est.customer_name}
                  onChange={(e) => set("customer_name", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Объект</Label>
                <Input
                  value={est.object_name ?? ""}
                  onChange={(e) => set("object_name", e.target.value)}
                  placeholder="Например: квартира 3-к, ЖК «Северный»"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Адрес объекта</Label>
                <Input value={est.address} onChange={(e) => set("address", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Телефон</Label>
                <Input value={est.phone} onChange={(e) => set("phone", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Email (необязательно)</Label>
                <Input value={est.email} onChange={(e) => set("email", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Номер сметы</Label>
                <Input value={est.number} onChange={(e) => set("number", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Дата</Label>
                <Input
                  type="date"
                  value={est.doc_date}
                  onChange={(e) => set("doc_date", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Срок выполнения работ</Label>
                <Input
                  placeholder="напр. 10 рабочих дней"
                  value={est.work_period}
                  onChange={(e) => set("work_period", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Срок действия предложения</Label>
                <Input
                  placeholder="напр. 14 дней"
                  value={est.valid_until}
                  onChange={(e) => set("valid_until", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Позиции */}
          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold">Работы в смете</h2>
              <Button size="sm" variant="outline" onClick={addCustom}>
                <Plus className="mr-2 size-4" /> Своя позиция
              </Button>
            </div>

            {est.items.length === 0 && (
              <p className="mt-4 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Выберите работы из прайса (ниже на телефоне, справа на компьютере)
                или добавьте свою позицию.

              </p>
            )}

            <div className="mt-4 space-y-3">
              {est.items.map((item, i) => (
                <div key={item.id} className="rounded-xl border border-border p-3">
                  <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
                    <span className="w-4 text-sm text-muted-foreground">{i + 1}</span>
                    <Input
                      className="min-w-0"
                      value={item.name}
                      onChange={(e) => patchItem(item.id, "name", e.target.value)}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="shrink-0 text-destructive hover:text-destructive"
                      onClick={() =>
                        set(
                          "items",
                          est.items.filter((x) => x.id !== item.id),
                        )
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="min-w-0 space-y-1.5">
                      <Label className="text-xs">Ед.</Label>
                      <Select
                        value={item.unit}
                        onValueChange={(v) => patchItem(item.id, "unit", v)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from(new Set([...UNITS, item.unit])).map((u) => (
                            <SelectItem key={u} value={u}>
                              {u}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="min-w-0 space-y-1.5">
                      <Label className="text-xs">Кол-во</Label>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={item.qty}
                        onChange={(e) => patchItem(item.id, "qty", Number(e.target.value))}
                      />
                    </div>
                    <div className="min-w-0 space-y-1.5">
                      <Label className="text-xs">Исходная цена, ₽</Label>
                      <Input
                        type="number"
                        min={0}
                        value={item.price}
                        onChange={(e) => patchItem(item.id, "price", Number(e.target.value))}
                      />
                    </div>
                    <div className="min-w-0 space-y-1.5">
                      <Label className="text-xs">Цена / стоимость</Label>
                      <div className="flex h-9 items-center justify-end overflow-hidden rounded-md bg-secondary px-3 text-sm font-semibold">
                        {money(finalPrice.get(item.id) ?? item.price)} ₽ ·{" "}
                        {money(
                          lineTotal({
                            ...item,
                            price: finalPrice.get(item.id) ?? item.price,
                          }),
                        )}{" "}
                        ₽
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-4">
                    <label className="flex cursor-pointer items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        className="size-4 accent-[hsl(var(--brand))]"
                        checked={Boolean(item.at_height)}
                        onChange={() => toggleItemFlag(item.id, "at_height")}
                      />
                      Работы на высоте от 3 м
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        className="size-4 accent-[hsl(var(--brand))]"
                        checked={Boolean(item.commissioning)}
                        onChange={() => toggleItemFlag(item.id, "commissioning")}
                      />
                      Требуется пусконаладка
                    </label>
                  </div>
                </div>

              ))}
            </div>

            {/* Внутреннее увеличение — заказчик его не видит */}
            <div className="mt-5 rounded-xl border border-border p-4">
              <h3 className="font-bold">Увеличение (только для администратора)</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Увеличение распределяется по всем позициям сметы. В документах
                заказчика видны только итоговые цены.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Увеличение, %</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.1"
                    value={markup.percent}
                    onChange={(e) => patchMarkup({ percent: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Увеличение, ₽</Label>
                  <Input
                    type="number"
                    min={0}
                    step="1"
                    value={markup.fixed}
                    onChange={(e) => patchMarkup({ fixed: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="mt-3 flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Стоимость работ до увеличения
                </span>
                <span>{money(subtotal(est.items))} ₽</span>
              </div>
              <div className="mt-1 flex justify-between text-sm font-semibold">
                <span>Стоимость работ после увеличения</span>
                <span>{money(sub)} ₽</span>
              </div>
            </div>

            {/* Дополнительные расходы */}
            <div className="mt-5 rounded-xl border border-border p-4">
              <h3 className="font-bold">Дополнительные расходы</h3>
              <div className="mt-3 space-y-3">
                {SURCHARGE_KEYS.map((key) => {
                  const line = totals.surchargeLines.find((l) => l.key === key);
                  const beforeItems = key === "commissioning" ? heightOnlyItems : markedUpItems;
                  const afterItems = key === "height" ? heightOnlyItems : finalItems;
                  const selectiveAmount = key === "transport"
                    ? line?.amount ?? 0
                    : afterItems.reduce((sum, item, index) => {
                        const before = beforeItems[index];
                        if (!before) return sum;
                        const selected = key === "height" ? item.at_height : item.commissioning;
                        return selected ? sum + lineTotal(item) - lineTotal(before) : sum;
                      }, 0);
                  return (
                    <div
                      key={key}
                      className="flex flex-wrap items-center justify-between gap-3"
                    >
                      <label className="flex min-w-0 cursor-pointer items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="size-4 accent-[hsl(var(--brand))]"
                          checked={surcharges[key].enabled}
                          onChange={(e) =>
                            patchSurcharge(key, { enabled: e.target.checked })
                          }
                        />
                        <span className="min-w-0">
                          {SURCHARGE_META[key].label}
                          <span className="block text-xs text-muted-foreground">
                            {SURCHARGE_META[key].hint}
                          </span>
                        </span>
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          step="0.1"
                          className="w-24"
                          value={surcharges[key].percent}
                          onChange={(e) =>
                            patchSurcharge(key, { percent: Number(e.target.value) })
                          }
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                        <span className="w-28 text-right text-sm font-semibold">
                          {money(selectiveAmount)} ₽
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Итоги */}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Скидка</Label>
                  <div className="flex gap-2">
                    <Select
                      value={est.discount_type}
                      onValueChange={(v) => set("discount_type", v as DiscountType)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">Процент, %</SelectItem>
                        <SelectItem value="fixed">Сумма, ₽</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min={0}
                      value={est.discount_value}
                      onChange={(e) => set("discount_value", Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Примечание</Label>
                  <Textarea
                    rows={3}
                    value={est.note}
                    onChange={(e) => set("note", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Статус</Label>
                  <Select
                    value={est.status}
                    onValueChange={(v) => set("status", v as EstimateStatus)}
                  >
                    <SelectTrigger>
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
              </div>
              <div className="self-start rounded-xl border border-border bg-secondary/50 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Работы</span>
                  <span>{money(sub)} ₽</span>
                </div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">Скидка</span>
                  <span>− {money(disc)} ₽</span>
                </div>
                {totals.surchargeLines.map((line) => (
                  <div key={line.key} className="mt-2 flex justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">
                      {line.label} ({line.percent}%)
                    </span>
                    <span>{money(line.amount)} ₽</span>
                  </div>
                ))}
                <div className="mt-3 flex justify-between border-t border-border pt-3 text-base font-extrabold text-brand">
                  <span>К оплате</span>
                  <span>{money(total)} ₽</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Прайс */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <h2 className="font-bold">Прайс работ</h2>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Поиск работы…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-2">
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
            <div className="mt-3 max-h-[420px] space-y-2 overflow-y-auto pr-1">
              {filteredPrice.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addFromPrice(p)}
                  className="w-full rounded-lg border border-border p-2.5 text-left transition hover:border-brand hover:bg-secondary"
                >
                  <span className="block text-sm font-medium">{p.name}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {p.category} · {money(p.price)} ₽ / {p.unit}
                  </span>
                </button>
              ))}
              {filteredPrice.length === 0 && (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Ничего не найдено
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <h2 className="font-bold">Логотип в PDF</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              По умолчанию используется логотип S&M Electric. Можно загрузить свой.
            </p>
            {logo && (
              <img
                src={logo}
                alt="Загруженный логотип"
                className="mt-3 h-16 w-16 rounded-lg object-contain"
              />
            )}
            <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border p-3 text-sm hover:bg-secondary">
              <ImageIcon className="size-4" /> Загрузить логотип
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onLogoUpload(f);
                }}
              />
            </label>
            {logo && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full"
                onClick={() => {
                  localStorage.removeItem(LOGO_KEY);
                  setLogo(undefined);
                }}
              >
                Вернуть логотип по умолчанию
              </Button>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
