/**
 * Техническая визуализация монтажа щита (компоновка + реальные проводники).
 * Масштаб 1:1 в миллиметрах: шаг модуля 17,5 мм, высота лицевой части 45 мм.
 */

import {
  WIRE_COLOR,
  type Conductor,
  type PanelProject,
  type ProjectDevice,
} from "./project-model";
import { esc } from "./single-line";

export const MODULE_MM = 17.5;
export const DEV_H = 45;
const RAIL_GAP = 42; // расстояние между лицевыми частями соседних реек
const PAD_X = 22;
const PAD_TOP = 34;

const ORDER: ProjectDevice["kind"][] = [
  "input",
  "meter",
  "spd",
  "relay",
  "contactor",
  "rcd",
  "rcbo",
  "breaker",
  "other",
];

export type PlacedDev = ProjectDevice & { rail: number; offset: number; phase: Conductor | "" };

export type Layout = {
  rails: { index: number; used: number; capacity: number; items: PlacedDev[] }[];
  capacity: number;
  used: number;
  reserve: number;
  total: number;
};

/** Раскладка аппаратов спецификации по DIN-рейкам без наложений. */
export function layoutPanel(p: PanelProject): Layout {
  const cap = Math.max(4, p.enclosure.rowCapacity);
  const devices = [...p.devices].sort((a, b) => {
    const d = ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind);
    return d !== 0 ? d : a.position - b.position;
  });

  // фазировка групповых аппаратов берётся из групп проекта
  const phaseQueue = p.circuits.map((c) => c.phase);
  let qi = 0;

  const rails: Layout["rails"] = [{ index: 1, used: 0, capacity: cap, items: [] }];
  for (const d of devices) {
    const wmod = Math.min(Math.max(1, d.modules), cap);
    let rail = rails[rails.length - 1]!;
    if (rail.used + wmod > cap) {
      rail = { index: rails.length + 1, used: 0, capacity: cap, items: [] };
      rails.push(rail);
    }
    const phase: Conductor | "" =
      d.kind === "breaker" || d.kind === "rcbo"
        ? (phaseQueue[qi++ % Math.max(1, phaseQueue.length)] ?? "L1")
        : "";
    rail.items.push({ ...d, rail: rail.index, offset: rail.used, phase });
    rail.used += wmod;
  }

  const used = rails.reduce((s, r) => s + r.used, 0);
  const total = Math.max(p.enclosure.modules, rails.length * cap);
  return { rails, capacity: cap, used, reserve: Math.max(0, total - used), total };
}

const L = (x1: number, y1: number, x2: number, y2: number, c = "#000", w = 0.35) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;

