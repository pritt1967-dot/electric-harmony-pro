/**
 * ПРОВЕРКА И СРАВНЕНИЕ С ЭТАЛОНАМИ (тестовый режим).
 * 1) 10 логических проверок единой модели;
 * 2) сравнение однолинейной схемы с «Документ1.vsdx»;
 * 3) сравнение физической раскладки с «Щит зарядки.vsdx».
 */

import {
  DOC1_COLUMN_PITCH_MM,
  DOC1_ELEMENTS,
  DOC1_FIRST_COLUMN_MM,
  doc1Y,
} from "./doc1-reference";
import type { SingleLine } from "./single-line-build";
import { SL } from "./single-line-build";
import { BUS_REF, SOURCE_REF, type UProject } from "./unified-model";

export type CheckRow = {
  id: number;
  name: string;
  ok: boolean;
  detail: string;
};

/** 10 обязательных проверок собранного проекта. */
export function verifyProject(project: UProject): { rows: CheckRow[]; passed: number } {
  const { devices, loads, connections, groups, rails } = project.board;
  const rows: CheckRow[] = [];
  const add = (id: number, name: string, ok: boolean, detail: string) =>
    rows.push({ id, name, ok, detail });

  // 1 — уникальность внутренних ID
  const ids = new Set(devices.map((d) => d.id));
  add(1, "Уникальность ID аппаратов", ids.size === devices.length, `${ids.size} из ${devices.length}`);

  // 2 — все фигуры найдены в библиотеке (без заменителей)
  const missing = devices.filter((d) => !d.shape);
  add(
    2,
    "Все аппараты есть в библиотеке",
    missing.length === 0,
    missing.length ? missing.map((d) => `${d.label} ${d.model}`).join(", ") : "отсутствующих фигур нет",
  );

  // 3 — у каждой отходящей линии есть электроприёмник
  const feeders = devices.filter((d) => d.role === "feeder" || d.role === "feeder-rcbo");
  const withLoad = feeders.filter((d) => loads.some((l) => l.deviceId === d.id));
  add(3, "У каждой линии есть электроприёмник", withLoad.length === feeders.length, `${withLoad.length} из ${feeders.length}`);

  // 4 — кабель указан для каждой отходящей линии
  const noCable = feeders.filter((d) => !d.cable);
  add(4, "Кабель указан для всех линий", noCable.length === 0, noCable.map((d) => d.label).join(", ") || "все линии с кабелем");

  // 5 — номинал указан для каждого аппарата защиты
  const noRating = devices.filter((d) => d.kind !== "PI" && !d.nominalText);
  add(5, "Номиналы аппаратов заданы", noRating.length === 0, noRating.map((d) => d.label).join(", ") || "все номиналы заданы");

  // 6 — вводная цепочка непрерывна от источника до шин
  const logical = connections.filter((c) => c.kind === "logical");
  const nextOf = new Map(logical.map((c) => [c.from.ref, c.to.ref]));
  let cursor: string | undefined = SOURCE_REF;
  let steps = 0;
  while (cursor && cursor !== BUS_REF && steps < 50) {
    cursor = nextOf.get(cursor);
    steps++;
  }
  add(6, "Вводная цепочка непрерывна", cursor === BUS_REF, cursor === BUS_REF ? `${steps} звен(а) до шин` : "разрыв цепочки ввода");

  // 7 — нет неподключённых аппаратов
  const used = new Set(connections.flatMap((c) => [c.from.ref, c.to.ref]));
  const orphans = devices.filter((d) => !used.has(d.id));
  add(7, "Нет неподключённых аппаратов", orphans.length === 0, orphans.map((d) => d.label).join(", ") || "все аппараты в связях");

  // 8 — физические провода опираются на реальные точки подключения Visio
  const phys = connections.filter((c) => c.kind === "physical");
  const badPhys = phys.filter((c) => !c.ok);
  add(
    8,
    "Провода идут по точкам подключения",
    badPhys.length === 0,
    `${phys.length - badPhys.length} из ${phys.length}`,
  );

  // 9 — вместимость реек и резерв
  const overflowRail = rails.find((r) => r.used > r.modules);
  add(
    9,
    "Вместимость DIN-реек соблюдена",
    !overflowRail && !project.physical.totals.overflow,
    `свободно ${project.physical.totals.free} мод., рейк(и): ${rails.map((r) => `${r.used}/${r.modules}`).join(", ")}`,
  );

  // 10 — схема и щит синхронны: каждый аппарат размещён физически и входит в группу
  const unplaced = devices.filter((d) => d.rail == null);
  const ungrouped = devices.filter((d) => !groups.some((g) => g.deviceIds.includes(d.id)));
  add(
    10,
    "Схема и раскладка синхронны",
    unplaced.length === 0 && ungrouped.length === 0,
    unplaced.length
      ? `не размещены: ${unplaced.map((d) => d.label).join(", ")}`
      : `${devices.length} аппарат(ов) в ${groups.length} групп(ах)`,
  );

  return { rows, passed: rows.filter((r) => r.ok).length };
}

