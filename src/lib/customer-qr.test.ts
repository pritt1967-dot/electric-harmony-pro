import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";

import { customerPublicUrl } from "./customer-qr";
import { canonicalEstimate, formatSignatureCode, type SignableEstimate } from "./estimate-signature";

const base: SignableEstimate = {
  number: "1", version: 1, doc_date: "2026-10-01", total: 1000,
  discount_type: "percent", discount_value: 0,
  items: [{ name: "Розетка", unit: "шт", qty: 2, price: 500 }],
};
const sign = (e: SignableEstimate) =>
  formatSignatureCode(createHmac("sha256", "k".repeat(40)).update(canonicalEstimate(e)).digest("hex"));

describe("QR заказчика", () => {
  it("один заказчик — несколько заказов: ссылка зависит только от токена заказчика", () => {
    const token = "8d3c1f9e-0000-4000-8000-000000000001";
    const forOrder1 = customerPublicUrl(token, "https://x");
    const forOrder2 = customerPublicUrl(token, "https://x");
    assert.equal(forOrder1, forOrder2);
    assert.equal(forOrder1, `https://x/klient/${token}`);
  });
  it("номер заказа не входит в QR", () => {
    assert.doesNotMatch(customerPublicUrl("abc", "https://x"), /\/1$|\/2$|smeta/);
  });
  it("разные заказчики получают разные ссылки", () => {
    assert.notEqual(customerPublicUrl("a", "https://x"), customerPublicUrl("b", "https://x"));
  });
});

describe("Подпись версии сметы (отдельно от QR)", () => {
  it("стабильна для одной версии", () => assert.equal(sign(base), sign({ ...base })));
  it("меняется при изменении суммы, позиции или версии", () => {
    assert.notEqual(sign({ ...base, total: 1001 }), sign(base));
    assert.notEqual(sign({ ...base, version: 2 }), sign(base));
    assert.notEqual(sign({ ...base, items: [{ ...base.items[0], qty: 3 }] }), sign(base));
  });
});
