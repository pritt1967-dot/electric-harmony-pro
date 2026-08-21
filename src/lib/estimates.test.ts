import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  applyMarkup,
  computeEstimateTotals,
  defaultSurcharges,
  lineTotal,
  legacySurcharges,
  packItems,
  unpackItems,
  type EstimateItem,
} from "./estimates";

const item = (
  id: string,
  price: number,
  flags: Partial<EstimateItem> = {},
): EstimateItem => ({ id, name: `Работа ${id}`, unit: "шт", qty: 1, price, ...flags });

describe("selective estimate charges", () => {
  it("opens a legacy estimate without new fields using safe in-memory defaults", () => {
    const reopened = unpackItems([
      { id: "old", name: "Старая работа", unit: "шт", qty: 2, price: 500 },
    ]);
    const surcharges = reopened.surcharges ?? legacySurcharges();

    assert.equal(reopened.items[0]?.at_height, false);
    assert.equal(reopened.items[0]?.commissioning, false);
    assert.equal(surcharges.height.enabled, false);
    assert.equal(surcharges.height.percent, 0);
    assert.equal(surcharges.commissioning.enabled, false);
    assert.equal(surcharges.commissioning.percent, 0);
    assert.equal(computeEstimateTotals(reopened.items, "percent", 0, surcharges).total, 1_000);
  });

  it("restores new fields when they exist", () => {
    const surcharges = defaultSurcharges({ height: 20, commissioning: 10 });
    surcharges.height.enabled = true;
    surcharges.commissioning.enabled = true;
    const reopened = unpackItems(
      packItems(
        [item("new", 1_320, { at_height: true, commissioning: true })],
        surcharges,
        undefined,
        [item("new", 1_000, { at_height: true, commissioning: true })],
      ),
    );

    assert.equal(reopened.baseItems[0]?.at_height, true);
    assert.equal(reopened.baseItems[0]?.commissioning, true);
    assert.equal(reopened.surcharges?.height.percent, 20);
    assert.equal(reopened.surcharges?.commissioning.percent, 10);
  });

  it("calculates transport, height, and commissioning through the same totals path", () => {
    const surcharges = defaultSurcharges({ height: 20, commissioning: 10 });
    surcharges.transport.enabled = true;
    surcharges.transport.percent = 5;
    surcharges.height.enabled = true;
    surcharges.commissioning.enabled = true;
    const rows = [
      item("A", 10_000, { at_height: true }),
      item("B", 20_000),
      item("C", 30_000, { commissioning: true }),
    ];
    const totals = computeEstimateTotals(rows, "percent", 0, surcharges);

    assert.deepEqual(totals.surchargeLines.map((line) => line.amount), [3_000, 12_000, 6_000]);
    assert.equal(totals.total, 81_000);
  });

  it("preserves flags and final prices through save and reopen", () => {
    const surcharges = defaultSurcharges({ height: 20, commissioning: 10 });
    surcharges.height.enabled = true;
    surcharges.commissioning.enabled = true;
    const base = [item("A", 5_000, { at_height: true, commissioning: true })];
    const markedUp = applyMarkup(base, { percent: 100, fixed: 0 });
    const reopened = unpackItems(packItems(markedUp, surcharges, { percent: 100, fixed: 0 }, base));

    assert.equal(reopened.items[0]?.price, 10_000);
    assert.equal(reopened.baseItems[0]?.price, 5_000);
    assert.equal(reopened.baseItems[0]?.at_height, true);
    assert.equal(reopened.baseItems[0]?.commissioning, true);
  });

  it("preserves original prices on reopen even without general markup", () => {
    const surcharges = defaultSurcharges({ height: 20 });
    surcharges.height.enabled = true;
    const base = [item("A", 10_000, { at_height: true })];
    const reopened = unpackItems(packItems(base, surcharges, undefined, base));

    assert.equal(reopened.items[0]?.price, 10_000);
    assert.equal(reopened.baseItems[0]?.price, 10_000);
    assert.equal(reopened.baseItems[0]?.at_height, true);
  });

  it("keeps quantity recalculation exact and applies discount afterward", () => {
    const surcharges = defaultSurcharges({ height: 20 });
    surcharges.height.enabled = true;
    const rows = [{ ...item("A", 1_000, { at_height: true }), qty: 3 }];
    assert.equal(computeEstimateTotals(rows, "percent", 10, surcharges).total, 3_300);
    // base = subtotal 3 000, height 20% = 600, discount 10% = 300
  });
});
describe("percent settings actually change the total", () => {
  const build = (transport: number, height: number) => {
    const s = defaultSurcharges({ transport, height, commissioning: 10 });
    s.transport.enabled = true;
    s.height.enabled = true;
    const items = [
      item("1", 10_000, { at_height: true }),
      item("2", 20_000),
      item("3", 30_000, { at_height: true }),
    ];
    return { items, totals: computeEstimateTotals(items, "percent", 0, s) };
  };

  it("transport 5% and height 20%", () => {
    const { items, totals } = build(5, 20);
    assert.deepEqual(items.map((i) => i.price), [10_000, 20_000, 30_000]);
    assert.equal(totals.subtotal, 60_000);
    assert.deepEqual(totals.surchargeLines.map((line) => line.amount), [3_000, 12_000]);
    assert.equal(totals.total, 75_000);
  });

  it("raising transport to 10% raises the total", () => {
    assert.equal(build(10, 20).totals.total, 78_000);
  });

  it("raising height to 30% raises works and total", () => {
    const { totals } = build(10, 30);
    assert.equal(totals.subtotal, 60_000);
    assert.equal(totals.total, 84_000);
  });

  it("doubles selective amounts exactly from 5% to 10% and includes all three in total", () => {
    const rows = [
      item("height", 9_000, { at_height: true }),
      item("commissioning", 15_000, { commissioning: true }),
      item("regular", 6_000),
    ];
    const s = defaultSurcharges({ transport: 5, height: 5, commissioning: 5 });
    for (const key of ["transport", "height", "commissioning"] as const) s[key].enabled = true;
    const at5 = computeEstimateTotals(rows, "percent", 0, s);
    assert.deepEqual(at5.surchargeLines.map((line) => line.amount), [1_500, 1_500, 1_500]);
    assert.equal(at5.total, 34_500);

    s.height.percent = 10;
    s.commissioning.percent = 10;
    const at10 = computeEstimateTotals(rows, "percent", 0, s);
    assert.deepEqual(at10.surchargeLines.map((line) => line.amount), [1_500, 3_000, 3_000]);
    assert.equal(at10.total, 37_500);
  });
});
