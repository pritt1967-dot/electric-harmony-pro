/**
 * ТЕСТ №3: логическая группировка щита.
 *
 * СПЕЦИФИКАЦИЯ → ЛОГИЧЕСКИЕ ГРУППЫ → ОБОРУДОВАНИЕ ГРУПП → DIN-РЕЙКИ → SVG-ФИГУРЫ →
 * CONNECTION POINTS → ПРОВОДНИКИ → ВИЗУАЛИЗАЦИЯ.
 *
 * Координаты рассчитываются алгоритмом (координаты оригинального Visio не используются).
 * Заменители фигур не рисуются. К рабочему проектировщику не подключено.
 */

import { SHAPE_LIBRARY, type LibraryItem } from "./index";
import { MODULE_MM, matchShape, modulesOf, type SpecRow } from "./spec-assemble";

const PX_PER_MM = 100 / 25.4;
const MARGIN_MM = 20;
const RAIL_GAP_MM = 70;

export type GroupKind = "input" | "protection" | "group" | "reserve";

export const GROUP_KIND_LABEL: Record<GroupKind, string> = {
  input: "Ввод",
  protection: "Защита",
  group: "Группа",
  reserve: "Резерв",
};

/** Порядок уровней щита: ввод → защита → группы → резерв. */
export const KIND_ORDER: Record<GroupKind, number> = {
  input: 0,
  protection: 1,
  group: 2,
  reserve: 3,
};

export type PanelGroup = {
  id: string;
  kind: GroupKind;
  name: string;
  description: string;
  /** Резервные (свободные) модули внутри группы. */
  reserveModules: number;
  devices: SpecRow[];
};

export type GroupPlaced = {
  key: string;
  groupId: string;
  rowId: string;
  item: LibraryItem;
  x: number;
  y: number;
  w: number;
  h: number;
  rail: number;
  startModule: number;
  modules: number;
};

export type GroupSpan = {
  groupId: string;
  rail: number;
  startModule: number;
  modules: number;
};

export type GroupWarning = { level: "error" | "warn"; text: string };

export type LogicalNode = {
  id: string;
  label: string;
  sub: string;
  children: LogicalNode[];
};

export type LogicalLink = { from: string; to: string; fromKey: string; toKey: string };

export type PhysicalWire = { id: string; d: string; from: string; to: string };

export type GroupAssembly = {
  svg: string;
  placed: GroupPlaced[];
  rails: { index: number; x: number; y: number; w: number; used: number }[];
  spans: GroupSpan[];
  order: PanelGroup[];
  missing: { group: PanelGroup; row: SpecRow; reason: string }[];
  splitGroups: string[];
  wholeGroups: string[];
  warnings: GroupWarning[];
  tree: LogicalNode | null;
  links: LogicalLink[];
  wires: PhysicalWire[];
  totals: {
    groups: number;
    devices: number;
    modules: number;
    reserveModules: number;
    capacity: number;
    free: number;
    rails: number;
    connectionPoints: number;
  };
};

export type GroupOptions = {
  railModules: number;
  /** Разделительные (резервные) модули между группами. */
  gapModules: number;
};

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

/** Реальная точка подключения фигуры в координатах щита. */
export function connPoint(p: GroupPlaced, connId: string) {
  const c = p.item.connection_points.find((k) => k.id === connId);
  if (!c) return null;
  return { x: p.x + c.x_mm, y: p.y + (p.h - c.y_mm) };
}

/** Нижняя / верхняя реальная точка подключения (не центр фигуры). */
function edgeConn(p: GroupPlaced, side: "top" | "bottom") {
  const cps = p.item.connection_points;
  if (!cps.length) return null;
  const sorted = cps
    .map((c) => ({ id: c.id, x: p.x + c.x_mm, y: p.y + (p.h - c.y_mm) }))
    .sort((a, b) => a.y - b.y);
  return side === "top" ? sorted[0]! : sorted[sorted.length - 1]!;
}

/** Сортировка групп: ввод → защита → пользовательские группы → резерв. */
export function orderGroups(groups: PanelGroup[]) {
  return groups
    .map((g, i) => ({ g, i }))
    .sort((a, b) => KIND_ORDER[a.g.kind] - KIND_ORDER[b.g.kind] || a.i - b.i)
    .map((x) => x.g);
}

