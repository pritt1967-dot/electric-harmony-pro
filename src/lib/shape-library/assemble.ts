/**
 * ТЕСТ: алгоритмическая сборка щита из тестовой библиотеки фигур Visio.
 *
 * Состав, порядок и связи берутся из разбора оригинального «Щит зарядки.vsdx»
 * (original-panel.ts). Графика — реальные SVG-фигуры библиотеки (generated.ts),
 * заменители не рисуются. К рабочему визуализатору щита не подключено.
 */

import { SHAPE_LIBRARY, type LibraryItem } from "./index";
import { ORIGINAL_PANEL, type OriginalInstance } from "./original-panel";

const BY_SLUG = new Map<string, LibraryItem>(SHAPE_LIBRARY.map((s) => [s.slug, s]));

const PX_PER_MM = 100 / 25.4; // масштаб SVG библиотеки (100 px на дюйм)
const RAIL_GAP_MM = 60; // расстояние между DIN-рейками в сборке
const MARGIN_MM = 20;

export type Placed = {
  instanceId: string;
  slug: string;
  item: LibraryItem;
  /** левый-верхний угол в мм (система сборки, y вниз) */
  x: number;
  y: number;
  w: number;
  h: number;
  rail: number;
};

export type AssemblyWire = {
  id: string;
  from: { x: number; y: number } | null;
  to: { x: number; y: number } | null;
  resolved: boolean;
  reason?: string;
};

export type AssemblyIssue = { level: "warn" | "error"; text: string };

export type Assembly = {
  svg: string;
  placed: Placed[];
  wires: AssemblyWire[];
  rails: { y: number; x: number; w: number }[];
  issues: AssemblyIssue[];
  connectionPoints: number;
};

const ELECTRICAL = new Set(["breaker", "rcd", "relay", "contactor"]);

/** Точка подключения фигуры по имени из Visio: «TVC2», «Row_1» или «X3» (индекс). */
function connOf(item: LibraryItem, name: string) {
  const direct = item.connection_points.find((c) => c.id === name);
  if (direct) return direct;
  const m = /^[XY](\d+)$/.exec(name);
  if (m) return item.connection_points[Number(m[1]) - 1] ?? null;
  return null;
}

/** Габарит рамки библиотечного SVG (в мм) вместе с полем вокруг геометрии. */
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

