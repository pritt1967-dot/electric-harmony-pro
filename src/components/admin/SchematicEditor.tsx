import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  AlignHorizontalJustifyStart,
  AlignVerticalJustifyStart,
  Cable,
  ClipboardList,
  Copy,
  FileDown,
  Group,
  Loader2,
  MousePointer2,
  Printer,
  Redo2,
  Save,
  ShieldCheck,
  Trash2,
  Ungroup,
  Undo2,
  Wand2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  CATALOG,
  LIBRARY,
  LIB_GROUPS,
  createElement,
  defOf,
  elementSvg,
  emptyDoc,
  kindOf,
  pageSize,
  portsOf,
  uid,
  WIRE_KINDS,
} from "@/lib/schematic/library";
import { pointsToPath, wirePoints } from "@/lib/schematic/routing";
import { autoBuild } from "@/lib/schematic/autobuild";
import { checkSchematic, type CheckResult } from "@/lib/schematic/validate";
import {
  exportDxf,
  exportPdf,
  exportPng,
  exportSvg,
  printSchematic,
} from "@/lib/schematic/export";
import type { PageFormat, SchDoc, SchElement, WireKind } from "@/lib/schematic/types";
import type { PanelDesign } from "@/lib/panel";
import { emptyEstimate, nextNumber } from "@/lib/estimates";
import type { EstimateItem } from "@/lib/estimates";

type Saved = { id: string; title: string; updated_at: string };
type DesignRow = { id: string; title: string; design: PanelDesign | null };

const MIN_Z = 0.2;
const MAX_Z = 3;

