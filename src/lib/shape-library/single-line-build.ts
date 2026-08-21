/**
 * ОДНОЛИНЕЙНАЯ СХЕМА по эталону «Документ1.vsdx».
 *
 * Строится из единой модели (unified-model.ts): те же аппараты, те же ID,
 * те же кабели и фазы, что и в физической раскладке щита.
 * Геометрия (шаг колонок, уровни ввода / шин / аппаратов / электроприёмников)
 * взята из исходного Visio-файла — см. doc1-reference.ts.
 */

import { doc1X, doc1Y, DOC1_COLUMN_PITCH_MM } from "./doc1-reference";
import type { UDevice, UProject } from "./unified-model";

export const SL = {
  yInput: doc1Y(10.334645669), // 42.30 — вводная цепочка
  ySource: doc1Y(11.220472441), // 20.80 — источник L1,L2,L3
  yQsDrop: doc1Y(9.153543303), // 72.30 — спуск от вводного рубильника
  yBus: doc1Y(7.775590551), // 107.30 — шины L / N / PE
  yDevice: doc1Y(6.25), // 146.05 — аппараты отходящих линий
  yLoad: doc1Y(3.297244094), // 221.05 — электроприёмники
  x0: doc1X(4.625984252), // 117.50 — первая колонка
  pitch: DOC1_COLUMN_PITCH_MM, // 30.00
  xSource: doc1X(11.417322826), // 290.00
  xMain: doc1X(10.039370074), // 255.00
  xMeter: doc1X(8.562992126), // 217.50
  xRcbo: doc1X(7.431102362), // 188.75
  xSwitch: doc1X(6.397637795), // 162.50
  xSide: doc1X(2.214566929), // 56.25 — боковик (таблица наименований)
  loadW: 30,
  loadH: 26,
  busGap: 7,
};

export type SlElement = {
  kind: "load" | "device" | "input" | "bus" | "source" | "frame";
  label: string;
  xMm: number;
  yMm: number;
};

export type SingleLine = {
  svg: string;
  elements: SlElement[];
  columns: number;
  widthMm: number;
  heightMm: number;
};

const esc = (s: string) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const t = (x: number, y: number, s: string, o: { size?: number; anchor?: string; weight?: number; rot?: number } = {}) =>
  s
    ? `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="${o.size ?? 3.2}" font-weight="${o.weight ?? 400}" text-anchor="${o.anchor ?? "middle"}" fill="#111"${
        o.rot ? ` transform="rotate(${o.rot} ${x} ${y})"` : ""
      }>${esc(s)}</text>`
    : "";