export function assembleGroups(groups: PanelGroup[], opts: GroupOptions): GroupAssembly {
  const railModules = Math.max(2, Math.round(opts.railModules));
  const gap = Math.max(0, Math.round(opts.gapModules));
  const railItem = SHAPE_LIBRARY.find((s) => s.slug === "динрейка") ?? null;
  const railH = railItem?.height_mm ?? 35;

  const order = orderGroups(groups);
  const warnings: GroupWarning[] = [];
  const missing: GroupAssembly["missing"] = [];

  // ---- проверка порядка уровней (групповой аппарат не может стоять до ввода)
  const rawIdx = groups.map((g) => KIND_ORDER[g.kind]);
  if (rawIdx.some((v, i) => i > 0 && v < rawIdx[i - 1]!))
    warnings.push({
      level: "warn",
      text: "Порядок уровней исправлен при раскладке: ввод и защита всегда размещаются до групп.",
    });

  // ---- подбор фигур
  type Unit = { group: PanelGroup; row: SpecRow; item: LibraryItem; modules: number };
  const groupUnits = new Map<string, Unit[]>();
  for (const g of order) {
    const units: Unit[] = [];
    for (const row of g.devices) {
      const m = matchShape(row);
      if (!m.item) {
        missing.push({ group: g, row, reason: m.reason });
        continue;
      }
      for (let n = 0; n < Math.max(1, row.qty); n++)
        units.push({ group: g, row, item: m.item, modules: modulesOf(m.item) });
    }
    groupUnits.set(g.id, units);
  }

  // ---- физическая раскладка: группа целиком, при нехватке — перенос, затем разрыв
  const placed: GroupPlaced[] = [];
  const spans: GroupSpan[] = [];
  const railsUsed: number[] = [0];
  const splitGroups: string[] = [];
  const wholeGroups: string[] = [];
  let rail = 0;
  let cursor = 0;
  let seq = 0;

  for (const g of order) {
    const units = groupUnits.get(g.id) ?? [];
    const need = units.reduce((s, u) => s + u.modules, 0) + Math.max(0, g.reserveModules);
    if (!need) continue;

    if (cursor > 0) cursor += gap;
    if (cursor + need > railModules && need <= railModules) {
      rail += 1;
      railsUsed[rail] = 0;
      cursor = 0;
    }
    if (need > railModules) {
      splitGroups.push(g.name);
      warnings.push({
        level: "warn",
        text: `⚠️ Группа «${g.name}» не помещается на одну DIN-рейку (${need} мод. при ${railModules}) — разделена между рейками.`,
      });
    }

    let spanRail = rail;
    let spanStart = cursor;
    let spanMods = 0;
    const flushSpan = () => {
      if (spanMods > 0) spans.push({ groupId: g.id, rail: spanRail, startModule: spanStart, modules: spanMods });
    };

    for (const u of units) {
      if (cursor + u.modules > railModules) {
        flushSpan();
        rail += 1;
        railsUsed[rail] = 0;
        cursor = 0;
        spanRail = rail;
        spanStart = 0;
        spanMods = 0;
      }
      placed.push({
        key: `${g.id}-${seq++}`,
        groupId: g.id,
        rowId: u.row.id,
        item: u.item,
        x: MARGIN_MM + cursor * MODULE_MM,
        y: 0,
        w: u.item.width_mm,
        h: u.item.height_mm,
        rail,
        startModule: cursor,
        modules: u.modules,
      });
      cursor += u.modules;
      spanMods += u.modules;
      railsUsed[rail] = cursor;
    }

    const res = Math.max(0, g.reserveModules);
    if (res) {
      if (cursor + res > railModules) {
        flushSpan();
        rail += 1;
        railsUsed[rail] = 0;
        cursor = 0;
        spanRail = rail;
        spanStart = 0;
        spanMods = 0;
      }
      cursor += res;
      spanMods += res;
      railsUsed[rail] = cursor;
    }
    flushSpan();
    if (spans.filter((s) => s.groupId === g.id).length > 1) {
      if (!splitGroups.includes(g.name)) splitGroups.push(g.name);
    } else wholeGroups.push(g.name);
  }

  const rails = railsUsed.map((used, k) => ({
    index: k,
    x: MARGIN_MM,
    y: MARGIN_MM + k * (RAIL_GAP_MM + railH),
    w: railModules * MODULE_MM,
    used,
  }));
  for (const p of placed) {
    const r = rails[p.rail]!;
    p.y = r.y + railH / 2 - p.h / 2;
  }

  // ---- логическая структура и связи
  const byGroup = new Map<string, GroupPlaced[]>();
  for (const p of placed) byGroup.set(p.groupId, [...(byGroup.get(p.groupId) ?? []), p]);

  const label = (p: GroupPlaced) => `${p.item.manufacturer} ${p.item.model}`;
  const sub = (p: GroupPlaced) =>
    [p.item.poles ? `${p.item.poles}P` : "", p.item.nominal_current ? `${p.item.nominal_current}A` : "", `${p.modules} мод.`]
      .filter(Boolean)
      .join(" · ");

  const links: LogicalLink[] = [];
  const chain: GroupPlaced[] = [];
  for (const g of order)
    if (g.kind === "input" || g.kind === "protection") chain.push(...(byGroup.get(g.id) ?? []));

  const tree: LogicalNode | null = order.length
    ? { id: "panel", label: "ЩИТ", sub: "ввод → защита → группы", children: [] }
    : null;

  if (tree) {
    let cursorNode = tree;
    let prev: GroupPlaced | null = null;
    for (const p of chain) {
      const node: LogicalNode = { id: p.key, label: label(p), sub: sub(p), children: [] };
      cursorNode.children.push(node);
      if (prev) links.push({ from: label(prev), to: label(p), fromKey: prev.key, toKey: p.key });
      prev = p;
      cursorNode = node;
    }
    const tail = prev;
    for (const g of order) {
      if (g.kind === "input" || g.kind === "protection") continue;
      const items = byGroup.get(g.id) ?? [];
      const gNode: LogicalNode = {
        id: g.id,
        label: `${GROUP_KIND_LABEL[g.kind]}: ${g.name}`,
        sub: g.description || (g.kind === "reserve" ? `${g.reserveModules} свободных модулей` : ""),
        children: [],
      };
      cursorNode.children.push(gNode);
      // защитный аппарат группы = первое УЗО/диф, остальные — отходящие линии
      const prot = items.find((p) => p.item.equipment_type === "rcd") ?? null;
      let parent: GroupPlaced | null = prot ?? tail;
      if (prot) {
        const pn: LogicalNode = { id: prot.key, label: label(prot), sub: sub(prot), children: [] };
        gNode.children.push(pn);
        if (tail) links.push({ from: label(tail), to: label(prot), fromKey: tail.key, toKey: prot.key });
        for (const p of items) {
          if (p === prot) continue;
          pn.children.push({ id: p.key, label: label(p), sub: sub(p), children: [] });
          links.push({ from: label(prot), to: label(p), fromKey: prot.key, toKey: p.key });
        }
      } else {
        for (const p of items) {
          gNode.children.push({ id: p.key, label: label(p), sub: sub(p), children: [] });
          if (parent) links.push({ from: label(parent), to: label(p), fromKey: parent.key, toKey: p.key });
        }
      }
    }
  }

  // ---- физические проводники по реальным connection points
  const byKey = new Map(placed.map((p) => [p.key, p]));
  const wires: PhysicalWire[] = [];
  links.forEach((l, i) => {
    const a = byKey.get(l.fromKey);
    const b = byKey.get(l.toKey);
    if (!a || !b) return;
    const pa = edgeConn(a, "bottom");
    const pb = edgeConn(b, "top");
    if (!pa) {
      warnings.push({ level: "error", text: `⚠️ У аппарата отсутствует connection point: «${label(a)}»` });
      return;
    }
    if (!pb) {
      warnings.push({ level: "error", text: `⚠️ У аппарата отсутствует connection point: «${label(b)}»` });
      return;
    }
    const my = a.rail === b.rail ? Math.max(pa.y, pb.y) + 8 + (i % 4) * 2.5 : (pa.y + pb.y) / 2;
    wires.push({
      id: `pw${i + 1}`,
      from: l.from,
      to: l.to,
      d:
        `M ${pa.x.toFixed(2)} ${pa.y.toFixed(2)} L ${pa.x.toFixed(2)} ${my.toFixed(2)} ` +
        `L ${pb.x.toFixed(2)} ${my.toFixed(2)} L ${pb.x.toFixed(2)} ${pb.y.toFixed(2)}`,
    });
  });

  // ---- SVG
  const maxY = Math.max(MARGIN_MM + railH, ...rails.map((r) => r.y + railH), ...placed.map((p) => p.y + p.h));
  const W = MARGIN_MM * 2 + railModules * MODULE_MM;
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
  if (railItem) {
    const tile = railItem.width_mm;
    for (const r of rails) {
      const n = Math.ceil(r.w / tile);
      for (let i = 0; i < n; i++) {
        const x = r.x + i * tile;
        const clipW = Math.min(tile, r.x + r.w - x);
        const cid = `grail-${r.index}-${i}`;
        body.push(
          `<clipPath id="${cid}"><rect x="${x.toFixed(2)}" y="${r.y.toFixed(2)}" width="${clipW.toFixed(2)}" height="${railH.toFixed(2)}"/></clipPath>` +
            `<g clip-path="url(#${cid})">${put(railItem, x, r.y)}</g>`,
        );
      }
    }
  }

  // визуальные разделители и подписи групп
  const groupById = new Map(order.map((g) => [g.id, g]));
  for (const s of spans) {
    const g = groupById.get(s.groupId);
    const r = rails[s.rail]!;
    const x0 = MARGIN_MM + s.startModule * MODULE_MM;
    const x1 = x0 + s.modules * MODULE_MM;
    body.push(
      `<rect x="${x0.toFixed(2)}" y="${(r.y - 12).toFixed(2)}" width="${(x1 - x0).toFixed(2)}" height="${(railH + 24).toFixed(2)}" ` +
        `fill="#2563eb" fill-opacity="0.05" stroke="#2563eb" stroke-opacity="0.45" stroke-width="0.4" stroke-dasharray="2 1.5" rx="1.5"/>` +
        `<text x="${(x0 + 1).toFixed(2)}" y="${(r.y - 14).toFixed(2)}" font-size="5" fill="#1e3a8a" font-family="sans-serif">${
          (g?.name ?? "").replace(/[<&]/g, "")
        }</text>`,
    );
  }

  for (const p of placed) body.push(put(p.item, p.x, p.y));
  for (const w of wires)
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
    `width="${(W * 3).toFixed(0)}" height="${(H * 3).toFixed(0)}">${body.join("")}` +
    `<g data-role="connection-points">${dots.join("")}</g></svg>`;

  const modules = placed.reduce((s, p) => s + p.modules, 0);
  const reserveModules = order.reduce((s, g) => s + Math.max(0, g.reserveModules), 0);
  const capacity = rails.length * railModules;

  for (const m of missing)
    warnings.push({
      level: "error",
      text: `⚠️ Не найдена фигура: «${[m.row.manufacturer, m.row.series, m.row.model].filter(Boolean).join(" ")}» — ${m.reason}`,
    });
  if (modules + reserveModules > capacity)
    warnings.push({
      level: "error",
      text: `⚠️ Недостаточно места: требуется ${modules + reserveModules} мод., доступно ${capacity}.`,
    });

  return {
    svg,
    placed,
    rails,
    spans,
    order,
    missing,
    splitGroups,
    wholeGroups,
    warnings,
    tree,
    links,
    wires,
    totals: {
      groups: order.length,
      devices: placed.length,
      modules,
      reserveModules,
      capacity,
      free: capacity - modules - reserveModules,
      rails: rails.length,
      connectionPoints: placed.reduce((s, p) => s + p.item.connection_points.length, 0),
    },
  };
}

