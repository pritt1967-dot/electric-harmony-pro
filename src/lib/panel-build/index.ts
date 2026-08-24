/**
 * Сборка физического щита из спецификации (тестовый движок v2).
 * Спецификация → поиск SVG → модули DIN → раскладка → connection points →
 * проводники → готовая визуализация.
 */

import { layoutPanel, type LayoutOptions } from "./layout";
import { buildWires } from "./wiring";
import { renderPanel } from "./render";
import type { PanelBuild, SpecItem } from "./types";

export * from "./types";
export { TEST_SPEC_48 } from "./test-spec";
export { deviceModules, resolveDevice, DRAWABLE_DEVICES } from "./device-resolve";
export { buildConnectionPoints } from "./connection-points";
export { GROUND_WAVE } from "./render";

export type BuildOptions = LayoutOptions & { showPoints?: boolean };

export function buildPanel(spec: SpecItem[], opts: BuildOptions): PanelBuild {
  const layout = layoutPanel(spec, opts);
  const wires = buildWires(layout);
  const svg = renderPanel(layout, wires, opts.showPoints ?? true);

  const points = layout.placed.flatMap((p) => p.points);
  const modules = layout.placed.reduce((s, p) => s + p.modules, 0);

  return {
    svg,
    widthMm: layout.widthMm,
    heightMm: layout.heightMm,
    rails: layout.railList,
    placed: layout.placed,
    wires,
    resolutions: layout.resolutions,
    missing: layout.resolutions.filter((r) => !r.device),
    totals: {
      positions: spec.length,
      devices: layout.placed.length,
      modules,
      capacity: layout.railList.length * layout.railList[0]!.modules,
      reserve: layout.reserveSlots.reduce((s, r) => s + r.modules, 0),
      connectionPoints: points.length,
      derivedPoints: points.filter((p) => p.source === "derived").length,
      visioPoints: points.filter((p) => p.source === "visio").length,
      wires: wires.length,
    },
  };
}
