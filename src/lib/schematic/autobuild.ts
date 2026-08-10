import { createElement, defOf, emptyDoc, uid } from "./library";
import type { SchDoc, SchElement, SchWire, WireKind } from "./types";
import type { PanelDesign } from "@/lib/panel";

const COL = 150;
const ROW_INPUT = 40;
const ROW_MAIN = 140;
const ROW_RELAY = 240;
const ROW_BUS = 340;
const ROW_RCD = 430;
const ROW_MCB = 540;
const ROW_LOAD = 660;

function wire(
  from: SchElement,
  fromPort: string,
  to: SchElement,
  toPort: string,
  kind: WireKind,
  colors: Record<WireKind, string>,
): SchWire {
  return {
    id: uid("w"),
    from: { el: from.id, port: fromPort },
    to: { el: to.id, port: toPort },
    kind,
    color: colors[kind],
  };
}

/** Builds a complete schematic out of the AI panel design. */
export function autoBuild(design: PanelDesign, objectName = ""): SchDoc {
  const doc = emptyDoc(objectName || design.summary?.object_type || "");
  const els: SchElement[] = [];
  const wires: SchWire[] = [];
  const add = (type: string, x: number, y: number, patch: Partial<SchElement> = {}) => {
    const el = { ...createElement(type, x, y, els), ...patch };
    els.push(el);
    return el;
  };

  const threePhase = (design.summary?.supply ?? "").includes("400");
  const phases: WireKind[] = threePhase ? ["L1", "L2", "L3"] : ["L1"];

  // Ввод
  const sources = phases.map((p, i) =>
    add(`src_${p.toLowerCase()}`, 60 + i * 80, ROW_INPUT, { name: p }),
  );
  const srcN = add("src_n", 60 + phases.length * 80, ROW_INPUT, { name: "N" });
  const srcPe = add("src_pe", 60 + (phases.length + 1) * 80, ROW_INPUT, { name: "PE" });

  // Вводной автомат
  const main = add(threePhase ? "main_4p" : "main_2p", 60, ROW_MAIN, {
    name: "Вводной автомат",
    rating: design.summary?.main_breaker || "C25",
    line: "Ввод",
  });
  sources.forEach((s, i) =>
    wires.push(wire(s, "T1", main, doc.mode === "single" ? "IN" : `I${i + 1}`, phases[i]!, doc.colors)),
  );
  wires.push(wire(srcN, "T1", main, doc.mode === "single" ? "IN" : `I${phases.length + 1}`, "N", doc.colors));

  // Реле напряжения / контактор (если упомянуты в цепочке защиты)
  const chain = (design.protection_chain ?? []).join(" ").toLowerCase();
  let last = main;
  if (chain.includes("реле напряж") || chain.includes("узм")) {
    const kv = add("voltage_relay", 60, ROW_RELAY, { name: "Реле напряжения" });
    wires.push(wire(last, "OUT", kv, "IN", "L1", doc.colors));
    last = kv;
  }
  if (chain.includes("контактор")) {
    const km = add("contactor", 240, ROW_RELAY, { name: "Контактор" });
    wires.push(wire(last, "OUT", km, "IN", "L1", doc.colors));
    last = km;
  }

  // Шины
  const busL = add("bus_l", 60, ROW_BUS, { name: threePhase ? "Шина L1/L2/L3" : "Шина L" });
  const busN = add("bus_n", 520, ROW_BUS, { name: "Шина N" });
  const busPe = add("bus_pe", 980, ROW_BUS, { name: "Шина PE" });
  wires.push(wire(last, "OUT", busL, "IN", "L1", doc.colors));
  wires.push(wire(main, "OUT", busN, "IN", "N", doc.colors));
  wires.push(wire(srcPe, "T1", busPe, "IN", "PE", doc.colors));

  // Группы УЗО и отходящие линии
  const lines = design.lines ?? [];
  const groups = design.rcd_groups ?? [];
  const byMark = new Map(lines.map((l) => [l.mark, l]));
  const placed = new Set<string>();
  let col = 0;

  const placeLine = (mark: string, parent: SchElement | null) => {
    const l = byMark.get(mark);
    if (!l || placed.has(mark)) return;
    placed.add(mark);
    const x = 60 + col * COL;
    const poles = Math.max(1, l.poles || 1);
    const mcb = add(`mcb_${Math.min(4, poles)}p`, x, ROW_MCB, {
      ref: l.mark || undefined,
      name: l.name,
      rating: l.breaker,
      poles,
      phase: l.phase || "L1",
      cable: l.cable,
      line: l.name,
    } as Partial<SchElement>);
    const load = add("load_socket", x, ROW_LOAD, { name: l.name });
    wires.push(
      wire(parent ?? busL, parent ? "OUT" : `T${(col % 8) + 1}`, mcb, "IN", (l.phase as WireKind) || "L1", doc.colors),
    );
    wires.push(wire(mcb, "OUT", load, "IN", (l.phase as WireKind) || "L1", doc.colors));
    wires.push(wire(busN, `T${(col % 8) + 1}`, load, "IN", "N", doc.colors));
    wires.push(wire(busPe, `T${(col % 8) + 1}`, load, "IN", "PE", doc.colors));
    col += 1;
  };

  groups.forEach((g, gi) => {
    const gx = 60 + col * COL;
    const rcd = add(g.type?.includes("4") || threePhase ? "rcd_4p" : "rcd_2p", gx, ROW_RCD, {
      ref: g.mark || undefined,
      name: `УЗО ${g.leakage || "30мА"}`,
      rating: [g.rating, g.leakage].filter(Boolean).join("/"),
    } as Partial<SchElement>);
    wires.push(wire(busL, `T${(gi % 8) + 1}`, rcd, "IN", "L1", doc.colors));
    (g.lines ?? []).forEach((m) => placeLine(m, rcd));
  });
  lines.forEach((l) => placeLine(l.mark, null));

  doc.elements = els;
  doc.wires = wires;
  doc.title.object = objectName || design.summary?.object_type || "";
  return doc;
}

export function elementLabel(type: string) {
  return defOf(type).label;
}
