/**
 * ТЕСТ №2: алгоритмическая сборка щита ИЗ СПЕЦИФИКАЦИИ.
 *
 * Спецификация → подбор фигуры в библиотеке (generated.ts) → модули → DIN-рейки →
 * connection points → проводники → SVG. Заменители не рисуются: если фигуры нет,
 * позиция помечается как отсутствующая. К рабочему визуализатору не подключено.
 */

import { SHAPE_LIBRARY, type LibraryItem, type EquipmentType } from "./index";
import { ORIGINAL_PANEL } from "./original-panel";

export const MODULE_MM = 17.5;
const PX_PER_MM = 100 / 25.4;
const MARGIN_MM = 20;
const RAIL_GAP_MM = 60;

/** Роль аппарата в логической структуре щита (для однолинейной схемы). */
export type SpecRole =
  | "input-switch"
  | "meter"
  | "input-rcbo"
  | "main-breaker"
  | "feeder"
  | "feeder-rcbo";

export type SpecRow = {
  id: string;
  manufacturer: string;
  series: string;
  model: string;
  equipment_type: EquipmentType | "";
  poles: number | null;
  nominal: number | null;
  qty: number;
  /** --- поля единой модели (используются однолинейной схемой) --- */
  role?: SpecRole;
  /** Марка аппарата для подписи (ВА47-29, АД12, ВН32…). */
  mark?: string;
  /** Номинал так, как он подписывается на схеме (C16, 63А…). */
  nominalText?: string;
  /** Уставка дифзащиты (30mA, 100мА). */
  leakage?: string;
  /** Кабель отходящей линии (ВВГнг(А)-LS 3х2,5). */
  cable?: string;
  /** Наименование электроприёмника. */
  load?: string;
  /** Фаза линии: L1 / L2 / L3 / L1,L2,L3. */
  phase?: string;
};


export type SpecMatch = {
  row: SpecRow;
  item: LibraryItem | null;
  reason: string;
};

export type SpecPlaced = {
  key: string;
  rowId: string;
  index: number;
  item: LibraryItem;
  x: number;
  y: number;
  w: number;
  h: number;
  rail: number;
  modules: number;
};

export type SpecWire = {
  id: string;
  from: { key: string; conn: string };
  to: { key: string; conn: string };
};

export type SpecAssembly = {
  svg: string;
  placed: SpecPlaced[];
  rails: { index: number; x: number; y: number; w: number; modules: number; used: number }[];
  matches: SpecMatch[];
  missing: SpecMatch[];
  totals: {
    positions: number;
    devices: number;
    modules: number;
    capacity: number;
    free: number;
    overflow: boolean;
    connectionPoints: number;
  };
  wirePoints: { id: string; d: string; ok: boolean }[];
};

const norm = (s: string) =>
  s.toLowerCase().replace(/ё/g, "е").replace(/[^a-zа-я0-9]+/g, " ").trim();

/** Подбор фигуры: производитель → модель → тип → полюса → номинал. Без заменителей. */
export function matchShape(row: SpecRow): SpecMatch {
  let pool = SHAPE_LIBRARY.slice();
  const steps: string[] = [];

  if (row.manufacturer.trim()) {
    const m = norm(row.manufacturer);
    const next = pool.filter((s) => norm(s.manufacturer).includes(m) || m.includes(norm(s.manufacturer)));
    if (!next.length) return { row, item: null, reason: `производитель «${row.manufacturer}» не найден в библиотеке` };
    pool = next;
    steps.push("производитель");
  }
  if (row.equipment_type) {
    const next = pool.filter((s) => s.equipment_type === row.equipment_type);
    if (!next.length) return { row, item: null, reason: "нет фигуры такого типа оборудования у этого производителя" };
    pool = next;
    steps.push("тип");
  }
  if (row.model.trim() || row.series.trim()) {
    const tokens = norm(`${row.series} ${row.model}`).split(" ").filter(Boolean);
    const scored = pool
      .map((s) => {
        const hay = norm(`${s.series} ${s.model} ${s.slug}`);
        return { s, hit: tokens.filter((t) => hay.includes(t)).length };
      })
      .sort((a, b) => b.hit - a.hit);
    if (scored[0] && scored[0].hit > 0) {
      pool = scored.filter((x) => x.hit === scored[0]!.hit).map((x) => x.s);
      steps.push("модель");
    }
  }
  if (row.poles != null) {
    const next = pool.filter((s) => s.poles === row.poles);
    if (!next.length)
      return { row, item: null, reason: `фигура на ${row.poles}P отсутствует в библиотеке` };
    pool = next;
    steps.push("полюса");
  }
  if (row.nominal != null) {
    const next = pool.filter((s) => s.nominal_current === row.nominal);
    if (next.length) {
      pool = next;
      steps.push("номинал");
    }
  }
  if (!pool.length) return { row, item: null, reason: "совпадений в библиотеке нет" };
  if (pool.length > 1)
    return {
      row,
      item: pool[0]!,
      reason: `подобрано по ${steps.join(" → ")}; в библиотеке ещё ${pool.length - 1} похожих фигур`,
    };
  return { row, item: pool[0]!, reason: `подобрано по ${steps.join(" → ") || "единственному совпадению"}` };
}

