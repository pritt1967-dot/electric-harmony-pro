/**
 * Инженерная логика щита для существующего конструктора «Щит из библиотеки Visio»:
 * координаты аппаратов на DIN-рейках, логическая цепочка Ввод → вводной аппарат → УЗО →
 * групповые автоматы → нагрузки, привязка N и PE, проверки раскладки.
 *
 * Модуль только описывает и проверяет то, что уже задано пользователем.
 * Автоматических электротехнических выводов (подбор номиналов, сечений и т. п.) здесь нет.
 */

import { CATALOG_BY_ID, type CatalogDevice } from "./device-tree";

export type PanelRole = "main" | "rcd" | "group" | "other";

export type LogicItem = {
  key: string;
  deviceId: string;
  rail: number;
  modules: number;
  manufacturer: string;
  model: string;
  ratedCurrent: number | null;
  label?: string;
  role?: PanelRole;
  substitute?: boolean;
};

export type PlacedItem = LogicItem & {
  /** Порядковый номер в общей цепочке (по рейкам слева направо). */
  order: number;
  /** Координата на рейке: первый занятый модуль (с 1). */
  startModule: number;
  /** Последний занятый модуль. */
  endModule: number;
  role: PanelRole;
  device: CatalogDevice | null;
  poles: number | null;
  curve: string | null;
  series: string;
  /** Аппарат не помещается в рейку или рейки не существует. */
  outOfRail: boolean;
};

export type PanelGroupLine = {
  item: PlacedItem;
  phase: "L";
  /** Имя шины N, к которой привязана линия. */
  nBus: string;
  pe: "PE";
};

export type PanelChain = {
  supply: { phases: 1; voltage: 230 };
  main: PlacedItem | null;
  /** Ветви: УЗО и подключённые к нему линии; УЗО может отсутствовать (прямые линии). */
  branches: { rcd: PlacedItem | null; nBus: string; lines: PanelGroupLine[] }[];
  nBuses: string[];
  peBus: "PE (общая)";
};

export type Check = { id: string; title: string; ok: boolean; detail: string };

/** Роль аппарата: из явного поля, иначе из типа аппарата и маркировки. */
export function roleOf(item: LogicItem, device: CatalogDevice | null, index: number): PanelRole {
  if (item.role) return item.role;
  const label = (item.label ?? "").toLowerCase();
  const type = device?.deviceType ?? "";
  if (type === "rcd") return "rcd";
  if (label.includes("ввод") || (index === 0 && type === "breaker")) return "main";
  if (type === "breaker" || type === "rcbo") return "group";
  return "other";
}

/** Раскладка: координаты аппаратов по рейкам (модули считаются слева направо). */
export function placeItems(
  items: LogicItem[],
  rails: number,
  railModules: number,
): { placed: PlacedItem[]; railUsed: number[] } {
  const railUsed = Array.from({ length: Math.max(rails, 1) }, () => 0);
  const cursor = new Map<number, number>();
  const placed: PlacedItem[] = [];

  items.forEach((it, index) => {
    const device = CATALOG_BY_ID.get(it.deviceId) ?? null;
    const start = (cursor.get(it.rail) ?? 0) + 1;
    const end = start + it.modules - 1;
    cursor.set(it.rail, end);
    if (railUsed[it.rail] != null) railUsed[it.rail]! += it.modules;
    placed.push({
      ...it,
      order: index,
      startModule: start,
      endModule: end,
      role: roleOf(it, device, index),
      device,
      poles: device?.poles ?? null,
      curve: device?.curve ?? null,
      series: device?.series ?? "",
      outOfRail: it.rail < 0 || it.rail >= rails || end > railModules,
    });
  });

  // порядок в цепочке: сначала рейка, затем позиция на рейке
  placed.sort((a, b) => (a.rail - b.rail) || (a.startModule - b.startModule));
  placed.forEach((p, i) => (p.order = i));
  return { placed, railUsed };
}

/** Логическая цепочка щита и привязка N / PE. */
export function buildChain(placed: PlacedItem[]): PanelChain {
  const main = placed.find((p) => p.role === "main") ?? null;
  const branches: PanelChain["branches"] = [];
  const direct: PanelGroupLine[] = [];
  let current: PanelChain["branches"][number] | null = null;
  let rcdIndex = 0;

  for (const p of placed) {
    if (p === main) continue;
    if (p.role === "rcd") {
      rcdIndex += 1;
      const tag = (p.label ?? "").split(" ")[0] || `QD${rcdIndex}`;
      current = { rcd: p, nBus: `N после ${tag}`, lines: [] };
      branches.push(current);
      continue;
    }
    if (p.role !== "group") continue;
    const line: PanelGroupLine = {
      item: p,
      phase: "L",
      nBus: current ? current.nBus : "N (вводная)",
      pe: "PE",
    };
    if (current) current.lines.push(line);
    else direct.push(line);
  }

  if (direct.length) {
    branches.unshift({ rcd: null, nBus: "N (вводная)", lines: direct });
  }

  return {
    supply: { phases: 1, voltage: 230 },
    main,
    branches,
    nBuses: [...new Set(branches.map((b) => b.nBus))],
    peBus: "PE (общая)",
  };
}