/** Строит щит алгоритмически: рейки → аппараты по модулям → маркировка → провода. */
export function assemblePanel(): Assembly {
  const issues: AssemblyIssue[] = [];
  const instances = ORIGINAL_PANEL.instances;

  const railsSrc = instances
    .filter((i) => i.slug === "динрейка")
    .sort((a, b) => b.y_mm - a.y_mm);
  const railItem = BY_SLUG.get("динрейка");
  if (!railItem) issues.push({ level: "error", text: "DIN-рейка отсутствует в библиотеке" });

  const railOf = (i: OriginalInstance) => {
    let best = 0;
    let dist = Infinity;
    railsSrc.forEach((r, k) => {
      const d = Math.abs(i.y_mm - r.y_mm);
      if (d < dist) {
        dist = d;
        best = k;
      }
    });
    return best;
  };

  const devicesSrc = instances.filter((i) => {
    const it = BY_SLUG.get(i.slug);
    return it ? ELECTRICAL.has(it.equipment_type) : false;
  });
  const markersSrc = instances.filter((i) => BY_SLUG.get(i.slug)?.equipment_type === "marker");

  for (const i of instances) {
    const it = BY_SLUG.get(i.slug);
    if (!it) {
      issues.push({ level: "warn", text: `«${i.name}» — фигура отсутствует в библиотеке или требует ручной обработки` });
    } else if (it.status === "manual") {
      issues.push({ level: "warn", text: `«${it.model}» — фигура требует ручной обработки, в сборку не размещена` });
    }
  }

  const railBox = railItem ? svgBox(railItem) : null;
  const railW = railItem?.width_mm ?? 0;
  const railH = railItem?.height_mm ?? 0;

  const rails = railsSrc.map((_, k) => ({
    x: MARGIN_MM,
    y: MARGIN_MM + k * (RAIL_GAP_MM + railH),
    w: railW,
  }));

  const placed: Placed[] = [];
  const railCursor = rails.map((r) => r.x + 5);

  // DIN-рейки — реальная фигура библиотеки, левая и правая точки подключения её собственные.
  if (railItem)
    railsSrc.forEach((src, k) => {
      const r = rails[k]!;
      placed.push({
        instanceId: src.id,
        slug: src.slug,
        item: railItem,
        x: r.x,
        y: r.y,
        w: railW,
        h: railH,
        rail: k,
      });
    });


  const ordered = [...devicesSrc].sort((a, b) => {
    const ra = railOf(a);
    const rb = railOf(b);
    return ra - rb || a.x_mm - b.x_mm;
  });

  for (const d of ordered) {
    const item = BY_SLUG.get(d.slug);
    if (!item || item.status === "manual") continue;
    const k = railOf(d);
    const rail = rails[k];
    if (!rail) continue;
    const x = railCursor[k]!;
    const railCenter = rail.y + railH / 2;
    placed.push({
      instanceId: d.id,
      slug: d.slug,
      item,
      x,
      y: railCenter - item.height_mm / 2,
      w: item.width_mm,
      h: item.height_mm,
      rail: k,
    });
    railCursor[k] = x + item.width_mm;
  }

  // Маркировка ставится под ближайшим по исходному X аппаратом той же рейки.
  for (const mk of markersSrc) {
    const item = BY_SLUG.get(mk.slug);
    if (!item) continue;
    const k = railOf(mk);
    const host = placed
      .filter((p) => p.rail === k)
      .map((p) => ({ p, src: instances.find((i) => i.id === p.instanceId)! }))
      .sort((a, b) => Math.abs(a.src.x_mm - mk.x_mm) - Math.abs(b.src.x_mm - mk.x_mm))[0];
    if (!host) continue;
    placed.push({
      instanceId: mk.id,
      slug: mk.slug,
      item,
      x: host.p.x + host.p.w / 2 - item.width_mm / 2,
      y: host.p.y + host.p.h + 3,
      w: item.width_mm,
      h: item.height_mm,
      rail: k,
    });
  }

  const byInstance = new Map(placed.map((p) => [p.instanceId, p]));

  const point = (ref: { shape: string; conn: string } | null) => {
    if (!ref) return null;
    const p = byInstance.get(ref.shape);
    if (!p) return null;
    const c = connOf(p.item, ref.conn);
    if (!c) return null;
    return { x: p.x + c.x_mm, y: p.y + (p.h - c.y_mm) };
  };

  const wires: AssemblyWire[] = ORIGINAL_PANEL.wires.map((w) => {
    const from = point(w.from);
    const to = point(w.to);
    const resolved = !!from && !!to;
    return {
      id: w.id,
      from,
      to,
      resolved,
      reason: resolved
        ? undefined
        : !w.from || !w.to
          ? "в оригинале провод не привязан к точке подключения"
          : "точка подключения не найдена в библиотечной фигуре",
    };
  });

  const unresolved = wires.filter((w) => !w.resolved).length;
  if (unresolved)
    issues.push({ level: "warn", text: `${unresolved} проводник(ов) не восстановлено — нет привязки к точкам подключения` });

  // ------------------------------------------------------------------ SVG
  const maxX = Math.max(...rails.map((r) => r.x + r.w), ...placed.map((p) => p.x + p.w), 100);
  const maxY = Math.max(...rails.map((r) => r.y + railH), ...placed.map((p) => p.y + p.h), 100);
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
  if (railItem && railBox)
    for (const r of rails) body.push(put(railItem, r.x, r.y));
  for (const p of placed) body.push(put(p.item, p.x, p.y));

  for (const w of wires) {
    if (!w.from || !w.to) continue;
    const midY = (w.from.y + w.to.y) / 2;
    body.push(
      `<path d="M ${w.from.x.toFixed(2)} ${w.from.y.toFixed(2)} L ${w.from.x.toFixed(2)} ${midY.toFixed(2)} ` +
        `L ${w.to.x.toFixed(2)} ${midY.toFixed(2)} L ${w.to.x.toFixed(2)} ${w.to.y.toFixed(2)}" ` +
        `fill="none" stroke="#1d4ed8" stroke-width="0.6" stroke-linejoin="round" stroke-linecap="round"/>`,
    );
  }

  const dots: string[] = [];
  let cps = 0;
  for (const p of placed) {
    for (const c of p.item.connection_points) {
      cps += 1;
      dots.push(
        `<circle cx="${(p.x + c.x_mm).toFixed(2)}" cy="${(p.y + (p.h - c.y_mm)).toFixed(2)}" r="0.9" fill="#e11d48" fill-opacity="0.8"/>`,
      );
    }
  }

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W.toFixed(1)} ${H.toFixed(1)}" ` +
    `width="${(W * 3).toFixed(0)}" height="${(H * 3).toFixed(0)}">` +
    body.join("") +
    `<g data-role="connection-points">${dots.join("")}</g></svg>`;

  return { svg, placed, wires, rails, issues, connectionPoints: cps };
}

