/**
 * Spec-driven panel visualization model (client-safe).
 * SPECIFICATION -> DATA MODEL -> LAYOUT ENGINE -> VISUALIZATION.
 * No hardcoded or generated equipment: every device comes from the spec rows.
 */

import type { PanelSpecRow } from "./panel";

export type DeviceCategory =
  | "input"
  | "spd"
  | "relay"
  | "contactor"
  | "rcd"
  | "rcbo"
  | "breaker"
  | "other";

export const CATEGORY_LABEL: Record<DeviceCategory, string> = {
  input: "Вводное оборудование",
  spd: "УЗИП",
  relay: "Реле напряжения",
  contactor: "Контакторы",
  rcd: "УЗО",
  rcbo: "Дифавтоматы",
  breaker: "Групповые автоматы",
  other: "Дополнительное оборудование",
};

const CATEGORY_ORDER: DeviceCategory[] = [
  "input",
  "spd",
  "relay",
  "contactor",
  "rcd",
  "rcbo",
  "breaker",
  "other",
];

/** Item from the project specification, normalized. */
export type SpecItem = {
  id: string;
  pos: number;
  category: DeviceCategory;
  name: string;
  manufacturer: string;
  model: string;
  rating: string;
  poles: number;
  modules: number;
  quantity: number;
};

/** A single physical device placed on a DIN rail. */
export type PlacedDevice = SpecItem & {
  uid: string;
  copy: number;
  offset: number; // in modules, from rail start
};

export type VisualRail = {
  index: number;
  capacity: number;
  used: number;
  items: PlacedDevice[];
};

export function detectCategory(row: {
  name?: string;
  model?: string;
  rating?: string;
}): DeviceCategory {
  const t = `${row.name ?? ""} ${row.model ?? ""} ${row.rating ?? ""}`.toLowerCase();
  if (/узип|спд|ограничитель перенапряж|surge|spd/.test(t)) return "spd";
  if (/реле напряж|реле контрол|вольтметр|kv\d/.test(t)) return "relay";
  if (/контактор|модульный контактор|contactor/.test(t)) return "contactor";
  if (/дифавтомат|диффер|авдт|rcbo/.test(t)) return "rcbo";
  if (/узо|устройство защитн|вдт|дифференциального тока|rccb/.test(t)) return "rcd";
  if (/ввод|вводн|главный автомат|рубильник|выключатель нагрузки/.test(t))
    return "input";
  if (/автомат|выключатель|circuit breaker|ва\d|c\d{1,2}\b/.test(t)) return "breaker";
  return "other";
}

export function detectPoles(row: {
  name?: string;
  model?: string;
  rating?: string;
  modules?: number;
}): number {
  const t = `${row.rating ?? ""} ${row.model ?? ""} ${row.name ?? ""}`;
  const m = t.match(/(\d)\s*[pPрР]\s*(\+\s*[nNнН])?/);
  if (m) return Number(m[1]) + (m[2] ? 1 : 0);
  return Math.max(1, Math.round(row.modules ?? 1));
}

/**
 * Normalize spec rows into the single source of truth for the visualizer.
 * Rows without modular width (enclosure, rails, wire, markers) are excluded
 * from the rail layout but still reported.
 */
export function toSpecItems(rows: PanelSpecRow[]): SpecItem[] {
  return rows
    .map((r, i) => {
      const modules = Math.max(0, Math.round(Number(r.modules) || 0));
      const quantity = Math.max(0, Math.round(Number(r.qty) || 0));
      return {
        id: `${r.pos ?? i + 1}-${i}`,
        pos: Number(r.pos) || i + 1,
        category: detectCategory(r),
        name: (r.name ?? "").trim(),
        manufacturer: (r.manufacturer ?? "").trim(),
        model: (r.model ?? "").trim(),
        rating: (r.rating ?? "").trim(),
        poles: detectPoles({ ...r, modules }),
        modules,
        quantity,
      } satisfies SpecItem;
    })
    .filter((x) => x.modules > 0 && x.quantity > 0);
}

