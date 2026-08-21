import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  applyItemSurcharges,
  applyMarkup,
  computeEstimateTotals,
  defaultSurcharges,
  lineTotal,
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
  it("applies height and commissioning only to selected items", () => {
    const surcharges = defaultSurcharges({ height: 20, commissioning: 10 });
    surcharges.height.enabled = true;
    surcharges.commissioning.enabled = true;

    const result = applyItemSurcharges(
      [
        item("A", 10_000, { at_height: true }),
        item("B", 20_000),
        item("C", 30_000, { commissioning: true }),
      ],
      surcharges,
    );

    assert.deepEqual(result.map(lineTotal), [12_000, 20_000, 33_000]);
    assert.equal(computeEstimateTotals(result, "percent", 0, surcharges).total, 65_000);
  });

  it("applies both stages sequentially to one item", () => {
    const surcharges = defaultSurcharges({ height: 20, commissioning: 10 });
    surcharges.height.enabled = true;
    surcharges.commissioning.enabled = true;
    const [result] = applyItemSurcharges(
      [item("A", 10_000, { at_height: true, commissioning: true })],
      surcharges,
    );
    assert.equal(result ? lineTotal(result) : 0, 13_200);
  });

  it("preserves flags and final prices through save and reopen", () => {
    const surcharges = defaultSurcharges({ height: 20, commissioning: 10 });
    surcharges.height.enabled = true;
    surcharges.commissioning.enabled = true;
    const base = [item("A", 5_000, { at_height: true, commissioning: true })];
    const markedUp = applyMarkup(base, { percent: 100, fixed: 0 });
    const final = applyItemSurcharges(markedUp, surcharges);
    const reopened = unpackItems(packItems(final, surcharges, { percent: 100, fixed: 0 }, base));

    assert.equal(reopened.items[0]?.price, 13_200);
    assert.equal(reopened.baseItems[0]?.price, 5_000);
    assert.equal(reopened.baseItems[0]?.at_height, true);
    assert.equal(reopened.baseItems[0]?.commissioning, true);
  });

  it("preserves original prices on reopen even without general markup", () => {
    const surcharges = defaultSurcharges({ height: 20 });
    surcharges.height.enabled = true;
    const base = [item("A", 10_000, { at_height: true })];
    const final = applyItemSurcharges(base, surcharges);
    const reopened = unpackItems(packItems(final, surcharges, undefined, base));

    assert.equal(reopened.items[0]?.price, 12_000);
    assert.equal(reopened.baseItems[0]?.price, 10_000);
    assert.equal(reopened.baseItems[0]?.at_height, true);
  });

  it("keeps quantity recalculation exact and applies discount afterward", () => {
    const surcharges = defaultSurcharges({ height: 20 });
    surcharges.height.enabled = true;
    const final = applyItemSurcharges(
      [{ ...item("A", 1_000, { at_height: true }), qty: 3 }],
      surcharges,
    );
    assert.equal(lineTotal(final[0]), 3_600);
    assert.equal(computeEstimateTotals(final, "percent", 10, surcharges).total, 3_240);
  });
});