export type CompareRow = {
  label: string;
  original: string | number;
  assembled: string | number;
  match: boolean;
};

/** Сравнение сборки с оригиналом: состав, количество, модули, размеры, позиции. */
export function compareWithOriginal(a: Assembly) {
  const orig = ORIGINAL_PANEL.instances;
  const origEquip = orig.filter((i) => {
    const it = BY_SLUG.get(i.slug);
    return it ? ELECTRICAL.has(it.equipment_type) : false;
  });
  const asmEquip = a.placed.filter((p) => ELECTRICAL.has(p.item.equipment_type));

  const modulesOf = (slug: string) => BY_SLUG.get(slug)?.modules ?? 0;
  const origModules = origEquip.reduce((s, i) => s + modulesOf(i.slug), 0);
  const asmModules = asmEquip.reduce((s, p) => s + (p.item.modules ?? 0), 0);

  const missing = orig.filter((i) => !a.placed.some((p) => p.instanceId === i.id));
  const sizeDiff: string[] = [];
  const posDiff: string[] = [];
  for (const p of a.placed) {
    const src = orig.find((i) => i.id === p.instanceId);
    if (!src) continue;
    if (Math.abs(src.w_mm - p.w) > 0.51 || Math.abs(src.h_mm - p.h) > 0.51)
      sizeDiff.push(`${p.item.model}: оригинал ${src.w_mm}×${src.h_mm} мм, сборка ${p.w}×${p.h} мм`);
  }
  // позиции сравниваем по порядку на рейке (сборка укладывает модули вплотную)
  const railsCount = a.rails.length;
  for (let k = 0; k < railsCount; k++) {
    const o = origEquip
      .filter((i) => nearestRail(i, orig) === k)
      .sort((x, y) => x.x_mm - y.x_mm)
      .map((i) => i.id)
      .join(",");
    const s = asmEquip
      .filter((p) => p.rail === k)
      .sort((x, y) => x.x - y.x)
      .map((p) => p.instanceId)
      .join(",");
    if (o !== s) posDiff.push(`Рейка ${k + 1}: порядок оригинала [${o}] ≠ сборки [${s}]`);
  }

  const missingConn = orig.reduce((s, i) => {
    const it = BY_SLUG.get(i.slug);
    const have = it?.connection_points.length ?? 0;
    return s + Math.max(0, i.connection_points - have);
  }, 0);

  const rows: CompareRow[] = [
    {
      label: "Состав оборудования",
      original: [...new Set(origEquip.map((i) => i.slug))].length,
      assembled: [...new Set(asmEquip.map((p) => p.slug))].length,
      match:
        [...new Set(origEquip.map((i) => i.slug))].length ===
        [...new Set(asmEquip.map((p) => p.slug))].length,
    },
    {
      label: "Количество аппаратов",
      original: origEquip.length,
      assembled: asmEquip.length,
      match: origEquip.length === asmEquip.length,
    },
    { label: "Модулей всего", original: origModules, assembled: asmModules, match: origModules === asmModules },
    {
      label: "DIN-рейки",
      original: orig.filter((i) => i.slug === "динрейка").length,
      assembled: a.rails.length,
      match: orig.filter((i) => i.slug === "динрейка").length === a.rails.length,
    },
    {
      label: "Точки подключения",
      original: ORIGINAL_PANEL.stats["connection_points"] ?? 0,
      assembled: a.connectionPoints,
      match: missingConn === 0,
    },
    {
      label: "Проводники",
      original: ORIGINAL_PANEL.wires.length,
      assembled: a.wires.filter((w) => w.resolved).length,
      match: ORIGINAL_PANEL.wires.length === a.wires.filter((w) => w.resolved).length,
    },
    {
      label: "Элементы всего (с рамой и маркировкой)",
      original: orig.length,
      assembled: a.placed.length + a.rails.length,
      match: orig.length === a.placed.length + a.rails.length,
    },
  ];

  return {
    rows,
    missing: missing.map((i) => `${i.name} (ID ${i.id})`),
    sizeDiff,
    posDiff,
    missingConn,
  };
}

function nearestRail(i: OriginalInstance, all: OriginalInstance[]) {
  const rails = all.filter((r) => r.slug === "динрейка").sort((a, b) => b.y_mm - a.y_mm);
  let best = 0;
  let dist = Infinity;
  rails.forEach((r, k) => {
    const d = Math.abs(i.y_mm - r.y_mm);
    if (d < dist) {
      dist = d;
      best = k;
    }
  });
  return best;
}