/** Expand quantity into individual physical devices, keeping the spec order. */
export function expandDevices(
  items: SpecItem[],
  useCategoryOrder: boolean,
): Omit<PlacedDevice, "offset">[] {
  const sorted = useCategoryOrder
    ? [...items].sort((a, b) => {
        const d = CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
        return d !== 0 ? d : a.pos - b.pos;
      })
    : [...items].sort((a, b) => a.pos - b.pos);

  const out: Omit<PlacedDevice, "offset">[] = [];
  for (const it of sorted) {
    for (let i = 0; i < it.quantity; i++) {
      out.push({ ...it, uid: `${it.id}-${i}`, copy: i + 1 });
    }
  }
  return out;
}

/** Place devices left to right, wrapping onto the next DIN rail. */
export function packRails(
  devices: Omit<PlacedDevice, "offset">[],
  capacity: number,
): VisualRail[] {
  const cap = Math.max(4, Math.round(capacity));
  const rails: VisualRail[] = [];
  let rail: VisualRail = { index: 1, capacity: cap, used: 0, items: [] };
  for (const d of devices) {
    const w = Math.min(d.modules, cap);
    if (rail.used + w > cap && rail.items.length) {
      rails.push(rail);
      rail = { index: rails.length + 1, capacity: cap, used: 0, items: [] };
    }
    rail.items.push({ ...d, offset: rail.used });
    rail.used += w;
  }
  if (rail.items.length || rails.length === 0) rails.push(rail);
  return rails;
}

export type VerifyResult = {
  ok: boolean;
  specDevices: number;
  visualDevices: number;
  specModules: number;
  visualModules: number;
  rails: number;
  checks: { text: string; ok: boolean }[];
  errors: string[];
};

export function verifyVisualization(
  items: SpecItem[],
  rails: VisualRail[],
): VerifyResult {
  const placed = rails.flatMap((r) => r.items);
  const specDevices = items.reduce((s, i) => s + i.quantity, 0);
  const specModules = items.reduce((s, i) => s + i.quantity * i.modules, 0);
  const visualDevices = placed.length;
  const visualModules = placed.reduce((s, d) => s + d.modules, 0);

  const errors: string[] = [];
  for (const it of items) {
    const shown = placed.filter((d) => d.id === it.id).length;
    if (shown !== it.quantity) {
      errors.push(
        `В спецификации ${it.quantity} × ${[it.manufacturer, it.model, it.rating, it.name]
          .filter(Boolean)
          .join(" ")}, на визуализации ${shown}.`,
      );
    }
    const wrongWidth = placed.filter((d) => d.id === it.id && d.modules !== it.modules);
    if (wrongWidth.length) {
      errors.push(
        `Ширина «${it.name}» не соответствует спецификации (${it.modules} мод.).`,
      );
    }
    const wrongModel = placed.filter(
      (d) => d.id === it.id && (d.model !== it.model || d.manufacturer !== it.manufacturer),
    );
    if (wrongModel.length) {
      errors.push(`Модель или производитель «${it.name}» не совпадает со спецификацией.`);
    }
  }
  if (specDevices !== visualDevices)
    errors.push(`Устройств в спецификации ${specDevices}, на визуализации ${visualDevices}.`);
  if (specModules !== visualModules)
    errors.push(`Модулей в спецификации ${specModules}, на визуализации ${visualModules}.`);

  return {
    ok: errors.length === 0,
    specDevices,
    visualDevices,
    specModules,
    visualModules,
    rails: rails.filter((r) => r.items.length).length,
    checks: [
      { text: "Оборудование соответствует спецификации", ok: errors.length === 0 },
      { text: "Количество соответствует", ok: specDevices === visualDevices },
      { text: "Количество модулей соответствует", ok: specModules === visualModules },
      {
        text: "Все модели соответствуют спецификации",
        ok: !errors.some((e) => e.includes("Модель")),
      },
    ],
    errors,
  };
}

export function buildVisual(
  rows: PanelSpecRow[],
  opts: { capacity: number; useCategoryOrder: boolean },
) {
  const items = toSpecItems(rows);
  const rails = packRails(expandDevices(items, opts.useCategoryOrder), opts.capacity);
  return { items, rails, verify: verifyVisualization(items, rails) };
}