function svgBox(item: LibraryItem) {
  const m = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(item.svg);
  const wPx = m ? Number(m[1]) : item.width_mm * PX_PER_MM;
  const hPx = m ? Number(m[2]) : item.height_mm * PX_PER_MM;
  const wMm = wPx / PX_PER_MM;
  const hMm = hPx / PX_PER_MM;
  return { wMm, hMm, padX: (wMm - item.width_mm) / 2, padY: (hMm - item.height_mm) / 2 };
}

function inner(item: LibraryItem) {
  const start = item.svg.indexOf(">", item.svg.indexOf("<svg")) + 1;
  return item.svg.slice(start, item.svg.lastIndexOf("</svg>"));
}

/** Реальное число модулей фигуры библиотеки (не по полю poles). */
export function modulesOf(item: LibraryItem) {
  return item.modules ?? Math.max(1, Math.round(item.width_mm / MODULE_MM));
}

export function connectionPointAt(p: SpecPlaced, connId: string) {
  const c = p.item.connection_points.find((k) => k.id === connId);
  if (!c) return null;
  return { x: p.x + c.x_mm, y: p.y + (p.h - c.y_mm) };
}

export type SpecOptions = {
  railModules: number;
  reserveModules: number;
};

/** Спецификация → библиотека → модули → рейки → точки подключения → провода → SVG. */
export function assembleFromSpec(
  spec: SpecRow[],
  opts: SpecOptions,
  wires: SpecWire[] = [],
): SpecAssembly {
  const railModules = Math.max(2, Math.round(opts.railModules));
  const reserve = Math.max(0, Math.round(opts.reserveModules));
  const railItem = SHAPE_LIBRARY.find((s) => s.slug === "динрейка") ?? null;
  const railH = railItem?.height_mm ?? 35;
  const railWidth = railModules * MODULE_MM;

  const matches = spec.map(matchShape);
  const missing = matches.filter((m) => !m.item);

  // ---- раскладка: последовательно, с резервом между группами (позициями спецификации)
  const placed: SpecPlaced[] = [];
  const railsUsed: number[] = [0];
  let rail = 0;
  let cursor = 0; // в модулях от левого края рейки

  matches.forEach((m, gi) => {
    if (!m.item) return;
    if (gi > 0 && cursor > 0) cursor += reserve;
    const mod = modulesOf(m.item);
    for (let n = 0; n < Math.max(1, m.row.qty); n++) {
      if (cursor + mod > railModules) {
        rail += 1;
        railsUsed[rail] = 0;
        cursor = 0;
      }
      placed.push({
        key: `${m.row.id}-${n}`,
        rowId: m.row.id,
        index: n,
        item: m.item,
        x: MARGIN_MM + cursor * MODULE_MM,
        y: 0,
        w: m.item.width_mm,
        h: m.item.height_mm,
        rail,
        modules: mod,
      });
      cursor += mod;
      railsUsed[rail] = cursor;
    }
  });

  const rails = railsUsed.map((used, k) => ({
    index: k,
    x: MARGIN_MM,
    y: MARGIN_MM + k * (RAIL_GAP_MM + railH),
    w: railWidth,
    modules: railModules,
    used,
  }));

  // вертикальная привязка: аппарат стоит на своей рейке по центру профиля
  for (const p of placed) {
    const r = rails[p.rail]!;
    p.y = r.y + railH / 2 - p.h / 2;
  }

  const totalModules = placed.reduce((s, p) => s + p.modules, 0);
  const capacity = rails.length * railModules;
  const cps = placed.reduce((s, p) => s + p.item.connection_points.length, 0);

  // ---------------------------------------------------------------- SVG
  const maxX = Math.max(MARGIN_MM + railWidth, ...placed.map((p) => p.x + p.w));
  const maxY = Math.max(
    ...rails.map((r) => r.y + railH),
    ...placed.map((p) => p.y + p.h),
    MARGIN_MM + railH,
  );
  const W = maxX + MARGIN_MM;
  const H = maxY + MARGIN_MM;

  const put = (item: LibraryItem, x: number, y: number) => {
    const b = svgBox(item);
    return (
      `<svg x="${(x - b.padX).toFixed(2)}" y="${(y - b.padY).toFixed(2)}" ` +
      `width="${b.wMm.toFixed(2)}" height="${b.hMm.toFixed(2)}" ` +
      `viewBox="0 0 ${(b.wMm * PX_PER_MM).toFixed(2)} ${(b.hMm * PX_PER_MM).toFixed(2)}" ` +
      `preserveAspectRatio="xMidYMid meet" overflow="visible">${inner(item)}</svg>`
    );
  };

  const body: string[] = [];
  // DIN-рейки — реальная фигура библиотеки, тиражируется по длине рейки без растяжения
  if (railItem) {
    const tile = railItem.width_mm;
    for (const r of rails) {
      const n = Math.ceil(r.w / tile);
      for (let i = 0; i < n; i++) {
        const x = r.x + i * tile;
        const clipW = Math.min(tile, r.x + r.w - x);
        const cid = `rail-${r.index}-${i}`;
        body.push(
          `<clipPath id="${cid}"><rect x="${x.toFixed(2)}" y="${r.y.toFixed(2)}" width="${clipW.toFixed(2)}" height="${railH.toFixed(2)}"/></clipPath>` +
            `<g clip-path="url(#${cid})">${put(railItem, x, r.y)}</g>`,
        );
      }
    }
  }
  for (const p of placed) body.push(put(p.item, p.x, p.y));

  const byKey = new Map(placed.map((p) => [p.key, p]));
  const wirePoints = wires.map((w) => {
    const a = byKey.get(w.from.key);
    const b = byKey.get(w.to.key);
    const pa = a ? connectionPointAt(a, w.from.conn) : null;
    const pb = b ? connectionPointAt(b, w.to.conn) : null;
    if (!pa || !pb) return { id: w.id, d: "", ok: false };
    const my = (pa.y + pb.y) / 2;
    const d =
      `M ${pa.x.toFixed(2)} ${pa.y.toFixed(2)} L ${pa.x.toFixed(2)} ${my.toFixed(2)} ` +
      `L ${pb.x.toFixed(2)} ${my.toFixed(2)} L ${pb.x.toFixed(2)} ${pb.y.toFixed(2)}`;
    return { id: w.id, d, ok: true };
  });

  for (const w of wirePoints)
    if (w.ok)
      body.push(
        `<path d="${w.d}" fill="none" stroke="#1d4ed8" stroke-width="0.6" stroke-linejoin="round" stroke-linecap="round"/>`,
      );

  const dots: string[] = [];
  for (const p of placed)
    for (const c of p.item.connection_points)
      dots.push(
        `<circle cx="${(p.x + c.x_mm).toFixed(2)}" cy="${(p.y + (p.h - c.y_mm)).toFixed(2)}" r="0.9" fill="#e11d48" fill-opacity="0.8"/>`,
      );

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W.toFixed(1)} ${H.toFixed(1)}" ` +
    `width="${(W * 3).toFixed(0)}" height="${(H * 3).toFixed(0)}">` +
    body.join("") +
    `<g data-role="connection-points">${dots.join("")}</g></svg>`;

  return {
    svg,
    placed,
    rails,
    matches,
    missing,
    totals: {
      positions: spec.length,
      devices: placed.length,
      modules: totalModules,
      capacity,
      free: capacity - totalModules,
      overflow: totalModules > railModules,
      connectionPoints: cps,
    },
    wirePoints,
  };
}