export type StructureCheck = { label: string; ok: boolean; detail: string };

/** Кнопка «Проверить структуру». Ничего не исправляет автоматически. */
export function checkStructure(groups: PanelGroup[], a: GroupAssembly): StructureCheck[] {
  const has = (k: GroupKind) => groups.some((g) => g.kind === k && g.devices.length > 0);
  const noKind = groups.filter((g) => !g.kind);
  const emptyGroups = groups.filter((g) => g.kind === "group" && !g.devices.length);
  const noCp = a.placed.filter((p) => !p.item.connection_points.length);
  const rawIdx = groups.map((g) => KIND_ORDER[g.kind]);
  const orderOk = !rawIdx.some((v, i) => i > 0 && v < rawIdx[i - 1]!);

  return [
    { label: "Есть ввод", ok: has("input"), detail: has("input") ? "вводной аппарат задан" : "⚠️ уровень «Ввод» пуст" },
    {
      label: "Есть защитный аппарат",
      ok: has("protection") || a.placed.some((p) => p.item.equipment_type === "rcd"),
      detail: has("protection") ? "реле/УЗО присутствует" : "⚠️ нет реле напряжения или УЗО на уровне «Защита»",
    },
    {
      label: "Есть группы",
      ok: groups.some((g) => g.kind === "group"),
      detail: `${groups.filter((g) => g.kind === "group").length} шт.`,
    },
    {
      label: "Нет оборудования без назначения",
      ok: !noKind.length && !emptyGroups.length,
      detail: emptyGroups.length ? `⚠️ пустые группы: ${emptyGroups.map((g) => g.name).join(", ")}` : "все аппараты привязаны",
    },
    {
      label: "Хватает модулей",
      ok: a.totals.free >= 0,
      detail: `занято ${a.totals.modules + a.totals.reserveModules} из ${a.totals.capacity}`,
    },
    { label: "Хватает DIN-реек", ok: a.rails.length > 0, detail: `${a.rails.length} рейк(и)` },
    { label: "Порядок уровней корректен", ok: orderOk, detail: orderOk ? "ввод → защита → группы → резерв" : "⚠️ групповой аппарат стоит до вводного" },
    {
      label: "Все фигуры найдены",
      ok: !a.missing.length,
      detail: a.missing.length ? `⚠️ отсутствуют: ${a.missing.length}` : "заменители не использовались",
    },
    {
      label: "Connection points",
      ok: !noCp.length && a.totals.connectionPoints > 0,
      detail: noCp.length
        ? `⚠️ нет точек: ${noCp.map((p) => p.item.model).join(", ")}`
        : `${a.totals.connectionPoints} точек из библиотеки`,
    },
    {
      label: "Логические связи",
      ok: a.links.length > 0,
      detail: `${a.links.length} логических, ${a.wires.length} физических проводников`,
    },
    {
      label: "Группы не разорваны",
      ok: !a.splitGroups.length,
      detail: a.splitGroups.length ? `⚠️ разделены: ${a.splitGroups.join(", ")}` : "все группы размещены целиком",
    },
  ];
}

