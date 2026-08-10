import type {
  ElKind,
  PageFormat,
  Port,
  SchDoc,
  SchElement,
  WireKind,
} from "./types";

export const WIRE_COLORS: Record<WireKind, string> = {
  L1: "#8b5a2b",
  L2: "#111827",
  L3: "#9ca3af",
  N: "#2563eb",
  PE: "#65a30d",
  CTRL: "#dc2626",
};

export const WIRE_KINDS: WireKind[] = ["L1", "L2", "L3", "N", "PE", "CTRL"];

/** Page sizes in mm. */
export const PAGE_MM: Record<PageFormat, [number, number]> = {
  A4: [210, 297],
  A3: [297, 420],
  A2: [420, 594],
  A1: [594, 841],
};
/** Drawing units per mm. */
export const PX_PER_MM = 4;

export function pageSize(doc: SchDoc) {
  const [a, b] = PAGE_MM[doc.page.format];
  const w = (doc.page.landscape ? b : a) * PX_PER_MM;
  const h = (doc.page.landscape ? a : b) * PX_PER_MM;
  return { w, h };
}

export type LibDef = {
  type: string;
  label: string;
  group: string;
  kind: ElKind;
  prefix: string;
  poles: number;
  modules: number;
  w?: number;
  h?: number;
  rating?: string;
};

export const LIBRARY: LibDef[] = [
  // Вводные аппараты
  { type: "main_1p", label: "Вводной автомат 1P", group: "Вводные аппараты", kind: "input", prefix: "QF", poles: 1, modules: 1, rating: "C25" },
  { type: "main_2p", label: "Вводной автомат 2P", group: "Вводные аппараты", kind: "input", prefix: "QF", poles: 2, modules: 2, rating: "C40" },
  { type: "main_3p", label: "Вводной автомат 3P", group: "Вводные аппараты", kind: "input", prefix: "QF", poles: 3, modules: 3, rating: "C25" },
  { type: "main_4p", label: "Вводной автомат 4P", group: "Вводные аппараты", kind: "input", prefix: "QF", poles: 4, modules: 4, rating: "C25" },
  { type: "switch_qs", label: "Рубильник", group: "Вводные аппараты", kind: "input", prefix: "QS", poles: 3, modules: 3, rating: "63A" },
  { type: "load_break", label: "Выключатель нагрузки", group: "Вводные аппараты", kind: "input", prefix: "QS", poles: 2, modules: 2, rating: "63A" },

  // Защита
  { type: "mcb_1p", label: "Автомат 1P", group: "Защита", kind: "breaker", prefix: "QF", poles: 1, modules: 1, rating: "C16" },
  { type: "mcb_2p", label: "Автомат 2P", group: "Защита", kind: "breaker", prefix: "QF", poles: 2, modules: 2, rating: "C16" },
  { type: "mcb_3p", label: "Автомат 3P", group: "Защита", kind: "breaker", prefix: "QF", poles: 3, modules: 3, rating: "C16" },
  { type: "mcb_4p", label: "Автомат 4P", group: "Защита", kind: "breaker", prefix: "QF", poles: 4, modules: 4, rating: "C16" },
  { type: "rcd_2p", label: "УЗО 2P", group: "Защита", kind: "rcd", prefix: "VD", poles: 2, modules: 2, rating: "40A/30мА" },
  { type: "rcd_4p", label: "УЗО 4P", group: "Защита", kind: "rcd", prefix: "VD", poles: 4, modules: 4, rating: "40A/30мА" },
  { type: "rcbo", label: "Дифавтомат", group: "Защита", kind: "rcd", prefix: "VD", poles: 2, modules: 2, rating: "C16/30мА" },
  { type: "spd", label: "УЗИП", group: "Защита", kind: "rcd", prefix: "FV", poles: 4, modules: 4, rating: "T2" },

  // Управление
  { type: "voltage_relay", label: "Реле напряжения", group: "Управление", kind: "control", prefix: "KV", poles: 1, modules: 2, rating: "63A" },
  { type: "contactor", label: "Контактор", group: "Управление", kind: "control", prefix: "KM", poles: 4, modules: 3, rating: "40A" },
  { type: "relay", label: "Реле", group: "Управление", kind: "control", prefix: "KL", poles: 1, modules: 1, rating: "" },
  { type: "timer", label: "Таймер", group: "Управление", kind: "control", prefix: "KT", poles: 1, modules: 2, rating: "" },
  { type: "selector", label: "Переключатель", group: "Управление", kind: "control", prefix: "SA", poles: 1, modules: 1, rating: "" },

  // Соединения
  { type: "src_l1", label: "L1", group: "Соединения", kind: "terminal", prefix: "XP", poles: 1, modules: 0, w: 60, h: 34 },
  { type: "src_l2", label: "L2", group: "Соединения", kind: "terminal", prefix: "XP", poles: 1, modules: 0, w: 60, h: 34 },
  { type: "src_l3", label: "L3", group: "Соединения", kind: "terminal", prefix: "XP", poles: 1, modules: 0, w: 60, h: 34 },
  { type: "src_n", label: "N", group: "Соединения", kind: "terminal", prefix: "XP", poles: 1, modules: 0, w: 60, h: 34 },
  { type: "src_pe", label: "PE", group: "Соединения", kind: "terminal", prefix: "XP", poles: 1, modules: 0, w: 60, h: 34 },
  { type: "bus_n", label: "Шина N", group: "Соединения", kind: "bus", prefix: "XN", poles: 1, modules: 0, w: 420, h: 26 },
  { type: "bus_pe", label: "Шина PE", group: "Соединения", kind: "bus", prefix: "XPE", poles: 1, modules: 0, w: 420, h: 26 },
  { type: "bus_l", label: "Шина L1/L2/L3", group: "Соединения", kind: "bus", prefix: "XL", poles: 3, modules: 0, w: 420, h: 26 },
  { type: "terminal", label: "Клеммник", group: "Соединения", kind: "terminal", prefix: "XT", poles: 1, modules: 1, w: 110, h: 44 },
  { type: "junction_box", label: "Распределительная коробка", group: "Соединения", kind: "terminal", prefix: "XB", poles: 1, modules: 0, w: 120, h: 56 },

  // Нагрузки
  { type: "load_socket", label: "Розетка", group: "Нагрузки", kind: "load", prefix: "EL", poles: 1, modules: 0 },
  { type: "load_light", label: "Освещение", group: "Нагрузки", kind: "load", prefix: "EL", poles: 1, modules: 0 },
  { type: "load_boiler", label: "Бойлер", group: "Нагрузки", kind: "load", prefix: "EK", poles: 1, modules: 0 },
  { type: "load_stove", label: "Электроплита", group: "Нагрузки", kind: "load", prefix: "EK", poles: 2, modules: 0 },
  { type: "load_washer", label: "Стиральная машина", group: "Нагрузки", kind: "load", prefix: "EM", poles: 1, modules: 0 },
  { type: "load_pump", label: "Насос", group: "Нагрузки", kind: "load", prefix: "EM", poles: 1, modules: 0 },
  { type: "load_heater", label: "Котёл", group: "Нагрузки", kind: "load", prefix: "EK", poles: 1, modules: 0 },
  { type: "load_ac", label: "Кондиционер", group: "Нагрузки", kind: "load", prefix: "EM", poles: 1, modules: 0 },
  { type: "load_reserve", label: "Резервная линия", group: "Нагрузки", kind: "load", prefix: "EL", poles: 1, modules: 0 },
];