/** Готовая тестовая спецификация «Щит зарядки — тест №2» (по составу эталона). */
export const CHARGING_PANEL_SPEC: SpecRow[] = [
  {
    id: "s1",
    manufacturer: "IEK",
    series: "ВА47-29 KARAT",
    model: "ВА47-29 3P",
    equipment_type: "breaker",
    poles: 3,
    nominal: 32,
    qty: 2,
  },
  {
    id: "s2",
    manufacturer: "IEK",
    series: "ВА47-29 KARAT",
    model: "ВА47-29 1P",
    equipment_type: "breaker",
    poles: 1,
    nominal: 16,
    qty: 1,
  },
  {
    id: "s3",
    manufacturer: "IEK",
    series: "ВД3-63",
    model: "ВД3-63 4P 6kA тип A",
    equipment_type: "rcd",
    poles: 4,
    nominal: 25,
    qty: 1,
  },
  {
    id: "s4",
    manufacturer: "IEK",
    series: "ВД3-63",
    model: "ВД3-63 2P 6kA тип A",
    equipment_type: "rcd",
    poles: 2,
    nominal: 16,
    qty: 1,
  },
  {
    id: "s5",
    manufacturer: "DigiTop",
    series: "VP",
    model: "VP-3F 63A",
    equipment_type: "relay",
    poles: 3,
    nominal: 63,
    qty: 1,
  },
  {
    id: "s6",
    manufacturer: "EKF",
    series: "PROxima",
    model: "КБР-80A",
    equipment_type: "contactor",
    poles: null,
    nominal: 80,
    qty: 1,
  },
];