export type CompareRow = { label: string; original: string | number; built: string | number; match: boolean };

const near = (a: number, b: number, tol = 0.6) => Math.abs(a - b) <= tol;

/** Сравнение сгенерированной однолинейной схемы с эталоном «Документ1.vsdx». */
export function compareWithDoc1(project: UProject, sl: SingleLine) {
  const refLoads = DOC1_ELEMENTS.filter((e) => e.kind === "load");
  const refFeeders = DOC1_ELEMENTS.filter((e) => e.kind === "qf-cable" || e.kind === "qd-cable");
  const refInputs = DOC1_ELEMENTS.filter((e) =>
    ["qs-cable", "qfd", "qf", "meter"].includes(e.kind),
  );
  const refCables = new Set(refFeeders.map((e) => e.cable).filter(Boolean));

  const builtLoads = sl.elements.filter((e) => e.kind === "load");
  const builtDevices = sl.elements.filter((e) => e.kind === "device");
  const builtInputs = sl.elements.filter((e) => e.kind === "input");
  const feeders = project.board.devices.filter((d) => d.role === "feeder" || d.role === "feeder-rcbo");
  const builtCables = new Set(feeders.map((d) => d.cable).filter(Boolean));

  const firstCol = builtDevices[0]?.xMm ?? 0;
  const pitch =
    builtDevices.length > 1 ? +(builtDevices[1]!.xMm - builtDevices[0]!.xMm).toFixed(2) : 0;
  const cableHit = [...builtCables].filter((c) => refCables.has(c)).length;

  const rows: CompareRow[] = [
    {
      label: "Электроприёмников",
      original: refLoads.length,
      built: builtLoads.length,
      match: refLoads.length === builtLoads.length,
    },
    {
      label: "Аппаратов отходящих линий",
      original: refFeeders.length,
      built: builtDevices.length,
      match: refFeeders.length === builtDevices.length,
    },
    {
      label: "Аппаратов ввода (QS/PI/QFD/QF)",
      original: refInputs.length,
      built: builtInputs.length,
      match: refInputs.length === builtInputs.length,
    },
    {
      label: "Шаг колонок, мм",
      original: DOC1_COLUMN_PITCH_MM,
      built: pitch,
      match: near(pitch, DOC1_COLUMN_PITCH_MM),
    },
    {
      label: "X первой колонки, мм",
      original: DOC1_FIRST_COLUMN_MM,
      built: +firstCol.toFixed(2),
      match: near(firstCol, DOC1_FIRST_COLUMN_MM),
    },
    {
      label: "Уровень аппаратов Y, мм",
      original: doc1Y(6.25),
      built: SL.yDevice,
      match: near(SL.yDevice, doc1Y(6.25)),
    },
    {
      label: "Уровень шин L/N/PE, мм",
      original: doc1Y(7.775590551),
      built: SL.yBus,
      match: near(SL.yBus, doc1Y(7.775590551)),
    },
    {
      label: "Уровень электроприёмников Y, мм",
      original: doc1Y(3.297244094),
      built: SL.yLoad,
      match: near(SL.yLoad, doc1Y(3.297244094)),
    },
    {
      label: "Рамка щита ЩК",
      original: "есть",
      built: sl.elements.some((e) => e.kind === "frame") ? "есть" : "нет",
      match: sl.elements.some((e) => e.kind === "frame"),
    },
    {
      label: "Марки кабелей совпадают",
      original: refCables.size,
      built: cableHit,
      match: cableHit === refCables.size && refCables.size > 0,
    },
  ];

  const percent = Math.round((rows.filter((r) => r.match).length / rows.length) * 100);
  return { rows, percent };
}