export const LIB_GROUPS = [
  "Вводные аппараты",
  "Защита",
  "Управление",
  "Соединения",
  "Нагрузки",
];

export const DEF_W = 110;
export const DEF_H = 58;

export function defOf(type: string): LibDef {
  return LIBRARY.find((l) => l.type === type) ?? LIBRARY[6]!;
}

export function kindOf(type: string): ElKind {
  return defOf(type).kind;
}

/** Catalog for the manufacturer → model → rating binding. */
export const CATALOG: Record<string, Record<string, string[]>> = {
  ABB: {
    "S201 (1P)": ["B10", "C10", "C16", "C20", "C25", "C32"],
    "S203 (3P)": ["C16", "C20", "C25", "C32", "C40", "C50"],
    "FH202 (УЗО 2P)": ["25A/30мА", "40A/30мА", "63A/30мА"],
    "F204 (УЗО 4P)": ["40A/30мА", "63A/30мА", "63A/100мА"],
    "OVR T2": ["T2 40kA"],
  },
  Schneider: {
    "Easy9 1P": ["C10", "C16", "C20", "C25"],
    "Acti9 iC60 3P": ["C16", "C25", "C32", "C40"],
    "Acti9 iID 4P": ["40A/30мА", "63A/30мА"],
  },
  Hager: {
    "MY 1P": ["C10", "C16", "C20", "C25"],
    "CD 4P": ["40A/30мА", "63A/30мА"],
  },
  IEK: {
    "ВА47-29 1P": ["C10", "C16", "C20", "C25"],
    "ВА47-29 3P": ["C16", "C25", "C32", "C40"],
    "ВД1-63 4P": ["40A/30мА", "63A/30мА"],
  },
  EKF: {
    "PROxima 1P": ["C10", "C16", "C20", "C25"],
    "ОПС1 УЗИП": ["T2 40kA"],
  },
  "Реле и автоматика": {
    "УЗМ-51М": ["63A"],
    "РН-113": ["63A"],
    "КМ-103": ["25A", "40A", "63A"],
  },
};

