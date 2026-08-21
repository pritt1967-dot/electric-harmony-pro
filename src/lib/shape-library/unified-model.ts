/**
 * ЕДИНАЯ ВНУТРЕННЯЯ МОДЕЛЬ ТЕСТОВОГО РЕЖИМА СБОРКИ:
 *
 *   Project → Board → Groups → Devices → Connections → Loads
 *
 * Одна и та же спецификация порождает ДВА связанных представления:
 *   • однолинейную схему (эталон «Документ1.vsdx»);
 *   • физическую раскладку щита (эталон «Щит зарядки.vsdx»).
 * Никаких отдельных данных для схемы и для щита не создаётся: у аппарата один
 * внутренний ID, одна DIN-рейка, одна позиция, один кабель и одна фаза.
 *
 * К рабочему визуализатору и проектировщику НЕ подключено.
 */

import type { LibraryItem } from "./index";
import {
  assembleFromSpec,
  MODULE_MM,
  modulesOf,
  type SpecAssembly,
  type SpecOptions,
  type SpecRole,
  type SpecRow,
  type SpecWire,
} from "./spec-assemble";

export type DeviceKind = "QS" | "PI" | "QFD" | "QF" | "QD";

export type UDevice = {
  /** Внутренний уникальный ID — один и тот же в схеме и в щите. */
  id: string;
  /** Ключ размещения физической раскладки (совпадает с SpecPlaced.key). */
  key: string;
  specRowId: string;
  /** Позиционное обозначение по ГОСТ: QF1, QD2, QFD1, QS1, PI. */
  label: string;
  kind: DeviceKind;
  role: SpecRole;
  groupId: string;
  manufacturer: string;
  model: string;
  mark: string;
  nominalText: string;
  leakage: string;
  poles: number | null;
  modules: number;
  phase: string;
  cable: string;
  /** Физика: DIN-рейка, позиция в модулях от левого края рейки, координаты в мм. */
  rail: number | null;
  position: number | null;
  xMm: number | null;
  yMm: number | null;
  shape: LibraryItem | null;
  connectionPoints: string[];
  missingReason: string;
};

export type ULoad = {
  id: string;
  number: number;
  name: string;
  deviceId: string;
};

export type UGroup = {
  id: string;
  name: string;
  kind: "input" | "feeder";
  deviceIds: string[];
};

export type UConnection = {
  id: string;
  from: { ref: string; port: string };
  to: { ref: string; port: string };
  kind: "logical" | "physical";
  wire: "L" | "N" | "PE" | "L1,L2,L3";
  cable: string;
  ok: boolean;
  note: string;
};

export type UBoard = {
  id: string;
  name: string;
  railModules: number;
  reserveModules: number;
  rails: SpecAssembly["rails"];
  groups: UGroup[];
  devices: UDevice[];
  loads: ULoad[];
  connections: UConnection[];
};

export type UProject = {
  title: string;
  supply: string;
  board: UBoard;
  /** Физическая сборка (реальные SVG фигуры библиотеки). */
  physical: SpecAssembly;
};

export const SOURCE_REF = "SRC";
export const BUS_REF = "BUS";

const KIND_BY_ROLE: Record<SpecRole, DeviceKind> = {
  "input-switch": "QS",
  meter: "PI",
  "input-rcbo": "QFD",
  "main-breaker": "QF",
  feeder: "QF",
  "feeder-rcbo": "QD",
};

/** Порядок вводной цепочки от источника к шинам (как в «Документ1.vsdx»). */
export const INPUT_CHAIN: SpecRole[] = ["main-breaker", "meter", "input-rcbo", "input-switch"];

const isFeeder = (r: SpecRole) => r === "feeder" || r === "feeder-rcbo";

function roleOf(row: SpecRow): SpecRole {
  if (row.role) return row.role;
  return row.equipment_type === "rcd" ? "feeder-rcbo" : "feeder";
}

function portsOf(item: LibraryItem | null) {
  const ids = item?.connection_points.map((c) => c.id) ?? [];
  return { ids, in: ids[0] ?? "", out: ids[ids.length - 1] ?? "" };
}

export type UOptions = SpecOptions & { title?: string; supply?: string };

