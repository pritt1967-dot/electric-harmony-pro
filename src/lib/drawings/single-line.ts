/**
 * Генератор однолинейной схемы (ГОСТ-подобный технический чертёж).
 * Координаты — в миллиметрах, поэтому чертёж 1:1 переносится в PDF и на печать.
 * Всё содержимое строится из PanelProject: ни одного «зашитого» аппарата.
 */

import type { Conductor, PanelProject, ProjectCircuit, ProjectDevice } from "./project-model";
import { getSchematicSymbol } from "@/lib/shape-library/schematic-library";

/* ------------------------------------------------------------------ */
/* Фигуры из «Библиотеки схемы» (VSS). Геометрия библиотеки не меняется: */
/* фигура вставляется как есть, выводы совмещаются с линией колонки.     */
/* ------------------------------------------------------------------ */

const PT_PER_MM = 72 / 25.4;

/** Вставить полную библиотечную геометрию, масштабируя обе оси одинаково. */
function libSym(id: string, x: number, y: number): string {
  const s = getSchematicSymbol(id);
  if (!s?.svg) throw new Error(`Нет библиотечной фигуры ${id}`);
  // В импортированном SVG ввод находится на вертикальном проводнике.
  // Visio-master хранит координаты до поворота: (X,Y) -> (-Y,X).
  const lead = s.svg.match(/M\s*([-\d.]+),\s*([-\d.]+)\s+L\s*([-\d.]+),\s*([-\d.]+)\s+M\s*([-\d.]+),\s*0\.0000\s+L/);
  if (!lead) throw new Error(`Нет входной точки фигуры ${id}`);
  const leadX = Number(lead[5]);
  const leadBottom = Number(lead[2]);
  const points = s.connection_points.map((p) => ({
    id: p.id,
    x: p.source === "visio-master" ? leadX - p.y_mm * PT_PER_MM : p.x_mm * PT_PER_MM,
    y: p.source === "visio-master" ? p.x_mm * PT_PER_MM : p.y_mm * PT_PER_MM,
  }));
  // Геометрические p2/p1 описывают контакты внутри символа, а проводники
  // подходят к концам библиотечных выводов. Используем их точные SVG-координаты.
  const input = points.find((p) => p.id === "in") ?? points.find((p) => p.id === "p2");
  const output = points.find((p) => p.id === "out") ?? points.find((p) => p.id === "p1");
  if (!input || !output || leadBottom <= 0) throw new Error(`Нет выходной точки фигуры ${id}`);
  input.x = output.x = leadX;
  input.y = 0;
  output.y = leadBottom;
  if (input.id !== "in") points.push({ ...input, id: "in" });
  if (output.id !== "out") points.push({ ...output, id: "out" });
  // В QF cable координаты N/PE master относятся к неповернутой фигуре;
  // реальные начала этих выводов берём из сохранённых библиотечных контуров.
  if (id === "qf-cable") {
    for (const point of points.filter((p) => p.id === "N" || p.id === "PE")) {
      const starts = [...s.svg.matchAll(/M\s*([-\d.]+),\s*([-\d.]+)\s+L/g)]
        .map((m) => ({ x: Number(m[1]), y: Number(m[2]) }))
        .filter((p) => Math.abs(p.x - point.x) < 0.05);
      const terminal = starts.sort((a, b) => a.y - b.y)[0];
      if (terminal) { point.x = terminal.x; point.y = terminal.y; }
    }
  }
  const scale = Math.min(1 / PT_PER_MM, SYM_H / output.y);
  const inner = s.svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  const connections = points.map((p) =>
    `${p.id}:${x + (p.x - leadX) * scale},${y + p.y * scale}`,
  ).join(";");
  // Маркеры разных библиотечных фигур не должны ссылаться друг на друга.
  const prefix = `${id}-${x}-${y}`.replace(/[^a-zA-Z0-9_-]/g, "_");
  const scopedInner = inner.replace(/\bid="([^"]+)"/g, `id="${prefix}-$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${prefix}-$1)`);
  const outX = x + (output.x - leadX) * scale;
  const outY = y + output.y * scale;
  return (
    `<g data-library-symbol="${id}" data-vss-shape="${s.shape_id}" data-connections="${connections}" transform="translate(${x - leadX * scale} ${y}) scale(${scale})">${scopedInner}</g>` +
    L(outX, outY, x, y + SYM_H)
  );
}

export type SheetFormat = "A4" | "A3" | "A2";

export const SHEET_MM: Record<SheetFormat, { w: number; h: number }> = {
  A4: { w: 297, h: 210 },
  A3: { w: 420, h: 297 },
  A2: { w: 594, h: 420 },
};

export const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const T = (
  x: number,
  y: number,
  text: unknown,
  o: { size?: number; anchor?: "start" | "middle" | "end"; bold?: boolean; rotate?: number } = {},
) => {
  const size = o.size ?? 2.8;
  const anchor = o.anchor ?? "start";
  const rot = o.rotate ? ` transform="rotate(${o.rotate} ${x} ${y})"` : "";
  return `<text x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}" fill="#000"${
    o.bold ? ' font-weight="bold"' : ""
  }${rot}>${esc(text)}</text>`;
};

const L = (x1: number, y1: number, x2: number, y2: number, w = 0.3) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#000" stroke-width="${w}"/>`;