/** Wire assignment per pole. */
function poleWires(el: SchElement): WireKind[] {
  const t = el.type;
  if (t === "src_l1") return ["L1"];
  if (t === "src_l2") return ["L2"];
  if (t === "src_l3") return ["L3"];
  if (t === "src_n") return ["N"];
  if (t === "src_pe") return ["PE"];
  if (t === "bus_n") return ["N"];
  if (t === "bus_pe") return ["PE"];
  if (t === "bus_l") return ["L1", "L2", "L3"];
  const p = Math.max(1, el.poles);
  if (p === 1) return [(["L1", "L2", "L3"].includes(el.phase) ? el.phase : "L1") as WireKind];
  if (p === 2) return ["L1", "N"];
  if (p === 3) return ["L1", "L2", "L3"];
  return ["L1", "L2", "L3", "N"];
}

/** Connection points of an element for the given display mode. */
export function portsOf(el: SchElement, mode: "single" | "multi"): Port[] {
  const kind = kindOf(el.type);
  const ports: Port[] = [];
  const spread = (n: number, i: number) => (el.w * (i + 1)) / (n + 1);

  if (kind === "bus") {
    const taps = 8;
    const wires = poleWires(el);
    ports.push({
      id: "IN",
      kind: "in",
      wire: wires[0]!,
      x: el.x,
      y: el.y + el.h / 2,
      label: wires.join("/"),
    });
    for (let i = 0; i < taps; i++) {
      ports.push({
        id: `T${i + 1}`,
        kind: "out",
        wire: wires[i % wires.length]!,
        x: el.x + ((i + 1) * el.w) / (taps + 1),
        y: el.y + el.h,
        label: wires[i % wires.length]!,
      });
    }
    return ports;
  }

  const wires = poleWires(el);
  const ins = mode === "single" ? ["IN"] : wires.map((_, i) => `I${i + 1}`);
  const outs = mode === "single" ? ["OUT"] : wires.map((_, i) => `O${i + 1}`);

  ins.forEach((id, i) => {
    ports.push({
      id,
      kind: "in",
      wire: mode === "single" ? wires[0]! : wires[i]!,
      x: el.x + spread(ins.length, i),
      y: el.y,
      label: mode === "single" ? wires.join("/") : wires[i]!,
    });
  });
  if (kind !== "load") {
    outs.forEach((id, i) => {
      ports.push({
        id,
        kind: "out",
        wire: mode === "single" ? wires[0]! : wires[i]!,
        x: el.x + spread(outs.length, i),
        y: el.y + el.h,
        label: mode === "single" ? wires.join("/") : wires[i]!,
      });
    });
  }
  return ports;
}

export function findPort(
  el: SchElement,
  portId: string,
  mode: "single" | "multi",
): Port | undefined {
  const list = portsOf(el, mode);
  return (
    list.find((p) => p.id === portId) ??
    list.find((p) => p.kind === (portId.startsWith("I") ? "in" : "out"))
  );
}