/**
 * Демо-спецификация для сквозного теста
 * СПЕЦИФИКАЦИЯ → ЛОГИКА → ОДНОЛИНЕЙНАЯ СХЕМА → РАСКЛАДКА ЩИТА.
 * Используются только фигуры, реально существующие в библиотеке.
 */
export const UNIFIED_DEMO_SPEC: SpecRow[] = [
  {
    id: "u1",
    manufacturer: "IEK",
    series: "ВА47-29 KARAT",
    model: "ВА47-29 3P",
    equipment_type: "breaker",
    poles: 3,
    nominal: 32,
    qty: 1,
    role: "main-breaker",
    mark: "ВА47-29",
    nominalText: "С32",
    phase: "L1,L2,L3",
  },
  {
    id: "u2",
    manufacturer: "DigiTop",
    series: "VP",
    model: "VP-3F 63A",
    equipment_type: "relay",
    poles: 3,
    nominal: 63,
    qty: 1,
    role: "input-rcbo",
    mark: "VP-3F",
    nominalText: "63А",
    phase: "L1,L2,L3",
  },
  {
    id: "u3",
    manufacturer: "EKF",
    series: "PROxima",
    model: "КБР-80A",
    equipment_type: "contactor",
    poles: null,
    nominal: 80,
    qty: 1,
    role: "input-switch",
    mark: "КБР-80A",
    nominalText: "80А",
    cable: "ВВГнг(А)-LS 5х6",
    phase: "L1,L2,L3",
  },
  {
    id: "u4",
    manufacturer: "IEK",
    series: "ВА47-29 KARAT",
    model: "ВА47-29 3P",
    equipment_type: "breaker",
    poles: 3,
    nominal: 32,
    qty: 1,
    role: "feeder",
    mark: "ВА47-29",
    nominalText: "C32",
    cable: "ВВГнг(А)-LS 5х6",
    load: "Зарядная станция",
    phase: "L1,L2,L3",
  },
  {
    id: "u5",
    manufacturer: "IEK",
    series: "ВД3-63",
    model: "ВД3-63 4P 6kA тип A",
    equipment_type: "rcd",
    poles: 4,
    nominal: 25,
    qty: 1,
    role: "feeder-rcbo",
    mark: "ВД3-63",
    nominalText: "C25",
    leakage: "30mA",
    cable: "ВВГнг(А)-LS 3х2.5",
    load: "Розетки мастерской",
    phase: "L1,L2,L3",
  },
  {
    id: "u6",
    manufacturer: "IEK",
    series: "ВД3-63",
    model: "ВД3-63 2P 6kA тип A",
    equipment_type: "rcd",
    poles: 2,
    nominal: 16,
    qty: 1,
    role: "feeder-rcbo",
    mark: "ВД3-63",
    nominalText: "C16",
    leakage: "30mA",
    cable: "ВВГнг(А)-LS 3х2,5",
    load: "Розетки бытовые",
    phase: "L1",
  },
  {
    id: "u7",
    manufacturer: "IEK",
    series: "ВА47-29 KARAT",
    model: "ВА47-29 1P",
    equipment_type: "breaker",
    poles: 1,
    nominal: 16,
    qty: 3,
    role: "feeder",
    mark: "ВА47-29",
    nominalText: "C16",
    cable: "ВВГнг(А)-LS 3х1.5",
    load: "Освещение",
    phase: "L2",
  },
];