const R = (x: number, y: number, w: number, h: number, sw = 0.3) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#000" stroke-width="${sw}"/>`;

const DOT = (x: number, y: number, r = 0.7) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#000"/>`;

const CIRC = (x: number, y: number, r: number, sw = 0.3) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#000" stroke-width="${sw}"/>`;

/* ------------------------------------------------------------------ */
/* Условные обозначения (вертикальные, вход сверху, выход снизу)        */
/* ------------------------------------------------------------------ */

export const SYM_H = 16;

/** Автоматический выключатель (QF). */
export function symBreaker(x: number, y: number, poles = 1): string {
  const lib = libSym("qf-cable", x, y);
  return lib + (poles > 1 ? T(x - 3, y + 6, `${poles}P`, { size: 2.2, anchor: "end" }) : "");
}

/** УЗО / ВДТ. */
export function symRcd(x: number, y: number): string {
  return libSym("qd", x, y);
}

/** Дифференциальный автомат (АВДТ). */
export function symRcbo(x: number, y: number): string {
  return libSym("qfd", x, y);
}

/** Прибор учёта. */
export function symMeter(x: number, y: number): string {
  return [
    L(x, y, x, y + 3),
    CIRC(x, y + 8, 5),
    T(x, y + 9, "kWh", { size: 2.4, anchor: "middle" }),
    L(x, y + 13, x, y + SYM_H),
  ].join("");
}

/** УЗИП (ограничитель перенапряжения). */
export function symSpd(x: number, y: number): string {
  return [
    L(x, y, x, y + 3),
    R(x - 3, y + 3, 6, 8),
    L(x - 3, y + 11, x + 3, y + 3),
    L(x, y + 11, x, y + 13.4),
    L(x - 3.6, y + 13.4, x + 3.6, y + 13.4, 0.5),
    L(x - 2.2, y + 14.6, x + 2.2, y + 14.6),
    L(x - 1, y + 15.6, x + 1, y + 15.6),
  ].join("");
}

/** Реле напряжения. */
export function symRelay(x: number, y: number): string {
  return [
    L(x, y, x, y + 3),
    R(x - 5, y + 3, 10, 10),
    T(x, y + 9.6, "U<>", { size: 2.6, anchor: "middle" }),
    L(x, y + 13, x, y + SYM_H),
  ].join("");
}

/** Контактор. */
export function symContactor(x: number, y: number): string {
  return libSym("km", x, y);
}

/** Рубильник / выключатель нагрузки (вводной разъединитель). */
export function symSwitch(x: number, y: number): string {
  return libSym("qs", x, y);
}

