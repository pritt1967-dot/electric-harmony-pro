import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { getSchematicSymbol } from "../shape-library/schematic-library";
import { SYM_H, symBreaker, symRcd, symRcbo, symSwitch, symContactor, buildSingleLineSheets } from "./single-line";
import type { PanelProject } from "./project-model";

const fixture = (count = 3): PanelProject => ({
  title: "Геометрия VSDX", object: "", input: { voltage: "400", phases: 3, powerKw: 5, calculatedKw: 5, cable: "5×6", mainBreaker: "63A", grounding: "TN-S", ip: "IP31" },
  busbars: ["L1", "L2", "L3", "N", "PE"], mainDevices: [], devices: [],
  circuits: Array.from({ length: count }, (_, i) => ({ id: `line-${i}`, mark: `QF${i + 1}`, name: "Розетки", powerKw: 2, currentA: 9, breaker: "C16", characteristic: "C", ratedCurrent: 16, poles: 1, phase: (["L1", "L2", "L3"] as const)[i % 3] ?? "L1", cable: "ВВГнг-LS 3×2,5", rcd: i === 0 ? "QD1" : i === 1 ? "АВДТ" : "", modules: 1 })),
  enclosure: { modules: 36, rowCapacity: 12, rows: 3, used: 12, reserve: 24, name: "Щит" },
});

describe("Компоновка по Документ1.vsdx", () => {
  test("горизонтальные раздельные шины и точное подключение N/PE к SVG", () => {
    const svg = buildSingleLineSheets(fixture())[0];
    assert.ok(svg);
    const rails = new Map([...svg.matchAll(/data-bus="([^"]+)"><line x1="([^"]+)" y1="([^"]+)" x2="([^"]+)" y2="([^"]+)"/g)].map((m) => {
      assert.equal(m[3], m[5]);
      return [m[1], Number(m[3])] as const;
    }));
    assert.equal(rails.size, 5);
    assert.ok((rails.get("N") ?? 0) < (rails.get("PE") ?? 0));
    const connections = [...svg.matchAll(/data-circuit="([^"]+)"><g[^>]*data-connections="([^"]+)"/g)];
    assert.equal(connections.length, 3);
    for (const m of connections) for (const terminal of ["N", "PE"]) {
      const point = m[2].split(";").find((p) => p.startsWith(terminal + ":"))?.split(":")[1]?.split(",");
      assert.ok(point);
      assert.ok(svg.includes(`data-terminal-wire="${terminal}" data-for="${m[1]}"><line x1="${point[0]}" y1="${rails.get(terminal)}" x2="${point[0]}" y2="${point[1]}"`));
    }
  });

  test("контуры кабельных QF/QFD неизменны, масштаб не сжимает символ до 16 мм", () => {
    const svg = buildSingleLineSheets(fixture())[0];
    assert.ok(svg);
    for (const id of ["qf-cable", "qfd-cable"]) {
      const symbol = getSchematicSymbol(id);
      assert.ok(symbol);
      for (const path of symbol.svg.matchAll(/<path\s+d="([^"]+)"/g)) assert.ok(svg.includes(`d="${path[1]}"`));
      const scales = [...svg.matchAll(new RegExp(`data-library-symbol="${id}"[^>]*scale\\(([\\d.]+)\\)`, "g"))].map((m) => Number(m[1]));
      assert.ok(scales.some((scale) => Math.abs(scale - 25.4 / 72) < 1e-6));
    }
    assert.doesNotMatch(svg, /ВВГнг\(А\)-LS/); // Library placeholder text must not replace project cables.
  });

  test("30 мм шаг колонок; центры таблицы совпадают с линиями на всех форматах", () => {
    for (const format of ["A4", "A3", "A2"] as const) {
      const svg = buildSingleLineSheets(fixture(), format)[0];
      assert.ok(svg);
      const transform = svg.match(/data-doc1-layout="true" transform="translate\(([^ ]+) [^)]+\) scale\(([^)]+)\)/);
      assert.ok(transform);
      const centers = [...svg.matchAll(/data-table-group="[^"]+" data-center-x="([^"]+)"/g)].map((m) => Number(m[1]));
      assert.equal(centers.length, 3);
      centers.forEach((x, i) => assert.ok(Math.abs(x - (Number(transform[1]) + (50 + i * 30) * Number(transform[2]))) < 1e-8));
      assert.match(svg, /data-panel-boundary="true"[^>]*stroke-dasharray="4 2"/);
      assert.doesNotMatch(svg, /NaN|Infinity/);
    }
  });

  test("количество групп сохраняется при разбивке; проект не изменяется", () => {
    const p = fixture(28);
    const before = JSON.stringify(p);
    for (const format of ["A4", "A3", "A2"] as const) {
      const sheets = buildSingleLineSheets(p, format);
      const groups = sheets.flatMap((s) => [...s.matchAll(/data-circuit="([^"]+)"/g)].map((m) => m[1]));
      assert.deepEqual(groups, p.circuits.map((c) => c.id));
      for (const svg of sheets) {
        const ids = [...svg.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
        assert.equal(ids.length, new Set(ids).size);
      }
    }
    assert.equal(JSON.stringify(p), before);
  });

  test("фазный ввод и отходящие линии не заканчиваются на шине N или PE", () => {
    const svg = buildSingleLineSheets(fixture())[0];
    assert.ok(svg);
    const phaseRailY = [66, 71, 76];
    for (const m of svg.matchAll(/data-circuit="([^"]+)"><g[^>]*data-connections="([^"]+)"/g)) {
      const input = m[2].split(";").find((p) => p.startsWith("in:"))?.slice(3).split(",");
      assert.ok(input);
      const i = Number(m[1].split("-")[1]);
      if (i !== 0) assert.ok(svg.includes(`x1="${input[0]}" y1="${phaseRailY[i]}" x2="${input[0]}" y2="${input[1]}"`));
    }
  });
});

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