/**
 * Структурированный каталог библиотеки «Набор электрика для Visio»:
 * производитель → серия → тип аппарата → модель → параметры → фигура (SVG).
 *
 * Данные берутся из уже импортированной библиотеки №2 (device-library-generated.ts).
 * Характеристики, отсутствующие в источнике, остаются null — не выдумываются.
 */

import { PHYSICAL_DEVICES } from "./device-library-generated";
import type { PhysicalDevice } from "./device-library-types";
import { typeLabel } from "./device-library";
import { busConnectionType, dinMountable, type BusConnectionType } from "./bus-connection";

export const MODULE_WIDTH_MM = 17.5;

export type CatalogDevice = {
  device: PhysicalDevice;
  id: string;
  manufacturer: string;
  series: string;
  deviceType: string;
  deviceTypeLabel: string;
  model: string;
  article: string | null;
  ratedCurrent: number | null;
  curve: string | null;
  poles: number | null;
  modules: number;
  modulesFromSource: boolean;
  busConnection: BusConnectionType;
  dinMount: boolean | null;
  svgAsset: string;
  sourceFile: string;
  format: "vss" | "vssx";
};

/** Реальное число модулей: из источника либо по ширине мастера. */
export function modulesOf(d: PhysicalDevice): { modules: number; fromSource: boolean } {
  if (d.modules && d.modules > 0) return { modules: d.modules, fromSource: true };
  const w = d.moduleWidthMm ?? d.width ?? 0;
  return { modules: Math.max(1, Math.round(w / MODULE_WIDTH_MM)), fromSource: false };
}

function toCatalog(d: PhysicalDevice): CatalogDevice {
  const m = modulesOf(d);
  return {
    device: d,
    id: d.id,
    manufacturer: d.manufacturer,
    series: d.series,
    deviceType: d.deviceType,
    deviceTypeLabel: typeLabel(d.deviceType),
    model: d.model,
    article: d.article,
    ratedCurrent: d.ratedCurrent,
    curve: d.curve,
    poles: d.poles,
    modules: m.modules,
    modulesFromSource: m.fromSource,
    busConnection: busConnectionType(d),
    dinMount: dinMountable(d),
    svgAsset: d.svgAsset,
    sourceFile: d.sourceFile,
    format: d.format,
  };
}

/** Аппараты с реальной фигурой — только они попадают в конструктор (без заглушек). */
export const CATALOG_DEVICES: CatalogDevice[] = PHYSICAL_DEVICES.filter(
  (d) => d.hasSvg && Boolean(d.svgAsset),
).map(toCatalog);

export const CATALOG_BY_ID = new Map(CATALOG_DEVICES.map((d) => [d.id, d]));

const ru = (a: string, b: string) => a.localeCompare(b, "ru");

export const CATALOG_MANUFACTURERS = Array.from(
  new Set(CATALOG_DEVICES.map((d) => d.manufacturer)),
).sort(ru);

export function seriesOf(manufacturer: string): string[] {
  return Array.from(
    new Set(
      CATALOG_DEVICES.filter((d) => !manufacturer || d.manufacturer === manufacturer).map(
        (d) => d.series,
      ),
    ),
  ).sort(ru);
}

export function typesOf(manufacturer: string, series: string): { key: string; label: string }[] {
  const keys = Array.from(
    new Set(
      CATALOG_DEVICES.filter(
        (d) =>
          (!manufacturer || d.manufacturer === manufacturer) && (!series || d.series === series),
      ).map((d) => d.deviceType),
    ),
  );
  return keys.map((k) => ({ key: k, label: typeLabel(k) })).sort((a, b) => ru(a.label, b.label));
}

export type CatalogQuery = {
  manufacturer?: string;
  series?: string;
  deviceType?: string;
  poles?: number | null;
  q?: string;
};

export function searchCatalog(f: CatalogQuery): CatalogDevice[] {
  const q = (f.q ?? "").trim().toLowerCase().split(/\s+/).filter(Boolean);
  return CATALOG_DEVICES.filter((d) => {
    if (f.manufacturer && d.manufacturer !== f.manufacturer) return false;
    if (f.series && d.series !== f.series) return false;
    if (f.deviceType && d.deviceType !== f.deviceType) return false;
    if (f.poles != null && d.poles !== f.poles) return false;
    if (q.length) {
      const hay = [
        d.manufacturer,
        d.series,
        d.model,
        d.article ?? "",
        d.deviceTypeLabel,
        d.ratedCurrent ? `${d.curve ?? ""}${d.ratedCurrent} ${d.ratedCurrent}a ${d.ratedCurrent}а` : "",
        d.poles ? `${d.poles}p ${d.poles}п` : "",
      ]
        .join(" ")
        .toLowerCase();
      if (!q.every((t) => hay.includes(t))) return false;
    }
    return true;
  });
}

export const CATALOG_STATS = {
  devices: CATALOG_DEVICES.length,
  manufacturers: CATALOG_MANUFACTURERS.length,
  types: new Set(CATALOG_DEVICES.map((d) => d.deviceType)).size,
  vss: CATALOG_DEVICES.filter((d) => d.format === "vss").length,
  vssx: CATALOG_DEVICES.filter((d) => d.format === "vssx").length,
  withBusType: CATALOG_DEVICES.filter((d) => d.busConnection !== "unknown").length,
};
