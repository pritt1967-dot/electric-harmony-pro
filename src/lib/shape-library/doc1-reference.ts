/**
 * ЭТАЛОН ОДНОЛИНЕЙНОЙ СХЕМЫ — «Документ1.vsdx».
 *
 * Данные извлечены из page1.xml исходного файла (мастера, Shape Data
 * LabelTimVisio / Mark / Nominal / Leakage / CableText, координаты PinX/PinY,
 * ширины и связи Connects). Ничего не дорисовано и не додумано.
 *
 * Система координат Visio — снизу вверх, в дюймах. Для сравнения с генератором
 * координаты переводятся в мм экранной системы (сверху вниз) функцией toMm().
 */

export const DOC1_BASE_IN = 12.0;
export const IN_MM = 25.4;

/** Visio (дюймы, Y вверх) → мм экранные (Y вниз). */
export const doc1X = (xIn: number) => +(xIn * IN_MM).toFixed(2);
export const doc1Y = (yIn: number) => +((DOC1_BASE_IN - yIn) * IN_MM).toFixed(2);

export type Doc1Kind =
  | "load"
  | "qf-cable"
  | "qd-cable"
  | "qs-cable"
  | "qfd"
  | "qf"
  | "meter"
  | "bus"
  | "bus-source"
  | "point"
  | "wire-n"
  | "wire-pe"
  | "frame"
  | "table";

export type Doc1Element = {
  /** ID фигуры на странице Visio. */
  sheet: number;
  master: string;
  kind: Doc1Kind;
  /** Позиционное обозначение (Prop.LabelTimVisio) — QF1, QD1, QFD1, QS1… */
  label: string;
  mark: string;
  nominal: string;
  leakage: string;
  cable: string;
  /** Номер электроприёмника (Prop.NumberGroup). */
  number: number | null;
  xIn: number;
  yIn: number;
  wIn: number | null;
};

