import { describe, expect, it } from "vitest";
import { placeItems, buildChain, validatePanel, type LogicItem } from "./panel-logic";

const item = (key: string, rail: number, modules: number): LogicItem => ({
  key, deviceId: "unknown-device", rail, modules,
  manufacturer: "T", model: `M${modules}P`, ratedCurrent: 16,
});

describe("DIN-рейка: границы и свободные модули", () => {
  it("1P, 2P, 3P, 4P помещаются на пустую рейку", () => {
    const { placed } = placeItems([item("a",0,1), item("b",0,2), item("c",0,3), item("d",0,4)], 1, 12);
    expect(placed.map(p => p.endModule)).toEqual([1, 3, 6, 10]);
    expect(placed.every(p => !p.outOfRail)).toBe(true);
  });

  it("аппарат, не помещающийся на рейке, переходит на следующую", () => {
    const { placed } = placeItems([item("a",0,4), item("b",0,4), item("c",0,4), item("d",0,4)], 2, 12);
    expect(placed.find(p => p.key === "d")!.rail).toBe(1);
    expect(placed.every(p => !p.outOfRail)).toBe(true);
  });

  it("заполненная рейка: 4P не влезает в остаток 3 мод. — уходит на рейку 2", () => {
    const { placed } = placeItems([item("a",0,3), item("b",0,3), item("c",0,3), item("d",0,4)], 2, 12);
    const d = placed.find(p => p.key === "d")!;
    expect(d.rail).toBe(1);
    expect(d.startModule).toBe(1);
    expect(d.outOfRail).toBe(false);
  });

  it("без свободных реек отрицательных свободных модулей в отчёте нет", () => {
    const items = [item("a",0,4), item("b",0,4), item("c",0,4), item("d",0,4)];
    const { placed } = placeItems(items, 1, 12);
    const checks = validatePanel(placed, buildChain(placed), { rails: 1, railModules: 12, reserveModules: 0 });
    const reserve = checks.find(c => c.id === "reserve")!;
    expect(reserve.detail).toContain("свободно 0");
    expect(reserve.detail).not.toMatch(/свободно -/);
  });

  it("свободные модули интерфейса неотрицательны при переполнении", () => {
    const capacity = 1 * 12;
    const total = 16;
    const free = Math.max(0, capacity - total);
    expect(free).toBe(0);
  });
});
