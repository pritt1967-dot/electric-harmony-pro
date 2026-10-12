/**
 * Генератор однолинейной схемы (ГОСТ-подобный технический чертёж).
 * Координаты — в миллиметрах, поэтому чертёж 1:1 переносится в PDF и на печать.
 * Всё содержимое строится из PanelProject: ни одного «зашитого» аппарата.
 */

import type { PanelProject, ProjectCircuit, ProjectDevice } from "./project-model";
import { getSchematicSymbol } from "@/lib/shape-library/schematic-library";
import { DOC1_COLUMN_PITCH_MM } from "@/lib/shape-library/doc1-reference";

/* ------------------------------------------------------------------ */
/* Фигуры из «Библиотеки схемы» (VSS). Геометрия библиотеки не меняется: */
/* фигура вставляется как есть, выводы совмещаются с линией колонки.     */
/* ------------------------------------------------------------------ */

const PT_PER_MM = 72 / 25.4;

/** Вставить полную библиотечную геометрию, масштабируя обе оси одинаково. */
function libSym(id: string, x: number, y: number, height = SYM_H, labels?: { mark: string; cable?: string }): string {
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
  if (id.endsWith("-cable")) {
    for (const point of points.filter((p) => p.id === "N" || p.id === "PE")) {
      const starts = [...s.svg.matchAll(/M\s*([-\d.]+),\s*([-\d.]+)\s+L/g)]
        .map((m) => ({ x: Number(m[1]), y: Number(m[2]) }))
        .filter((p) => Math.abs(p.x - point.x) < 0.05);
      const terminal = starts.sort((a, b) => a.y - b.y)[0];
      if (terminal) { point.x = terminal.x; point.y = terminal.y; }
    }
  }
  const scale = Math.min(1 / PT_PER_MM, height / output.y);
  let inner = s.svg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  if (labels) inner = inner.replace(/<text\b[\s\S]*?<\/text>/g, "");
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
    L(outX, outY, x, y + height)
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

  /* Компоновка VSDX: источник справа, ввод справа налево, спуск к
     горизонтальным шинам, отходящие колонки с шагом 30 мм. Состав и
     порядок цепочек остаются из PanelProject; эталон не добавляет аппараты. */
  const chain = p.mainDevices.length ? p.mainDevices : p.input.mainBreaker ? [{
    kind: "input" as const, name: "Вводной автомат", manufacturer: "", model: "",
    rating: p.input.mainBreaker, ratedCurrent: 0, leakage: "", poles: p.input.phases === 3 ? 4 : 2,
  }] : [];
  const pitch = DOC1_COLUMN_PITCH_MM;
  const dw = Math.max(80 + circuits.length * pitch, 60 + chain.length * 42);
  const busTop = 66;
  const busGap = 5;
  const hasSeriesRcd = circuits.some((c) => c.rcd.trim() && !/дифавтомат|авдт|rcbo/i.test(c.rcd));
  const cableHeight = 75;
  const busBottom = busTop + Math.max(0, p.busbars.length - 1) * busGap;
  const loadY = busBottom + 6 + (hasSeriesRcd ? SYM_H + 2 : 0) + cableHeight + 5;
  const dh = loadY + 4;
  const diagramScale = Math.min((b.x1 - b.x0 - 6) / dw, (tableTop - b.y0 - 9) / dh);
  const diagramX = b.x0 + 3;
  const diagramY = b.y0 + 7;
  parts.push(`<g data-doc1-layout="true" transform="translate(${diagramX} ${diagramY}) scale(${diagramScale})">`);
  const wrap = (text: string, max = 23) => {
    const rows: string[] = [];
    for (const word of text.split(/\s+/)) {
      if (!word) continue;
      const last = rows[rows.length - 1];
      if (last && (last + " " + word).length <= max) rows[rows.length - 1] = last + " " + word;
      else for (let at = 0; at < word.length; at += max) rows.push(word.slice(at, at + max));
    }
    return rows;
  };
  parts.push(T(2, 0, `Питающая сеть ${p.input.voltage} · ${p.input.grounding}`, { size: 3, bold: true }));
  const inY = 29;
  const sourceX = dw - 12;
  const dropX = sourceX - chain.length * 42 - 8;
  parts.push(T(sourceX, 7, p.input.phases === 3 ? "L1, L2, L3" : "L1", { anchor: "end", bold: true }));
  parts.push(L(sourceX, 10, sourceX, inY), DOT(sourceX, inY));
  let previousX = sourceX;
  chain.forEach((d, i) => {
    const x = sourceX - 10 - i * 42;
    // rotate(90): верхний ввод (x,0) становится правым, выход — левым.
    parts.push(L(previousX, inY, x, inY));
    const original = symbolFor(d.kind, x, inY, d.poles, `${d.name} ${d.model} ${d.rating}`);
    const symbol = original.includes("data-library-symbol") ? original.replace(/<text\b[\s\S]*?<\/text>/g, "") : original;
    parts.push(`<g data-input-device="${i}" transform="rotate(90 ${x} ${inY})">${symbol}</g>`);
    const libraryId = original.match(/data-library-symbol="([^"]+)"/)?.[1];
    const mark = `${d.name} ${d.model}`.match(/\b(?:QFD|QF|QD|QS|KM)\d*\b/i)?.[0] ?? ({ qs: "QS", km: "KM", qd: "QD", qfd: "QFD", "qf-cable": "QF" }[libraryId ?? ""] ?? "");
    if (mark) parts.push(T(x - 8, 24, mark, { size: 2.8, bold: true, anchor: "middle" }));
    wrap(d.name || d.model, 21).slice(0, 3).forEach((row, ri) => parts.push(T(x - 8, 11 + ri * 3.3, row, { size: 2.6, anchor: "middle", bold: ri === 0 })));
    wrap([d.manufacturer, d.model, d.rating, d.leakage].filter(Boolean).join(" "), 23).slice(0, 3)
      .forEach((row, ri) => parts.push(T(x - 8, 40 + ri * 3.3, row, { size: 2.5, anchor: "middle" })));
    previousX = x - SYM_H;
  });
  parts.push(L(previousX, inY, dropX, inY), L(dropX, inY, dropX, busTop));
  if (p.input.cable) parts.push(T(dropX - 3, 53, p.input.cable, { size: 2.5, anchor: "end" }));
  const busY: Record<string, number> = {};
  p.busbars.forEach((c, i) => {
    const by = busTop + i * busGap;
    busY[c] = by;
    parts.push(`<g data-bus="${c}">${L(20, by, dw - 8, by, c === "PE" || c === "N" ? 0.4 : 0.6)}${T(17, by + 1, c, { anchor: "end", bold: true })}</g>`);
  });
  // Only the phase chain is joined to its bus; crossing N/PE is not a junction.
  parts.push(DOT(dropX, busTop, 0.6));
  parts.push(`<rect data-panel-boundary="true" x="2" y="3" width="${dw - 3}" height="${busBottom + 2}" fill="none" stroke="#000" stroke-width="0.3" stroke-dasharray="4 2"/>`);
  circuits.forEach((c, i) => {
    const x = 50 + pitch * i;
    const py = busY[c.phase] ?? busTop;
    const isRcbo = /дифавтомат|авдт|rcbo/i.test(c.rcd);
    const seriesRcd = !!c.rcd.trim() && !isRcbo;
    let cy = busBottom + 6;
    // All cable figures have their original 75 mm extent and 5/10 mm N/PE offsets.
    if (seriesRcd) {
      parts.push(`<g data-series-rcd="${esc(c.id)}">${symRcd(x, cy).replace(/<text\b[\s\S]*?<\/text>/g, "")}</g>`);
      parts.push(T(x - 6, cy + 8, c.rcd, { size: 2.8, anchor: "end", bold: true }));
      parts.push(L(x, py, x, cy), DOT(x, py, 0.6));
      cy += SYM_H + 2;
      parts.push(L(x, cy - 2, x, cy));
    } else {
      parts.push(L(x, py, x, cy), DOT(x, py, 0.6));
    }
    const symbolId = isRcbo ? "qfd-cable" : "qf-cable";
    const cableSymbol = libSym(symbolId, x, cy, cableHeight, { mark: c.mark, cable: c.cable });
    parts.push(`<g data-circuit="${esc(c.id)}">${cableSymbol}</g>`);
    const deviceY = cy + 27.5;
    parts.push(T(x - 5, deviceY, c.mark, { size: 2.8, anchor: "end", bold: true }));
    parts.push(T(x - 5, deviceY + 4, `${c.breaker} ${c.poles}P`, { size: 2.5, anchor: "end" }));
    if (isRcbo) parts.push(T(x - 5, deviceY + 8, c.rcd, { size: 2.4, anchor: "end" }));
    parts.push(L(x, cy + cableHeight, x, loadY));
    wrap(c.cable, 32).forEach((row, ri) => parts.push(T(x - 4 - ri * 3.2, cy + 56, row, { size: 2.7, rotate: -90, anchor: "middle" })));
    for (const terminal of ["N", "PE"] as const) {
      const by = busY[terminal];
      const connection = cableSymbol.match(new RegExp(`${terminal}:([-\\d.]+),([-\\d.]+)`));
      if (by === undefined || !connection) continue;
      const px = Number(connection[1]);
      const ty = Number(connection[2]);
      // Real library N/PE starts, not parallel wires extending to the load.
      parts.push(`<g data-terminal-wire="${terminal}" data-for="${esc(c.id)}">${L(px, by, px, ty)}${DOT(px, by, 0.5)}</g>`);
    }
    parts.push(L(x - 2, loadY, x + 2, loadY, 0.4));
  });
  parts.push("</g>");

  /* --- Таблица групп --- */
  parts.push(R(b.x0, tableTop, b.x1 - b.x0, tableH, 0.5));
  TABLE_ROWS.forEach((label, r) => {
    const ry = tableTop + r * 7;
    if (r) parts.push(L(b.x0, ry, b.x1, ry, 0.3));
    parts.push(T(b.x0 + 1.5, ry + 4.6, label, { size: 2.4 }));
  });
  const colW = pitch * diagramScale;
  const colX0 = diagramX + (50 - pitch / 2) * diagramScale;
  parts.push(L(colX0, tableTop, colX0, tableTop + tableH, 0.5));
  circuits.forEach((c, i) => {
    const x = colX0 + colW * i;
    parts.push(L(x + colW, tableTop, x + colW, tableTop + tableH, 0.3));
    const cx = x + colW / 2;
    // мини-символ аппарата в первой строке
    const g = `<g data-table-group="${esc(c.id)}" data-center-x="${cx}" transform="translate(${cx},${tableTop + 0.8}) scale(0.38)">${
      /дифавтомат|авдт|rcbo/i.test(c.rcd) ? symRcbo(0, 0) : symBreaker(0, 0, c.poles)
    }</g>`.replace(/<text\b[\s\S]*?<\/text>/g, "").replace(/\bid="([^"]+)"/g, `id="table-${i}-$1"`)
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
  const perSheet = Math.max(1, Math.floor(usable / DOC1_COLUMN_PITCH_MM));
  const groups = chunk(p.circuits, perSheet);
  return groups.map((g, i) => sheetSvg(p, g, format, i + 1, groups.length));
}
