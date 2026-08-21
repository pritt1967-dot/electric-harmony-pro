/**
 * БИБЛИОТЕКА №2 — «Библиотека модульных устройств» (физические аппараты для DIN-рейки).
 *
 * Источник: «Набор электрика для Visio» (4 архива объединены логически, дедупликация по md5).
 * Геометрия — только исходные Visio-мастера. Отсутствующие данные остаются null
 * и показываются как «Не указано в источнике».
 *
 * Библиотека №1 (УГО) НЕ изменяется: связь только через schematicSymbolId.
 */

import {
  PHYSICAL_DEVICES,
  PROTECTED_ARCHIVES,
  IMPORT_ERRORS,
  DEVICE_LIBRARY_STATS,
  DEVICE_TYPE_LABELS,
} from "./device-library-generated";
import type { PhysicalDevice } from "./device-library-types";
import { getSchematicSymbol } from "./schematic-library";

export type { PhysicalDevice };
export { PHYSICAL_DEVICES, PROTECTED_ARCHIVES, IMPORT_ERRORS, DEVICE_LIBRARY_STATS, DEVICE_TYPE_LABELS };

export const NOT_IN_SOURCE = "Не указано в источнике";

export function typeLabel(key: string): string {
  return DEVICE_TYPE_LABELS[key] ?? key;
}

function uniqSorted(values: (string | null)[]): string[] {
  return Array.from(new Set(values.filter((v): v is string => Boolean(v)))).sort((a, b) =>
    a.localeCompare(b, "ru"),
  );
}

export const DEVICE_MANUFACTURERS = uniqSorted(PHYSICAL_DEVICES.map((d) => d.manufacturer));
export const DEVICE_TYPES = uniqSorted(PHYSICAL_DEVICES.map((d) => d.deviceType));
export const DEVICE_FORMATS = uniqSorted(PHYSICAL_DEVICES.map((d) => d.format));

export type DeviceFilters = {
  q?: string;
  manufacturer?: string;
  series?: string;
  deviceType?: string;
  poles?: string;
  nominal?: string;
  modules?: string;
  format?: string;
};

const ALL = "all";

function matchesQuery(d: PhysicalDevice, q: string): boolean {
  const hay = [
    d.manufacturer,
    d.series,
    d.model,
    d.article ?? "",
    typeLabel(d.deviceType),
    d.subType ?? "",
    d.poles ? `${d.poles}P` : "",
    d.ratedCurrent ? `${d.curve ?? ""}${d.ratedCurrent} ${d.ratedCurrent}A` : "",
    d.leakageCurrent ? `${d.leakageCurrent}mA ${d.leakageCurrent}мА` : "",
    d.modules ? `${d.modules} мод` : "",
    d.labelFields.join(" "),
  ]
    .join(" ")
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => hay.includes(token));
}

export function filterDevices(f: DeviceFilters): PhysicalDevice[] {
  const q = (f.q ?? "").trim();
  return PHYSICAL_DEVICES.filter((d) => {
    if (f.manufacturer && f.manufacturer !== ALL && d.manufacturer !== f.manufacturer) return false;
    if (f.series && f.series !== ALL && d.series !== f.series) return false;
    if (f.deviceType && f.deviceType !== ALL && d.deviceType !== f.deviceType) return false;
    if (f.format && f.format !== ALL && d.format !== f.format) return false;
    if (f.poles && f.poles !== ALL && String(d.poles ?? "") !== f.poles) return false;
    if (f.modules && f.modules !== ALL && String(d.modules ?? "") !== f.modules) return false;
    if (f.nominal && f.nominal !== ALL && String(d.ratedCurrent ?? "") !== f.nominal) return false;
    if (q && !matchesQuery(d, q)) return false;
    return true;
  });
}

/** Значения фильтров, доступные внутри текущей выборки. */
export function facets(devices: PhysicalDevice[]) {
  return {
    series: uniqSorted(devices.map((d) => d.series)).slice(0, 400),
    poles: Array.from(new Set(devices.map((d) => d.poles).filter(Boolean) as number[])).sort((a, b) => a - b),
    modules: Array.from(new Set(devices.map((d) => d.modules).filter(Boolean) as number[])).sort((a, b) => a - b),
    nominals: Array.from(new Set(devices.map((d) => d.ratedCurrent).filter(Boolean) as number[])).sort(
      (a, b) => a - b,
    ),
  };
}

export function symbolOf(device: PhysicalDevice) {
  return device.schematicSymbolId ? getSchematicSymbol(device.schematicSymbolId) : undefined;
}

/** Автоматические проверки импорта (п.17 задания). Ошибки не скрываются. */
export function libraryChecks() {
  const dupKeys = new Set<string>();
  let duplicates = 0;
  for (const d of PHYSICAL_DEVICES) {
    const key = `${d.manufacturer}|${d.sourceFile}|${d.sourceMasterId}`;
    if (dupKeys.has(key)) duplicates += 1;
    dupKeys.add(key);
  }
  const s = DEVICE_LIBRARY_STATS;
  return [
    { label: "Исходных стенсилов прочитано", value: s.stencilsScanned },
    { label: "Импортировано устройств", value: s.imported },
    { label: "Дубликатов", value: duplicates },
    { label: "Ошибок импорта", value: s.errors, warn: s.errors > 0 },
    { label: "Без SVG", value: s.noSvg, warn: s.noSvg > 0 },
    { label: "Без connection points", value: s.noConnectionPoints, warn: s.noConnectionPoints > 0 },
    { label: "Без производителя", value: s.noManufacturer, warn: s.noManufacturer > 0 },
    { label: "Без модели", value: s.noModel, warn: s.noModel > 0 },
    { label: "Без номинала (нет в источнике)", value: s.noNominal },
    { label: "Без количества модулей", value: s.noModules },
    { label: "Защищённых архивов (не обработаны)", value: s.protectedArchives },
    { label: "Производителей", value: s.vendors },
    { label: "Категорий", value: s.categories },
    { label: "Связано с УГО", value: s.linkedToSymbol },
    { label: "Без связи с УГО", value: s.unlinked },
    { label: "Connection points всего", value: s.connectionPointsTotal },
  ];
}
