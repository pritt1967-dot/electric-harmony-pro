/**
 * Тестовый однофазный щит 230 В для практического испытания существующего конструктора.
 * Аппараты берутся ТОЛЬКО из уже импортированной библиотеки (реальные фигуры Visio).
 * Если точного аппарата в библиотеке нет — подбирается ближайший существующий
 * и помечается как временный тестовый (substitute).
 */

import { CATALOG_BY_ID, CATALOG_DEVICES, type CatalogDevice } from "./device-tree";

export type TestLine = {
  label: string;
  /** Точный id аппарата библиотеки, если он найден. */
  deviceId: string;
  substitute: boolean;
  note: string;
};

const byId = (id: string) => CATALOG_BY_ID.get(id) ?? null;

function pick(
  filter: (d: CatalogDevice) => boolean,
  fallback: (d: CatalogDevice) => boolean,
): { device: CatalogDevice | null; substitute: boolean } {
  const exact = CATALOG_DEVICES.find(filter);
  if (exact) return { device: exact, substitute: false };
  const near = CATALOG_DEVICES.find(fallback);
  return { device: near ?? null, substitute: true };
}

/** Вводной автомат 2P C25 — реальный аппарат библиотеки. */
export const MAIN_2P_C25 = pick(
  (d) => d.deviceType === "breaker" && d.poles === 2 && d.ratedCurrent === 25 && d.curve === "C",
  (d) => d.deviceType === "breaker" && d.poles === 2,
);

/** УЗО 2P 40 А / 30 мА — точного номинала в библиотеке нет. */
export const RCD_2P_40 = pick(
  (d) => d.deviceType === "rcd" && d.poles === 2 && d.ratedCurrent === 40,
  (d) => d.deviceType === "rcd" && d.poles === 2,
);

export const MCB_1P_C10 = pick(
  (d) => d.deviceType === "breaker" && d.poles === 1 && d.ratedCurrent === 10 && d.curve === "C" && d.modules === 1,
  (d) => d.deviceType === "breaker" && d.poles === 1 && d.ratedCurrent === 10,
);

export const MCB_1P_C16 = pick(
  (d) =>
    d.deviceType === "breaker" &&
    d.poles === 1 &&
    d.ratedCurrent === 16 &&
    d.curve === "C" &&
    d.modules === 1 &&
    d.manufacturer === "IEK",
  (d) => d.deviceType === "breaker" && d.poles === 1 && d.ratedCurrent === 16 && d.modules === 1,
);

/** Реальные фигуры шин N и PE из библиотеки (ABB Mistral). */
export const BUS_N = byId("abb-abb-mistral-65-24m-шина-n-5");
export const BUS_PE = byId("abb-abb-mistral-65-24m-шина-pe-4");

export type TestPanelRole = "main" | "rcd" | "group";

export type TestPanelItem = {
  label: string;
  device: CatalogDevice;
  substitute: boolean;
  note: string;
  role: TestPanelRole;
};

/** Состав тестового щита: ввод → УЗО → отходящие линии. */
export function testPanel230(): TestPanelItem[] {
  const rows: (TestPanelItem | null)[] = [
    MAIN_2P_C25.device && {
      label: "QF1 Ввод 2P C25",
      role: "main" as const,
      device: MAIN_2P_C25.device,
      substitute: MAIN_2P_C25.substitute,
      note: MAIN_2P_C25.substitute ? "временный тестовый аналог" : "реальный аппарат библиотеки",
    },
    RCD_2P_40.device && {
      label: "QD1 УЗО 40 А / 30 мА",
      role: "rcd" as const,
      device: RCD_2P_40.device,
      substitute: RCD_2P_40.substitute,
      note: RCD_2P_40.substitute
        ? "в библиотеке нет УЗО 2P 40 А / 30 мА — временный тестовый аналог"
        : "реальный аппарат библиотеки",
    },
    ...[
      ["QF2 Освещение 1 C10", MCB_1P_C10],
      ["QF3 Освещение 2 C10", MCB_1P_C10],
      ["QF4 Розетки комнат C16", MCB_1P_C16],
      ["QF5 Розетки кухни C16", MCB_1P_C16],
      ["QF6 Стиральная машина C16", MCB_1P_C16],
      ["QF7 Посудомоечная машина C16", MCB_1P_C16],
      ["QF8 Бойлер C16", MCB_1P_C16],
    ].map(([label, src]) => {
      const s = src as { device: CatalogDevice | null; substitute: boolean };
      return s.device
        ? {
            label: label as string,
            role: "group" as const,
            device: s.device,
            substitute: s.substitute,
            note: s.substitute ? "временный тестовый аналог" : "реальный аппарат библиотеки",
          }
        : null;
    }),
  ];
  return rows.filter(Boolean) as TestPanelItem[];
}
