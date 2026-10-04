import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { snapshotFromDesign } from "./from-design";
import { PanelSnapshotSchema } from "./types";
import type { PanelDesign } from "@/lib/panel";

const design = {
  summary: { object_type: "Дом", supply: "3ф 400 В", grounding: "TN-C-S", total_power_kw: 15, calculated_power_kw: 12, main_breaker: "C25 3P", used_modules: 20, reserve_modules: 4, enclosure: "24", enclosure_modules: 24, ip: "IP40" },
  phase_load: [], protection_chain: [],
  lines: [
    { mark: "QF1", name: "Розетки кухня", power_kw: 2, current_a: 9, breaker: "C16", curve: "", poles: 1, phase: "L1", rcd: "QD1", cable: "ВВГнг 3×2,5", modules: 1, note: "" },
    { mark: "QF2", name: "Свет", power_kw: 1, current_a: 4, breaker: "B10", curve: "B", poles: 1, phase: "L2", rcd: "", cable: "ВВГнг 3×1,5", modules: 1, note: "" },
  ],
  rcd_groups: [{ mark: "QD1", rating: "25А", type: "2P", leakage: "30мА", lines: ["QF1"], note: "" }],
  rails: [{ index: 1, title: "", items: [{ mark: "QD1", label: "", modules: 2 }, { mark: "QF1", label: "", modules: 1 }, { mark: "QF2", label: "", modules: 1 }] }],
  spec: [], materials: [], checks: [{ text: "Селективность", ok: true }], issues: [], assumptions: [], image_prompt: "",
} as unknown as PanelDesign;

describe("snapshotFromDesign", () => {
  test("валидный снимок текущего щита", () => {
    const s = PanelSnapshotSchema.parse(snapshotFromDesign(design));
    assert.deepEqual(s.network, { phases: 3, voltage: 400, grounding: "TN-C-S", ip: "IP40" });
    assert.deepEqual(s.devices.map((d) => d.key), ["QD1", "QF1", "QF2"]);
    const qf1 = s.devices.find((d) => d.key === "QF1")!;
    assert.deepEqual([qf1.rated_a, qf1.curve, qf1.rail, qf1.start], [16, "C", 1, 3]);
    assert.deepEqual(s.chain, [{ rcd: "QD1 25А 30мА", n_bus: "N1", lines: ["QF1"] }, { rcd: null, n_bus: "N", lines: ["QF2"] }]);
  });
  test("не меняет исходный щит", () => {
    const before = JSON.stringify(design);
    snapshotFromDesign(design);
    assert.equal(JSON.stringify(design), before);
  });
});
