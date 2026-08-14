/**
 * SPEC -> ELECTRICAL MODEL.
 * Единый источник данных для однолинейной схемы, компоновки и визуализации щита.
 * Никакого «зашитого» оборудования: всё берётся из спецификации / линий проекта.
 */

import type { PanelDesign, PanelSpecRow } from "@/lib/panel";
import { detectCategory, detectPoles, type DeviceCategory } from "@/lib/panel-visual";

export type Conductor = "L1" | "L2" | "L3" | "N" | "PE";

/** Стандартная цветовая маркировка жил (используется только для проводников). */
export const WIRE_COLOR: Record<Conductor, string> = {
  L1: "#7a4a21",
  L2: "#111111",
  L3: "#8c8c8c",
  N: "#1450c8",
  PE: "#2f9e41",
};

export type MainDeviceKind =
  | "meter"
  | "input"
  | "spd"
  | "relay"
  | "contactor"
  | "rcd"
  | "other";

export type ProjectDevice = {
  id: string;
  kind: MainDeviceKind | "breaker" | "rcbo";
  category: DeviceCategory;
  manufacturer: string;
  model: string;
  name: string;
  rating: string;
  ratedCurrent: number;
  leakage: string;
  characteristic: string;
  poles: number;
  modules: number;
  voltage: string;
  phase: string;
  circuitId: string;
  position: number;
};

export type ProjectCircuit = {
  id: string;
  mark: string;
  name: string;
  powerKw: number;
  currentA: number;
  breaker: string;
  characteristic: string;
  ratedCurrent: number;
  poles: number;
  phase: Conductor;
  cable: string;
  rcd: string;
  modules: number;
};

export type PanelProject = {
  title: string;
  object: string;
  input: {
    voltage: string;
    phases: 1 | 3;
    powerKw: number;
    calculatedKw: number;
    cable: string;
    mainBreaker: string;
    grounding: string;
    ip: string;
  };
  busbars: Conductor[];
  mainDevices: ProjectDevice[];
  circuits: ProjectCircuit[];
  devices: ProjectDevice[];
  enclosure: {
    modules: number;
    rowCapacity: number;
    rows: number;
    used: number;
    reserve: number;
    name: string;
  };
};