function esc(s: string) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Pure SVG markup of one element (used by the canvas and by exports). */
export function elementSvg(
  el: SchElement,
  doc: SchDoc,
  selected = false,
): string {
  const kind = kindOf(el.type);
  const stroke = selected ? "#2563eb" : "#111827";
  const sw = selected ? 2 : 1.4;
  const parts: string[] = [];
  parts.push(`<g transform="translate(${el.x},${el.y})">`);

  if (kind === "bus") {
    parts.push(
      `<rect x="0" y="0" width="${el.w}" height="${el.h}" fill="#f8fafc" stroke="${stroke}" stroke-width="${sw}"/>`,
      `<line x1="6" y1="${el.h / 2}" x2="${el.w - 6}" y2="${el.h / 2}" stroke="${
        el.type === "bus_n" ? doc.colors.N : el.type === "bus_pe" ? doc.colors.PE : doc.colors.L1
      }" stroke-width="3"/>`,
      `<text x="8" y="${el.h / 2 - 5}" font-size="11" font-family="Arial" fill="#111827">${esc(el.ref)} · ${esc(el.name)}</text>`,
    );
  } else if (kind === "load") {
    parts.push(
      `<rect x="0" y="0" width="${el.w}" height="${el.h}" rx="3" fill="#ffffff" stroke="${stroke}" stroke-width="${sw}"/>`,
      `<circle cx="${el.w / 2}" cy="${el.h / 2 - 4}" r="10" fill="none" stroke="${stroke}" stroke-width="${sw}"/>`,
      `<line x1="${el.w / 2 - 7}" y1="${el.h / 2 - 11}" x2="${el.w / 2 + 7}" y2="${el.h / 2 + 3}" stroke="${stroke}" stroke-width="1"/>`,
      `<line x1="${el.w / 2 + 7}" y1="${el.h / 2 - 11}" x2="${el.w / 2 - 7}" y2="${el.h / 2 + 3}" stroke="${stroke}" stroke-width="1"/>`,
    );
  } else {
    parts.push(
      `<rect x="0" y="0" width="${el.w}" height="${el.h}" rx="3" fill="#ffffff" stroke="${stroke}" stroke-width="${sw}"/>`,
      `<text x="6" y="16" font-size="12" font-family="Arial" font-weight="bold" fill="#111827">${esc(el.ref)}</text>`,
    );
    if (doc.show.rating && el.rating)
      parts.push(
        `<text x="6" y="31" font-size="11" font-family="Arial" fill="#111827">${esc(el.rating)}</text>`,
      );
    parts.push(
      `<text x="${el.w - 6}" y="16" text-anchor="end" font-size="11" font-family="Arial" fill="#6b7280">${el.poles}P</text>`,
    );
    // Символ аппарата
    const cy = el.h - 14;
    if (kind === "rcd") {
      parts.push(
        `<rect x="6" y="${cy - 9}" width="${el.w - 12}" height="14" fill="none" stroke="${stroke}" stroke-width="1"/>`,
        `<text x="${el.w / 2}" y="${cy + 2}" text-anchor="middle" font-size="10" font-family="Arial" fill="#111827">I∆n</text>`,
      );
    } else if (kind === "control") {
      parts.push(
        `<rect x="6" y="${cy - 9}" width="18" height="14" fill="none" stroke="${stroke}" stroke-width="1"/>`,
        `<line x1="28" y1="${cy - 2}" x2="${el.w - 8}" y2="${cy - 2}" stroke="${stroke}" stroke-width="1" stroke-dasharray="3 2"/>`,
      );
    } else {
      parts.push(
        `<line x1="8" y1="${cy}" x2="${el.w - 26}" y2="${cy}" stroke="${stroke}" stroke-width="1"/>`,
        `<line x1="${el.w - 26}" y1="${cy}" x2="${el.w - 10}" y2="${cy - 10}" stroke="${stroke}" stroke-width="1.6"/>`,
        `<line x1="${el.w - 20}" y1="${cy - 12}" x2="${el.w - 12}" y2="${cy - 12}" stroke="${stroke}" stroke-width="2"/>`,
      );
    }
  }

  parts.push("</g>");

  // Подписи под элементом
  const lines: string[] = [];
  if (doc.show.name && el.name && kind !== "bus") lines.push(el.name);
  if (doc.show.cable && el.cable) lines.push(el.cable);
  lines.forEach((t, i) => {
    parts.push(
      `<text x="${el.x + el.w / 2}" y="${el.y + el.h + 14 + i * 12}" text-anchor="middle" font-size="10" font-family="Arial" fill="#374151">${esc(t)}</text>`,
    );
  });

  return parts.join("");
}

let seq = 0;
export function uid(prefix = "e") {
  seq += 1;
  return `${prefix}${Date.now().toString(36)}${seq.toString(36)}`;
}

export function nextRef(elements: SchElement[], prefix: string) {
  const used = elements
    .filter((e) => e.ref.startsWith(prefix))
    .map((e) => Number(e.ref.slice(prefix.length)) || 0);
  return `${prefix}${Math.max(0, ...used) + 1}`;
}

export function createElement(
  type: string,
  x: number,
  y: number,
  elements: SchElement[],
): SchElement {
  const d = defOf(type);
  return {
    id: uid(),
    type,
    ref: nextRef(elements, d.prefix),
    name: d.label,
    manufacturer: "",
    model: "",
    rating: d.rating ?? "",
    poles: d.poles,
    modules: d.modules,
    phase: "L1",
    line: "",
    cable: "",
    x,
    y,
    w: d.w ?? DEF_W,
    h: d.h ?? DEF_H,
    group: "",
  };
}

export function emptyDoc(objectName = ""): SchDoc {
  return {
    elements: [],
    wires: [],
    mode: "single",
    page: { format: "A3", landscape: true },
    grid: { size: 10, show: true, snap: true },
    show: { rating: true, cable: true, name: true },
    colors: { ...WIRE_COLORS },
    title: {
      object: objectName,
      name: "Схема электрическая принципиальная",
      date: new Date().toLocaleDateString("ru-RU"),
      author: "S&M Electric",
      sheet: "1",
    },
  };
}