export const DOC1_ELEMENTS: Doc1Element[] = [
  { sheet: 1, master: "Боковик", kind: "table", label: "", mark: "", nominal: "", leakage: "", cable: "", number: null, xIn: 2.214566929, yIn: 2.066928934, wIn: null },

  { sheet: 23, master: "Электроприемник", kind: "load", label: "", mark: "", nominal: "", leakage: "", cable: "", number: 1, xIn: 4.035433071, yIn: 3.297244094, wIn: 1.181102362 },
  { sheet: 87, master: "Электроприемник", kind: "load", label: "", mark: "", nominal: "", leakage: "", cable: "", number: 2, xIn: 5.216535433, yIn: 3.297244094, wIn: 1.181102362 },
  { sheet: 105, master: "Электроприемник", kind: "load", label: "", mark: "", nominal: "", leakage: "", cable: "", number: 3, xIn: 6.397637795, yIn: 3.297244094, wIn: 1.181102362 },
  { sheet: 133, master: "Электроприемник", kind: "load", label: "", mark: "", nominal: "", leakage: "", cable: "", number: 4, xIn: 7.578740157, yIn: 3.297244094, wIn: 1.181102362 },
  { sheet: 150, master: "Электроприемник", kind: "load", label: "", mark: "", nominal: "", leakage: "", cable: "", number: 5, xIn: 8.759842520, yIn: 3.297244094, wIn: 1.181102362 },
  { sheet: 158, master: "Электроприемник", kind: "load", label: "", mark: "", nominal: "", leakage: "", cable: "", number: 6, xIn: 9.940944882, yIn: 3.297244094, wIn: 1.181102362 },

  { sheet: 31, master: "QF cable", kind: "qf-cable", label: "QF1", mark: "ВА47-29", nominal: "C10", leakage: "", cable: "ВВГнг(А)-LS 3х1.5", number: 1, xIn: 4.625984252, yIn: 6.250000195, wIn: 3.444881881 },
  { sheet: 95, master: "QF cable", kind: "qf-cable", label: "QF2", mark: "ВА47-29", nominal: "C10", leakage: "", cable: "ВВГнг(А)-LS 3х1.5", number: 2, xIn: 5.807086614, yIn: 6.250000195, wIn: 3.444881881 },
  { sheet: 113, master: "QF cable", kind: "qf-cable", label: "QF3", mark: "ВА47-29", nominal: "C16", leakage: "", cable: "ВВГнг(А)-LS 3х2.5", number: 3, xIn: 6.988188976, yIn: 6.250000195, wIn: 3.444881881 },
  { sheet: 141, master: "QD cable", kind: "qd-cable", label: "QD1", mark: "", nominal: "C16", leakage: "30mA", cable: "ВВГнг(А)-LS 3х2,5", number: 4, xIn: 8.169291339, yIn: 6.250000100, wIn: 3.444881690 },
  { sheet: 166, master: "QD cable", kind: "qd-cable", label: "QD2", mark: "", nominal: "C16", leakage: "30mA", cable: "ВВГнг(А)-LS 3х2,5", number: 5, xIn: 9.350393701, yIn: 6.250000100, wIn: 3.444881690 },
  { sheet: 175, master: "QD cable", kind: "qd-cable", label: "QD3", mark: "", nominal: "C16", leakage: "30mA", cable: "ВВГнг(А)-LS 3х2,5", number: 6, xIn: 10.531496063, yIn: 6.250000100, wIn: 3.444881690 },

  { sheet: 41, master: "Line L, N, PE", kind: "bus", label: "", mark: "", nominal: "", leakage: "", cable: "", number: null, xIn: 4.232283465, yIn: 7.775590551, wIn: 2.657480315 },

  { sheet: 184, master: "QS cable", kind: "qs-cable", label: "QS1", mark: "ВН32", nominal: "63А", leakage: "", cable: "ВВГнг(А)-LS 3x6", number: null, xIn: 6.397637795, yIn: 9.153543303, wIn: 2.362204733 },
  { sheet: 196, master: "QFD", kind: "qfd", label: "QFD1", mark: "АД12", nominal: "С32", leakage: "100мА", cable: "", number: null, xIn: 7.431102362, yIn: 10.334645669, wIn: 2.066929134 },
  { sheet: 193, master: "PI", kind: "meter", label: "PI", mark: "", nominal: "", leakage: "", cable: "", number: null, xIn: 8.562992126, yIn: 10.905511811, wIn: null },
  { sheet: 200, master: "QF", kind: "qf", label: "QF1", mark: "ВА47-29", nominal: "С40", leakage: "", cable: "", number: null, xIn: 10.039370074, yIn: 10.334645669, wIn: 2.755905503 },
  { sheet: 208, master: "Point", kind: "point", label: "L1", mark: "", nominal: "", leakage: "", cable: "", number: null, xIn: 11.417322826, yIn: 10.334645669, wIn: null },
  { sheet: 204, master: "Line L, N, PE", kind: "bus-source", label: "L1,L2,L3", mark: "", nominal: "", leakage: "", cable: "", number: null, xIn: 11.220472441, yIn: 11.220472441, wIn: 1.673228346 },

  { sheet: 213, master: "Провод N", kind: "wire-n", label: "", mark: "", nominal: "", leakage: "", cable: "", number: null, xIn: 10.580708659, yIn: 10.137795276, wIn: 1.279527555 },
  { sheet: 214, master: "Провод PE", kind: "wire-pe", label: "", mark: "", nominal: "", leakage: "", cable: "", number: null, xIn: 9.104330709, yIn: 9.940944882, wIn: 3.838582677 },

  { sheet: 215, master: "Щит/Шкаф", kind: "frame", label: "", mark: "", nominal: "", leakage: "", cable: "", number: null, xIn: 9.104330709, yIn: 10.482283465, wIn: 5.807086614 },
  { sheet: 216, master: "Щит/Шкаф", kind: "frame", label: "ЩК", mark: "", nominal: "", leakage: "", cable: "", number: null, xIn: 7.627952756, yIn: 7.824803150, wIn: 7.578740157 },
];

/** Связи Connects исходного файла (from-фигура → connection point to-фигуры). */
export const DOC1_CONNECTS: { from: number; to: number; port: string }[] = [
  { from: 200, to: 208, port: "Point" },
  { from: 200, to: 193, port: "Row_14" },
  { from: 31, to: 23, port: "in" },
  { from: 95, to: 87, port: "in" },
  { from: 113, to: 105, port: "in" },
  { from: 141, to: 133, port: "in" },
  { from: 166, to: 150, port: "in" },
  { from: 175, to: 158, port: "in" },
  { from: 196, to: 184, port: "out" },
  { from: 196, to: 193, port: "Row_13" },
];

/** Шаг колонок отходящих линий в эталоне (дюймы → мм). */
export const DOC1_COLUMN_PITCH_MM = +(1.181102362 * IN_MM).toFixed(2); // 30 мм
export const DOC1_FIRST_COLUMN_MM = doc1X(4.625984252);