export function SchematicEditor() {
  const navigate = useNavigate();
  const [doc, setDoc] = useState<SchDoc>(() => emptyDoc());
  const [past, setPast] = useState<SchDoc[]>([]);
  const [future, setFuture] = useState<SchDoc[]>([]);
  const [sel, setSel] = useState<string[]>([]);
  const [tool, setTool] = useState<"select" | "wire">("select");
  const [wireKind, setWireKind] = useState<WireKind>("L1");
  const [view, setView] = useState({ x: 40, y: 40, z: 0.8 });
  const [pending, setPending] = useState<{ el: string; port: string; x: number; y: number } | null>(null);
  const [cursor, setCursor] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [clip, setClip] = useState<SchElement[]>([]);
  const [check, setCheck] = useState<CheckResult | null>(null);
  const [saved, setSaved] = useState<Saved[]>([]);
  const [savedId, setSavedId] = useState("");
  const [designs, setDesigns] = useState<DesignRow[]>([]);
  const [title, setTitle] = useState("Схема щита");
  const [busy, setBusy] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef(view);
  viewRef.current = view;
  const dragRef = useRef<{ ids: string[]; sx: number; sy: number; orig: Record<string, [number, number]> } | null>(null);
  const panRef = useRef<{ sx: number; sy: number; vx: number; vy: number } | null>(null);

  const page = pageSize(doc);

  // ---------- история ----------
  const commit = useCallback((updater: (d: SchDoc) => SchDoc) => {
    setDoc((prev) => {
      setPast((p) => [...p.slice(-49), prev]);
      setFuture([]);
      return updater(prev);
    });
  }, []);

  const undo = useCallback(() => {
    setPast((p) => {
      if (!p.length) return p;
      const prev = p[p.length - 1]!;
      setDoc((cur) => {
        setFuture((f) => [cur, ...f].slice(0, 50));
        return prev;
      });
      return p.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (!f.length) return f;
      const next = f[0]!;
      setDoc((cur) => {
        setPast((p) => [...p, cur]);
        return next;
      });
      return f.slice(1);
    });
  }, []);

  // ---------- загрузка списков ----------
  const loadLists = useCallback(async () => {
    const [{ data: sch }, { data: des }] = await Promise.all([
      supabase
        .from("panel_schematics")
        .select("id, title, updated_at")
        .order("updated_at", { ascending: false }),
      supabase
        .from("panel_designs")
        .select("id, title, design")
        .order("updated_at", { ascending: false })
        .limit(30),
    ]);
    setSaved((sch ?? []) as Saved[]);
    setDesigns((des ?? []) as unknown as DesignRow[]);
  }, []);

  useEffect(() => {
    void loadLists();
  }, [loadLists]);

  // ---------- координаты ----------
  const toWorld = useCallback((clientX: number, clientY: number) => {
    const rect = wrapRef.current!.getBoundingClientRect();
    const v = viewRef.current;
    return {
      x: (clientX - rect.left - v.x) / v.z,
      y: (clientY - rect.top - v.y) / v.z,
    };
  }, []);

  const snap = useCallback(
    (n: number) => (doc.grid.snap ? Math.round(n / doc.grid.size) * doc.grid.size : Math.round(n)),
    [doc.grid.snap, doc.grid.size],
  );

  // ---------- зум колесом ----------
  const wheelRef = useRef<(e: WheelEvent) => void>(() => {});
  wheelRef.current = (e: WheelEvent) => {
    const rect = wrapRef.current!.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
    setView((v) => {
      const next = Math.min(MAX_Z, Math.max(MIN_Z, v.z * Math.exp(-dy * 0.0015)));
      const k = next / v.z;
      return { z: next, x: px - (px - v.x) * k, y: py - (py - v.y) * k };
    });
  };

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      wheelRef.current(e);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // ---------- операции ----------
  const selected = doc.elements.filter((e) => sel.includes(e.id));
  const single = selected.length === 1 ? selected[0]! : null;

  const addFromLibrary = (type: string) => {
    commit((d) => {
      const el = createElement(type, snap(120 + d.elements.length * 12), snap(120 + d.elements.length * 8), d.elements);
      setSel([el.id]);
      return { ...d, elements: [...d.elements, el] };
    });
  };

  const deleteSelection = useCallback(() => {
    if (!sel.length) return;
    commit((d) => ({
      ...d,
      elements: d.elements.filter((e) => !sel.includes(e.id)),
      wires: d.wires.filter((w) => !sel.includes(w.from.el) && !sel.includes(w.to.el)),
    }));
    setSel([]);
  }, [sel, commit]);

  const copySelection = useCallback(() => {
    setClip(selected.map((e) => ({ ...e })));
    if (selected.length) toast.success(`Скопировано: ${selected.length}`);
  }, [selected]);

  const pasteClipboard = useCallback(() => {
    if (!clip.length) return;
    commit((d) => {
      const copies = clip.map((e) => ({ ...e, id: uid(), x: e.x + 30, y: e.y + 30 }));
      setSel(copies.map((c) => c.id));
      return { ...d, elements: [...d.elements, ...copies] };
    });
  }, [clip, commit]);

  const patchSelected = (patch: Partial<SchElement>) => {
    commit((d) => ({
      ...d,
      elements: d.elements.map((e) => (sel.includes(e.id) ? { ...e, ...patch } : e)),
    }));
  };

  const align = (axis: "x" | "y") => {
    if (selected.length < 2) return;
    const v = Math.min(...selected.map((e) => e[axis]));
    commit((d) => ({
      ...d,
      elements: d.elements.map((e) => (sel.includes(e.id) ? { ...e, [axis]: v } : e)),
    }));
  };

  const groupSel = (on: boolean) => {
    const g = on ? uid("g") : "";
    commit((d) => ({
      ...d,
      elements: d.elements.map((e) => (sel.includes(e.id) ? { ...e, group: g } : e)),
    }));
  };

  // ---------- клавиатура ----------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      } else if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      } else if (mod && e.key.toLowerCase() === "c") {
        copySelection();
      } else if (mod && e.key.toLowerCase() === "v") {
        pasteClipboard();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteSelection();
      } else if (e.key === "Escape") {
        setPending(null);
        setSel([]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, copySelection, pasteClipboard, deleteSelection]);

  // ---------- мышь ----------
  function onElementDown(e: React.PointerEvent, el: SchElement) {
    if (tool === "wire") return;
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const ids = e.shiftKey
      ? sel.includes(el.id)
        ? sel
        : [...sel, el.id]
      : sel.includes(el.id)
        ? sel
        : el.group
          ? doc.elements.filter((x) => x.group === el.group).map((x) => x.id)
          : [el.id];
    setSel(ids);
    const w = toWorld(e.clientX, e.clientY);
    dragRef.current = {
      ids,
      sx: w.x,
      sy: w.y,
      orig: Object.fromEntries(
        doc.elements.filter((x) => ids.includes(x.id)).map((x) => [x.id, [x.x, x.y] as [number, number]]),
      ),
    };
    setPast((p) => [...p.slice(-49), doc]);
    setFuture([]);
  }

  function onCanvasDown(e: React.PointerEvent) {
    if (e.button === 1 || e.altKey || tool === "select") {
      if (e.button === 1 || e.altKey) {
        panRef.current = { sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y };
        return;
      }
    }
    if (tool === "select") setSel([]);
    if (tool === "wire") setPending(null);
  }

  function onMove(e: React.PointerEvent) {
    const w = toWorld(e.clientX, e.clientY);
    setCursor(w);
    if (panRef.current) {
      const p = panRef.current;
      setView((v) => ({ ...v, x: p.vx + (e.clientX - p.sx), y: p.vy + (e.clientY - p.sy) }));
      return;
    }
    const d = dragRef.current;
    if (!d) return;
    const dx = w.x - d.sx;
    const dy = w.y - d.sy;
    setDoc((cur) => ({
      ...cur,
      elements: cur.elements.map((el) =>
        d.ids.includes(el.id)
          ? { ...el, x: snap(d.orig[el.id]![0] + dx), y: snap(d.orig[el.id]![1] + dy) }
          : el,
      ),
    }));
  }

  function onUp() {
    dragRef.current = null;
    panRef.current = null;
  }

  function onPortDown(e: React.PointerEvent, el: SchElement, portId: string, kind: "in" | "out") {
    if (tool !== "wire") return;
    e.stopPropagation();
    if (!pending) {
      if (kind !== "out") {
        toast.info("Начните проводник с выходной точки");
        return;
      }
      const w = toWorld(e.clientX, e.clientY);
      setPending({ el: el.id, port: portId, x: w.x, y: w.y });
      return;
    }
    if (pending.el === el.id) {
      setPending(null);
      return;
    }
    commit((d) => ({
      ...d,
      wires: [
        ...d.wires,
        {
          id: uid("w"),
          from: { el: pending.el, port: pending.port },
          to: { el: el.id, port: portId },
          kind: wireKind,
          color: d.colors[wireKind],
        },
      ],
    }));
    setPending(null);
  }

  // ---------- сохранение ----------
  async function save(asNew = false) {
    setBusy(true);
    try {
      const payload = {
        title: title.trim() || "Схема щита",
        object_name: doc.title.object,
        doc: doc as never,
      };
      if (savedId && !asNew) {
        const { error } = await supabase.from("panel_schematics").update(payload).eq("id", savedId);
        if (error) throw new Error(error.message);
      } else {
        const { data, error } = await supabase
          .from("panel_schematics")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw new Error(error.message);
        setSavedId(data.id);
      }
      await loadLists();
      toast.success("Схема сохранена");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось сохранить");
    }
    setBusy(false);
  }

  async function open(id: string) {
    const { data } = await supabase
      .from("panel_schematics")
      .select("id, title, doc")
      .eq("id", id)
      .maybeSingle();
    if (!data) return toast.error("Схема не найдена");
    setSavedId(data.id);
    setTitle(data.title);
    setDoc({ ...emptyDoc(), ...(data.doc as unknown as SchDoc) });
    setSel([]);
    setPast([]);
    setFuture([]);
    toast.success("Схема загружена");
  }

  function buildFromDesign(id: string) {
    const row = designs.find((d) => d.id === id);
    if (!row?.design) return toast.error("В сессии нет расчёта");
    commit(() => autoBuild(row.design!, row.title));
    setSel([]);
    toast.success("Схема построена автоматически");
  }

  async function toEstimate() {
    setBusy(true);
    try {
      const { data: priceRows } = await supabase.from("price_items").select("name, unit, price");
      const priceMap = new Map((priceRows ?? []).map((p) => [p.name.trim().toLowerCase(), p]));
      const items: EstimateItem[] = doc.elements
        .filter((e) => kindOf(e.type) !== "load")
        .map((e, i) => {
          const match = priceMap.get(e.name.trim().toLowerCase());
          return {
            id: `${Date.now()}-${i}`,
            name: [e.name, e.manufacturer, e.model, e.rating].filter(Boolean).join(" · "),
            unit: match?.unit || "шт",
            qty: 1,
            price: Number(match?.price ?? 0),
            comment: e.ref,
          } as EstimateItem;
        });
      const { data: existing } = await supabase.from("estimates").select("number");
      const number = nextNumber((existing ?? []).map((e) => e.number));
      const base = emptyEstimate(number);
      const { data, error } = await supabase
        .from("estimates")
        .insert({
          ...base,
          object_name: doc.title.object,
          note: `По схеме: ${title}`,
          items: items as never,
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      toast.success("Смета создана");
      navigate({ to: "/estimate/$id", params: { id: data.id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось создать смету");
    }
    setBusy(false);
  }

  // ---------- рендер ----------
  const gridId = "sch-grid";
  const wiresSvg = useMemo(
    () =>
      doc.wires.map((w) => {
        const pts = wirePoints(doc, w);
        if (!pts) return null;
        return (
          <path
            key={w.id}
            d={pointsToPath(pts)}
            fill="none"
            stroke={w.color || doc.colors[w.kind]}
            strokeWidth={1.8}
            onClick={(e) => {
              e.stopPropagation();
              commit((d) => ({ ...d, wires: d.wires.filter((x) => x.id !== w.id) }));
              toast.info("Проводник удалён");
            }}
            className="cursor-pointer"
          />
        );
      }),
    [doc, commit],
  );

  const models = single?.manufacturer ? Object.keys(CATALOG[single.manufacturer] ?? {}) : [];
  const ratings =
    single?.manufacturer && single?.model ? (CATALOG[single.manufacturer]?.[single.model] ?? []) : [];

  return (
    <div className="space-y-4">
      {/* Панель управления */}
      <div className="rounded-xl border bg-card p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant={tool === "select" ? "default" : "outline"} onClick={() => setTool("select")}>
            <MousePointer2 className="mr-2 h-4 w-4" /> Выбор
          </Button>
          <Button size="sm" variant={tool === "wire" ? "default" : "outline"} onClick={() => setTool("wire")}>
            <Cable className="mr-2 h-4 w-4" /> Проводник
          </Button>
          <Select value={wireKind} onValueChange={(v) => setWireKind(v as WireKind)}>
            <SelectTrigger className="h-9 w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WIRE_KINDS.map((k) => (
                <SelectItem key={k} value={k}>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: doc.colors[k] }} />
                    {k === "CTRL" ? "Управление" : k}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="mx-1 h-6 w-px bg-border" />
          <Button size="icon" variant="outline" onClick={undo} disabled={!past.length} title="Отменить">
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={redo} disabled={!future.length} title="Повторить">
            <Redo2 className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={copySelection} title="Копировать">
            <Copy className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={deleteSelection} title="Удалить">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={() => align("x")} title="Выровнять по левому краю">
            <AlignHorizontalJustifyStart className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={() => align("y")} title="Выровнять по верхнему краю">
            <AlignVerticalJustifyStart className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={() => groupSel(true)} title="Группировать">
            <Group className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="outline" onClick={() => groupSel(false)} title="Разгруппировать">
            <Ungroup className="h-4 w-4" />
          </Button>

          <span className="mx-1 h-6 w-px bg-border" />
          <Button
            size="icon"
            variant="outline"
            onClick={() => setView((v) => ({ ...v, z: Math.max(MIN_Z, v.z / 1.2) }))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center text-xs text-muted-foreground">
            {Math.round(view.z * 100)}%
          </span>
          <Button
            size="icon"
            variant="outline"
            onClick={() => setView((v) => ({ ...v, z: Math.min(MAX_Z, v.z * 1.2) }))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setView({ x: 40, y: 40, z: 0.8 })}>
            Сброс
          </Button>

          <span className="mx-1 h-6 w-px bg-border" />
          <div className="flex items-center gap-2 text-xs">
            <span>Однолин.</span>
            <Switch
              checked={doc.mode === "multi"}
              onCheckedChange={(v) => commit((d) => ({ ...d, mode: v ? "multi" : "single" }))}
            />
            <span>Многолин.</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span>Сетка</span>
            <Switch
              checked={doc.grid.show}
              onCheckedChange={(v) => setDoc((d) => ({ ...d, grid: { ...d.grid, show: v } }))}
            />
            <span>Привязка</span>
            <Switch
              checked={doc.grid.snap}
              onCheckedChange={(v) => setDoc((d) => ({ ...d, grid: { ...d.grid, snap: v } }))}
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Input
            className="h-9 w-[220px]"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название схемы"
          />
          <Button size="sm" onClick={() => save(false)} disabled={busy}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Сохранить
          </Button>
          {savedId && (
            <Button size="sm" variant="outline" onClick={() => save(true)} disabled={busy}>
              Копия
            </Button>
          )}
          <Select value={savedId} onValueChange={open}>
            <SelectTrigger className="h-9 w-[220px]">
              <SelectValue placeholder="Открыть схему…" />
            </SelectTrigger>
            <SelectContent>
              {saved.length === 0 && (
                <SelectItem value="none" disabled>
                  Нет сохранённых схем
                </SelectItem>
              )}
              {saved.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.title} · {new Date(s.updated_at).toLocaleDateString("ru-RU")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value="" onValueChange={buildFromDesign}>
            <SelectTrigger className="h-9 w-[260px]">
              <SelectValue placeholder="Создать схему автоматически…" />
            </SelectTrigger>
            <SelectContent>
              {designs.length === 0 && (
                <SelectItem value="none" disabled>
                  Нет расчётов проектировщика
                </SelectItem>
              )}
              {designs.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  <span className="inline-flex items-center gap-2">
                    <Wand2 className="h-3.5 w-3.5" /> {d.title}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button size="sm" variant="outline" onClick={() => setCheck(checkSchematic(doc))}>
            <ShieldCheck className="mr-2 h-4 w-4" /> Проверить схему
          </Button>
          <Button size="sm" variant="outline" onClick={() => exportPdf(doc, title)}>
            <FileDown className="mr-2 h-4 w-4" /> PDF
          </Button>
          <Button size="sm" variant="outline" onClick={() => exportPng(doc, title)}>
            PNG
          </Button>
          <Button size="sm" variant="outline" onClick={() => exportSvg(doc, title)}>
            SVG
          </Button>
          <Button size="sm" variant="outline" onClick={() => exportDxf(doc, title)}>
            DXF
          </Button>
          <Button size="sm" variant="outline" onClick={() => printSchematic(doc)}>
            <Printer className="mr-2 h-4 w-4" /> Печать
          </Button>
          <Button size="sm" variant="secondary" onClick={toEstimate} disabled={busy}>
            <ClipboardList className="mr-2 h-4 w-4" /> В смету
          </Button>
        </div>

        {check && (
          <div
            className={`mt-3 rounded-lg border p-3 text-sm ${
              check.level === "error"
                ? "border-destructive/40 bg-destructive/10"
                : check.level === "warn"
                  ? "border-amber-400/50 bg-amber-100/40"
                  : "border-emerald-500/40 bg-emerald-100/40"
            }`}
          >
            <div className="font-medium">
              {check.level === "error"
                ? "🔴 Обнаружены ошибки"
                : check.level === "warn"
                  ? "🟡 Есть предупреждения"
                  : "🟢 Схема проверена"}
            </div>
            <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
              {check.messages.map((m, i) => (
                <li key={i}>• {m.text}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Рабочая область */}
      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_260px]">
        {/* Библиотека */}
        <aside className="max-h-[720px] overflow-y-auto rounded-xl border bg-card p-3">
          <h3 className="text-sm font-semibold">Библиотека элементов</h3>
          {LIB_GROUPS.map((g) => (
            <div key={g} className="mt-3">
              <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {g}
              </div>
              <div className="mt-1 space-y-1">
                {LIBRARY.filter((l) => l.group === g).map((l) => (
                  <button
                    key={l.type}
                    type="button"
                    onClick={() => addFromLibrary(l.type)}
                    className="flex w-full items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-left text-xs hover:border-border hover:bg-muted"
                  >
                    <span className="inline-block h-4 w-6 shrink-0 rounded-[2px] border border-foreground/60 bg-background" />
                    <span className="truncate">{l.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </aside>

        {/* Холст */}
        <div className="overflow-hidden rounded-xl border bg-card">
          {/* Линейка сверху */}
          <div className="flex">
            <div className="h-6 w-6 border-b border-r bg-muted/50" />
            <div className="relative h-6 flex-1 overflow-hidden border-b bg-muted/50">
              {Array.from({ length: 60 }).map((_, i) => {
                const x = view.x + i * 50 * view.z;
                return x < 0 || x > 4000 ? null : (
                  <div key={i} className="absolute top-0 h-full border-l text-[9px] text-muted-foreground" style={{ left: x }}>
                    <span className="ml-0.5">{i * 50}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex">
            <div className="relative w-6 shrink-0 border-r bg-muted/50">
              {Array.from({ length: 60 }).map((_, i) => {
                const y = view.y + i * 50 * view.z;
                return (
                  <div key={i} className="absolute left-0 w-full border-t text-[9px] text-muted-foreground" style={{ top: y }}>
                    <span className="ml-0.5">{i * 50}</span>
                  </div>
                );
              })}
            </div>
            <div
              ref={wrapRef}
              className="relative h-[680px] flex-1 touch-none bg-[#f1f5f9]"
              onPointerDown={onCanvasDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerLeave={onUp}
            >
              <svg className="h-full w-full" style={{ cursor: tool === "wire" ? "crosshair" : "default" }}>
                <defs>
                  <pattern
                    id={gridId}
                    width={doc.grid.size * view.z}
                    height={doc.grid.size * view.z}
                    patternUnits="userSpaceOnUse"
                    x={view.x}
                    y={view.y}
                  >
                    <path
                      d={`M ${doc.grid.size * view.z} 0 L 0 0 0 ${doc.grid.size * view.z}`}
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="0.5"
                    />
                  </pattern>
                </defs>
                <g transform={`translate(${view.x},${view.y}) scale(${view.z})`}>
                  <rect x={0} y={0} width={page.w} height={page.h} fill="#ffffff" stroke="#94a3b8" />
                </g>
                {doc.grid.show && (
                  <rect
                    x={view.x}
                    y={view.y}
                    width={page.w * view.z}
                    height={page.h * view.z}
                    fill={`url(#${gridId})`}
                    pointerEvents="none"
                  />
                )}
                <g transform={`translate(${view.x},${view.y}) scale(${view.z})`}>
                  {wiresSvg}
                  {pending && (
                    <line
                      x1={
                        doc.elements.find((e) => e.id === pending.el)
                          ? portsOf(doc.elements.find((e) => e.id === pending.el)!, doc.mode).find(
                              (p) => p.id === pending.port,
                            )?.x ?? pending.x
                          : pending.x
                      }
                      y1={
                        doc.elements.find((e) => e.id === pending.el)
                          ? portsOf(doc.elements.find((e) => e.id === pending.el)!, doc.mode).find(
                              (p) => p.id === pending.port,
                            )?.y ?? pending.y
                          : pending.y
                      }
                      x2={cursor.x}
                      y2={cursor.y}
                      stroke={doc.colors[wireKind]}
                      strokeDasharray="5 3"
                      strokeWidth={1.5}
                    />
                  )}
                  {doc.elements.map((el) => (
                    <g key={el.id}>
                      <g
                        onPointerDown={(e) => onElementDown(e, el)}
                        className={tool === "select" ? "cursor-move" : "cursor-default"}
                        dangerouslySetInnerHTML={{
                          __html: elementSvg(el, doc, sel.includes(el.id)),
                        }}
                      />
                      {(tool === "wire" || sel.includes(el.id)) &&
                        portsOf(el, doc.mode).map((p) => (
                          <circle
                            key={p.id}
                            cx={p.x}
                            cy={p.y}
                            r={4}
                            fill={p.kind === "out" ? doc.colors[p.wire] : "#ffffff"}
                            stroke={doc.colors[p.wire]}
                            strokeWidth={1.5}
                            className="cursor-crosshair"
                            onPointerDown={(e) => onPortDown(e, el, p.id, p.kind)}
                          />
                        ))}
                    </g>
                  ))}
                </g>
              </svg>
              <div className="pointer-events-none absolute bottom-2 left-2 rounded bg-background/80 px-2 py-1 text-[11px] text-muted-foreground">
                {Math.round(cursor.x)} : {Math.round(cursor.y)} · {doc.elements.length} эл. ·{" "}
                {doc.wires.length} связ.
              </div>
            </div>
          </div>
        </div>

        {/* Свойства */}
        <aside className="max-h-[720px] overflow-y-auto rounded-xl border bg-card p-3">
          <h3 className="text-sm font-semibold">Свойства</h3>
          {!single && (
            <div className="mt-3 space-y-3 text-xs text-muted-foreground">
              <p>Выберите элемент, чтобы изменить его параметры.</p>
              <div className="space-y-1.5">
                <Label className="text-xs">Формат листа</Label>
                <Select
                  value={doc.page.format}
                  onValueChange={(v) => setDoc((d) => ({ ...d, page: { ...d.page, format: v as PageFormat } }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["A4", "A3", "A2", "A1"].map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <span>Альбомная ориентация</span>
                <Switch
                  checked={doc.page.landscape}
                  onCheckedChange={(v) => setDoc((d) => ({ ...d, page: { ...d.page, landscape: v } }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Объект</Label>
                <Input
                  className="h-9"
                  value={doc.title.object}
                  onChange={(e) => setDoc((d) => ({ ...d, title: { ...d.title, object: e.target.value } }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Название схемы</Label>
                <Input
                  className="h-9"
                  value={doc.title.name}
                  onChange={(e) => setDoc((d) => ({ ...d, title: { ...d.title, name: e.target.value } }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Показывать на схеме</Label>
                {(
                  [
                    ["rating", "Номинал"],
                    ["name", "Название линии"],
                    ["cable", "Кабель"],
                  ] as const
                ).map(([k, label]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span>{label}</span>
                    <Switch
                      checked={doc.show[k]}
                      onCheckedChange={(v) => setDoc((d) => ({ ...d, show: { ...d.show, [k]: v } }))}
                    />
                  </div>
                ))}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Цвета проводников</Label>
                {WIRE_KINDS.map((k) => (
                  <div key={k} className="flex items-center justify-between gap-2">
                    <span>{k === "CTRL" ? "Управление" : k}</span>
                    <input
                      type="color"
                      value={doc.colors[k]}
                      onChange={(e) =>
                        setDoc((d) => ({ ...d, colors: { ...d.colors, [k]: e.target.value } }))
                      }
                      className="h-7 w-12 rounded border"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {single && (
            <div className="mt-3 space-y-3">
              {(
                [
                  ["ref", "Обозначение"],
                  ["name", "Название"],
                  ["rating", "Номинал"],
                  ["line", "Линия"],
                  ["cable", "Кабель"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="space-y-1.5">
                  <Label className="text-xs">{label}</Label>
                  <Input
                    className="h-9"
                    value={String(single[key] ?? "")}
                    onChange={(e) => patchSelected({ [key]: e.target.value } as Partial<SchElement>)}
                  />
                </div>
              ))}

              <div className="space-y-1.5">
                <Label className="text-xs">Производитель</Label>
                <Select
                  value={single.manufacturer}
                  onValueChange={(v) => patchSelected({ manufacturer: v, model: "" })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Выбрать" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(CATALOG).map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Модель</Label>
                <Select value={single.model} onValueChange={(v) => patchSelected({ model: v })}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Выбрать" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.length === 0 && (
                      <SelectItem value="none" disabled>
                        Сначала выберите производителя
                      </SelectItem>
                    )}
                    {models.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {!!ratings.length && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Номинал из каталога</Label>
                  <Select
                    value=""
                    onValueChange={(v) => {
                      const poles = single.model.includes("4P")
                        ? 4
                        : single.model.includes("3P")
                          ? 3
                          : single.model.includes("2P")
                            ? 2
                            : single.poles;
                      patchSelected({ rating: v, poles, modules: poles || defOf(single.type).modules });
                    }}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Подставить номинал" />
                    </SelectTrigger>
                    <SelectContent>
                      {ratings.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Полюса</Label>
                  <Select
                    value={String(single.poles)}
                    onValueChange={(v) => patchSelected({ poles: Number(v) })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map((p) => (
                        <SelectItem key={p} value={String(p)}>
                          {p}P
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Модули</Label>
                  <Input
                    className="h-9"
                    type="number"
                    value={single.modules}
                    onChange={(e) => patchSelected({ modules: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Фаза</Label>
                <Select value={single.phase} onValueChange={(v) => patchSelected({ phase: v })}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["L1", "L2", "L3"].map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">X</Label>
                  <Input
                    className="h-9"
                    type="number"
                    value={single.x}
                    onChange={(e) => patchSelected({ x: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Y</Label>
                  <Input
                    className="h-9"
                    type="number"
                    value={single.y}
                    onChange={(e) => patchSelected({ y: Number(e.target.value) })}
                  />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Тип: {defOf(single.type).label}
                {single.group ? " · в группе" : ""}
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