const line = (x1: number, y1: number, x2: number, y2: number, w = 0.5, color = "#111", dash = "") =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${w}"${
    dash ? ` stroke-dasharray="${dash}"` : ""
  } stroke-linecap="round"/>`;

/** Автоматический выключатель (ГОСТ 21.614): контакт с косой чертой и тепловым расцепителем. */
function symbolBreaker(x: number, y: number, poles: number | null) {
  const p: string[] = [];
  p.push(line(x, y - 12, x, y - 5));
  p.push(line(x, y + 5, x, y + 12));
  p.push(line(x, y - 5, x + 4.5, y + 4)); // подвижный контакт
  p.push(line(x, y + 5, x, y + 4.6, 0.5));
  p.push(`<rect x="${x - 1.6}" y="${y + 4.6}" width="3.2" height="4" fill="none" stroke="#111" stroke-width="0.5"/>`);
  if (poles && poles > 1) {
    p.push(line(x - 3.5, y - 2.5, x + 1.5, y - 5.5, 0.5));
    p.push(t(x - 5.2, y - 4.2, String(poles), { size: 3, anchor: "end" }));
  }
  return p.join("");
}

/** Дифференциальный автомат / УЗО: автомат + тор дифференциального трансформатора. */
function symbolRcbo(x: number, y: number, poles: number | null, leakage: string) {
  return (
    symbolBreaker(x, y, poles) +
    `<circle cx="${x + 5.5}" cy="${y}" r="3.6" fill="none" stroke="#111" stroke-width="0.5"/>` +
    line(x + 1.9, y, x + 9.1, y, 0.4) +
    t(x + 12, y + 1.1, leakage, { size: 2.8, anchor: "start" })
  );
}

/** Выключатель нагрузки / рубильник. */
function symbolSwitch(x: number, y: number, poles: number | null) {
  const p = [
    line(x, y - 12, x, y - 5),
    line(x, y + 5, x, y + 12),
    line(x, y - 5, x + 4.5, y + 4.5),
    `<circle cx="${x}" cy="${y - 5}" r="0.9" fill="#111"/>`,
    `<circle cx="${x}" cy="${y + 5}" r="0.9" fill="#111"/>`,
  ];
  if (poles && poles > 1) {
    p.push(line(x - 3.5, y - 2.5, x + 1.5, y - 5.5, 0.5));
    p.push(t(x - 5.2, y - 4.2, String(poles), { size: 3, anchor: "end" }));
  }
  return p.join("");
}

/** Прибор учёта. */
function symbolMeter(x: number, y: number) {
  return (
    line(x, y - 12, x, y - 7) +
    line(x, y + 7, x, y + 12) +
    `<circle cx="${x}" cy="${y}" r="7" fill="none" stroke="#111" stroke-width="0.6"/>` +
    t(x, y + 1.2, "Wh", { size: 3.4, weight: 700 })
  );
}

function deviceSymbol(d: UDevice, x: number, y: number) {
  if (d.kind === "PI") return symbolMeter(x, y);
  if (d.kind === "QS") return symbolSwitch(x, y, d.poles);
  if (d.kind === "QD" || d.kind === "QFD") return symbolRcbo(x, y, d.poles, d.leakage);
  return symbolBreaker(x, y, d.poles);
}

const X_INPUT: Record<string, number> = {
  "main-breaker": SL.xMain,
  meter: SL.xMeter,
  "input-rcbo": SL.xRcbo,
  "input-switch": SL.xSwitch,
};

/** Единая модель → однолинейная схема в стиле эталона. */
export function buildSingleLine(project: UProject): SingleLine {
  const { devices, loads } = project.board;
  const feeders = devices.filter((d) => d.kind === "QF" || d.kind === "QD").filter((d) => loads.some((l) => l.deviceId === d.id));
  const inputs = devices.filter((d) => X_INPUT[d.role] != null);
  const loadOf = new Map(loads.map((l) => [l.deviceId, l]));

  const els: SlElement[] = [];
  const g: string[] = [];

  const lastX = SL.x0 + Math.max(0, feeders.length - 1) * SL.pitch;
  const widthMm = Math.max(lastX, SL.xSource) + 40;
  const heightMm = SL.yLoad + 45;

  // ---------------------------------------------------------------- источник
  g.push(t(SL.xSource, SL.ySource - 4, "L1, L2, L3", { size: 3.6, weight: 700 }));
  for (let i = 0; i < 3; i++)
    g.push(line(SL.xSource - 9 + i * 4, SL.ySource, SL.xSource - 5 + i * 4, SL.ySource - 3, 0.6));
  g.push(line(SL.xSource, SL.ySource, SL.xSource, SL.yInput, 0.6));
  g.push(`<circle cx="${SL.xSource}" cy="${SL.yInput}" r="1" fill="#111"/>`);
  els.push({ kind: "source", label: "L1,L2,L3", xMm: SL.xSource, yMm: SL.ySource });

  // ------------------------------------------------------------ цепочка ввода
  const chain = inputs.slice().sort((a, b) => (X_INPUT[b.role] ?? 0) - (X_INPUT[a.role] ?? 0));
  g.push(line(SL.xSource, SL.yInput, chain.length ? X_INPUT[chain[chain.length - 1]!.role]! : SL.xSwitch, SL.yInput, 0.6));
  chain.forEach((d) => {
    const x = X_INPUT[d.role]!;
    g.push(`<g transform="rotate(-90 ${x} ${SL.yInput})">${deviceSymbol(d, x, SL.yInput)}</g>`);
    const cap = [d.label, d.mark, d.nominalText, d.leakage].filter(Boolean).join(" ");
    g.push(t(x - 9, SL.yInput - 8, cap, { size: 3, anchor: "start", rot: -90 }));
    els.push({ kind: "input", label: d.label, xMm: x, yMm: SL.yInput });
  });

  // спуск от вводного аппарата к шинам
  const dropX = SL.xSwitch;
  g.push(line(dropX, SL.yInput, dropX, SL.yQsDrop, 0.6));
  const inCable = chain.find((d) => d.role === "input-switch")?.cable ?? "";
  if (inCable) g.push(t(dropX - 3, (SL.yInput + SL.yQsDrop) / 2, inCable, { size: 2.9, anchor: "middle", rot: -90 }));
  g.push(line(dropX, SL.yQsDrop, dropX, SL.yBus, 0.6));

  // ------------------------------------------------------------------- шины
  const busX1 = Math.min(dropX, SL.x0 - SL.pitch / 2) - 6;
  const busX2 = lastX + 12;
  const busY = [SL.yBus, SL.yBus + SL.busGap, SL.yBus + SL.busGap * 2];
  ["L1, L2, L3", "N", "PE"].forEach((name, i) => {
    g.push(line(busX1, busY[i]!, busX2, busY[i]!, i === 0 ? 0.9 : 0.6));
    g.push(t(busX2 + 3, busY[i]! + 1.2, name, { size: 3, anchor: "start", weight: 700 }));
  });
  els.push({ kind: "bus", label: "L/N/PE", xMm: busX1, yMm: SL.yBus });

  // -------------------------------------------- колонки отходящих линий
  feeders.forEach((d, i) => {
    const x = SL.x0 + i * SL.pitch;
    const load = loadOf.get(d.id)!;
    g.push(line(x, SL.yBus, x, SL.yDevice - 12, 0.6));
    g.push(`<circle cx="${x}" cy="${SL.yBus}" r="1" fill="#111"/>`);
    g.push(deviceSymbol(d, x, SL.yDevice));
    const cap = [d.label, d.mark, d.nominalText].filter(Boolean).join(" ");
    g.push(t(x - 9, SL.yDevice - 4, cap, { size: 3, anchor: "middle", rot: -90 }));
    g.push(line(x, SL.yDevice + 12, x, SL.yLoad - SL.loadH, 0.6));
    g.push(line(x, SL.yLoad - SL.loadH, x - SL.loadW / 2, SL.yLoad - SL.loadH, 0.6));
    if (d.cable)
      g.push(t(x - 3, (SL.yDevice + 12 + SL.yLoad - SL.loadH) / 2, d.cable, { size: 2.8, anchor: "middle", rot: -90 }));

    // электроприёмник
    const lx = x - SL.loadW / 2;
    g.push(
      `<rect x="${lx - SL.loadW / 2}" y="${SL.yLoad - SL.loadH}" width="${SL.loadW}" height="${SL.loadH}" fill="none" stroke="#111" stroke-width="0.5"/>`,
    );
    const cx = x - SL.loadW / 2;
    g.push(`<circle cx="${cx}" cy="${SL.yLoad - SL.loadH}" r="3.6" fill="#fff" stroke="#111" stroke-width="0.5"/>`);
    g.push(t(cx, SL.yLoad - SL.loadH + 1.2, String(load.number), { size: 3.4, weight: 700 }));
    load.name
      .split(/\s+/)
      .reduce<string[]>((rows, word) => {
        const last = rows[rows.length - 1];
        if (last && (last + " " + word).length <= 16) rows[rows.length - 1] = `${last} ${word}`;
        else rows.push(word);
        return rows;
      }, [])
      .slice(0, 4)
      .forEach((row, ri) => g.push(t(cx, SL.yLoad - SL.loadH + 9 + ri * 4, row, { size: 2.8 })));
    els.push({ kind: "load", label: load.id, xMm: x - SL.loadW / 2, yMm: SL.yLoad });
    els.push({ kind: "device", label: d.label, xMm: x, yMm: SL.yDevice });
  });

  // ------------------------------------------------------------- рамка щита
  const frX1 = busX1 - 6;
  const frX2 = busX2 + 20;
  const frY1 = SL.yInput - 24;
  const frY2 = SL.yBus + SL.busGap * 2 + 8;
  g.push(
    `<rect x="${frX1}" y="${frY1}" width="${frX2 - frX1}" height="${frY2 - frY1}" fill="none" stroke="#111" stroke-width="0.5" stroke-dasharray="4 2"/>`,
  );
  g.push(t(frX1 + 6, frY1 + 6, project.board.name, { size: 4, anchor: "start", weight: 700 }));
  els.push({ kind: "frame", label: project.board.name, xMm: frX1, yMm: frY1 });

  // -------------------------------------------------- боковик (наименования)
  const sideRows: [number, string][] = [
    [SL.yDevice, "Аппарат защиты"],
    [(SL.yDevice + SL.yLoad - SL.loadH) / 2, "Кабель"],
    [SL.yLoad - SL.loadH / 2, "Электроприёмник"],
  ];
  const sideX = SL.xSide;
  sideRows.forEach(([y, label]) => g.push(t(sideX, y, label, { size: 3.4, anchor: "middle", weight: 700 })));
  g.push(line(sideX + 42, SL.yBus + SL.busGap * 2 + 8, sideX + 42, SL.yLoad + 4, 0.4, "#999", "3 2"));

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${widthMm} ${heightMm}" width="100%" role="img" aria-label="Однолинейная схема">
<rect x="0" y="0" width="${widthMm}" height="${heightMm}" fill="#ffffff"/>
${g.join("\n")}
</svg>`;

  return { svg, elements: els, columns: feeders.length, widthMm, heightMm };
}
