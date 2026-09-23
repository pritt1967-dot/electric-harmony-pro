/**
 * Конструктор щита из реальной библиотеки Visio: производитель → аппарат → параметры →
 * размещение на DIN-рейке. Используются только реальные фигуры (SVG из Visio-мастеров),
 * заглушки не создаются. Существующая логика конструктора не изменяется.
 */

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Plus, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { BUS_CONNECTION_LABEL } from "@/lib/shape-library/bus-connection";
import {
  CATALOG_BY_ID,
  CATALOG_MANUFACTURERS,
  CATALOG_STATS,
  MODULE_WIDTH_MM,
  searchCatalog,
  seriesOf,
  typesOf,
  type CatalogDevice,
} from "@/lib/shape-library/device-tree";
import { BUS_N, BUS_PE, testPanel230 } from "@/lib/shape-library/test-panel-230";

const ALL = "all";
const SCALE = 2.4; // px на мм
const DEVICE_H_MM = 85;
const LAYOUT_KIND = "library-layout";

type LayoutItem = {
  key: string;
  deviceId: string;
  rail: number;
  manufacturer: string;
  model: string;
  ratedCurrent: number | null;
  modules: number;
  /** Маркировка отходящей линии (QF1, «Розетки кухни» и т. п.). */
  label?: string;
  /** Временный тестовый аналог: точного аппарата в библиотеке нет. */
  substitute?: boolean;
  note?: string;
};

type SavedLayout = {
  kind: typeof LAYOUT_KIND;
  version: 1;
  rails: number;
  railModules: number;
  reserveModules?: number;
  items: LayoutItem[];
};

