import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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
  AlertTriangle,
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
import { supabase } from "@/integrations/supabase/browser-client";
import { designPanel, renderPanelImage } from "@/lib/panel.functions";
import { DEFAULT_PANEL_INPUT } from "@/lib/panel";
import { PanelSpecVisual } from "@/components/admin/PanelSpecVisual";
import { PanelDrawings } from "@/components/admin/PanelDrawings";
import { ResultErrorBoundary } from "@/components/admin/ResultErrorBoundary";

import type { PanelDesign, PanelInput } from "@/lib/panel";
import { buildSchematicSvg } from "@/lib/panel-schematic";
import { exportPanelSingleLineVsdx } from "@/lib/visio/adapters";
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

/** Типовой список линий дома по помещениям — с правилами объединения. */
const ROOMS_TEMPLATE = `САНУЗЕЛ:
- стиральная машина — отдельная линия
- розетки санузла — одна линия
- вентилятор + подсветка зеркала — одна линия
- освещение — объединить с освещением 1 этажа

ПРИХОЖАЯ:
- все розетки — одна линия
- освещение + свет перед входом — объединить с освещением 1 этажа

КУХНЯ:
- газовый котёл — отдельная линия
- посудомоечная машина — отдельная линия
- электрическая духовка — отдельная линия
- холодильник — отдельная линия
- микроволновка + рабочие кухонные розетки — одна линия
- вытяжка + мелкая кухонная техника — одна линия
- освещение кухни — объединить с освещением 1 этажа

ХОЛЛ:
- розетки + компьютер — одна линия
- освещение — объединить с общей линией освещения

СПАЛЬНЯ 1:
- розетки + компьютер — одна линия
- общий свет + дополнительные источники света — одна линия

СПАЛЬНЯ 2:
- розетки + телевизор — одна линия
- утюг — отдельная линия
- общий свет + дополнительные источники света — одна линия

ЛЕСТНИЦА / ВЕРХНИЙ ХОЛЛ:
- розетки — одна линия
- освещение — одна линия

НАРУЖНЫЕ ЛИНИИ:
- подсветка дома — отдельная линия
- наружные розетки — отдельная линия`;

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
  const [aiError, setAiError] = useState<string>("");
  const [showSvg, setShowSvg] = useState(false);
  const [cost, setCost] = useState<{ total: number; missing: number } | null>(null);
  const [costBusy, setCostBusy] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const shouldRevealResultRef = useRef(false);

  const set = <K extends keyof PanelInput>(key: K, value: PanelInput[K]) =>
    setInput((p) => ({ ...p, [key]: value }));

  // ---- сессии проектировщика ----
  type Session = {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
  };
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const loadSessions = useCallback(async () => {
    const { data } = await supabase
      .from("panel_designs")
      .select("id, title, created_at, updated_at")
      .order("updated_at", { ascending: false });
    setSessions((data ?? []) as Session[]);
  }, []);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const revealResult = useCallback((behavior: ScrollBehavior = "smooth") => {
    const result = resultRef.current;
    if (!result) return;
    const top = result.getBoundingClientRect().top + window.scrollY - 16;
    window.scrollTo({ top: Math.max(0, top), behavior });
  }, []);

  // Сначала ждём завершения расчёта и отрисовки тяжёлых SVG-блоков, затем
  // гарантированно ставим результат в начало desktop-экрана. Повторная
  // корректировка компенсирует позднее изменение высоты чертежей.
  useLayoutEffect(() => {
    if (!design || busy || !shouldRevealResultRef.current) return;
    shouldRevealResultRef.current = false;
    const frame = window.requestAnimationFrame(() => revealResult("auto"));
    const correction = window.setTimeout(() => revealResult("smooth"), 500);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(correction);
    };
  }, [design, busy, revealResult]);


  async function saveSession(asNew = false) {
    setSaving(true);
    try {
      const name =
        title.trim() ||
        `${input.object_type || "Щит"} — ${new Date().toLocaleDateString("ru-RU")}`;
      const payload = {
        title: name,
        input: input as never,
        design: (design ?? null) as never,
        image,
      };
      if (sessionId && !asNew) {
        const { error } = await supabase
          .from("panel_designs")
          .update(payload)
          .eq("id", sessionId);
        if (error) throw new Error(error.message);
      } else {
        const { data, error } = await supabase
          .from("panel_designs")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw new Error(error.message);
        setSessionId(data.id);
      }
      setTitle(name);
      await loadSessions();
      toast.success("Сессия сохранена");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Не удалось сохранить");
    }
    setSaving(false);
  }

  async function openSession(id: string) {
    if (!id) return;
    const { data, error } = await supabase
      .from("panel_designs")
      .select("id, title, input, design, image")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) {
      toast.error("Не удалось открыть сессию");
      return;
    }
    setSessionId(data.id);
    setTitle(data.title);
    setInput({ ...DEFAULT_PANEL_INPUT, ...((data.input ?? {}) as PanelInput) });
    setDesign((data.design as PanelDesign | null) ?? null);
    setImage(data.image ?? "");
    toast.success("Сессия загружена");
  }

  async function deleteSession() {
    if (!sessionId) return;
    const { error } = await supabase
      .from("panel_designs")
      .delete()
      .eq("id", sessionId);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSessionId("");
    setTitle("");
    await loadSessions();
    toast.success("Сессия удалена");
  }

  function newSession() {
    setSessionId("");
    setTitle("");
    setInput(DEFAULT_PANEL_INPUT);
    setDesign(null);
    setImage("");
    setAiError("");
  }

  async function pasteLines() {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        toast.error("Буфер обмена пуст");
        return;
      }
      setInput((p) => ({
        ...p,
        lines_text: p.lines_text.trim()
          ? `${p.lines_text.replace(/\s*$/, "")}\n${text}`
          : text,
      }));
      toast.success("Текст вставлен");
    } catch {
      toast.error("Разрешите доступ к буферу обмена и попробуйте ещё раз");
    }
  }

  // Построение SVG не должно ломать рендер результата: любая ошибка → пустая схема.
  const svg = useMemo(() => {
    if (!design) return "";
    try {
      return buildSchematicSvg(design);
    } catch (e) {
      console.error("[PanelDesigner] buildSchematicSvg:", e);
      return "";
    }
  }, [design]);


  async function handleDesign() {
    if (!input.lines_text.trim()) {
      toast.error("Добавьте список линий");
      return;
    }
    setBusy(true);
    setAiError("");
    shouldRevealResultRef.current = true;
    setDesign(null);
    setImage("");
    try {
      const res = await run({ data: input });
      if (!res || typeof res !== "object") {
        shouldRevealResultRef.current = false;
        const msg = "Сервис AI не ответил. Попробуйте ещё раз.";
        setAiError(msg);
        toast.error(msg);
        setBusy(false);
        return;
      }
      if (!res.ok) {
        shouldRevealResultRef.current = false;
        setAiError(res.message);
        toast.error(res.message);
        setBusy(false);
        return;
      }
      setDesign(res.design);
      toast.success("Щит спроектирован");
    } catch (e) {
      shouldRevealResultRef.current = false;
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
      if (!res || typeof res !== "object") {
        const msg = "Сервис AI не ответил. Попробуйте ещё раз.";
        setAiError(msg);
        toast.error(msg);
        setImgBusy(false);
        return;
      }
      if (!res.ok) {
        setAiError(res.message);
        toast.error(res.message);
        setImgBusy(false);
        return;
      }
      setImage(res.image);
      if (sessionId) {
        const { error } = await supabase
          .from("panel_designs")
          .update({ image: res.image, design: (design ?? null) as never })
          .eq("id", sessionId);
        if (error) {
          toast.error("Визуализация готова, но не сохранилась: " + error.message);
        } else {
          await loadSessions();
          toast.success("Визуализация готова и сохранена в сессии");
        }
      } else {
        toast.success("Визуализация готова — нажмите «Сохранить», чтобы записать её в сессию");
      }
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

  function downloadImage() {
    if (!image) return;
    const a = document.createElement("a");
    a.href = image;
    a.download = `Визуализация щита ${todayISO()}.png`;
    a.click();
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
      const { surcharges: _sc, markup: _mk, ...base } = emptyEstimate(number);
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

  /** Единый итог проекта: та же таблица для схемы, реек, спецификации и сметы. */
  const finalRows = useMemo(() => {
    if (!design) return [];
    const groupOf = new Map<string, { mark: string; leakage: string }>();
    (design.rcd_groups ?? []).forEach((g) =>
      (g.lines ?? []).forEach((m) => groupOf.set(m, { mark: g.mark, leakage: g.leakage })),
    );
    return (design.lines ?? []).map((l) => {
      const g = groupOf.get(l.mark);
      return {
        mark: l.mark,
        name: l.name,
        cable: l.cable,
        breaker: l.breaker,
        rcd: l.rcd || (g ? "УЗО" : "—"),
        leakage: g?.leakage ?? (l.rcd && /\d+\s*мА/.test(l.rcd) ? (l.rcd.match(/\d+\s*мА/)?.[0] ?? "") : ""),
        group: g?.mark ?? "—",
        modules: l.modules,
        power_kw: l.power_kw,
        current_a: l.current_a,
      };
    });
  }, [design]);

  async function calcCost() {
    if (!design) return;
    setCostBusy(true);
    try {
      const rows = [...(design.spec ?? []), ...(design.materials ?? [])];
      const { data: priceRows } = await supabase.from("price_items").select("name, price");
      const priceMap = new Map(
        (priceRows ?? []).map((p) => [p.name.trim().toLowerCase(), Number(p.price) || 0]),
      );
      let total = 0;
      let missing = 0;
      rows.forEach((r) => {
        const price = priceMap.get(r.name.trim().toLowerCase());
        if (price === undefined || price === 0) missing += 1;
        total += (price ?? 0) * (r.qty || 1);
      });
      setCost({ total: Math.round(total), missing });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Не удалось рассчитать стоимость");
    }
    setCostBusy(false);
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

        <div className="mt-4 rounded-lg border bg-muted/40 p-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
            <div className="space-y-1.5">
              <Label>Название сессии</Label>
              <Input
                value={title}
                placeholder="Например: Дом в Пушкине, щит 54 мод."
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Сохранённые сессии</Label>
              <Select value={sessionId} onValueChange={openSession}>
                <SelectTrigger>
                  <SelectValue placeholder="Открыть сессию…" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.length === 0 && (
                    <SelectItem value="none" disabled>
                      Пока нет сохранённых
                    </SelectItem>
                  )}
                  {sessions.map((x) => (
                    <SelectItem key={x.id} value={x.id}>
                      {x.title} ·{" "}
                      {new Date(x.updated_at).toLocaleDateString("ru-RU")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <Button variant="outline" onClick={() => saveSession(false)} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Сохранить
              </Button>
              {sessionId && (
                <>
                  <Button variant="outline" onClick={() => saveSession(true)} disabled={saving}>Копия</Button>
                  <Button variant="ghost" onClick={deleteSession}><Trash2 className="h-4 w-4" /></Button>
                </>
              )}
              <Button variant="ghost" onClick={newSession}><FolderOpen className="mr-2 h-4 w-4" /> Новая</Button>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5"><Label>Тип объекта</Label><Input value={input.object_type} onChange={(e) => set("object_type", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Фазность</Label><Select value={input.phases} onValueChange={(v) => { set("phases", v as PanelInput["phases"]); set("input_type", v === "3" ? "3P+N" : "1P+N"); }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">1 фаза, 230 В</SelectItem><SelectItem value="3">3 фазы, 400 В</SelectItem></SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Ввод</Label><Input value={input.input_type} onChange={(e) => set("input_type", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Мощность, кВт</Label><Input type="number" value={input.power_kw} onChange={(e) => set("power_kw", Number(e.target.value))} /></div>
          <div className="space-y-1.5"><Label>Вводной автомат, А</Label><Input type="number" value={input.main_breaker_a} onChange={(e) => set("main_breaker_a", Number(e.target.value))} /></div>
          <div className="space-y-1.5"><Label>Система заземления</Label><Select value={input.grounding} onValueChange={(v) => set("grounding", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="TN-C-S">TN-C-S</SelectItem><SelectItem value="TN-S">TN-S</SelectItem><SelectItem value="TT">TT</SelectItem></SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Степень защиты</Label><Input value={input.ip} onChange={(e) => set("ip", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Площадь объекта, м²</Label><Input type="number" value={input.area_m2 ?? 0} onChange={(e) => set("area_m2", Number(e.target.value))} /></div>
          <div className="space-y-1.5"><Label>Вводной кабель</Label><Input value={input.input_cable ?? ""} placeholder="Например: ВВГнг-LS 5×10" onChange={(e) => set("input_cable", e.target.value)} /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Дополнительные требования</Label><Input value={input.notes} placeholder="Например: реле напряжения, УЗИП, контактор для бойлера" onChange={(e) => set("notes", e.target.value)} /></div>
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-3"><Label>Помещения</Label><Textarea rows={3} value={input.rooms_text ?? ""} placeholder="Санузел, прихожая, кухня, холл, спальня 1, спальня 2, лестница, улица" onChange={(e) => set("rooms_text", e.target.value)} /></div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5"><Label>Заказчик</Label><Input value={input.customer ?? ""} onChange={(e) => set("customer", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Адрес объекта</Label><Input value={input.address ?? ""} onChange={(e) => set("address", e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Дата</Label><Input type="date" value={input.doc_date || todayISO()} onChange={(e) => set("doc_date", e.target.value)} /></div>
        </div>

        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between gap-2"><Label>Список линий (по одной в строке)</Label><div className="flex items-center gap-1"><Button type="button" variant="ghost" size="sm" onClick={pasteLines}>Вставить</Button><Button type="button" variant="ghost" size="sm" onClick={() => set("lines_text", EXAMPLE)}>Пример</Button><Button type="button" variant="ghost" size="sm" onClick={() => set("lines_text", ROOMS_TEMPLATE)}>Дом по комнатам</Button></div></div>
          <Textarea rows={10} className="font-mono text-sm" autoCapitalize="off" autoCorrect="off" spellCheck={false} placeholder={"Освещение кухня — 0.5 кВт\nРозетки спальня — 2 кВт"} value={input.lines_text} onChange={(e) => set("lines_text", e.target.value)} onPaste={(e) => { const text = e.clipboardData?.getData("text/plain"); if (!text) return; e.preventDefault(); const el = e.currentTarget; const start = el.selectionStart ?? el.value.length; const end = el.selectionEnd ?? el.value.length; const next = el.value.slice(0, start) + text + el.value.slice(end); set("lines_text", next); requestAnimationFrame(() => { const pos = start + text.length; el.setSelectionRange(pos, pos); }); }} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={handleDesign} disabled={busy}>{busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}Спроектировать щит</Button>
          {design && <><Button variant="outline" onClick={() => { setShowSvg((v) => !v); if (!showSvg) requestAnimationFrame(() => document.getElementById("panel-svg")?.scrollIntoView({ behavior: "smooth", block: "start" })); }}>{showSvg ? "Скрыть однолинейную схему" : "Показать однолинейную схему"}</Button><Button variant="outline" onClick={() => document.getElementById("panel-spec")?.scrollIntoView({ behavior: "smooth", block: "start" })}>Спецификация</Button><Button variant="outline" onClick={() => document.getElementById("panel-rails")?.scrollIntoView({ behavior: "smooth", block: "start" })}>Раскладка по DIN-рейкам</Button><Button variant="outline" onClick={calcCost} disabled={costBusy}>{costBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Рассчитать стоимость</Button><Button variant="secondary" onClick={() => revealResult()}><Download className="mr-2 h-4 w-4" /> К результату</Button><Button variant="outline" onClick={handlePdf} disabled={exporting}><FileDown className="mr-2 h-4 w-4" /> PDF-отчёт</Button><Button variant="outline" onClick={downloadSvg}><Download className="mr-2 h-4 w-4" /> Схема SVG</Button><Button variant="outline" onClick={handleImage} disabled={imgBusy}>{imgBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageIcon className="mr-2 h-4 w-4" />}Визуализация щита</Button><Button variant="secondary" onClick={toEstimate} disabled={exporting}><ClipboardList className="mr-2 h-4 w-4" /> Перенести в смету</Button></>}
        </div>
        {aiError && (
          <div role="alert" className="mt-4 flex gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div>
              <p className="font-medium">AI-проектировщик временно недоступен</p>
              <p className="mt-1 text-muted-foreground">{aiError}</p>
            </div>
          </div>
        )}
      </div>

      {busy && <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">Идёт расчёт нагрузок, подбор защиты и компоновка — обычно 20–40 секунд…</div>}

      {design && <div ref={resultRef} data-panel-result className="space-y-6 scroll-mt-4">
        <section className="rounded-xl border bg-card p-4 sm:p-6"><h3 className="font-semibold">Итог</h3><dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[["Питание", s?.supply],["Заземление", s?.grounding],["Расчётная мощность", `${s?.calculated_power_kw ?? 0} кВт`],["Вводной автомат", s?.main_breaker],["Занято модулей", String(s?.used_modules ?? 0)],["Резерв", `${s?.reserve_modules ?? 0} мод.`],["Корпус", `${s?.enclosure ?? ""} (${s?.enclosure_modules ?? 0} мод.)`],["IP", s?.ip]].map(([k,v]) => <div key={k as string} className="rounded-lg bg-muted/50 p-3"><dt className="text-xs text-muted-foreground">{k}</dt><dd className="mt-0.5 text-sm font-medium">{v || "—"}</dd></div>)}</dl></section>
        <section className="rounded-xl border bg-card p-4 sm:p-6"><h3 className="font-semibold">Распределение по фазам</h3><div className="mt-3 grid gap-3 sm:grid-cols-3">{(design.phase_load ?? []).map((p) => <div key={p.phase} className="rounded-lg border p-3"><div className="text-sm font-semibold text-primary">{p.phase}</div><div className="text-sm">{p.kw} кВт · {p.current_a} А</div><div className="mt-1 text-xs text-muted-foreground">{(p.lines ?? []).join(", ")}</div></div>)}</div>{!!(design.protection_chain ?? []).length && <ol className="mt-4 space-y-1 text-sm">{design.protection_chain.map((step,i)=><li key={i} className="text-muted-foreground">{i+1}. {step}</li>)}</ol>}</section>
        <section className="rounded-xl border bg-card p-4 sm:p-6"><h3 className="font-semibold">Групповые линии</h3><div className="mt-3 overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead className="text-left text-xs text-muted-foreground"><tr>{["Марк.","Линия","кВт","А","Автомат","P","Фаза","УЗО","Кабель","Мод."].map(h=><th key={h} className="px-2 py-2 font-medium">{h}</th>)}</tr></thead><tbody>{(design.lines ?? []).map(l=><tr key={l.mark} className="border-t"><td className="px-2 py-2 font-medium text-primary">{l.mark}</td><td className="px-2 py-2">{l.name}</td><td className="px-2 py-2">{l.power_kw}</td><td className="px-2 py-2">{l.current_a}</td><td className="px-2 py-2">{l.breaker}</td><td className="px-2 py-2">{l.poles}</td><td className="px-2 py-2">{l.phase}</td><td className="px-2 py-2">{l.rcd}</td><td className="px-2 py-2">{l.cable}</td><td className="px-2 py-2">{l.modules}</td></tr>)}</tbody></table></div></section>
        <section id="panel-final" className="rounded-xl border bg-card p-4 sm:p-6">
          <h3 className="font-semibold">Итог проекта</h3>
          <div className="mt-3 hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="text-left text-xs text-muted-foreground"><tr>{["№","Линия","Кабель","Автомат","УЗО","IΔn","Группа","Модули","Мощность","Ток"].map(h=><th key={h} className="px-2 py-2 font-medium">{h}</th>)}</tr></thead>
              <tbody>{finalRows.map((r,i)=><tr key={r.mark} className="border-t align-top"><td className="px-2 py-2">{i+1}</td><td className="px-2 py-2">{r.name}</td><td className="px-2 py-2">{r.cable}</td><td className="px-2 py-2">{r.breaker}</td><td className="px-2 py-2">{r.rcd}</td><td className="px-2 py-2">{r.leakage}</td><td className="px-2 py-2">{r.group}</td><td className="px-2 py-2">{r.modules}</td><td className="px-2 py-2">{r.power_kw} кВт</td><td className="px-2 py-2">{r.current_a} А</td></tr>)}</tbody>
            </table>
          </div>
          <ul className="mt-3 space-y-2 sm:hidden">{finalRows.map((r,i)=><li key={r.mark} className="rounded-lg border p-3 text-sm"><div className="font-medium">{i+1}. {r.name}</div><dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">{[["Кабель",r.cable],["Автомат",r.breaker],["УЗО",r.rcd],["IΔn",r.leakage],["Группа",r.group],["Модули",String(r.modules)],["Мощность",`${r.power_kw} кВт`],["Ток",`${r.current_a} А`]].map(([k,v])=><div key={k}><dt className="text-muted-foreground">{k}</dt><dd className="font-medium">{v || "—"}</dd></div>)}</dl></li>)}</ul>
        </section>

        <section className="rounded-xl border bg-card p-4 sm:p-6">
          <h3 className="font-semibold">Вводная часть и защита</h3>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[["Вводной автомат", s?.main_breaker],["Разделение PEN", `${s?.grounding ?? ""}: PEN → PE и N один раз на вводной шине`],["Расчётная нагрузка", `${s?.calculated_power_kw ?? 0} кВт из ${s?.total_power_kw ?? 0} кВт`],["Занято модулей", String(s?.used_modules ?? 0)],["Резерв", `${s?.reserve_modules ?? 0} мод.`],["DIN-рейки", String((design.rails ?? []).length)],["Корпус", `${s?.enclosure ?? ""} (${s?.enclosure_modules ?? 0} мод.)`],["IP", s?.ip]].map(([k,v])=><div key={k as string} className="rounded-lg bg-muted/50 p-3"><dt className="text-xs text-muted-foreground">{k}</dt><dd className="mt-0.5 text-sm font-medium">{v || "—"}</dd></div>)}</dl>
          {!!(design.rcd_groups ?? []).length && <div className="mt-4 grid gap-2 sm:grid-cols-2">{design.rcd_groups.map(g=><div key={g.mark} className="rounded-lg border p-3 text-sm"><div className="font-medium text-primary">{g.mark} · {g.rating} · {g.type} · {g.leakage}</div><div className="mt-1 text-xs text-muted-foreground">{(g.lines ?? []).join(", ")}</div></div>)}</div>}
        </section>

        <section id="panel-rails" className="rounded-xl border bg-card p-4 sm:p-6">
          <h3 className="font-semibold">Раскладка по DIN-рейкам</h3>
          <div className="mt-3 space-y-3">{(design.rails ?? []).map(rail=>{const used=railTotal(rail);const cap=Math.max(used, Math.round((s?.enclosure_modules ?? 0)/Math.max((design.rails ?? []).length,1)));return <div key={rail.index} className="rounded-lg border p-3"><div className="flex flex-wrap items-center justify-between gap-2 text-sm"><span className="font-medium">{rail.title || `Рейка ${rail.index}`}</span><span className="text-xs text-muted-foreground">{used} / {cap} мод.{cap>used?` · резерв ${cap-used}`:""}</span></div><div className="mt-2 flex flex-wrap gap-1.5">{rail.items.map((it,i)=><span key={`${rail.index}-${i}`} className="rounded border bg-muted/50 px-2 py-1 text-xs">[{it.mark}] {it.label} · {it.modules} мод.</span>)}{cap>used&&<span className="rounded border border-dashed px-2 py-1 text-xs text-muted-foreground">резерв {cap-used} мод.</span>}</div></div>;})}</div>
        </section>

        {showSvg && !!svg && <section id="panel-svg" className="rounded-xl border bg-card p-4 sm:p-6"><h3 className="font-semibold">Однолинейная схема</h3><div className="mt-3 overflow-x-auto" dangerouslySetInnerHTML={{ __html: svg }} /></section>}

        {cost !== null && <section className="rounded-xl border bg-card p-4 sm:p-6"><h3 className="font-semibold">Расчёт стоимости по прайсу</h3><p className="mt-2 text-sm">Оборудование и материалы: <span className="font-semibold">{cost.total.toLocaleString("ru-RU")} ₽</span></p>{cost.missing > 0 && <p className="mt-1 text-xs text-muted-foreground">Позиций без цены в прайсе: {cost.missing} — добавьте их во вкладке «Прайс».</p>}</section>}

        <ResultErrorBoundary title="Чертежи щита недоступны">
          <PanelDrawings design={design} title={title} />
        </ResultErrorBoundary>
        <section className="rounded-xl border bg-card p-4 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">Экспорт в Visio</h3><div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={downloadSvg}><Download className="mr-2 h-4 w-4" /> Схема SVG</Button><Button variant="outline" size="sm" onClick={() => design && exportPanelSingleLineVsdx(design, `Однолинейная схема ${todayISO()}`)}><Download className="mr-2 h-4 w-4" /> Visio (.vsdx)</Button></div></div></section>
        <ResultErrorBoundary
          title="Визуализация щита недоступна"
          message="Не удалось построить визуализацию. Основные данные проекта и спецификация доступны."
        >
          <PanelSpecVisual rows={[...(design.spec ?? []), ...(design.materials ?? [])]} />
        </ResultErrorBoundary>
        <section className="rounded-xl border bg-card p-4 sm:p-6"><h3 className="font-semibold">Спецификация</h3><div className="mt-3 overflow-x-auto"><table className="w-full min-w-[700px] text-sm"><thead className="text-left text-xs text-muted-foreground"><tr>{["№","Наименование","Производитель","Модель","Номинал","Кол-во","Ед."].map(h=><th key={h} className="px-2 py-2 font-medium">{h}</th>)}</tr></thead><tbody>{[...(design.spec ?? []), ...(design.materials ?? [])].map((r,i)=><tr key={i} className="border-t"><td className="px-2 py-2">{i+1}</td><td className="px-2 py-2">{r.name}</td><td className="px-2 py-2">{r.manufacturer}</td><td className="px-2 py-2">{r.model}</td><td className="px-2 py-2">{r.rating}</td><td className="px-2 py-2">{r.qty}</td><td className="px-2 py-2">{r.unit}</td></tr>)}</tbody></table></div></section>
        {(image || imgBusy) && <section className="rounded-xl border bg-card p-4 sm:p-6"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold">Визуализация щита</h3>{image && <Button variant="outline" size="sm" onClick={downloadImage}><Download className="mr-2 h-4 w-4" /> Скачать визуализацию</Button>}</div>{imgBusy ? <p className="mt-2 text-sm text-muted-foreground">Генерация изображения…</p> : <img src={image} alt="Визуализация собранного электрощита" className="mt-3 w-full rounded-lg border" />}</section>}
        {!!(design.questions ?? []).length && <section className="rounded-xl border border-primary/40 bg-primary/5 p-4 sm:p-6"><h3 className="font-semibold">Нужны уточнения по исходным данным</h3><p className="mt-1 text-sm text-muted-foreground">Ответьте в поле «Дополнительные требования» или в списке линий и повторите расчёт.</p><ul className="mt-3 space-y-2 text-sm">{(design.questions ?? []).map((q,i)=><li key={`q${i}`}>• {q}</li>)}</ul></section>}
        {(!!(design.issues ?? []).length || !!(design.assumptions ?? []).length) && <section className="rounded-xl border bg-card p-4 sm:p-6"><h3 className="font-semibold">Замечания и допущения</h3><ul className="mt-3 space-y-2 text-sm">{(design.issues ?? []).map((issue,i)=><li key={`i${i}`} className="rounded-lg bg-destructive/10 p-3"><span className="font-medium">{issue.text}</span>{issue.fix && <span className="text-muted-foreground"> → {issue.fix}</span>}</li>)}{(design.assumptions ?? []).map((a,i)=><li key={`a${i}`} className="text-muted-foreground">• {a}</li>)}</ul></section>}
      </div>}
    </div>
  );
}
