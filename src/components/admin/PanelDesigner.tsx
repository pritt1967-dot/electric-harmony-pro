import { useCallback, useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Loader2,
  Wand2,
  FileDown,
  Image as ImageIcon,
  ClipboardList,
  Download,
  Save,
  FolderOpen,
  Trash2,
} from "lucide-react";

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
import { supabase } from "@/integrations/supabase/client";
import { designPanel, renderPanelImage } from "@/lib/panel.functions";
import { DEFAULT_PANEL_INPUT, railTotal } from "@/lib/panel";
import type { PanelDesign, PanelInput } from "@/lib/panel";
import { buildSchematicSvg } from "@/lib/panel-schematic";
import { buildPanelPdf } from "@/lib/panel-pdf";
import { nextNumber, emptyEstimate, todayISO } from "@/lib/estimates";
import type { EstimateItem } from "@/lib/estimates";

const EXAMPLE = `Освещение 1 этаж — 0.6 кВт
Розетки гостиная — 2 кВт
Кухня розетки рабочая зона — 3.5 кВт
Варочная панель — 7 кВт
Стиральная машина — 2.5 кВт
Бойлер 80 л — 2 кВт
Ванная (розетки, полотенцесушитель) — 1.5 кВт
Уличное освещение — 0.5 кВт
Насосная станция — 1.5 кВт
Гараж розетки — 3 кВт`;