/** Спецификация → единая модель проекта (логика + физика в одних объектах). */
export function buildUnifiedProject(
  spec: SpecRow[],
  opts: UOptions,
  extraWires: SpecWire[] = [],
): UProject {
  const physical = assembleFromSpec(spec, opts, extraWires);
  const placedByKey = new Map(physical.placed.map((p) => [p.key, p]));
  const matchByRow = new Map(physical.matches.map((m) => [m.row.id, m]));

  const devices: UDevice[] = [];
  const groups: UGroup[] = [];
  const loads: ULoad[] = [];
  const counters: Record<DeviceKind, number> = { QS: 0, PI: 0, QFD: 0, QF: 0, QD: 0 };
  let loadNo = 0;

  const inputGroup: UGroup = { id: "G0", name: "Ввод", kind: "input", deviceIds: [] };
  groups.push(inputGroup);

  spec.forEach((row, ri) => {
    const role = roleOf(row);
    const kind = KIND_BY_ROLE[role];
    const match = matchByRow.get(row.id);
    const item = match?.item ?? null;
    const feeder = isFeeder(role);
    const group: UGroup = feeder
      ? { id: `G${ri + 1}`, name: row.load || row.model || `Группа ${ri + 1}`, kind: "feeder", deviceIds: [] }
      : inputGroup;
    if (feeder) groups.push(group);

    const qty = Math.max(1, Math.round(row.qty || 1));
    for (let n = 0; n < qty; n++) {
      counters[kind] += 1;
      const key = `${row.id}-${n}`;
      const placed = placedByKey.get(key) ?? null;
      const rail = placed ? physical.rails[placed.rail] ?? null : null;
      const id = `${kind}${counters[kind]}`;
      const dev: UDevice = {
        id,
        key,
        specRowId: row.id,
        label: kind === "PI" ? "PI" : id,
        kind,
        role,
        groupId: group.id,
        manufacturer: row.manufacturer,
        model: row.model,
        mark: row.mark ?? row.series ?? "",
        nominalText: row.nominalText || (row.nominal != null ? `C${row.nominal}` : ""),
        leakage: row.leakage ?? "",
        poles: row.poles,
        modules: item ? modulesOf(item) : 0,
        phase: row.phase || (row.poles && row.poles >= 3 ? "L1,L2,L3" : "L1"),
        cable: row.cable ?? "",
        rail: placed ? placed.rail : null,
        position: placed && rail ? Math.round((placed.x - rail.x) / MODULE_MM) : null,
        xMm: placed ? +placed.x.toFixed(2) : null,
        yMm: placed ? +placed.y.toFixed(2) : null,
        shape: item,
        connectionPoints: item?.connection_points.map((c) => c.id) ?? [],
        missingReason: item ? "" : match?.reason ?? "фигура не найдена",
      };
      devices.push(dev);
      group.deviceIds.push(id);

      if (feeder) {
        loadNo += 1;
        loads.push({
          id: `EL${loadNo}`,
          number: loadNo,
          name: row.load || `Электроприёмник ${loadNo}`,
          deviceId: id,
        });
      }
    }
  });

  // -------------------------------------------------- связи (единый источник)
  const connections: UConnection[] = [];
  const byId = new Map(devices.map((d) => [d.id, d]));
  let cn = 0;
  const push = (c: Omit<UConnection, "id">) => connections.push({ ...c, id: `C${++cn}` });

  const chain = INPUT_CHAIN.flatMap((role) => devices.filter((d) => d.role === role));
  let prev = SOURCE_REF;
  let prevPort = "L1,L2,L3";
  for (const d of chain) {
    const p = portsOf(d.shape);
    push({
      from: { ref: prev, port: prevPort },
      to: { ref: d.id, port: p.in || "in" },
      kind: "logical",
      wire: "L1,L2,L3",
      cable: d.cable,
      ok: true,
      note: "",
    });
    prev = d.id;
    prevPort = p.out || "out";
  }
  push({
    from: { ref: prev, port: prevPort },
    to: { ref: BUS_REF, port: "L" },
    kind: "logical",
    wire: "L1,L2,L3",
    cable: chain[chain.length - 1]?.cable ?? "",
    ok: true,
    note: "",
  });

  for (const load of loads) {
    const d = byId.get(load.deviceId)!;
    const p = portsOf(d.shape);
    push({
      from: { ref: BUS_REF, port: d.phase },
      to: { ref: d.id, port: p.in || "in" },
      kind: "logical",
      wire: "L",
      cable: "",
      ok: true,
      note: "",
    });
    push({
      from: { ref: d.id, port: p.out || "out" },
      to: { ref: load.id, port: "in" },
      kind: "logical",
      wire: "L",
      cable: d.cable,
      ok: !!d.cable,
      note: d.cable ? "" : "не указан кабель линии",
    });
  }

  // -------- физические связи: строго по реальным connection points библиотеки
  const chainPhys = [...chain];
  for (let i = 0; i < chainPhys.length - 1; i++) {
    const a = chainPhys[i]!;
    const b = chainPhys[i + 1]!;
    const pa = portsOf(a.shape);
    const pb = portsOf(b.shape);
    const ok = !!(pa.out && pb.in);
    push({
      from: { ref: a.id, port: pa.out || "—" },
      to: { ref: b.id, port: pb.in || "—" },
      kind: "physical",
      wire: "L",
      cable: "",
      ok,
      note: ok ? "" : "у фигуры нет точек подключения в исходном Visio",
    });
  }
  const busSource = chainPhys[chainPhys.length - 1] ?? null;
  for (const load of loads) {
    const d = byId.get(load.deviceId)!;
    const p = portsOf(d.shape);
    const src = busSource;
    const ps = portsOf(src?.shape ?? null);
    const ok = !!(src && ps.out && p.in);
    push({
      from: { ref: src?.id ?? BUS_REF, port: ps.out || "—" },
      to: { ref: d.id, port: p.in || "—" },
      kind: "physical",
      wire: "L",
      cable: d.cable,
      ok,
      note: ok ? "" : "нет точки подключения для физического провода",
    });
  }

  const board: UBoard = {
    id: "ЩК",
    name: "ЩК",
    railModules: opts.railModules,
    reserveModules: opts.reserveModules,
    rails: physical.rails,
    groups,
    devices,
    loads,
    connections,
  };

  return {
    title: opts.title ?? "Тестовый проект щита",
    supply: opts.supply ?? "380/220 В, 50 Гц, TN-S",
    board,
    physical,
  };
}

/** Провода физической раскладки, построенные из единой модели (без ручного ввода). */
export function modelWires(project: UProject): SpecWire[] {
  const byId = new Map(project.board.devices.map((d) => [d.id, d]));
  return project.board.connections
    .filter((c) => c.kind === "physical" && c.ok)
    .map((c) => {
      const a = byId.get(c.from.ref);
      const b = byId.get(c.to.ref);
      if (!a || !b) return null;
      return { id: c.id, from: { key: a.key, conn: c.from.port }, to: { key: b.key, conn: c.to.port } };
    })
    .filter(Boolean) as SpecWire[];
}