/** Проверки раскладки и логики. Только констатация фактов по текущему составу щита. */
export function validatePanel(
  placed: PlacedItem[],
  chain: PanelChain,
  opts: { rails: number; railModules: number; reserveModules: number },
): Check[] {
  const checks: Check[] = [];
  const add = (id: string, title: string, ok: boolean, detail: string) =>
    checks.push({ id, title, ok, detail });

  // 1. уникальные ID
  const keys = placed.map((p) => p.key);
  const dupKeys = keys.filter((k, i) => keys.indexOf(k) !== i);
  add(
    "ids",
    "Уникальные ID аппаратов",
    dupKeys.length === 0,
    dupKeys.length ? `повторяются: ${[...new Set(dupKeys)].join(", ")}` : `${keys.length} уникальных ID`,
  );

  // 2. полюса и модули
  const poleMismatch = placed.filter((p) => p.poles != null && p.poles !== p.modules);
  add(
    "poles",
    "Полюса и ширина в модулях (1P=1, 2P=2, 3P=3, 4P=4)",
    poleMismatch.length === 0,
    poleMismatch.length
      ? poleMismatch.map((p) => `${p.label ?? p.model}: ${p.poles}P = ${p.modules} мод.`).join("; ")
      : "у всех аппаратов ширина совпадает с числом полюсов",
  );

  // 3. наложения
  const overlaps: string[] = [];
  const byRail = new Map<number, PlacedItem[]>();
  for (const p of placed) byRail.set(p.rail, [...(byRail.get(p.rail) ?? []), p]);
  for (const [rail, list] of byRail) {
    const sorted = [...list].sort((a, b) => a.startModule - b.startModule);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i]!.startModule <= sorted[i - 1]!.endModule) {
        overlaps.push(`рейка ${rail + 1}: ${sorted[i - 1]!.model} и ${sorted[i]!.model}`);
      }
    }
  }
  add("overlap", "Нет наложений аппаратов", overlaps.length === 0, overlaps.join("; ") || "каждый модуль занят не более чем одним аппаратом");

  // 4. выход за пределы рейки
  const out = placed.filter((p) => p.outOfRail);
  add(
    "bounds",
    "Аппараты не выходят за пределы DIN-рейки",
    out.length === 0,
    out.length
      ? out.map((p) => `${p.label ?? p.model} (рейка ${p.rail + 1}, модули ${p.startModule}–${p.endModule})`).join("; ")
      : `все аппараты внутри ${opts.railModules} мод. на рейку`,
  );

  // 5. модули и резерв
  const used = placed.reduce((s, p) => s + p.modules, 0);
  const capacity = opts.rails * opts.railModules;
  add(
    "reserve",
    "Резерв модулей",
    capacity - used >= opts.reserveModules,
    `всего ${capacity}, занято ${used}, свободно ${capacity - used}, требуется резерв ${opts.reserveModules}`,
  );

  // 6. цепочка
  add(
    "chain",
    "Логическая цепочка Ввод → вводной аппарат → УЗО → группы → нагрузки",
    Boolean(chain.main) && chain.branches.some((b) => b.lines.length > 0),
    chain.main
      ? `ввод: ${chain.main.label ?? chain.main.model}; ветвей: ${chain.branches.length}; линий: ${chain.branches.reduce((s, b) => s + b.lines.length, 0)}`
      : "вводной аппарат не определён",
  );

  // 7. N и PE у каждой группы
  const lines = chain.branches.flatMap((b) => b.lines);
  const noN = lines.filter((l) => !l.nBus);
  add(
    "np",
    "У каждой группы есть фаза, N и PE",
    lines.length > 0 && noN.length === 0,
    `${lines.length} линий: L + N + PE; шин N: ${chain.nBuses.length}; шина PE: ${chain.peBus}`,
  );

  // 8. N после УЗО не смешивается
  const perLine = new Map<string, Set<string>>();
  for (const b of chain.branches) for (const l of b.lines) {
    perLine.set(l.item.key, new Set([...(perLine.get(l.item.key) ?? []), b.nBus]));
  }
  const mixed = [...perLine.entries()].filter(([, s]) => s.size > 1);
  const rcdBuses = chain.branches.filter((b) => b.rcd).map((b) => b.nBus);
  add(
    "n-separation",
    "N после УЗО не смешивается с N других групп",
    mixed.length === 0 && rcdBuses.length === new Set(rcdBuses).size,
    rcdBuses.length
      ? `отдельные шины N: ${rcdBuses.join(", ")}`
      : "УЗО в щите нет — все линии на вводной шине N",
  );

  // 9. дубликаты аппаратов на одной позиции
  const posKey = placed.map((p) => `${p.rail}:${p.startModule}`);
  const dupPos = posKey.filter((k, i) => posKey.indexOf(k) !== i);
  add(
    "positions",
    "Нет двух аппаратов в одном модуле",
    dupPos.length === 0,
    dupPos.length ? `совпадающие позиции: ${[...new Set(dupPos)].join(", ")}` : "позиции всех аппаратов различны",
  );

  return checks;
}
