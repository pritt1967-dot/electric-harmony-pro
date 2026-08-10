import { findPort } from "./library";
import type { SchDoc, SchWire } from "./types";

/** Orthogonal (90°) routing between two connection points. */
export function wirePoints(doc: SchDoc, wire: SchWire): [number, number][] | null {
  const a = doc.elements.find((e) => e.id === wire.from.el);
  const b = doc.elements.find((e) => e.id === wire.to.el);
  if (!a || !b) return null;
  const pa = findPort(a, wire.from.port, doc.mode);
  const pb = findPort(b, wire.to.port, doc.mode);
  if (!pa || !pb) return null;

  const p1: [number, number] = [pa.x, pa.y];
  const p2: [number, number] = [pb.x, pb.y];
  if (Math.abs(p1[0] - p2[0]) < 0.5 || Math.abs(p1[1] - p2[1]) < 0.5)
    return [p1, p2];

  const outDown = pa.kind === "out";
  if (outDown && p2[1] > p1[1] + 8) {
    const my = Math.round((p1[1] + p2[1]) / 2);
    return [p1, [p1[0], my], [p2[0], my], p2];
  }
  // Обход вверх/вбок
  const stub = 18;
  const y1 = p1[1] + (outDown ? stub : -stub);
  const y2 = p2[1] - stub;
  const mx = Math.round((p1[0] + p2[0]) / 2);
  return [p1, [p1[0], y1], [mx, y1], [mx, y2], [p2[0], y2], p2];
}

export function pointsToPath(pts: [number, number][]) {
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
}