const num = (v: unknown) => {
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

function ratedFrom(text: string): number {
  const m = String(text).match(/(\d{1,3})\s*(?:А|A)\b/i) ?? String(text).match(/[СCBDсв](\d{1,3})/i);
  return m ? Number(m[1]) : 0;
}

function characteristicFrom(text: string): string {
  const m = String(text).match(/\b([BCDbcdСс])\s?\d{1,3}\b/);
  return m ? m[1]!.toUpperCase().replace("С", "C") : "";
}

function leakageFrom(text: string): string {
  const m = String(text).match(/(\d{2,3})\s*(?:мА|mA)/i);
  return m ? `${m[1]} мА` : "";
}

function kindOf(cat: DeviceCategory, text: string): ProjectDevice["kind"] {
  if (/счётчик|счетчик|meter|прибор учёта|прибор учета/i.test(text)) return "meter";
  switch (cat) {
    case "input":
      return "input";
    case "spd":
      return "spd";
    case "relay":
      return "relay";
    case "contactor":
      return "contactor";
    case "rcd":
      return "rcd";
    case "rcbo":
      return "rcbo";
    case "breaker":
      return "breaker";
    default:
      return "other";
  }
}

/** Все модульные аппараты спецификации, развёрнутые по количеству. */
export function specDevices(rows: PanelSpecRow[]): ProjectDevice[] {
  const out: ProjectDevice[] = [];
  rows.forEach((r, i) => {
    const modules = Math.max(0, Math.round(num(r.modules)));
    const qty = Math.max(0, Math.round(num(r.qty)));
    if (!modules || !qty) return;
    const text = `${r.name ?? ""} ${r.model ?? ""} ${r.rating ?? ""}`;
    const category = detectCategory(r);
    for (let c = 0; c < qty; c++) {
      out.push({
        id: `sp-${i}-${c}`,
        kind: kindOf(category, text),
        category,
        manufacturer: (r.manufacturer ?? "").trim(),
        model: (r.model ?? "").trim(),
        name: (r.name ?? "").trim(),
        rating: (r.rating ?? "").trim(),
        ratedCurrent: ratedFrom(text),
        leakage: leakageFrom(text),
        characteristic: characteristicFrom(text),
        poles: detectPoles({ ...r, modules }),
        modules,
        voltage: "",
        phase: "",
        circuitId: "",
        position: Number(r.pos) || i + 1,
      });
    }
  });
  return out;
}

const MAIN_ORDER: ProjectDevice["kind"][] = [
  "input",
  "meter",
  "spd",
  "relay",
  "contactor",
  "rcd",
];

/** Собирает электрическую модель проекта из спроектированного щита. */
export function buildProject(design: PanelDesign, title = ""): PanelProject {
  const s = design.summary;
  const phases: 1 | 3 = String(s?.supply ?? "").includes("400") ? 3 : 1;
  const rows = [...(design.spec ?? []), ...(design.materials ?? [])];
  const devices = specDevices(rows);

  const phaseNames: Conductor[] = phases === 3 ? ["L1", "L2", "L3"] : ["L1"];
  const busbars: Conductor[] = [...phaseNames, "N", "PE"];

  const circuits: ProjectCircuit[] = (design.lines ?? []).map((l, i) => {
    const ph = String(l.phase ?? "").toUpperCase().replace("L", "L");
    const phase = (busbars.includes(ph as Conductor) && ph !== "N" && ph !== "PE"
      ? (ph as Conductor)
      : phaseNames[i % phaseNames.length]!) as Conductor;
    return {
      id: l.mark || `W${i + 1}`,
      mark: l.mark || `W${i + 1}`,
      name: l.name ?? "",
      powerKw: num(l.power_kw),
      currentA: num(l.current_a),
      breaker: l.breaker ?? "",
      characteristic: l.curve || characteristicFrom(l.breaker ?? ""),
      ratedCurrent: ratedFrom(l.breaker ?? ""),
      poles: Math.max(1, Math.round(num(l.poles)) || 1),
      phase,
      cable: l.cable ?? "",
      rcd: l.rcd ?? "",
      modules: Math.max(1, Math.round(num(l.modules)) || 1),
    };
  });

  // Вводная цепочка — только те аппараты, что реально есть в спецификации.
  const mainDevices = devices
    .filter((d) => MAIN_ORDER.includes(d.kind as MainDeviceKind))
    .sort(
      (a, b) =>
        MAIN_ORDER.indexOf(a.kind as MainDeviceKind) -
        MAIN_ORDER.indexOf(b.kind as MainDeviceKind),
    )
    // по одному представителю каждого аппарата в цепочке ввода
    .filter(
      (d, i, arr) =>
        arr.findIndex((x) => x.kind === d.kind && x.model === d.model) === i,
    );

  const used = Math.round(num(s?.used_modules)) || devices.reduce((a, d) => a + d.modules, 0);
  const modules = Math.round(num(s?.enclosure_modules)) || 0;
  const rowCapacity = modules >= 72 ? 24 : modules >= 36 ? 18 : 12;

  return {
    title: title || s?.object_type || "Распределительный щит",
    object: s?.object_type ?? "",
    input: {
      voltage: phases === 3 ? "400/230 В, 50 Гц" : "230 В, 50 Гц",
      phases,
      powerKw: num(s?.total_power_kw),
      calculatedKw: num(s?.calculated_power_kw),
      cable:
        rows.find((r) => /кабель|ввод/i.test(r.name ?? "") && /ввод/i.test(r.name ?? ""))
          ?.model ?? "",
      mainBreaker: s?.main_breaker ?? "",
      grounding: s?.grounding ?? "",
      ip: s?.ip ?? "",
    },
    busbars,
    mainDevices,
    circuits,
    devices,
    enclosure: {
      modules: modules || Math.ceil(used / rowCapacity) * rowCapacity,
      rowCapacity,
      rows: Math.max(1, Math.ceil((modules || used) / rowCapacity)),
      used,
      reserve: Math.max(0, (modules || used) - used),
      name: s?.enclosure ?? "",
    },
  };
}

export type ProjectIssue = { level: "error" | "warn"; text: string };

/** Проверка перед генерацией чертежей (п. 13 ТЗ). */
export function validateProject(p: PanelProject): ProjectIssue[] {
  const out: ProjectIssue[] = [];
  if (!p.circuits.length) out.push({ level: "error", text: "В проекте нет отходящих групп." });
  if (!p.input.mainBreaker)
    out.push({ level: "error", text: "Не задан вводной аппарат защиты." });

  for (const c of p.circuits) {
    const who = `${c.mark} «${c.name || "без названия"}»`;
    if (!c.breaker) out.push({ level: "error", text: `Группа ${who}: не указан автомат.` });
    if (!c.ratedCurrent)
      out.push({ level: "error", text: `Группа ${who}: не указан номинал автомата.` });
    if (!c.cable) out.push({ level: "error", text: `Группа ${who}: не указан кабель.` });
    if (!c.phase) out.push({ level: "error", text: `Группа ${who}: не назначена фаза.` });
    if (c.ratedCurrent && c.currentA && c.currentA > c.ratedCurrent * 1.05)
      out.push({
        level: "warn",
        text: `Группа ${who}: расчётный ток ${c.currentA} А выше номинала автомата ${c.ratedCurrent} А.`,
      });
  }

  if (p.input.phases === 3) {
    const per = new Map<string, number>();
    for (const c of p.circuits) per.set(c.phase, (per.get(c.phase) ?? 0) + c.powerKw);
    const used = ["L1", "L2", "L3"].filter((f) => (per.get(f) ?? 0) > 0);
    if (used.length < 3 && p.circuits.length >= 3)
      out.push({ level: "warn", text: "Нагрузка распределена не по всем фазам L1/L2/L3." });
    const vals = ["L1", "L2", "L3"].map((f) => per.get(f) ?? 0);
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    if (max > 0 && max - min > max * 0.4)
      out.push({ level: "warn", text: "Перекос фаз более 40% — проверьте фазировку групп." });
  }

  if (p.busbars.includes("N") === false || p.busbars.includes("PE") === false)
    out.push({ level: "error", text: "Отсутствует шина N или PE." });

  if (p.enclosure.used > p.enclosure.modules)
    out.push({
      level: "error",
      text: `Переполнение корпуса: занято ${p.enclosure.used} из ${p.enclosure.modules} модулей.`,
    });

  return out;
}
