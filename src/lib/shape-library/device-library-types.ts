/**
 * БИБЛИОТЕКА №2 — типы физических модульных устройств.
 * Отдельная от библиотеки №1 (УГО однолинейной схемы): УГО QF ≠ конкретный автомат.
 */

export type DeviceConnectionPoint = { id: string; x_mm: number; y_mm: number };
export type DeviceShapeDatum = { key: string; label: string; value: string };

export type PhysicalDevice = {
  id: string;
  manufacturer: string;
  series: string;
  model: string;
  article: string | null;
  deviceType: string;
  subType: string | null;
  poles: number | null;
  nominal: string | null;
  ratedCurrent: number | null;
  curve: string | null;
  leakageCurrent: number | null;
  modules: number | null;
  moduleWidthMm: number | null;
  width: number | null;
  height: number | null;
  aspectRatio: number | null;
  /** Путь к исходной SVG-фигуре, полученной из Visio-мастера (без перерисовки). */
  svgAsset: string;
  hasSvg: boolean;
  rasterStripped?: boolean;
  sourceFile: string;
  sourceMasterId: string;
  connectionPoints: DeviceConnectionPoint[];
  connectionPointsSource: "visio-master" | "unavailable";
  labelFields: string[];
  shapeData: DeviceShapeDatum[];
  /** Связь с библиотекой №1 через Unified Device Model. */
  schematicSymbolId: string | null;
  format: "vss" | "vssx";
};

export type ProtectedArchive = {
  file: string;
  vendor: string;
  name: string;
  size_kb: number;
};

export type DeviceLibraryStats = {
  stencilsScanned: number;
  imported: number;
  duplicatesSkipped: number;
  errors: number;
  noSvg: number;
  noConnectionPoints: number;
  noManufacturer: number;
  noModel: number;
  noNominal: number;
  noModules: number;
  protectedArchives: number;
  vendors: number;
  categories: number;
  linkedToSymbol: number;
  unlinked: number;
  connectionPointsTotal: number;
};
