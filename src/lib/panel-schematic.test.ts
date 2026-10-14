import { describe, test } from "node:test";
import assert from "node:assert/strict";
import type { PanelDesign } from "./panel";
import { buildSchematicSvg, buildLegacySchematicSvg, combineSheets } from "./panel-schematic";
import { buildProject, validateProject } from "./drawings/project-model";
import { buildSingleLineSheets } from "./drawings/single-line";

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

  test("некорректные данные не ломают экран — прежняя схема", () => {
    const d = design(0);
    assert.equal(buildSchematicSvg(d), buildLegacySchematicSvg(d));
  });

  test("электрические данные проекта не изменяются", () => {
    const d = design();
    const before = JSON.stringify(d);
    buildSchematicSvg(d);
    assert.equal(JSON.stringify(d), before);
  });
});
