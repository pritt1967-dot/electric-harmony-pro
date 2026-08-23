/**
 * Разводка проводников. Провода строятся ТОЛЬКО между реальными connection points
 * аппаратов и шинами N/PE. Если у аппарата нет нужной точки — провод не рисуется.
 */

import type { Layout } from "./layout";
import type { ConnPoint, Placed, Wire } from "./types";

export type AbsPoint = { key: string; point: ConnPoint; x: number; y: number };

export function absPoints(p: Placed): AbsPoint[] {
  return p.points.map((c) => ({ key: `${p.key}:${c.id}`, point: c, x: p.x + c.x, y: p.y + c.y }));
}

const ortho = (a: AbsPoint, b: AbsPoint, midY: number) =>
  `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} L ${a.x.toFixed(1)} ${midY.toFixed(1)} ` +
  `L ${b.x.toFixed(1)} ${midY.toFixed(1)} L ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;

export function buildWires(layout: Layout): Wire[] {
  const wires: Wire[] = [];
  const { placed, buses } = layout;
  let n = 0;
  const id = () => `w${++n}`;

  const supplyChainRoles = ["input", "spd", "voltage-relay", "meter", "rcd"];
  const chain = placed.filter((p) => supplyChainRoles.includes(p.role) && p.device);

  // 1) Последовательная цепь питания: выход предыдущего → вход следующего по фазам.
  for (let i = 0; i < chain.length - 1; i++) {
    const a = chain[i]!;
    const b = chain[i + 1]!;
    const outs = absPoints(a).filter((p) => p.point.side === "out" && p.point.kind === "L");
    const ins = absPoints(b).filter((p) => p.point.side === "in" && p.point.kind === "L");
    const midY = Math.max(a.y + a.h, b.y + b.h) + 12;
    for (const o of outs) {
      const target = ins.find((p) => p.point.phase === o.point.phase);
      if (!target) continue;
      wires.push({
        id: id(),
        kind: "L",
        phase: o.point.phase,
        d: ortho(o, target, a.rail === b.rail ? Math.min(a.y, b.y) - 10 : midY),
        from: o.key,
        to: target.key,
      });
    }
  }

  // 2) Распределение на групповые аппараты от последнего аппарата ввода.
  const source = chain[chain.length - 1];
  const groups = placed.filter((p) => p.role === "group" && p.device);
  if (source) {
    const outs = absPoints(source).filter((p) => p.point.side === "out" && p.point.kind === "L");
    for (const g of groups) {
      const ins = absPoints(g).filter((p) => p.point.side === "in" && p.point.kind === "L");
      for (const i of ins) {
        const o = outs.find((p) => p.point.phase === i.point.phase) ?? outs[0];
        if (!o) continue;
        const midY = Math.min(source.y, g.y) - 12;
        wires.push({ id: id(), kind: "L", phase: i.point.phase, d: ortho(o, i, midY), from: o.key, to: i.key });
      }
    }
  }

  // 3) Шина N: все точки N (кроме входных точек цепи питания) на шину нуля.
  for (const p of placed) {
    for (const c of absPoints(p)) {
      if (c.point.kind !== "N" || c.point.side !== "out") continue;
      wires.push({
        id: id(),
        kind: "N",
        d: `M ${c.x.toFixed(1)} ${c.y.toFixed(1)} L ${c.x.toFixed(1)} ${buses.n.y.toFixed(1)}`,
        from: c.key,
        to: "bus:N",
      });
    }
  }

  // 4) Шина PE.
  for (const p of placed) {
    for (const c of absPoints(p)) {
      if (c.point.kind !== "PE") continue;
      wires.push({
        id: id(),
        kind: "PE",
        d: `M ${c.x.toFixed(1)} ${c.y.toFixed(1)} L ${c.x.toFixed(1)} ${buses.pe.y.toFixed(1)}`,
        from: c.key,
        to: "bus:PE",
      });
    }
  }

  return wires;
}
