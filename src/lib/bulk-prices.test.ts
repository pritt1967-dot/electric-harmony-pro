import { test } from "node:test";
import assert from "node:assert/strict";
import { changedPrice, priceChangeSchema, selectPriceIds } from "./bulk-prices";

test("увеличение 1000 рублей на 10% даёт 1100", () => assert.equal(changedPrice(1000, 10, "increase"), 1100));
test("уменьшение 1000 рублей на 10% даёт 900", () => assert.equal(changedPrice(1000, 10, "decrease"), 900));
test("цена округляется до целых рублей", () => assert.equal(changedPrice(105, 10, "increase"), 116));
test("уменьшение на 100% даёт ноль, не отрицательную цену", () => assert.equal(changedPrice(1000, 100, "decrease"), 0));
test("уменьшение более 100% запрещено", () => assert.throws(() => changedPrice(1000, 101, "decrease")));
test("нулевой, отрицательный и нечисловой процент запрещены", () => { for (const percent of [0, -1, NaN, Infinity]) assert.throws(() => changedPrice(1000, percent, "increase")); });
test("отрицательная исходная цена запрещена", () => assert.throws(() => changedPrice(-1, 10, "increase")));
test("переполнение колонки numeric(12,2) запрещено", () => assert.throws(() => changedPrice(9999999999, 10, "increase")));
const rows = [{ id: "a", category: "Щиты" }, { id: "b", category: "Кабель" }, { id: "c", category: "Щиты" }];
test("весь прайс включает все позиции", () => assert.deepEqual(selectPriceIds(rows, "all", [], ""), ["a", "b", "c"]));
test("выборочные изменения затрагивают только выбранные id", () => assert.deepEqual(selectPriceIds(rows, "selected", ["b"], ""), ["b"]));
test("категория затрагивает только свои позиции", () => assert.deepEqual(selectPriceIds(rows, "category", [], "Щиты"), ["a", "c"]));
test("без выбранных позиций применение запрещено", () => assert.equal(priceChangeSchema.safeParse({ direction: "increase", percent: 10, scope: "selected" }).success, false));
test("без категории применение запрещено", () => assert.equal(priceChangeSchema.safeParse({ direction: "increase", percent: 10, scope: "category" }).success, false));