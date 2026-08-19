/**
 * ТЕСТОВАЯ библиотека оборудования из Visio-файла «Щит зарядки.vsdx».
 * Графика получена из реальных Visio Master (см. generated.ts), не перерисована.
 * К существующему визуализатору щита НЕ подключена.
 */

import { VISIO_SHAPES, type VisioShapeGeometry } from "./generated";

export type EquipmentType =
  | "breaker"
  | "rcd"
  | "relay"
  | "contactor"
  | "terminal"
  | "wire"
  | "rail"
  | "frame"
  | "accessory"
  | "marker"
  | "ground";

export const EQUIPMENT_TYPE_LABEL: Record<EquipmentType, string> = {
  breaker: "Автоматический выключатель",
  rcd: "УЗО / дифзащита",
  relay: "Реле напряжения",
  contactor: "Контактор / модульный аппарат",
  terminal: "Клемма",
  wire: "Проводник",
  rail: "DIN-рейка",
  frame: "Рама / корпус",
  accessory: "Аксессуар",
  marker: "Маркировка",
  ground: "Заземление",
};

export type LibraryStatus = "ready" | "manual";

export type LibraryItem = VisioShapeGeometry & {
  manufacturer: string;
  series: string;
  model: string;
  equipment_type: EquipmentType;
  poles: number | null;
  modules: number | null;
  /** Номинал из Shape Data Visio (Prop.Nominal). null = отсутствует в исходном Visio. */
  nominal_current: number | null;
  /** Надпись, которую Visio показывает на фигуре (текст Master). */
  displayed_label: string | null;
  /** Характеристика срабатывания (Prop.Curve), если есть в Visio. */
  curve: string | null;
  /** Артикул (Prop.Article) из Visio. */
  article: string | null;
  svg_asset: string;
  status: LibraryStatus;
  note: string;
};

type Meta = Omit<
  LibraryItem,
  | keyof VisioShapeGeometry
  | "svg_asset"
  | "status"
  | "note"
  | "displayed_label"
  | "curve"
  | "article"
  | "nominal_current"
> & { note?: string; status?: LibraryStatus; nominal_current?: number | null };

const MODULE_MM = 17.5;

