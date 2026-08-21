/**
 * UNIFIED DEVICE MODEL — связующее звено между двумя РАЗНЫМИ библиотеками:
 *   • библиотека №1 — УГО однолинейной схемы (schematicSymbolId → VSS-мастер);
 *   • библиотека №2 — физические модульные аппараты (physicalDeviceId → SVG щита).
 *
 * УГО QF ≠ физический автомат конкретной модели: это две сущности,
 * связанные одним устройством, а не одна фигура.
 * Используется только тестовой системой сборки.
 */

import { getSchematicSymbol, type SchematicSymbol } from "./schematic-library";
import { SHAPE_LIBRARY, type LibraryItem } from "./index";

export type DeviceType =
  | "input-switch"
  | "breaker"
  | "rcd"
  | "rcbo"
  | "contactor"
  | "relay"
  | "spd"
  | "meter"
  | "terminal"
  | "other";

export type UnifiedDevice = {
  id: string;
  type: DeviceType;
  manufacturer: string | null;
  model: string | null;
  rating: number | null;
  poles: number | null;
  modules: number | null;
  /** ID фигуры в библиотеке №1 (УГО однолинейной схемы). */
  schematicSymbolId: string | null;
  /** ID фигуры в библиотеке №2 (физический модульный аппарат). */
  physicalDeviceId: string | null;
};

/** УГО по умолчанию для типа устройства — только существующие фигуры VSS. */
export const DEFAULT_SYMBOL_BY_TYPE: Record<DeviceType, string> = {
  "input-switch": "qs",
  breaker: "qf",
  rcd: "qd",
  rcbo: "qfd",
  contactor: "km",
  relay: "kv",
  spd: "fv",
  meter: "pi",
  terminal: "point",
  other: "ugo",
};

export function resolveSymbol(device: UnifiedDevice): SchematicSymbol | undefined {
  const id = device.schematicSymbolId ?? DEFAULT_SYMBOL_BY_TYPE[device.type];
  return getSchematicSymbol(id);
}

export function resolvePhysical(device: UnifiedDevice): LibraryItem | undefined {
  if (!device.physicalDeviceId) return undefined;
  return SHAPE_LIBRARY.find((i) => i.slug === device.physicalDeviceId);
}

/** Устройство корректно, если у него есть и УГО, и физическая фигура. */
export function deviceLinkStatus(device: UnifiedDevice) {
  return {
    schematic: Boolean(resolveSymbol(device)),
    physical: Boolean(resolvePhysical(device)),
  };
}