export function PanelDesigner() {
  const navigate = useNavigate();
  const run = useServerFn(designPanel);
  const renderImg = useServerFn(renderPanelImage);

  const [input, setInput] = useState<PanelInput>(DEFAULT_PANEL_INPUT);
  const [design, setDesign] = useState<PanelDesign | null>(null);
  const [image, setImage] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [imgBusy, setImgBusy] = useState(false);
  const [exporting, setExporting] = useState(false);

  const set = <K extends keyof PanelInput>(key: K, value: PanelInput[K]) =>
    setInput((p) => ({ ...p, [key]: value }));

  const svg = useMemo(() => (design ? buildSchematicSvg(design) : ""), [design]);

  async function handleDesign() {
    if (!input.lines_text.trim()) {
      toast.error("Добавьте список линий");
      return;
    }
    setBusy(true);
    setDesign(null);
    setImage("");
    try {
      const res = await run({ data: input });
      setDesign(res);
      toast.success("Щит спроектирован");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка расчёта");
    }
    setBusy(false);
  }

  async function handleImage() {
    if (!design) return;
    setImgBusy(true);
    try {
      const res = await renderImg({
        data: { prompt: design.image_prompt || design.summary?.enclosure || "" },
      });
      setImage(res.image);
      toast.success("Визуализация готова");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка визуализации");
    }
    setImgBusy(false);
  }

  async function handlePdf() {
    if (!design) return;
    setExporting(true);
    try {
      const doc = await buildPanelPdf(design, image || undefined);
      doc.save(`Проект щита ${todayISO()}.pdf`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка экспорта");
    }
    setExporting(false);
  }

  function downloadSvg() {
    if (!svg) return;
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Однолинейная схема ${todayISO()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function toEstimate() {
    if (!design) return;
    setExporting(true);
    try {
      const rows = [...(design.spec ?? []), ...(design.materials ?? [])];
      const { data: priceRows } = await supabase
        .from("price_items")
        .select("name, unit, price");
      const priceMap = new Map(
        (priceRows ?? []).map((p) => [p.name.trim().toLowerCase(), p]),
      );

      const items: EstimateItem[] = rows.map((r, i) => {
        const match = priceMap.get(r.name.trim().toLowerCase());
        return {
          id: `${Date.now()}-${i}`,
          name: [r.name, r.manufacturer, r.model, r.rating]
            .filter(Boolean)
            .join(" · "),
          unit: r.unit || match?.unit || "шт",
          qty: r.qty || 1,
          price: Number(match?.price ?? 0),
          comment: "",
        } as EstimateItem;
      });
      items.push({
        id: `${Date.now()}-assembly`,
        name: "Сборка и монтаж распределительного щита",
        unit: "шт",
        qty: 1,
        price: 0,
        comment: design.summary?.enclosure ?? "",
      } as EstimateItem);

      const { data: existing } = await supabase.from("estimates").select("number");
      const number = nextNumber((existing ?? []).map((e) => e.number));
      const base = emptyEstimate(number);
      const { data, error } = await supabase
        .from("estimates")
        .insert({
          ...base,
          object_name: design.summary?.object_type ?? "",
          note: `Проект щита: ${design.summary?.enclosure ?? ""}`,
          items: items as never,
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      toast.success("Смета создана");
      navigate({ to: "/estimate/$id", params: { id: data.id } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Не удалось создать смету");
    }
    setExporting(false);
  }

  const s = design?.summary;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-4 sm:p-6">
        <h2 className="text-lg font-semibold">AI-проектировщик электрощита</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Опишите ввод и список линий — система подберёт защиту, компоновку,
          корпус и спецификацию.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Тип объекта</Label>
            <Input
              value={input.object_type}
              onChange={(e) => set("object_type", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Фазность</Label>
            <Select
              value={input.phases}
              onValueChange={(v) => {
                set("phases", v as PanelInput["phases"]);
                set("input_type", v === "3" ? "3P+N" : "1P+N");
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 фаза, 230 В</SelectItem>
                <SelectItem value="3">3 фазы, 400 В</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Ввод</Label>
            <Input
              value={input.input_type}
              onChange={(e) => set("input_type", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Мощность, кВт</Label>
            <Input
              type="number"
              value={input.power_kw}
              onChange={(e) => set("power_kw", Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Вводной автомат, А</Label>
            <Input
              type="number"
              value={input.main_breaker_a}
              onChange={(e) => set("main_breaker_a", Number(e.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Система заземления</Label>
            <Select
              value={input.grounding}
              onValueChange={(v) => set("grounding", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TN-C-S">TN-C-S</SelectItem>
                <SelectItem value="TN-S">TN-S</SelectItem>
                <SelectItem value="TT">TT</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Степень защиты</Label>
            <Input value={input.ip} onChange={(e) => set("ip", e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Дополнительные требования</Label>
            <Input
              value={input.notes}
              placeholder="Например: реле напряжения, УЗИП, контактор для бойлера"
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <Label>Список линий (по одной в строке)</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => set("lines_text", EXAMPLE)}
            >
              Пример
            </Button>
          </div>
          <Textarea
            rows={10}
            className="font-mono text-sm"
            placeholder={"Освещение кухня — 0.5 кВт\nРозетки спальня — 2 кВт"}
            value={input.lines_text}
            onChange={(e) => set("lines_text", e.target.value)}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={handleDesign} disabled={busy}>
            {busy ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Спроектировать щит
          </Button>
          {design && (
            <>
              <Button variant="outline" onClick={handlePdf} disabled={exporting}>
                <FileDown className="mr-2 h-4 w-4" /> PDF-отчёт
              </Button>
              <Button variant="outline" onClick={downloadSvg}>
                <Download className="mr-2 h-4 w-4" /> Схема SVG
              </Button>
              <Button variant="outline" onClick={handleImage} disabled={imgBusy}>
                {imgBusy ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ImageIcon className="mr-2 h-4 w-4" />
                )}
                Визуализация щита
              </Button>
              <Button variant="secondary" onClick={toEstimate} disabled={exporting}>
                <ClipboardList className="mr-2 h-4 w-4" /> Перенести в смету
              </Button>
            </>
          )}
        </div>
      </div>

      {busy && (
        <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
          Идёт расчёт нагрузок, подбор защиты и компоновка — обычно 20–40 секунд…
        </div>
      )}

      {design && (
        <div className="space-y-6">
          <section className="rounded-xl border bg-card p-4 sm:p-6">
            <h3 className="font-semibold">Итог</h3>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Питание", s?.supply],
                ["Заземление", s?.grounding],
                ["Расчётная мощность", `${s?.calculated_power_kw ?? 0} кВт`],
                ["Вводной автомат", s?.main_breaker],
                ["Занято модулей", String(s?.used_modules ?? 0)],
                ["Резерв", `${s?.reserve_modules ?? 0} мод.`],
                ["Корпус", `${s?.enclosure ?? ""} (${s?.enclosure_modules ?? 0} мод.)`],
                ["IP", s?.ip],
              ].map(([k, v]) => (
                <div key={k as string} className="rounded-lg bg-muted/50 p-3">
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                  <dd className="mt-0.5 text-sm font-medium">{v || "—"}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-xl border bg-card p-4 sm:p-6">
            <h3 className="font-semibold">Распределение по фазам</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {(design.phase_load ?? []).map((p) => (
                <div key={p.phase} className="rounded-lg border p-3">
                  <div className="text-sm font-semibold text-primary">{p.phase}</div>
                  <div className="text-sm">
                    {p.kw} кВт · {p.current_a} А
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {(p.lines ?? []).join(", ")}
                  </div>
                </div>
              ))}
            </div>
            {!!(design.protection_chain ?? []).length && (
              <ol className="mt-4 space-y-1 text-sm">
                {design.protection_chain.map((step, i) => (
                  <li key={i} className="text-muted-foreground">
                    {i + 1}. {step}
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="rounded-xl border bg-card p-4 sm:p-6">
            <h3 className="font-semibold">Групповые линии</h3>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr>
                    {["Марк.", "Линия", "кВт", "А", "Автомат", "P", "Фаза", "УЗО", "Кабель", "Мод."].map(
                      (h) => (
                        <th key={h} className="px-2 py-2 font-medium">
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {(design.lines ?? []).map((l) => (
                    <tr key={l.mark} className="border-t">
                      <td className="px-2 py-2 font-medium text-primary">{l.mark}</td>
                      <td className="px-2 py-2">{l.name}</td>
                      <td className="px-2 py-2">{l.power_kw}</td>
                      <td className="px-2 py-2">{l.current_a}</td>
                      <td className="px-2 py-2">{l.breaker}</td>
                      <td className="px-2 py-2">{l.poles}</td>
                      <td className="px-2 py-2">{l.phase}</td>
                      <td className="px-2 py-2">{l.rcd}</td>
                      <td className="px-2 py-2">{l.cable}</td>
                      <td className="px-2 py-2">{l.modules}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-xl border bg-card p-4 sm:p-6">
            <h3 className="font-semibold">Однолинейная схема</h3>
            <div
              className="mt-3 overflow-x-auto rounded-lg border bg-white p-2"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </section>

          <section className="rounded-xl border bg-card p-4 sm:p-6">
            <h3 className="font-semibold">Компоновка DIN-реек</h3>
            <div className="mt-3 space-y-4">
              {(design.rails ?? []).map((rail) => (
                <div key={rail.index}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium">{rail.title}</span>
                    <span className="text-muted-foreground">
                      {railTotal(rail)} мод.
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 rounded-lg border bg-muted/40 p-2">
                    {(rail.items ?? []).map((item, i) => (
                      <div
                        key={`${rail.index}-${i}`}
                        className="rounded border border-primary/40 bg-background px-2 py-2 text-center"
                        style={{ minWidth: `${Math.max(1, item.modules) * 34}px` }}
                      >
                        <div className="text-[11px] font-semibold text-primary">
                          {item.mark}
                        </div>
                        <div className="text-[11px] leading-tight text-muted-foreground">
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border bg-card p-4 sm:p-6">
            <h3 className="font-semibold">Спецификация</h3>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr>
                    {["№", "Наименование", "Производитель", "Модель", "Номинал", "Кол-во", "Ед."].map(
                      (h) => (
                        <th key={h} className="px-2 py-2 font-medium">
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {[...(design.spec ?? []), ...(design.materials ?? [])].map((r, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-2 py-2">{i + 1}</td>
                      <td className="px-2 py-2">{r.name}</td>
                      <td className="px-2 py-2">{r.manufacturer}</td>
                      <td className="px-2 py-2">{r.model}</td>
                      <td className="px-2 py-2">{r.rating}</td>
                      <td className="px-2 py-2">{r.qty}</td>
                      <td className="px-2 py-2">{r.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {(image || imgBusy) && (
            <section className="rounded-xl border bg-card p-4 sm:p-6">
              <h3 className="font-semibold">Визуализация щита</h3>
              {imgBusy ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  Генерация изображения…
                </p>
              ) : (
                <img
                  src={image}
                  alt="Визуализация собранного электрощита"
                  className="mt-3 w-full rounded-lg border"
                />
              )}
            </section>
          )}

          {(!!(design.issues ?? []).length || !!(design.assumptions ?? []).length) && (
            <section className="rounded-xl border bg-card p-4 sm:p-6">
              <h3 className="font-semibold">Замечания и допущения</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {(design.issues ?? []).map((issue, i) => (
                  <li key={`i${i}`} className="rounded-lg bg-destructive/10 p-3">
                    <span className="font-medium">{issue.text}</span>
                    {issue.fix && (
                      <span className="text-muted-foreground"> → {issue.fix}</span>
                    )}
                  </li>
                ))}
                {(design.assumptions ?? []).map((a, i) => (
                  <li key={`a${i}`} className="text-muted-foreground">
                    • {a}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