export type SpecCompareRow = {
  label: string;
  original: string | number;
  assembled: string | number;
  match: boolean;
};

const ELECTRICAL = new Set(["breaker", "rcd", "relay", "contactor"]);

/** Сравнение сборки из спецификации с эталоном «Щит зарядки.vsdx». */
export function compareSpecWithOriginal(a: SpecAssembly) {
  const bySlug = new Map(SHAPE_LIBRARY.map((s) => [s.slug, s]));
  const origEquip = ORIGINAL_PANEL.instances.filter((i) => {
    const it = bySlug.get(i.slug);
    return it ? ELECTRICAL.has(it.equipment_type) : false;
  });
  const origRails = ORIGINAL_PANEL.instances.filter((i) => i.slug === "динрейка");

  const origBySlug = new Map<string, number>();
  for (const i of origEquip) origBySlug.set(i.slug, (origBySlug.get(i.slug) ?? 0) + 1);
  const asmBySlug = new Map<string, number>();
  for (const p of a.placed) asmBySlug.set(p.item.slug, (asmBySlug.get(p.item.slug) ?? 0) + 1);

  const compositionMatch =
    origBySlug.size === asmBySlug.size &&
    [...origBySlug].every(([s, n]) => asmBySlug.get(s) === n);

  const origModules = origEquip.reduce((s, i) => s + (bySlug.get(i.slug)?.modules ?? 0), 0);
  const asmModules = a.placed.reduce((s, p) => s + p.modules, 0);

  const origNominals = origEquip
    .map((i) => bySlug.get(i.slug)?.nominal_current ?? null)
    .filter((n) => n != null).length;
  const asmNominals = a.placed.filter((p) => p.item.nominal_current != null).length;

  const sizeMatch = a.placed.every((p) => {
    const src = origEquip.find((i) => bySlug.get(i.slug)?.slug === p.item.slug);
    return src ? Math.abs(src.w_mm - p.w) < 0.51 && Math.abs(src.h_mm - p.h) < 0.51 : false;
  });

  const origOrder = [...origEquip]
    .sort((x, y) => y.y_mm - x.y_mm || x.x_mm - y.x_mm)
    .map((i) => i.slug);
  const asmOrder = [...a.placed].sort((x, y) => x.rail - y.rail || x.x - y.x).map((p) => p.item.slug);
  const orderMatch = origOrder.join("|") === asmOrder.join("|");

  const origCps = origEquip.reduce((s, i) => s + i.connection_points, 0);
  const asmCps = a.placed.reduce((s, p) => s + p.item.connection_points.length, 0);

  const rows: SpecCompareRow[] = [
    {
      label: "Состав оборудования (модели и количество)",
      original: origBySlug.size,
      assembled: asmBySlug.size,
      match: compositionMatch,
    },
    {
      label: "Количество аппаратов",
      original: origEquip.length,
      assembled: a.placed.length,
      match: origEquip.length === a.placed.length,
    },
    {
      label: "Производители",
      original: [...new Set(origEquip.map((i) => bySlug.get(i.slug)?.manufacturer))].join(", "),
      assembled: [...new Set(a.placed.map((p) => p.item.manufacturer))].join(", "),
      match:
        [...new Set(origEquip.map((i) => bySlug.get(i.slug)?.manufacturer))].sort().join() ===
        [...new Set(a.placed.map((p) => p.item.manufacturer))].sort().join(),
    },
    {
      label: "Номиналы из Visio",
      original: origNominals,
      assembled: asmNominals,
      match: origNominals === asmNominals,
    },
    { label: "Модулей всего", original: origModules, assembled: asmModules, match: origModules === asmModules },
    { label: "Габариты фигур", original: "как в Visio", assembled: sizeMatch ? "как в Visio" : "расхождение", match: sizeMatch },
    { label: "Порядок оборудования", original: origOrder.length, assembled: asmOrder.length, match: orderMatch },
    {
      label: "DIN-рейки",
      original: origRails.length,
      assembled: a.rails.length,
      match: origRails.length === a.rails.length,
    },
    { label: "Точки подключения аппаратов", original: origCps, assembled: asmCps, match: origCps === asmCps },
    {
      label: "Координаты (раскладка)",
      original: "исходные координаты Visio",
      assembled: "алгоритмическая укладка по модулям",
      match: false,
    },
  ];

  const percent = Math.round((rows.filter((r) => r.match).length / rows.length) * 100);
  return { rows, percent };
}
