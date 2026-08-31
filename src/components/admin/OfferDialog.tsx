import { useEffect, useState } from "react";
import { Download, FileSignature, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { type Estimate, money } from "@/lib/estimates";
import {
  OFFER_BRAND,
  type OfferDoc,
  type OfferRow,
  type PriceRef,
  buildOfferDoc,
  fetchOffers,
  lampsSummaryText,
  fetchPriceRefs,
  releaseOffer,
} from "@/lib/offer";
import { downloadOfferPdf } from "@/lib/offer-pdf";
import { downloadOfferDocx } from "@/lib/offer-docx";

type Props = {
  estimate: Estimate & { id?: string };
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

export function OfferDialog({ estimate, open, onOpenChange }: Props) {
  const [price, setPrice] = useState<PriceRef[]>([]);
  const [doc, setDoc] = useState<OfferDoc | null>(null);
  const [versions, setVersions] = useState<OfferRow[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    (async () => {
      const refs = await fetchPriceRefs();
      if (!active) return;
      setPrice(refs);
      setDoc(buildOfferDoc(estimate, refs));
      if (estimate.id) {
        const rows = await fetchOffers(estimate.id);
        if (active) setVersions(rows);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, estimate.id]);

  if (!doc) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Коммерческое предложение</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-10">
            <Loader2 className="size-6 animate-spin text-brand" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const d = doc;
  const set = <K extends keyof OfferDoc>(key: K, value: OfferDoc[K]) =>
    setDoc((x) => (x ? { ...x, [key]: value } : x));

  const setAmount = (key: "works" | "materials", value: number) =>
    setDoc((x) => {
      if (!x) return x;
      const amounts = { ...x.amounts, [key]: value };
      amounts.total = Math.round((amounts.works + amounts.materials) * 100) / 100;
      return { ...x, amounts };
    });

  async function release() {
    if (!estimate.id) return toast.error("Сначала сохраните смету");
    setBusy(true);
    try {
      const row = await releaseOffer(estimate.id, d, versions);
      setVersions((v) => [row, ...v]);
      setDoc(row.snapshot);
      toast.success(`КП выпущено — версия ${row.version}`);
    } catch (e) {
      toast.error("Ошибка: " + (e as Error).message);
    }
    setBusy(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Коммерческое предложение</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Заказчик</Label>
              <Input
                value={d.customer_name}
                onChange={(e) => set("customer_name", e.target.value)}
              />
            </div>
            <div>
              <Label>Объект</Label>
              <Input
                value={d.object_name}
                onChange={(e) => set("object_name", e.target.value)}
              />
            </div>
            <div>
              <Label>Дата</Label>
              <Input
                type="date"
                value={d.date}
                onChange={(e) => set("date", e.target.value)}
              />
            </div>
            <div>
              <Label>Срок выполнения</Label>
              <Input value={d.term} onChange={(e) => set("term", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label>Гарантия</Label>
              <Input
                value={d.warranty}
                onChange={(e) => set("warranty", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Вводный текст</Label>
            <Textarea
              rows={2}
              value={d.intro}
              onChange={(e) => set("intro", e.target.value)}
            />
          </div>

          <div>
            <Label>Перечень работ (по строке на пункт)</Label>
            <Textarea
              rows={8}
              value={d.works.join("\n")}
              onChange={(e) =>
                set(
                  "works",
                  e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                )
              }
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Сформировано из фактических позиций сметы, без моделей, артикулов и цен
              позиций.
            </p>
          </div>

          <div className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <Label className="cursor-pointer">Блок «Светильники»</Label>
              <Switch
                checked={d.show_lamps}
                onCheckedChange={(v) => set("show_lamps", v)}
              />
            </div>
            {d.show_lamps && (
              <div className="mt-2 space-y-3">
                <Textarea
                  rows={4}
                  value={d.lamps_text}
                  onChange={(e) => set("lamps_text", e.target.value)}
                />
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <Label>Стоимость с выбранными, ₽</Label>
                    <Input
                      type="number"
                      value={d.lamps_selected_total ?? d.amounts.total}
                      onChange={(e) =>
                        set("lamps_selected_total", Number(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div>
                    <Label>Кол-во альтернатив</Label>
                    <Input
                      type="number"
                      value={d.lamps_alt_count ?? 0}
                      onChange={(e) => set("lamps_alt_count", Number(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label>Стоимость с альтернативой, ₽</Label>
                    <Input
                      type="number"
                      value={d.lamps_alt_total ?? 0}
                      onChange={(e) => set("lamps_alt_total", Number(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Пояснение</Label>
                  <Input
                    value={d.lamps_note ?? ""}
                    onChange={(e) => set("lamps_note", e.target.value)}
                  />
                </div>
                <p className="rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
                  {lampsSummaryText(d)}
                </p>
              </div>
            )}
          </div>

          <div className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-3">
            <div>
              <Label>Стоимость работ, ₽</Label>
              <Input
                type="number"
                value={d.amounts.works}
                onChange={(e) => setAmount("works", Number(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>Стоимость материалов, ₽</Label>
              <Input
                type="number"
                value={d.amounts.materials}
                onChange={(e) => setAmount("materials", Number(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>Общая стоимость</Label>
              <p className="mt-2 text-lg font-bold">{money(d.amounts.total)} ₽</p>
            </div>
            <p className="text-xs text-muted-foreground sm:col-span-3">
              Правки КП не изменяют исходную смету. {OFFER_BRAND.name}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={release} disabled={busy} className="h-11">
              {busy ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <FileSignature className="mr-2 size-4" />
              )}
              Выпустить КП
            </Button>
            <Button
              variant="outline"
              className="h-11"
              onClick={() =>
                downloadOfferPdf(d).catch(() => toast.error("Не удалось создать PDF"))
              }
            >
              <Download className="mr-2 size-4" /> PDF
            </Button>
            <Button
              variant="outline"
              className="h-11"
              onClick={() =>
                downloadOfferDocx(d).catch(() => toast.error("Не удалось создать Word"))
              }
            >
              <Download className="mr-2 size-4" /> Word
            </Button>
            <Button
              variant="ghost"
              className="h-11"
              onClick={() => setDoc(buildOfferDoc(estimate, price))}
            >
              <RefreshCw className="mr-2 size-4" /> Пересобрать из сметы
            </Button>
          </div>

          {versions.length > 0 && (
            <div className="rounded-lg border border-border p-3">
              <p className="mb-2 text-sm font-semibold">Выпущенные версии</p>
              <div className="space-y-2">
                {versions.map((v) => (
                  <div
                    key={v.id}
                    className="flex flex-wrap items-center justify-between gap-2 text-sm"
                  >
                    <span>
                      {v.number} · {new Date(v.created_at).toLocaleString("ru-RU")} ·{" "}
                      {money(v.snapshot.amounts?.total ?? 0)} ₽
                    </span>
                    <span className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadOfferPdf(v.snapshot)}
                      >
                        PDF
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadOfferDocx(v.snapshot)}
                      >
                        Word
                      </Button>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
