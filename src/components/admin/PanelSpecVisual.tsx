import { useMemo, useState } from "react";
import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PanelSpecRow } from "@/lib/panel";
import {
  buildVisual,
  CATEGORY_LABEL,
  type DeviceCategory,
  type PlacedDevice,
} from "@/lib/panel-visual";

const MODULE_W = 30;
const DEV_H = 108;
const RAIL_PAD = 10;

/** Technical SVG glyph per device type (used when no real photo exists). */
function DeviceGlyph({ category, w }: { category: DeviceCategory; w: number }) {
  const cx = w / 2;
  const common = "stroke-current";
  switch (category) {
    case "rcd":
    case "rcbo":
      return (
        <g className={common} fill="none" strokeWidth={1.4}>
          <rect x={cx - 9} y={30} width={18} height={22} rx={2} />
          <path d={`M${cx - 5} 34 h10 M${cx - 5} 40 h10 M${cx - 5} 46 h10`} />
          <circle cx={cx} cy={62} r={5} />
          <path d={`M${cx} 57 v10`} />
        </g>
      );
    case "contactor":
      return (
        <g className={common} fill="none" strokeWidth={1.4}>
          <rect x={cx - 10} y={30} width={20} height={18} rx={2} />
          <path d={`M${cx - 6} 52 v14 M${cx + 6} 52 v14 M${cx - 8} 58 l16 -6`} />
        </g>
      );
    case "relay":
      return (
        <g className={common} fill="none" strokeWidth={1.4}>
          <rect x={cx - 11} y={30} width={22} height={16} rx={2} />
          <path d={`M${cx - 7} 38 h4 l3 -6 l3 10 l3 -4 h2`} />
          <path d={`M${cx} 50 v16`} />
        </g>
      );
    case "spd":
      return (
        <g className={common} fill="none" strokeWidth={1.4}>
          <path d={`M${cx} 30 v10 M${cx - 6} 40 h12 l-6 10 z`} />
          <path d={`M${cx} 50 v8`} />
          <path d={`M${cx - 7} 60 h14 M${cx - 4} 64 h8 M${cx - 2} 68 h4`} />
        </g>
      );
    case "input":
      return (
        <g className={common} fill="none" strokeWidth={1.6}>
          <path d={`M${cx} 28 v10`} />
          <circle cx={cx} cy={40} r={2.2} />
          <path d={`M${cx} 40 l9 -10`} />
          <path d={`M${cx + 9} 52 v14`} />
          <circle cx={cx + 9} cy={52} r={2.2} />
        </g>
      );
    default:
      return (
        <g className={common} fill="none" strokeWidth={1.4}>
          <path d={`M${cx} 30 v10`} />
          <circle cx={cx} cy={41} r={2} />
          <path d={`M${cx} 41 l8 -9`} />
          <rect x={cx + 4} y={44} width={8} height={10} rx={1.5} />
          <path d={`M${cx + 8} 54 v12`} />
        </g>
      );
  }
}

function DeviceBox({ d, x }: { d: PlacedDevice; x: number }) {
  const w = Math.max(1, d.modules) * MODULE_W;
  const lines = [
    d.manufacturer,
    d.model || d.name,
    d.rating,
    `${d.poles}P`,
    `${d.modules}M`,
  ].filter(Boolean);
  return (
    <g transform={`translate(${x}, ${RAIL_PAD})`}>
      <rect
        width={w}
        height={DEV_H}
        rx={3}
        className="fill-background stroke-border"
        strokeWidth={1}
      />
      <rect y={0} width={w} height={6} className="fill-primary/70" />
      <g className="text-primary">
        <DeviceGlyph category={d.category} w={w} />
      </g>
      {[...Array(Math.max(1, d.modules) - 1)].map((_, i) => (
        <line
          key={i}
          x1={(i + 1) * MODULE_W}
          y1={6}
          x2={(i + 1) * MODULE_W}
          y2={DEV_H}
          className="stroke-border"
          strokeDasharray="2 3"
          strokeWidth={0.7}
        />
      ))}
      {lines.map((t, i) => (
        <text
          key={i}
          x={w / 2}
          y={74 + i * 8}
          textAnchor="middle"
          className="fill-foreground"
          style={{ fontSize: 6.5, fontFamily: "ui-monospace, monospace" }}
        >
          {t.length > Math.max(8, w / 3.4) ? `${t.slice(0, Math.max(8, w / 3.4))}…` : t}
        </text>
      ))}
    </g>
  );
}

