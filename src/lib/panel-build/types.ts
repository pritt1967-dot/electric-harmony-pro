/**
 * ТЕСТОВЫЙ движок сборки физического щита v2 (эталон «Щит_зарядки.vsdx»).
 * Изолирован: к рабочему проектировщику и Supabase не подключён.
 */

import type { PhysicalDevice } from "@/lib/shape-library/device-library-types";

export const MODULE_MM = 17.5;
export const RAIL_HEIGHT_MM = 35;
export const DEVICE_HEIGHT_MM = 85;

/** Тип точки подключения. */
export type ConnKind = "L" | "N" | "PE" | "control";
export type ConnSide = "in" | "out";

export type ConnPoint = {
  id: string;
  kind: ConnKind;
  side: ConnSide;
  /** Фаза для kind = "L": L1 | L2 | L3. */
  phase?: "L1" | "L2" | "L3";
  /** Координаты в мм относительно левого-верхнего угла аппарата. */
  x: number;
  y: number;
  /** Откуда взята точка: из Visio или рассчитана по геометрии аппарата. */
  source: "visio" | "derived";
};

export type SpecItem = {
  id: string;
  /** Позиция по схеме: QF1, QD1… */
  tag: string;
  /** Роль в структуре щита — задаёт порядок раскладки. */
  role: PanelRole;
  manufacturer?: string;
  series?: string;
  model?: string;
  deviceType?: string;
  poles?: number | null;
  ratedCurrent?: number | null;
  modules?: number | null;
  qty: number;
  /** Отходящая линия (подпись). */
  load?: string;
  phase?: "L1" | "L2" | "L3" | "L1,L2,L3";
};

export type PanelRole =
  | "input"
  | "spd"
  | "voltage-relay"
  | "meter"
  | "rcd"
  | "group"
  | "reserve";

export const ROLE_ORDER: PanelRole[] = [
  "input",
  "spd",
  "voltage-relay",
  "meter",
  "rcd",
  "group",
  "reserve",
];

export const ROLE_LABEL: Record<PanelRole, string> = {
  input: "Вводной аппарат",
  spd: "УЗИП",
  "voltage-relay": "Реле напряжения",
  meter: "Прибор учёта",
  rcd: "УЗО / дифзащита",
  group: "Групповой автомат",
  reserve: "Резерв",
};

export type Resolution = {
  item: SpecItem;
  device: PhysicalDevice | null;
  /** Причина/путь подбора либо причина отсутствия. */
  reason: string;
  candidates: number;
};

export type Placed = {
  key: string;
  itemId: string;
  tag: string;
  role: PanelRole;
  device: PhysicalDevice | null;
  /** Текст, показываемый вместо фигуры, когда её нет в библиотеке. */
  missingText?: string;
  rail: number;
  startModule: number;
  modules: number;
  x: number;
  y: number;
  w: number;
  h: number;
  points: ConnPoint[];
  label: string;
};

export type Wire = {
  id: string;
  kind: ConnKind;
  phase?: "L1" | "L2" | "L3";
  d: string;
  from: string;
  to: string;
};

export type Rail = {
  index: number;
  x: number;
  y: number;
  w: number;
  modules: number;
  used: number;
};

export type PanelBuild = {
  svg: string;
  widthMm: number;
  heightMm: number;
  rails: Rail[];
  placed: Placed[];
  wires: Wire[];
  resolutions: Resolution[];
  missing: Resolution[];
  totals: {
    positions: number;
    devices: number;
    modules: number;
    capacity: number;
    reserve: number;
    connectionPoints: number;
    derivedPoints: number;
    visioPoints: number;
    wires: number;
  };
};
