/**
 * Система точек подключения (ЗАДАЧА 2).
 *
 * Приоритет: точки из исходного Visio-мастера (`connectionPoints`, source = "visio").
 * Если источник их не содержит — точки рассчитываются по реальной геометрии аппарата
 * (ширина, число модулей, полюса, тип), source = "derived".
 * Проводники подключаются ТОЛЬКО к этим точкам.
 */

import type { PhysicalDevice } from "@/lib/shape-library/device-library-types";
import type { ConnPoint, PanelRole } from "./types";
import { deviceHeightMm, deviceModules, deviceWidthMm } from "./device-resolve";

const PHASES = ["L1", "L2", "L3"] as const;
type Phase = (typeof PHASES)[number];

/** Число силовых полюсов аппарата. */
function polesOf(d: PhysicalDevice): number {
  if (d.poles && d.poles > 0) return d.poles;
  const m = deviceModules(d);
  return Math.min(4, Math.max(1, m));
}

/** Раскладка клемм по ширине аппарата: n колонок по центрам модулей. */
function columns(width: number, n: number): number[] {
  const step = width / n;
  return Array.from({ length: n }, (_, i) => step * (i + 0.5));
}

/**
 * Схема клемм по типу аппарата:
 *  - breaker/switch/contactor: n полюсов L (верх — вход, низ — выход)
 *  - rcd/rcbo 2P: N + L1; 4P: N + L1..L3
 *  - spd: L(верх) → PE(низ)
 *  - voltage_relay: L1..L3 + N сверху, коммутируемые L снизу
 */
export function buildConnectionPoints(
  d: PhysicalDevice,
  role: PanelRole,
  phase: Phase | "L1,L2,L3" | undefined,
): ConnPoint[] {
  const w = deviceWidthMm(d);
  const h = deviceHeightMm(d);

  // 1) Точки из исходного Visio — используем как есть.
  if (d.connectionPoints?.length) {
    return d.connectionPoints.map((c, i) => {
      const y = c.y_mm;
      const side = y > h / 2 ? "in" : "out";
      const kind = /pe|земл|gnd/i.test(c.id) ? "PE" : /(^|[^a-z])n([^a-z]|$)/i.test(c.id) ? "N" : "L";
      return {
        id: `${c.id || `cp${i + 1}`}`,
        kind: kind as ConnPoint["kind"],
        side,
        phase: kind === "L" ? phaseFor(i, phase) : undefined,
        x: c.x_mm,
        y: h - y, // Visio: Y снизу вверх
        source: "visio" as const,
      };
    });
  }

  // 2) Расчёт по геометрии.
  const out: ConnPoint[] = [];
  const type = d.deviceType;
  const push = (id: string, kind: ConnPoint["kind"], side: ConnPoint["side"], x: number, y: number, ph?: Phase) =>
    out.push({ id, kind, side, x, y, phase: ph, source: "derived" });

  if (type === "spd") {
    const n = Math.max(1, polesOf(d));
    columns(w, n).forEach((x, i) => {
      push(`L-in-${i + 1}`, "L", "in", x, 0, phaseFor(i, phase));
      push(`PE-out-${i + 1}`, "PE", "out", x, h);
    });
    return out;
  }

  if (type === "rcd" || type === "rcbo") {
    const p = polesOf(d);
    const cols = columns(w, p);
    // Левый полюс — нейтраль (стандарт ВД/АД: N слева).
    cols.forEach((x, i) => {
      if (i === 0) {
        push("N-in", "N", "in", x, 0);
        push("N-out", "N", "out", x, h);
      } else {
        const ph = phaseFor(i - 1, phase);
        push(`L${i}-in`, "L", "in", x, 0, ph);
        push(`L${i}-out`, "L", "out", x, h, ph);
      }
    });
    return out;
  }

  if (type === "voltage_relay" || type === "relay" || type === "meter") {
    const n = 4;
    const cols = columns(w, n);
    cols.forEach((x, i) => {
      if (i === 3) {
        push("N-in", "N", "in", x, 0);
        push("N-out", "N", "out", x, h);
      } else {
        const ph = PHASES[i]!;
        push(`${ph}-in`, "L", "in", x, 0, ph);
        push(`${ph}-out`, "L", "out", x, h, ph);
      }
    });
    push("PE", "PE", "out", w / 2, h);
    return out;
  }

  // breaker / switch / contactor / прочее
  const p = polesOf(d);
  columns(w, p).forEach((x, i) => {
    const ph = phaseFor(i, phase);
    push(`L${i + 1}-in`, "L", "in", x, 0, ph);
    push(`L${i + 1}-out`, "L", "out", x, h, ph);
  });
  if (role === "group" && p === 1) {
    // однофазная группа: рабочий ноль и защитный проводник уходят на шины
    push("N", "N", "out", w / 2, h);
    push("PE", "PE", "out", w / 2, h);
  }
  return out;
}

function phaseFor(index: number, phase: Phase | "L1,L2,L3" | undefined): Phase {
  if (phase && phase !== "L1,L2,L3") return phase;
  return PHASES[index % 3]!;
}
