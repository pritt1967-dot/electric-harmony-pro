/**
 * Тип подключения к шине (bus_connection_type) — отдельный параметр аппарата.
 *
 * ВАЖНО: Fork (вилка), Pin (штырь) и обычное клеммное подключение — это РАЗНЫЕ значения.
 * Значение определяется ТОЛЬКО по исходным данным Visio-мастера (название, серия,
 * подписи, имя исходного файла). Если достоверно определить нельзя — "unknown".
 * Ничего не угадывается и не додумывается.
 */

import type { PhysicalDevice } from "./device-library-types";

export type BusConnectionType =
  | "terminal_only"
  | "pin"
  | "fork"
  | "independent_bus_connection"
  | "unknown";

export const BUS_CONNECTION_LABEL: Record<BusConnectionType, string> = {
  terminal_only: "Только клеммы",
  pin: "Штыревое (pin)",
  fork: "Вилочное (fork)",
  independent_bus_connection: "Независимое подключение шины",
  unknown: "Не определено в источнике",
};

const RULES: { type: BusConnectionType; re: RegExp }[] = [
  { type: "fork", re: /вилочн|вилк[ауи]|\bfork\b/i },
  { type: "pin", re: /штыр\w*|\bpin\b/i },
  { type: "independent_bus_connection", re: /кросс-?модул|распределительн\w+ блок|\bшина\s+(n|pe|нул)/i },
  { type: "terminal_only", re: /клемм\w*/i },
];

function haystack(d: PhysicalDevice): string {
  return [
    d.model,
    d.series,
    d.subType ?? "",
    d.sourceFile,
    d.labelFields.join(" "),
    d.shapeData.map((s) => `${s.label} ${s.value}`).join(" "),
  ].join(" ");
}

/** Тип подключения к шине; "unknown", если в источнике признака нет. */
export function busConnectionType(d: PhysicalDevice): BusConnectionType {
  const hay = haystack(d);
  for (const r of RULES) if (r.re.test(hay)) return r.type;
  return "unknown";
}

/** Пригодность к установке на DIN-рейку — только если это следует из источника. */
export function dinMountable(d: PhysicalDevice): boolean | null {
  const hay = haystack(d).toLowerCase();
  if (/din|дин-?рейк/.test(hay)) return true;
  if (d.modules && d.modules > 0) return true;
  if (d.deviceType === "enclosure") return false;
  return null;
}