const META: Record<string, Meta> = {
  "3p-ва47-29-karat-iek": {
    manufacturer: "IEK",
    series: "ВА47-29 KARAT",
    model: "ВА47-29 KARAT 3P",
    equipment_type: "breaker",
    poles: 3,
    modules: 3,
    nominal_current: null,
  },
  "1p-ва47-29-karat-iek": {
    manufacturer: "IEK",
    series: "ВА47-29 KARAT",
    model: "ВА47-29 KARAT 1P",
    equipment_type: "breaker",
    poles: 1,
    modules: 1,
    nominal_current: null,
  },
  "вд3-63-4p-6ka-тип-a-iek": {
    manufacturer: "IEK",
    series: "ВД3-63",
    model: "ВД3-63 4P 6kA тип A",
    equipment_type: "rcd",
    poles: 4,
    modules: 4,
    nominal_current: 63,
  },
  "вд3-63-2p-6ka-тип-a-iek": {
    manufacturer: "IEK",
    series: "ВД3-63",
    model: "ВД3-63 2P 6kA тип A",
    equipment_type: "rcd",
    poles: 2,
    modules: 2,
    nominal_current: 63,
  },
  "vp-3f-63a-digitop": {
    manufacturer: "DigiTop",
    series: "VP",
    model: "VP-3F 63A",
    equipment_type: "relay",
    poles: 3,
    modules: 7,
    nominal_current: 63,
  },
  "кбр-80a-ekf-proxima": {
    manufacturer: "EKF",
    series: "PROxima",
    model: "КБР-80A",
    equipment_type: "contactor",
    poles: null,
    modules: 2,
    nominal_current: 80,
  },
  динрейка: {
    manufacturer: "—",
    series: "DIN 35",
    model: "DIN-рейка 35 мм",
    equipment_type: "rail",
    poles: null,
    modules: null,
    nominal_current: null,
  },
  рама: {
    manufacturer: "—",
    series: "—",
    model: "Рама щита",
    equipment_type: "frame",
    poles: null,
    modules: null,
    nominal_current: null,
  },
  "ke1-klemsan-клемма": {
    manufacturer: "Klemsan",
    series: "KE",
    model: "KE1",
    equipment_type: "terminal",
    poles: 1,
    modules: null,
    nominal_current: null,
  },
  "ke2-klemsan-клемма": {
    manufacturer: "Klemsan",
    series: "KE",
    model: "KE2",
    equipment_type: "terminal",
    poles: 1,
    modules: null,
    nominal_current: null,
  },
  "ke3-klemsan-клемма": {
    manufacturer: "Klemsan",
    series: "KE",
    model: "KE3",
    equipment_type: "terminal",
    poles: 1,
    modules: null,
    nominal_current: null,
  },
  "провод-v-5-ke1": {
    manufacturer: "Klemsan",
    series: "Провод v.5",
    model: "Проводник с клеммами KE1",
    equipment_type: "wire",
    poles: null,
    modules: null,
    nominal_current: null,
  },
  "провод-v-5-ke2": {
    manufacturer: "Klemsan",
    series: "Провод v.5",
    model: "Проводник с клеммами KE2",
    equipment_type: "wire",
    poles: null,
    modules: null,
    nominal_current: null,
  },
  "провод-v-5-ke3": {
    manufacturer: "Klemsan",
    series: "Провод v.5",
    model: "Проводник с клеммами KE3",
    equipment_type: "wire",
    poles: null,
    modules: null,
    nominal_current: null,
  },
  "провод-v-5-ke1-pe": {
    manufacturer: "Klemsan",
    series: "Провод v.5",
    model: "Проводник PE с клеммами KE1",
    equipment_type: "wire",
    poles: null,
    modules: null,
    nominal_current: null,
  },
  "ограничитель-левый": {
    manufacturer: "—",
    series: "—",
    model: "Ограничитель DIN (левый)",
    equipment_type: "accessory",
    poles: null,
    modules: null,
    nominal_current: null,
  },
  "ограничитель-правый": {
    manufacturer: "—",
    series: "—",
    model: "Ограничитель DIN (правый)",
    equipment_type: "accessory",
    poles: null,
    modules: null,
    nominal_current: null,
  },
  "наклейка-v-2-для-маркировки": {
    manufacturer: "—",
    series: "Наклейка v.2",
    model: "Наклейка для маркировки",
    equipment_type: "marker",
    poles: null,
    modules: null,
    nominal_current: null,
  },
  "наклейка-v-2-размер-по-тексту": {
    manufacturer: "—",
    series: "Наклейка v.2",
    model: "Наклейка (размер по тексту)",
    equipment_type: "marker",
    poles: null,
    modules: null,
    nominal_current: null,
  },
  земля: {
    manufacturer: "—",
    series: "—",
    model: "Заземление",
    equipment_type: "ground",
    poles: null,
    modules: null,
    nominal_current: null,
  },
  "земля-вдоль": {
    manufacturer: "—",
    series: "—",
    model: "Заземление (вдоль)",
    equipment_type: "ground",
    poles: null,
    modules: null,
    nominal_current: null,
  },
  "земля-волной": {
    manufacturer: "—",
    series: "—",
    model: "Заземление (косая)",
    equipment_type: "ground",
    poles: null,
    modules: null,
    nominal_current: null,
  },
};

const FALLBACK: Meta = {
  manufacturer: "—",
  series: "—",
  model: "—",
  equipment_type: "accessory",
  poles: null,
  modules: null,
  nominal_current: null,
};

function build(shape: VisioShapeGeometry): LibraryItem {
  const meta = META[shape.slug] ?? { ...FALLBACK, model: shape.name };
  // Фигура считается готовой, если из Visio извлечена корректная векторная
  // геометрия и известны реальные габариты. Иначе — ручная конвертация.
  const geometryOk = shape.paths >= 2 && shape.width_mm > 0 && shape.height_mm > 0;
  const status: LibraryStatus = geometryOk ? "ready" : "manual";
  const notes: string[] = [];
  if (!geometryOk) notes.push("Требуется ручная конвертация: габариты Visio заданы формулой, геометрия неполная");
  if (shape.foreign_parts > 0)
    notes.push(
      `Внутри ${shape.foreign_parts} растровый/EMF фрагмент (логотип) — в SVG не перенесён`,
    );
  return {
    ...shape,
    ...meta,
    modules:
      meta.modules ??
      (shape.width_mm > MODULE_MM * 0.8 && meta.equipment_type === "breaker"
        ? Math.round(shape.width_mm / MODULE_MM)
        : null),
    svg_asset: `visio/${shape.slug}.svg`,
    status: meta.status ?? status,
    note: meta.note ?? notes.join("; "),
  };
}

export const SHAPE_LIBRARY: LibraryItem[] = VISIO_SHAPES.map(build);

export const LIBRARY_STATS = {
  total: SHAPE_LIBRARY.length,
  ready: SHAPE_LIBRARY.filter((s) => s.status === "ready").length,
  manual: SHAPE_LIBRARY.filter((s) => s.status === "manual").length,
  source: "Щит зарядки.vsdx",
};