function symbolFor(kind: ProjectDevice["kind"], x: number, y: number, poles: number, label = "") {
  switch (kind) {
    case "meter":
      return symMeter(x, y);
    case "spd":
      return symSpd(x, y);
    case "relay":
      return symRelay(x, y);
    case "contactor":
      return symContactor(x, y);
    case "rcd":
      return symRcd(x, y);
    case "rcbo":
      return symRcbo(x, y);
    case "input":
      return /рубильник|нагрузк|разъедин|вн(?![а-яё])/i.test(label) ? symSwitch(x, y) : symBreaker(x, y, poles);
    default:
      return symBreaker(x, y, poles);
  }
}

/* ------------------------------------------------------------------ */
/* Рамка и основная надпись                                            */
/* ------------------------------------------------------------------ */

function frame(
  w: number,
  h: number,
  p: PanelProject,
  sheet: number,
  total: number,
  format: SheetFormat,
) {
  const x0 = 20;
  const y0 = 5;
  const x1 = w - 5;
  const y1 = h - 5;
  const tbW = 185;
  const tbH = 40;
  const tx = x1 - tbW;
  const ty = y1 - tbH;
  const out: string[] = [
    R(x0, y0, x1 - x0, y1 - y0, 0.7),
    R(tx, ty, tbW, tbH, 0.7),
    L(tx, ty + 10, x1, ty + 10, 0.3),
    L(tx, ty + 22, x1, ty + 22, 0.3),
    L(tx + 120, ty + 22, tx + 120, y1, 0.3),
    L(tx + 150, ty + 22, tx + 150, y1, 0.3),
    T(tx + 3, ty + 7, p.title, { size: 3.6, bold: true }),
    T(tx + 3, ty + 18, `${p.object || ""}  ·  Схема электрическая принципиальная (однолинейная)`, {
      size: 2.6,
    }),
    T(tx + 3, ty + 29, "S&M ELECTRIC · Санкт-Петербург", { size: 2.8, bold: true }),
    T(tx + 3, ty + 36, new Date().toLocaleDateString("ru-RU"), { size: 2.6 }),
    T(tx + 123, ty + 29, `Формат ${format}`, { size: 2.4 }),
    T(tx + 153, ty + 29, `Лист ${sheet} из ${total}`, { size: 2.4 }),
  ];
  return { svg: out.join(""), box: { x0, y0, x1, y1, tbTop: ty } };
}

/* ------------------------------------------------------------------ */
/* Схема                                                               */
/* ------------------------------------------------------------------ */

const TABLE_ROWS = [
  "Условное обозначение",
  "№ группы",
  "Фаза",
  "Pн, кВт",
  "In, А",
  "Наименование",
];

