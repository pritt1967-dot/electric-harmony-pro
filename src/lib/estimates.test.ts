import { describe, expect, it } from "vitest";

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

    expect(result.map(lineTotal)).toEqual([12_000, 20_000, 33_000]);
    expect(computeEstimateTotals(result, "percent", 0, surcharges).total).toBe(65_000);
  });

  it("applies both stages sequentially to one item", () => {
    const surcharges = defaultSurcharges({ height: 20, commissioning: 10 });
    surcharges.height.enabled = true;
    surcharges.commissioning.enabled = true;
    const [result] = applyItemSurcharges(
      [item("A", 10_000, { at_height: true, commissioning: true })],
      surcharges,
    );
    expect(result ? lineTotal(result) : 0).toBe(13_200);
  });

  it("preserves flags and final prices through save and reopen", () => {
    const surcharges = defaultSurcharges({ height: 20, commissioning: 10 });
    surcharges.height.enabled = true;
    surcharges.commissioning.enabled = true;
    const base = [item("A", 5_000, { at_height: true, commissioning: true })];
    const markedUp = applyMarkup(base, { percent: 100, fixed: 0 });
    const final = applyItemSurcharges(markedUp, surcharges);
    const reopened = unpackItems(packItems(final, surcharges, { percent: 100, fixed: 0 }, base));

    expect(reopened.items[0]?.price).toBe(13_200);
    expect(reopened.baseItems[0]?.price).toBe(5_000);
    expect(reopened.baseItems[0]?.at_height).toBe(true);
    expect(reopened.baseItems[0]?.commissioning).toBe(true);
  });

  it("keeps quantity recalculation exact and applies discount afterward", () => {
    const surcharges = defaultSurcharges({ height: 20 });
    surcharges.height.enabled = true;
    const final = applyItemSurcharges(
      [{ ...item("A", 1_000, { at_height: true }), qty: 3 }],
      surcharges,
    );
    expect(lineTotal(final[0])).toBe(3_600);
    expect(computeEstimateTotals(final, "percent", 10, surcharges).total).toBe(3_240);
  });
});