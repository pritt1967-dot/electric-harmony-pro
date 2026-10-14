import { describe, test } from "node:test";
import assert from "node:assert/strict";
import type { PanelDesign } from "./panel";
import { buildSchematicSvg, combineSheets } from "./panel-schematic";
import { buildProject, validateProject } from "./drawings/project-model";
import { buildSingleLineSheets } from "./drawings/single-line";
import { getSchematicSymbol } from "./shape-library/schematic-library";

const design = (lines = 3): PanelDesign => ({
  summary: { object_type: "Дом", supply: "400 В", grounding: "TN-S", total_power_kw: 6, calculated_power_kw: 5, main_breaker: "C32 3P", used_modules: 12, reserve_modules: 12, enclosure: "Щит 24", enclosure_modules: 24, ip: "IP31" },
  phase_load: [],
  protection_chain: ["QS1 40A 3P", "QF1 C32 3P"],
  lines: Array.from({ length: lines }, (_, i) => ({ mark: `QF${i + 2}`, name: "Розетки", power_kw: 2, current_a: 9, breaker: "C16", curve: "C", poles: 1, phase: ["L1", "L2", "L3"][i % 3], rcd: "", cable: "ВВГнг-LS 3×2,5", modules: 1, note: "" })),
  rcd_groups: [], rails: [], spec: [], materials: [], checks: [], issues: [], assumptions: [], image_prompt: "",
});

describe("Предпросмотр и SVG-экспорт конструктора используют общий генератор", () => {
  test("результат совпадает с листами «Чертежей щита» и содержит библиотечные фигуры", () => {
    const d = design();
    const project = buildProject(d, d.summary.enclosure);
    assert.equal(validateProject(project).filter((i) => i.level === "error").length, 0);
    const svg = buildSchematicSvg(d);
    assert.equal(svg, combineSheets(buildSingleLineSheets(project, "A3")));
    assert.ok(svg.includes('data-library-symbol="'));
    assert.ok(svg.includes('data-bus="PE"'));
  });

  test("много групп — листы объединяются без перерисовки", () => {
    const d = design(30);
    const sheets = buildSingleLineSheets(buildProject(d, d.summary.enclosure), "A3");
    assert.ok(sheets.length > 1);
    const svg = buildSchematicSvg(d);
    assert.equal((svg.match(/<svg /g) ?? []).length, sheets.length + 1);
    for (const m of sheets[1].matchAll(/data-circuit="([^"]+)"/g)) assert.ok(svg.includes(`data-circuit="${m[1]}"`));
  });

  test("пустой проект не подменяется самодельной схемой", () => {
    const d = design(0);
    assert.equal(buildSchematicSvg(d), "");
  });

  test("QF1 C25 3P: итоговая геометрия #11 сохраняется даже при ошибках полноты данных", () => {
    const symbol = getSchematicSymbol("qf-cable");
    assert.ok(symbol);
    assert.equal(symbol.shape_id, 11);
    const libraryPaths = [...symbol.svg.matchAll(/<path\s+d="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(libraryPaths.length, 8);
    // Explicit slanted contact, not merely a library tag or a rectangle.
    assert.ok(libraryPaths.some((p) => p.includes("M32.0763,85.0557\nL25.0554,70.8499")));
    for (const missing of ["cable", "mainBreaker", "rating"] as const) {
      const d = design(1);
      const line = d.lines[0];
      assert.ok(line);
      Object.assign(line, { mark: "QF1", name: "Вводной автомат", breaker: "C25", poles: 3 });
      d.summary.main_breaker = "QF1 C25 3P";
      if (missing === "cable") line.cable = "";
      if (missing === "mainBreaker") d.summary.main_breaker = "";
      if (missing === "rating") line.breaker = "";
      const before = JSON.stringify(d);
      const project = buildProject(d, d.summary.enclosure);
      assert.ok(validateProject(project).some((i) => i.level === "error"));
      const svg = buildSchematicSvg(d);
      assert.equal(svg, combineSheets(buildSingleLineSheets(project, "A3")));
      const group = svg.match(/data-circuit="QF1">([\s\S]*?)\n<text/);
      assert.ok(group);
      assert.deepEqual([...group[1].matchAll(/<path\s+d="([^"]+)"/g)].map((m) => m[1]), libraryPaths);
      assert.doesNotMatch(group[1], /<rect/);
      assert.match(group[1], /data-vss-shape="11"/);
      const transform = group[1].match(/translate\(([-\d.]+) ([-\d.]+)\) scale\(([\d.]+)\)/);
      assert.ok(transform);
      const [tx, ty, scale] = transform.slice(1).map(Number);
      assert.ok(Math.abs(scale - 25.4 / 72) < 1e-5);
      const coords = group[1].match(/data-connections="([^"]+)"/);
      assert.ok(coords);
      const points = Object.fromEntries(coords[1].split(";").map((p) => {
        const [name, xy] = p.split(":");
        return [name, xy.split(",").map(Number)];
      }));
      assert.deepEqual(points.in, [tx + 32.0763 * scale, ty]);
      assert.deepEqual(points.out, [tx + 32.0763 * scale, ty + 212.5999 * scale]);
      for (const [terminal, px, py] of [["N", 46.2495, 14.1732], ["PE", 60.4227, 28.3465]] as const) {
        assert.deepEqual(points[terminal], [tx + px * scale, ty + py * scale]);
        const point = points[terminal];
        assert.ok(svg.includes(`data-terminal-wire="${terminal}" data-for="QF1"><line x1="${point[0]}"`));
        assert.ok(svg.includes(`x2="${point[0]}" y2="${point[1]}"`));
      }
      assert.match(svg, />QF1<\/text>/);
      assert.match(svg, missing === "rating" ? /> 3P<\/text>/ : />C25 3P<\/text>/);
      assert.equal(JSON.stringify(d), before);
    }
  });

  test("электрические данные проекта не изменяются", () => {
    const d = design();
    const before = JSON.stringify(d);
    buildSchematicSvg(d);
    assert.equal(JSON.stringify(d), before);
  });
});
