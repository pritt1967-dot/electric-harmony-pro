import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { getSchematicSymbol } from "../shape-library/schematic-library";
import { SYM_H, symBreaker, symRcd, symRcbo, symSwitch, symContactor, buildSingleLineSheets } from "./single-line";
import type { PanelProject } from "./project-model";

describe("Библиотечные фигуры однолинейной схемы", () => {
  for (const [id, render] of [
    ["qf-cable", symBreaker], ["qd", symRcd], ["qfd", symRcbo],
    ["qs", symSwitch], ["km", symContactor],
  ] as const) {
    test(`${id}: исходные контуры и равномерный масштаб`, () => {
      const symbol = getSchematicSymbol(id);
      assert.ok(symbol);
      const result = render(30, 20);
      assert.ok(result.includes(`data-library-symbol="${id}"`));
      for (const path of symbol.svg.matchAll(/<path\s+d="([^"]+)"/g)) {
        assert.ok(result.includes(`d="${path[1]}"`), "контур не изменён");
      }
      assert.match(result, /scale\([\d.]+\)/);
      assert.doesNotMatch(result, /scale\([\d.]+[, ]/);
      assert.match(result, /data-connections="[^"]+"/);
      assert.ok(result.endsWith(`x2="30" y2="${20 + SYM_H}" stroke="#000" stroke-width="0.3"/>`));
      const points = result.match(/data-connections="([^"]+)"/)?.[1];
      assert.ok(points);
      const connections = Object.fromEntries(points.split(";").map((p) => {
        const [name, coords] = p.split(":");
        return [name, coords?.split(",").map(Number)];
      }));
      assert.deepEqual(connections.in, [30, 20]);
      assert.equal(connections.out?.[0], 30);
      assert.ok(Math.abs((connections.out?.[1] ?? 0) - 35) <= 1.001);
      // The output must be the transformed endpoint of the original lead path.
      const lead = symbol.svg.match(/M\s*([-\d.]+),\s*([-\d.]+)\s+L/);
      const scale = Number(result.match(/scale\(([\d.]+)\)/)?.[1]);
      assert.ok(lead);
      assert.ok(Math.abs(20 + Number(lead[2]) * scale - (connections.out?.[1] ?? 0)) < 1e-8);
    });
  }

  test("QF cable: именно VSS #11, без самодельного прямоугольника", () => {
    const result = symBreaker(0, 0);
    assert.match(result, /data-vss-shape="11"/);
    assert.doesNotMatch(result, /<rect/);
    assert.match(result, /in:0,0/);
    assert.match(result, /out:0,16/);
  });

  test("ссылки на маркеры локальны для каждой фигуры", () => {
    const result = symBreaker(30, 20) + symBreaker(60, 20);
    const ids = [...result.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(ids.length, new Set(ids).size);
    for (const reference of result.matchAll(/url\(#([^)]+)\)/g)) {
      assert.ok(ids.includes(reference[1]));
    }
  });

  test("готовые листы: все пять фигур и уникальные маркеры в таблице", () => {
    const device = { id: "main", category: "input" as const, manufacturer: "", model: "", rating: "63A", ratedCurrent: 63, leakage: "", characteristic: "", poles: 2, modules: 2, voltage: "230", phase: "L1", circuitId: "", position: 0 };
    const circuit = { id: "line", mark: "QF1", name: "Розетки", powerKw: 2, currentA: 9, breaker: "C16", characteristic: "C", ratedCurrent: 16, poles: 1, phase: "L1" as const, cable: "3×2,5", rcd: "", modules: 1 };
    const project: PanelProject = {
      title: "Проверка отрисовки", object: "", input: { voltage: "230", phases: 1, powerKw: 5, calculatedKw: 5, cable: "3×6", mainBreaker: "63A", grounding: "TN-S", ip: "IP31" },
      busbars: ["L1", "N", "PE"], mainDevices: [
        { ...device, kind: "input", name: "Вводной рубильник" },
        { ...device, id: "km", kind: "contactor", name: "Контактор" },
      ], circuits: [{ ...circuit, rcd: "QD1" }, { ...circuit, id: "rcbo", mark: "QFD1", rcd: "АВДТ" }, { ...circuit, id: "last", mark: "QF2" }], devices: [],
      enclosure: { modules: 36, rowCapacity: 12, rows: 3, used: 12, reserve: 24, name: "Щит" },
    };
    for (const format of ["A4", "A3", "A2"] as const) {
      const svg = buildSingleLineSheets(project, format)[0];
      assert.ok(svg);
      for (const id of ["qf-cable", "qd", "qfd", "qs", "km"]) assert.ok(svg.includes(`data-library-symbol="${id}"`));
      const ids = [...svg.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
      assert.equal(ids.length, new Set(ids).size);
      for (const ref of svg.matchAll(/url\(#([^)]+)\)/g)) assert.ok(ids.includes(ref[1]));
    }
  });
});