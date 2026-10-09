import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { getSchematicSymbol } from "../shape-library/schematic-library";
import { SYM_H, symBreaker, symRcd, symRcbo, symSwitch, symContactor } from "./single-line";

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
});