const dev = (
  id: string,
  manufacturer: string,
  series: string,
  model: string,
  equipment_type: SpecRow["equipment_type"],
  poles: number | null,
  nominal: number | null,
  qty = 1,
): SpecRow => ({ id, manufacturer, series, model, equipment_type, poles, nominal, qty });

/** Тестовый пример «ЩИТ ЗАРЯДКИ — ГРУППИРОВКА» (только фигуры существующей библиотеки). */
export const CHARGING_PANEL_GROUPS: PanelGroup[] = [
  {
    id: "g-in",
    kind: "input",
    name: "Ввод",
    description: "Вводной аппарат щита",
    reserveModules: 0,
    devices: [dev("d1", "IEK", "ВА47-29 KARAT", "ВА47-29 3P", "breaker", 3, 32)],
  },
  {
    id: "g-prot",
    kind: "protection",
    name: "Защита",
    description: "Реле контроля напряжения",
    reserveModules: 0,
    devices: [dev("d2", "DigiTop", "VP", "VP-3F 63A", "relay", 3, 63)],
  },
  {
    id: "g1",
    kind: "group",
    name: "Зарядка",
    description: "Линия зарядной станции",
    reserveModules: 0,
    devices: [
      dev("d3", "IEK", "ВД3-63", "ВД3-63 4P 6kA тип A", "rcd", 4, 25),
      dev("d4", "IEK", "ВА47-29 KARAT", "ВА47-29 3P", "breaker", 3, 32),
    ],
  },
  {
    id: "g2",
    kind: "group",
    name: "Розетки",
    description: "Бытовые розеточные линии",
    reserveModules: 0,
    devices: [
      dev("d5", "IEK", "ВД3-63", "ВД3-63 2P 6kA тип A", "rcd", 2, 16),
      dev("d6", "IEK", "ВА47-29 KARAT", "ВА47-29 1P", "breaker", 1, 16),
    ],
  },
  {
    id: "g3",
    kind: "reserve",
    name: "Резерв",
    description: "Свободное место под расширение",
    reserveModules: 4,
    devices: [],
  },
];