export function PanelLibraryBuilder() {
  const [manufacturer, setManufacturer] = useState(ALL);
  const [series, setSeries] = useState(ALL);
  const [deviceType, setDeviceType] = useState(ALL);
  const [q, setQ] = useState("");

  const [railModules, setRailModules] = useState(12);
  const [rails, setRails] = useState(3);
  const [activeRail, setActiveRail] = useState(0);
  const [items, setItems] = useState<LayoutItem[]>([]);

  const [reserveModules, setReserveModules] = useState(2);

  const [title, setTitle] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<{ id: string; title: string }[]>([]);
  const [saving, setSaving] = useState(false);

  const seriesList = useMemo(
    () => seriesOf(manufacturer === ALL ? "" : manufacturer),
    [manufacturer],
  );
  const typeList = useMemo(
    () => typesOf(manufacturer === ALL ? "" : manufacturer, series === ALL ? "" : series),
    [manufacturer, series],
  );
  const found = useMemo(
    () =>
      searchCatalog({
        manufacturer: manufacturer === ALL ? undefined : manufacturer,
        series: series === ALL ? undefined : series,
        deviceType: deviceType === ALL ? undefined : deviceType,
        q,
      }),
    [manufacturer, series, deviceType, q],
  );

  const railsUsed = useMemo(() => {
    const used = Array.from({ length: rails }, () => 0);
    for (const it of items) if (used[it.rail] != null) used[it.rail]! += it.modules;
    return used;
  }, [items, rails]);

  const totalModules = items.reduce((s, i) => s + i.modules, 0);
  const capacity = rails * railModules;
  const freeModules = capacity - totalModules;
  const reserveOk = freeModules >= reserveModules;

  function setLabel(key: string, label: string) {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, label } : i)));
  }

  /** Тестовый однофазный щит 230 В — проверка конструктора на реальном составе. */
  function loadTestPanel() {
    const rows = testPanel230();
    let rail = 0;
    let used = 0;
    const next: LayoutItem[] = [];
    for (const r of rows) {
      if (used + r.device.modules > railModules) {
        rail += 1;
        used = 0;
      }
      next.push({
        key: `${r.device.id}-${next.length}-${Math.random().toString(36).slice(2, 7)}`,
        deviceId: r.device.id,
        rail,
        manufacturer: r.device.manufacturer,
        model: r.device.model,
        ratedCurrent: r.device.ratedCurrent,
        modules: r.device.modules,
        label: r.label,
        substitute: r.substitute,
        note: r.note,
      });
      used += r.device.modules;
    }
    setRails(Math.max(rails, rail + 1));
    setItems(next);
    setReserveModules(2);
    setTitle((t) => t || "Тестовый щит 230 В (испытание конструктора)");
    toast.success(`Собран тестовый щит: ${next.length} аппаратов`);
  }

  function addDevice(d: CatalogDevice) {
    const free = railModules - (railsUsed[activeRail] ?? 0);
    if (d.modules > free) {
      toast.error(`На рейке ${activeRail + 1} свободно ${free} мод., нужно ${d.modules}`);
      return;
    }
    setItems((prev) => [
      ...prev,
      {
        key: `${d.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        deviceId: d.id,
        rail: activeRail,
        manufacturer: d.manufacturer,
        model: d.model,
        ratedCurrent: d.ratedCurrent,
        modules: d.modules,
      },
    ]);
  }

  function remove(key: string) {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }

  function moveInRail(key: string, dir: -1 | 1) {
    setItems((prev) => {
      const next = [...prev];
      const idx = next.findIndex((i) => i.key === key);
      if (idx < 0) return prev;
      const rail = next[idx]!.rail;
      const sameRail = next.map((i, n) => ({ i, n })).filter((x) => x.i.rail === rail);
      const pos = sameRail.findIndex((x) => x.n === idx);
      const swap = sameRail[pos + dir];
      if (!swap) return prev;
      [next[idx], next[swap.n]] = [next[swap.n]!, next[idx]!];
      return next;
    });
  }

  function moveRail(key: string, dir: -1 | 1) {
    setItems((prev) => {
      const it = prev.find((i) => i.key === key);
      if (!it) return prev;
      const target = it.rail + dir;
      if (target < 0 || target >= rails) return prev;
      const used = prev.filter((i) => i.rail === target).reduce((s, i) => s + i.modules, 0);
      if (used + it.modules > railModules) {
        toast.error(`На рейке ${target + 1} недостаточно места`);
        return prev;
      }
      return prev.map((i) => (i.key === key ? { ...i, rail: target } : i));
    });
  }

  async function loadSessions() {
    const { data } = await supabase
      .from("panel_designs")
      .select("id, title, input")
      .order("updated_at", { ascending: false })
      .limit(100);
    setSessions(
      (data ?? [])
        .filter((r) => (r.input as { kind?: string } | null)?.kind === LAYOUT_KIND)
        .map((r) => ({ id: r.id, title: r.title })),
    );
  }

  useEffect(() => {
    void loadSessions();
  }, []);

  async function save(asNew = false) {
    setSaving(true);
    try {
      const name = title.trim() || `Щит из библиотеки — ${new Date().toLocaleDateString("ru-RU")}`;
      const payload: SavedLayout = {
        kind: LAYOUT_KIND,
        version: 1,
        rails,
        railModules,
        reserveModules,
        items,
      };
      const row = { title: name, input: payload as never, design: null as never, image: "" };
      if (sessionId && !asNew) {
        const { error } = await supabase.from("panel_designs").update(row).eq("id", sessionId);
        if (error) throw new Error(error.message);
      } else {
        const { data, error } = await supabase
          .from("panel_designs")
          .insert(row)
          .select("id")
          .single();
        if (error) throw new Error(error.message);
        setSessionId(data.id);
      }
      setTitle(name);
      await loadSessions();
      toast.success("Проект щита сохранён");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Не удалось сохранить");
    }
    setSaving(false);
  }

  async function open(id: string) {
    const { data, error } = await supabase
      .from("panel_designs")
      .select("id, title, input")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) {
      toast.error("Не удалось открыть проект");
      return;
    }
    const saved = data.input as unknown as SavedLayout;
    setSessionId(data.id);
    setTitle(data.title);
    setRails(saved.rails ?? 3);
    setRailModules(saved.railModules ?? 12);
    setReserveModules(saved.reserveModules ?? 0);
    setItems(Array.isArray(saved.items) ? saved.items : []);
    setActiveRail(0);
    toast.success("Проект открыт");
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-lg font-bold">Щит из библиотеки Visio</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Производитель → аппарат → параметры → DIN-рейка. В раскладку попадают только реальные
          фигуры из исходных Visio-мастеров: {CATALOG_STATS.devices} аппаратов,{" "}
          {CATALOG_STATS.manufacturers} производителей, форматы VSS ({CATALOG_STATS.vss}) и VSSX (
          {CATALOG_STATS.vssx}).
        </p>
      </header>

      {/* --- выбор аппарата --- */}
      <div className="space-y-3 rounded-xl border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label className="text-xs">Производитель</Label>
            <Select
              value={manufacturer}
              onValueChange={(v) => {
                setManufacturer(v);
                setSeries(ALL);
                setDeviceType(ALL);
              }}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value={ALL}>Все</SelectItem>
                {CATALOG_MANUFACTURERS.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Серия</Label>
            <Select value={series} onValueChange={(v) => { setSeries(v); setDeviceType(ALL); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value={ALL}>Все</SelectItem>
                {seriesList.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Тип аппарата</Label>
            <Select value={deviceType} onValueChange={setDeviceType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value={ALL}>Все</SelectItem>
                {typeList.map((t) => (
                  <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Поиск (модель, номинал, артикул)</Label>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="например: C16 1P" />
          </div>
        </div>

        <div className="text-xs text-muted-foreground">Найдено аппаратов: {found.length}</div>

        <div className="max-h-80 divide-y overflow-auto rounded-lg border">
          {found.slice(0, 60).map((d) => (
            <div key={d.id} className="flex items-center gap-3 p-2">
              <img
                src={d.svgAsset}
                alt={d.model}
                className="h-12 w-8 shrink-0 object-contain"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">
                  {d.manufacturer} · {d.model}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {d.deviceTypeLabel} · {d.poles ? `${d.poles}P` : "полюса не указаны"} ·{" "}
                  {d.ratedCurrent ? `${d.curve ?? ""}${d.ratedCurrent} А` : "номинал не указан"} ·{" "}
                  {d.modules} мод.{d.modulesFromSource ? "" : " (по ширине фигуры)"} ·{" "}
                  {BUS_CONNECTION_LABEL[d.busConnection]}
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => addDevice(d)}>
                <Plus className="mr-1 h-4 w-4" /> На рейку {activeRail + 1}
              </Button>
            </div>
          ))}
          {!found.length && (
            <div className="p-4 text-sm text-muted-foreground">
              Ничего не найдено по заданным параметрам.
            </div>
          )}
        </div>
      </div>

      {/* --- параметры щита --- */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
        <div className="w-36">
          <Label className="text-xs">Модулей в рейке</Label>
          <Input
            type="number"
            min={4}
            value={railModules}
            onChange={(e) => setRailModules(Math.max(4, Number(e.target.value) || 12))}
          />
        </div>
        <div className="w-28">
          <Label className="text-xs">DIN-реек</Label>
          <Input
            type="number"
            min={1}
            value={rails}
            onChange={(e) => setRails(Math.max(1, Number(e.target.value) || 1))}
          />
        </div>
        <div className="w-40">
          <Label className="text-xs">Активная рейка</Label>
          <Select value={String(activeRail)} onValueChange={(v) => setActiveRail(Number(v))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Array.from({ length: rails }, (_, i) => (
                <SelectItem key={i} value={String(i)}>Рейка {i + 1}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-36">
          <Label className="text-xs">Резерв, модулей</Label>
          <Input
            type="number"
            min={0}
            value={reserveModules}
            onChange={(e) => setReserveModules(Math.max(0, Number(e.target.value) || 0))}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Занято модулей: {totalModules} / {capacity} · свободно {freeModules} мод. · резерв{" "}
          <span className={reserveOk ? "text-emerald-600" : "text-destructive"}>
            {Math.min(freeModules, reserveModules)} из {reserveModules} мод.
          </span>
        </div>
        <Button size="sm" variant="outline" onClick={loadTestPanel}>
          Тестовый щит 230 В
        </Button>
      </div>

      {/* --- визуализация DIN-реек --- */}
      <div className="overflow-auto rounded-xl border bg-white p-4">
        <div className="space-y-6" style={{ minWidth: railModules * MODULE_WIDTH_MM * SCALE + 24 }}>
          {Array.from({ length: rails }, (_, r) => {
            const railItems = items.filter((i) => i.rail === r);
            return (
              <div key={r}>
                <div className="mb-1 text-xs text-neutral-500">
                  Рейка {r + 1} — занято {railsUsed[r] ?? 0} из {railModules} мод.
                </div>
                <div
                  className="relative flex items-stretch border border-neutral-300 bg-neutral-100"
                  style={{
                    width: railModules * MODULE_WIDTH_MM * SCALE,
                    height: DEVICE_H_MM * SCALE,
                  }}
                >
                  {railItems.map((it) => {
                    const dev = CATALOG_BY_ID.get(it.deviceId);
                    return (
                      <div
                        key={it.key}
                        title={`${it.manufacturer} ${it.model}`}
                        className="flex flex-col items-center justify-between border-r border-neutral-300 bg-white"
                        style={{ width: it.modules * MODULE_WIDTH_MM * SCALE }}
                      >
                        {dev ? (
                          <img
                            src={dev.svgAsset}
                            alt={it.model}
                            className="min-h-0 w-full flex-1 object-contain p-0.5"
                          />
                        ) : (
                          <span className="p-1 text-center text-[10px] text-red-600">
                            Фигура отсутствует в библиотеке
                          </span>
                        )}
                        {it.label && (
                          <span
                            className={`w-full truncate px-0.5 pb-0.5 text-center text-[9px] leading-tight ${
                              it.substitute ? "text-amber-600" : "text-neutral-600"
                            }`}
                            title={it.label}
                          >
                            {it.label}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* --- шины N и PE (реальные фигуры библиотеки) --- */}
          {[
            { name: "Шина N", dev: BUS_N, color: "bg-sky-50" },
            { name: "Шина PE", dev: BUS_PE, color: "bg-emerald-50" },
          ].map((b) => (
            <div key={b.name}>
              <div className="mb-1 text-xs text-neutral-500">{b.name}</div>
              <div
                className={`flex items-center gap-2 border border-neutral-300 px-2 py-1 ${b.color}`}
                style={{ width: railModules * MODULE_WIDTH_MM * SCALE }}
              >
                {b.dev ? (
                  <img src={b.dev.svgAsset} alt={b.name} className="h-8 w-full object-contain" />
                ) : (
                  <span className="text-[11px] text-red-600">
                    Фигура шины отсутствует в библиотеке
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- список аппаратов --- */}
      <div className="rounded-xl border bg-card">
        <div className="border-b p-3 text-sm font-semibold">Аппараты в щите ({items.length})</div>
        <div className="divide-y text-sm">
          {items.map((it) => (
            <div key={it.key} className="flex flex-wrap items-center gap-2 p-2">
              <span className="text-xs text-muted-foreground">Рейка {it.rail + 1}</span>
              <Input
                className="h-8 w-52"
                value={it.label ?? ""}
                onChange={(e) => setLabel(it.key, e.target.value)}
                placeholder="Маркировка линии"
              />
              <span className="font-medium">{it.manufacturer} {it.model}</span>
              <span className="text-xs text-muted-foreground">
                {it.ratedCurrent ? `${it.ratedCurrent} А · ` : ""}{it.modules} мод.
              </span>
              {it.substitute && (
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] text-amber-800">
                  временный тестовый аналог
                </span>
              )}
              <div className="ml-auto flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => moveInRail(it.key, -1)} aria-label="Левее">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => moveInRail(it.key, 1)} aria-label="Правее">
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => moveRail(it.key, -1)} aria-label="Рейкой выше">
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => moveRail(it.key, 1)} aria-label="Рейкой ниже">
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => remove(it.key)} aria-label="Удалить">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          {!items.length && (
            <div className="p-4 text-sm text-muted-foreground">
              Щит пуст — выберите аппарат из библиотеки выше.
            </div>
          )}
        </div>
      </div>

      {/* --- сохранение --- */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
        <div className="min-w-56 flex-1">
          <Label className="text-xs">Название проекта</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Щит квартиры" />
        </div>
        <Button onClick={() => save(false)} disabled={saving}>
          <Save className="mr-1 h-4 w-4" /> Сохранить
        </Button>
        <Button variant="outline" onClick={() => save(true)} disabled={saving}>
          Сохранить как новый
        </Button>
        <div className="w-64">
          <Label className="text-xs">Сохранённые щиты ({sessions.length})</Label>
          <Select value={sessionId ?? ""} onValueChange={(v) => void open(v)}>
            <SelectTrigger><SelectValue placeholder="Открыть проект" /></SelectTrigger>
            <SelectContent className="max-h-72">
              {sessions.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