export function PanelSpecVisual({ rows }: { rows: PanelSpecRow[] }) {
  const [exact, setExact] = useState(true);
  const [capacity, setCapacity] = useState(12);
  const [useCategoryOrder, setUseCategoryOrder] = useState(true);
  const [checked, setChecked] = useState(false);

  const { items, rails, verify } = useMemo(
    () => buildVisual(rows, { capacity, useCategoryOrder }),
    [rows, capacity, useCategoryOrder],
  );

  const railW = capacity * MODULE_W;
  const byCategory = useMemo(() => {
    const map = new Map<DeviceCategory, number>();
    for (const i of items) map.set(i.category, (map.get(i.category) ?? 0) + i.quantity);
    return [...map.entries()];
  }, [items]);

  return (
    <section className="rounded-xl border bg-card p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold">Визуализация щита по спецификации</h3>
          <p className="text-xs text-muted-foreground">
            Единственный источник данных — спецификация проекта
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch id="exact" checked={exact} onCheckedChange={setExact} />
            <Label htmlFor="exact" className="text-xs">
              Точная визуализация по спецификации
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs">Модулей на рейке</Label>
            <Select
              value={String(capacity)}
              onValueChange={(v) => setCapacity(Number(v))}
            >
              <SelectTrigger className="h-8 w-[84px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[12, 14, 18, 24, 36].map((c) => (
                  <SelectItem key={c} value={String(c)}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="ord"
              checked={useCategoryOrder}
              onCheckedChange={setUseCategoryOrder}
            />
            <Label htmlFor="ord" className="text-xs">
              Порядок по типу
            </Label>
          </div>
        </div>
      </div>

      {!exact ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Точная визуализация выключена. Другие источники оборудования не
          используются — включите режим, чтобы построить щит по спецификации.
        </p>
      ) : items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          В спецификации нет модульного оборудования — визуализировать нечего.
        </p>
      ) : (
        <>
          {!verify.ok && (
            <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
              Ошибка визуализации: количество оборудования не соответствует
              спецификации.
            </div>
          )}

          <div className="mt-4 space-y-4 overflow-x-auto">
            {rails.map((rail) => (
              <div key={rail.index} className="min-w-fit">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium">DIN-рейка {rail.index}</span>
                  <span className="text-muted-foreground">
                    {rail.used} / {rail.capacity} мод.
                  </span>
                </div>
                <svg
                  width={railW + 2}
                  height={DEV_H + RAIL_PAD * 2}
                  className="rounded-lg border bg-muted/30"
                >
                  <rect
                    x={0.5}
                    y={RAIL_PAD - 4}
                    width={railW}
                    height={DEV_H + 8}
                    className="fill-muted/40 stroke-border"
                  />
                  {rail.items.map((d) => (
                    <DeviceBox key={d.uid} d={d} x={d.offset * MODULE_W} />
                  ))}
                </svg>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <div className="rounded-lg bg-muted/50 px-3 py-2">
              Количество устройств: <b>{verify.visualDevices}</b>
            </div>
            <div className="rounded-lg bg-muted/50 px-3 py-2">
              Количество модулей: <b>{verify.visualModules}</b>
            </div>
            <div className="rounded-lg bg-muted/50 px-3 py-2">
              Количество DIN-реек: <b>{verify.rails}</b>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
            {byCategory.map(([cat, n]) => (
              <span key={cat} className="rounded border px-2 py-1">
                {CATEGORY_LABEL[cat]}: {n}
              </span>
            ))}
          </div>

          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={() => setChecked(true)}>
              <ShieldCheck className="mr-2 h-4 w-4" /> Проверить соответствие
              спецификации
            </Button>
          </div>

          {checked && (
            <ul className="mt-3 space-y-1 text-sm">
              {verify.checks.map((c) => (
                <li key={c.text} className="flex items-center gap-2">
                  {c.ok ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                  <span className={c.ok ? "" : "text-destructive"}>{c.text}</span>
                </li>
              ))}
              {verify.errors.map((e, i) => (
                <li key={i} className="text-sm text-destructive">
                  • {e}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