const R = (x: number, y: number, w: number, h: number, sw = 0.35, fill = "none") =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="#000" stroke-width="${sw}"/>`;

const T = (
  x: number,
  y: number,
  t: unknown,
  o: { size?: number; anchor?: "start" | "middle" | "end"; bold?: boolean; rotate?: number } = {},
) =>
  `<text x="${x}" y="${y}" font-size="${o.size ?? 2.6}" text-anchor="${o.anchor ?? "start"}" fill="#000"${
    o.bold ? ' font-weight="bold"' : ""
  }${o.rotate ? ` transform="rotate(${o.rotate} ${x} ${y})"` : ""}>${esc(t)}</text>`;

function deviceFace(d: PlacedDev, x: number, y: number): string {
  const w = Math.max(1, d.modules) * MODULE_MM;
  const p: string[] = [];
  p.push(R(x, y, w, DEV_H, 0.4, "#ffffff"));
  // разделение на модули
  for (let i = 1; i < d.modules; i++) p.push(L(x + i * MODULE_MM, y, x + i * MODULE_MM, y + DEV_H, "#000", 0.15));
  // клеммные зоны
  p.push(L(x, y + 9, x + w, y + 9, "#000", 0.2));
  p.push(L(x, y + DEV_H - 9, x + w, y + DEV_H - 9, "#000", 0.2));
  for (let i = 0; i < d.modules; i++) {
    const cx = x + i * MODULE_MM + MODULE_MM / 2;
    p.push(`<circle cx="${cx}" cy="${y + 4.5}" r="1.6" fill="none" stroke="#000" stroke-width="0.25"/>`);
    p.push(`<circle cx="${cx}" cy="${y + DEV_H - 4.5}" r="1.6" fill="none" stroke="#000" stroke-width="0.25"/>`);
  }
  // рычаг / индикация по типу аппарата
  const lx = x + w / 2;
  if (d.kind === "breaker" || d.kind === "rcbo" || d.kind === "input") {
    p.push(R(lx - 3, y + 17, 6, 11, 0.3));
    p.push(L(lx - 3, y + 22.5, lx + 3, y + 22.5, "#000", 0.25));
  } else if (d.kind === "rcd") {
    p.push(R(lx - 3, y + 15, 6, 9, 0.3));
    p.push(R(lx - 3.5, y + 27, 7, 5, 0.3));
    p.push(T(lx, y + 30.8, "T", { size: 2.6, anchor: "middle", bold: true }));
  } else if (d.kind === "relay" || d.kind === "meter") {
    p.push(R(x + 2, y + 14, w - 4, 9, 0.3));
    p.push(T(x + w / 2, y + 20.4, d.kind === "meter" ? "kWh" : "U", { size: 2.6, anchor: "middle" }));
  } else if (d.kind === "spd") {
    p.push(R(lx - 4, y + 14, 8, 10, 0.3));
    p.push(L(lx - 4, y + 24, lx + 4, y + 14, "#000", 0.3));
  } else if (d.kind === "contactor") {
    p.push(R(x + 2, y + 15, w - 4, 10, 0.3));
    p.push(T(x + w / 2, y + 21.6, "KM", { size: 2.6, anchor: "middle" }));
  }
  // маркировка
  const label = [d.manufacturer, d.model].filter(Boolean).join(" ");
  const rating = [d.rating || (d.ratedCurrent ? `${d.ratedCurrent}A` : ""), d.leakage]
    .filter(Boolean)
    .join(" ");
  if (w >= 30) {
    p.push(T(x + w / 2, y + 37, label.slice(0, Math.floor(w / 1.5)), { size: 2.1, anchor: "middle" }));
    p.push(T(x + w / 2, y + 40.5, rating, { size: 2.1, anchor: "middle", bold: true }));
  } else {
    p.push(T(x + w / 2, y + 40, `${label} ${rating}`.slice(0, 26), { size: 1.9, anchor: "middle", rotate: -90 }));
  }
  return p.join("");
}

/** Полный технический чертёж монтажа щита. */
export function buildAssemblySvg(p: PanelProject): string {
  const lay = layoutPanel(p);
  const innerW = lay.capacity * MODULE_MM;
  const w = innerW + PAD_X * 2 + 56;
  const railsH = lay.rails.length * (DEV_H + RAIL_GAP);
  const busZone = 46;
  const h = PAD_TOP + railsH + busZone + 34;

  const x0 = PAD_X;
  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}mm" height="${h}mm" viewBox="0 0 ${w} ${h}" font-family="Arial, Helvetica, sans-serif" shape-rendering="geometricPrecision">`,
    `<rect width="${w}" height="${h}" fill="#ffffff"/>`,
    T(x0, 8, `Монтажная схема щита ${p.enclosure.name || `${lay.total} мод.`}`, { size: 4, bold: true }),
    T(x0, 13.5, `${p.object || p.title} · ${p.input.voltage} · ${p.input.grounding} · ${p.input.ip}`, {
      size: 2.8,
    }),
    T(x0, 19, `Всего модулей: ${lay.total} · Занято: ${lay.used} · Резерв: ${lay.reserve} · DIN-реек: ${lay.rails.length}`, {
      size: 2.8,
      bold: true,
    }),
  ];

  // корпус
  const caseX = x0 - 8;
  const caseY = PAD_TOP - 12;
  const caseW = innerW + 16;
  const caseH = railsH + busZone + 6;
  parts.push(R(caseX, caseY, caseW, caseH, 0.8));
  parts.push(R(caseX + 3, caseY + 3, caseW - 6, caseH - 6, 0.25));

  const railY: number[] = [];
  lay.rails.forEach((rail, i) => {
    const y = PAD_TOP + i * (DEV_H + RAIL_GAP);
    railY.push(y);
    // DIN-рейка
    parts.push(R(x0, y + DEV_H - 4, innerW, 4, 0.4, "#f2f2f2"));
    parts.push(L(x0, y + DEV_H - 2, x0 + innerW, y + DEV_H - 2, "#000", 0.15));
    parts.push(T(caseX + 5.5, y + DEV_H / 2, `DIN ${rail.index}`, { size: 2.4, rotate: -90, anchor: "middle" }));
    parts.push(
      T(x0 + innerW + 2, y + DEV_H - 6, `${rail.used}/${rail.capacity} мод.`, { size: 2.3 }),
    );
    // свободные модули
    if (rail.used < rail.capacity) {
      const fx = x0 + rail.used * MODULE_MM;
      const fw = (rail.capacity - rail.used) * MODULE_MM;
      parts.push(
        `<rect x="${fx}" y="${y}" width="${fw}" height="${DEV_H}" fill="none" stroke="#000" stroke-width="0.2" stroke-dasharray="1.5 1.5"/>`,
      );
      parts.push(T(fx + fw / 2, y + DEV_H / 2, "резерв", { size: 2.2, anchor: "middle" }));
    }
    for (const d of rail.items) parts.push(deviceFace(d, x0 + d.offset * MODULE_MM, y));
  });

  // Шины N и PE внизу корпуса
  const busY = PAD_TOP + railsH + 8;
  const nY = busY;
  const peY = busY + 14;
  const drawBus = (y: number, label: string, color: string) => {
    parts.push(R(x0, y, innerW, 6, 0.4, "#ffffff"));
    const n = Math.max(6, Math.floor(innerW / 8));
    for (let i = 0; i < n; i++) {
      const cx = x0 + 4 + (i * (innerW - 8)) / (n - 1);
      parts.push(`<circle cx="${cx}" cy="${y + 3}" r="1.5" fill="none" stroke="#000" stroke-width="0.25"/>`);
    }
    parts.push(`<rect x="${x0}" y="${y}" width="4" height="6" fill="${color}"/>`);
    parts.push(T(x0 + innerW + 2, y + 4.2, label, { size: 2.6, bold: true }));
  };
  drawBus(nY, "Шина N", WIRE_COLOR.N);
  drawBus(peY, "Шина PE", WIRE_COLOR.PE);

  // Гребенчатая шина фаз над каждой рейкой + реальные проводники
  lay.rails.forEach((rail, i) => {
    const y = railY[i]!;
    const combY = y - 8;
    const phases: Conductor[] = p.input.phases === 3 ? ["L1", "L2", "L3"] : ["L1"];
    phases.forEach((ph, k) => {
      const cy = combY - k * 3;
      parts.push(L(x0, cy, x0 + rail.used * MODULE_MM, cy, WIRE_COLOR[ph], 0.7));
      parts.push(T(x0 - 3, cy + 0.9, ph, { size: 2.2, anchor: "end" }));
    });
    for (const d of rail.items) {
      const dx = x0 + d.offset * MODULE_MM;
      const wmm = Math.max(1, d.modules) * MODULE_MM;
      const ph: Conductor = (d.phase || "L1") as Conductor;
      const phIdx = Math.max(0, phases.indexOf(ph));
      // фазный проводник к верхней клемме
      parts.push(L(dx + MODULE_MM / 2, combY - phIdx * 3, dx + MODULE_MM / 2, y + 4.5, WIRE_COLOR[ph], 0.7));
      // нулевой проводник от нижней клеммы к шине N
      if (d.kind === "breaker" || d.kind === "rcd" || d.kind === "rcbo" || d.kind === "input") {
        const nx = dx + wmm - MODULE_MM / 2;
        const drop = y + DEV_H + 4 + (i === lay.rails.length - 1 ? 0 : 6);
        parts.push(L(nx, y + DEV_H - 4.5, nx, drop, WIRE_COLOR.N, 0.6));
        parts.push(L(nx, drop, x0 + innerW - 6, drop, WIRE_COLOR.N, 0.6));
        parts.push(L(x0 + innerW - 6, drop, x0 + innerW - 6, nY + 3, WIRE_COLOR.N, 0.6));
      }
    }
    // PE от корпуса/группы
    parts.push(L(x0 + innerW - 12, y + DEV_H + 2, x0 + innerW - 12, peY + 3, WIRE_COLOR.PE, 0.6));
  });

  // Вводной кабель
  parts.push(L(caseX - 12, caseY + 6, x0, caseY + 6, "#000", 0.5));
  parts.push(T(caseX - 12, caseY + 3.5, `Ввод ${p.input.cable || p.input.mainBreaker}`, { size: 2.4 }));

  // Легенда проводников
  const legY = h - 20;
  parts.push(T(x0, legY - 3, "Маркировка проводников:", { size: 2.6, bold: true }));
  (["L1", "L2", "L3", "N", "PE"] as Conductor[])
    .filter((c) => p.input.phases === 3 || !["L2", "L3"].includes(c))
    .forEach((c, i) => {
      const lx = x0 + i * 34;
      parts.push(L(lx, legY + 2, lx + 10, legY + 2, WIRE_COLOR[c], 1));
      parts.push(T(lx + 12, legY + 3, c, { size: 2.4 }));
    });
  parts.push(T(x0, h - 6, "S&M ELECTRIC · монтажная визуализация построена по спецификации проекта", { size: 2.3 }));

  parts.push("</svg>");
  return parts.join("\n");
}