function chunk<T>(arr: T[], size: number): T[][] {
  if (arr.length === 0) return [[]];
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function sheetSvg(
  p: PanelProject,
  circuits: ProjectCircuit[],
  format: SheetFormat,
  sheet: number,
  total: number,
): string {
  const { w, h } = SHEET_MM[format];
  const f = frame(w, h, p, sheet, total, format);
  const b = f.box;
  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}mm" height="${h}mm" viewBox="0 0 ${w} ${h}" font-family="Arial, Helvetica, sans-serif" shape-rendering="geometricPrecision">`,
    `<rect width="${w}" height="${h}" fill="#ffffff"/>`,
    f.svg,
  ];

  const tableH = TABLE_ROWS.length * 7;
  const tableTop = b.tbTop - 4 - tableH;
  const headW = 46;
  const colX0 = b.x0 + headW;
  const colArea = b.x1 - 4 - colX0;
  const colW = circuits.length ? Math.min(38, colArea / circuits.length) : colArea;

  /* --- Ввод --- */
  const inX = b.x0 + 12;
  let y = b.y0 + 12;
  parts.push(
    T(b.x0 + 3, y, `Питающая сеть ${p.input.voltage} · ${p.input.phases === 3 ? "3Ф+N+PE" : "1Ф+N+PE"} · ${p.input.grounding}`, {
      size: 3,
      bold: true,
    }),
  );
  y += 4;
  parts.push(L(inX, y, inX, y + 8));
  if (p.input.cable) parts.push(T(inX + 3, y + 5.5, `Вводной кабель ${p.input.cable}`, { size: 2.5 }));
  y += 8;

  /* --- Вводная цепочка (при необходимости — в несколько колонок) --- */
  const circuitH = 46;
  const busSpan = (p.busbars.length - 1) * 4;
  const chainTop = y;
  const chainBottomLimit = tableTop - 6 - circuitH - busSpan - 6;
  const step = SYM_H + 3;
  const perCol = Math.max(1, Math.floor((chainBottomLimit - chainTop) / step));
  const chain: Pick<ProjectDevice, "kind" | "name" | "manufacturer" | "model" | "rating" | "ratedCurrent" | "leakage" | "poles">[] = p.mainDevices.length
    ? p.mainDevices
    : p.input.mainBreaker
      ? [
          {
            kind: "input" as const,
            name: "Вводной автомат",
            manufacturer: "",
            model: "",
            rating: p.input.mainBreaker,
            ratedCurrent: 0,
            leakage: "",
            poles: p.input.phases === 3 ? 4 : 2,
          },
        ]
      : [];

  const colGap = 92;
  let lastX = inX;
  let lastY = y;
  let chainBottom = y;
  chain.forEach((d, i) => {
    const col = Math.floor(i / perCol);
    const row = i % perCol;
    const cx = inX + col * colGap;
    const cyTop = chainTop + row * step;
    if (row === 0 && col > 0) parts.push(L(lastX, lastY, cx, lastY), L(cx, lastY, cx, cyTop));
    parts.push(symbolFor(d.kind as ProjectDevice["kind"], cx, cyTop, d.poles, `${d.name} ${d.model} ${d.rating}`));
    const bits = [d.manufacturer, d.model, d.rating || (d.ratedCurrent ? `${d.ratedCurrent} А` : "")];
    if (d.poles && !/\dP/i.test(d.rating)) bits.push(`${d.poles}P`);
    if (d.leakage && !d.rating.includes(d.leakage.replace(" мА", ""))) bits.push(d.leakage);
    const label = bits.filter(Boolean).join(" ");
    parts.push(T(cx + 8, cyTop + 6, d.name || label, { size: 2.6, bold: true }));
    parts.push(T(cx + 8, cyTop + 10, label, { size: 2.4 }));
    lastX = cx;
    lastY = cyTop + SYM_H;
    chainBottom = Math.max(chainBottom, lastY);
    if (row < perCol - 1 && i < chain.length - 1) parts.push(L(cx, lastY, cx, cyTop + step));
  });

  /* --- Шины --- */
  const busGap = 4;
  const busTop = Math.max(chainBottom + 8, chainTop + 10);
  const busX1 = b.x1 - 4;
  const busY: Record<string, number> = {};
  p.busbars.forEach((c, i) => {
    const by = busTop + i * busGap;
    busY[c] = by;
    parts.push(L(b.x0 + 4, by, busX1, by, c === "PE" || c === "N" ? 0.4 : 0.6));
    parts.push(T(b.x0 + 1.5, by - 0.8, c, { size: 2.6, bold: true }));
  });
  const busBottom = busTop + (p.busbars.length - 1) * busGap;
  // ввод на шины
  parts.push(L(lastX, lastY, lastX, busTop));
  p.busbars.forEach((c, i) => {
    if (c !== "PE") parts.push(DOT(lastX, busTop + i * busGap, 0.6));
  });

  /* --- Отходящие группы --- */
  const startY = busBottom + 6;
  const loadY = tableTop - 5;
  circuits.forEach((c, i) => {
    const x = colX0 + colW * (i + 0.5);
    const flip = x + 34 > b.x1;
    const tx = flip ? x - 4 : x + 6;
    const anchor: "start" | "end" = flip ? "end" : "start";
    const py = busY[c.phase] ?? busTop;
    parts.push(DOT(x, py, 0.6));
    parts.push(L(x, py, x, startY));
    let cy = startY;
    const hasRcd = !!c.rcd.trim();
    const isRcbo = /дифавтомат|авдт|rcbo/i.test(c.rcd);
    if (hasRcd && !isRcbo) {
      parts.push(symRcd(x, cy));
      parts.push(T(tx, cy + 7, c.rcd, { size: 2.2, anchor }));
      cy += SYM_H + 2;
      parts.push(L(x, cy - 2, x, cy));
    }
    if (isRcbo) {
      parts.push(symRcbo(x, cy));
      parts.push(T(tx, cy + 7, c.rcd, { size: 2.2, anchor }));
    } else {
      parts.push(symBreaker(x, cy, c.poles));
    }
    parts.push(T(tx, cy + 13, `${c.breaker}${c.poles ? ` ${c.poles}P` : ""}`, { size: 2.3, anchor }));
    cy += SYM_H;

    // N и PE к нагрузке
    parts.push(L(x, cy, x, loadY));
    parts.push(T(tx, (cy + loadY) / 2 + 1, c.cable, { size: 2.2, anchor }));
    const neutralY = busY["N"];
    const earthY = busY["PE"];
    // Обход справа от реальных контуров QD/QFD и кабельных выводов QF.
    if (neutralY !== undefined) {
      parts.push(DOT(x + 7, neutralY, 0.5));
      parts.push(L(x + 7, neutralY, x + 7, loadY));
    }
    if (earthY !== undefined) {
      parts.push(DOT(x + 9, earthY, 0.5));
      parts.push(L(x + 9, earthY, x + 9, loadY));
    }
    // стрелка нагрузки
    parts.push(L(x - 2, loadY, x + 11, loadY, 0.4));
  });


  /* --- Таблица групп --- */
  parts.push(R(b.x0, tableTop, b.x1 - b.x0, tableH, 0.5));
  TABLE_ROWS.forEach((label, r) => {
    const ry = tableTop + r * 7;
    if (r) parts.push(L(b.x0, ry, b.x1, ry, 0.3));
    parts.push(T(b.x0 + 1.5, ry + 4.6, label, { size: 2.4 }));
  });
  parts.push(L(colX0, tableTop, colX0, tableTop + tableH, 0.5));
  circuits.forEach((c, i) => {
    const x = colX0 + colW * i;
    parts.push(L(x + colW, tableTop, x + colW, tableTop + tableH, 0.3));
    const cx = x + colW / 2;
    // мини-символ аппарата в первой строке
    const g = `<g transform="translate(${cx - 1.6},${tableTop + 0.8}) scale(0.38)">${
      /дифавтомат|авдт|rcbo/i.test(c.rcd) ? symRcbo(0, 0) : symBreaker(0, 0, c.poles)
    }</g>`.replace(/\bid="([^"]+)"/g, `id="table-${i}-$1"`)
      .replace(/url\(#([^)]+)\)/g, `url(#table-${i}-$1)`);
    parts.push(g);
    const vals = [c.mark, c.phase, c.powerKw ? String(c.powerKw) : "—", c.ratedCurrent ? String(c.ratedCurrent) : "—"];
    vals.forEach((v, k) => parts.push(T(cx, tableTop + (k + 1) * 7 + 4.6, v, { size: 2.4, anchor: "middle" })));
    const name = c.name.length > Math.floor(colW / 1.35) ? `${c.name.slice(0, Math.floor(colW / 1.35))}…` : c.name;
    parts.push(T(cx, tableTop + 5 * 7 + 4.6, name, { size: 2.2, anchor: "middle" }));
  });

  parts.push("</svg>");
  return parts.join("\n");
}

/** Однолинейная схема: массив листов SVG (авторазбивка по количеству групп). */
export function buildSingleLineSheets(p: PanelProject, format: SheetFormat = "A3"): string[] {
  const { w } = SHEET_MM[format];
  const usable = w - 5 - 20 - 46 - 4;
  const perSheet = Math.max(1, Math.floor(usable / 24));
  const groups = chunk(p.circuits, perSheet);
  return groups.map((g, i) => sheetSvg(p, g, format, i + 1, groups.length));
}
