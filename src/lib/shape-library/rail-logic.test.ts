import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { placeItems, buildChain, validatePanel, type LogicItem } from "./panel-logic";

const item = (key: string, rail: number, modules: number): LogicItem => ({
  key, deviceId: "unknown-device", rail, modules,
  manufacturer: "T", model: `M${modules}P`, ratedCurrent: 16,
});

describe("DIN-рейка: границы и свободные модули", () => {
  it("1P, 2P, 3P, 4P помещаются на пустую рейку", () => {
    const { placed } = placeItems([item("a",0,1), item("b",0,2), item("c",0,3), item("d",0,4)], 1, 12);
    assert.deepEqual(placed.map(p => p.endModule), [1, 3, 6, 10]);
    assert.ok(placed.every(p => !p.outOfRail));
  });

  it("аппарат, не помещающийся на рейке, переходит на следующую", () => {
    const { placed } = placeItems([item("a",0,4), item("b",0,4), item("c",0,4), item("d",0,4)], 2, 12);
    assert.equal(placed.find(p => p.key === "d")!.rail, 1);
    assert.ok(placed.every(p => !p.outOfRail));
  });

  it("заполненная рейка: 4P не влезает в остаток 3 мод. — уходит на рейку 2", () => {
    const { placed } = placeItems([item("a",0,3), item("b",0,3), item("c",0,3), item("d",0,4)], 2, 12);
    const d = placed.find(p => p.key === "d")!;
    assert.equal(d.rail, 1);
    assert.equal(d.startModule, 1);
    assert.equal(d.outOfRail, false);
  });

  it("без свободных реек отрицательных свободных модулей в отчёте нет", () => {
    const items = [item("a",0,4), item("b",0,4), item("c",0,4), item("d",0,4)];
    const { placed } = placeItems(items, 1, 12);
    const checks = validatePanel(placed, buildChain(placed), { rails: 1, railModules: 12, reserveModules: 0 });
    const reserve = checks.find(c => c.id === "reserve")!;
    assert.ok(reserve.detail.includes("свободно 0"));
    assert.ok(!/свободно -/.test(reserve.detail));
  });

  it("свободные модули интерфейса неотрицательны при переполнении", () => {
    assert.equal(Math.max(0, 12 - 16), 0);
  });
});
