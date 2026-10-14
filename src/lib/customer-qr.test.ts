import { describe, expect, it } from "vitest";
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
    expect(forOrder1).toBe(forOrder2);
    expect(forOrder1).toBe(`https://x/klient/${token}`);
  });
  it("номер заказа не входит в QR", () => {
    expect(customerPublicUrl("abc", "https://x")).not.toMatch(/\/1$|\/2$|smeta/);
  });
  it("разные заказчики получают разные ссылки", () => {
    expect(customerPublicUrl("a", "https://x")).not.toBe(customerPublicUrl("b", "https://x"));
  });
});

describe("Подпись версии сметы (отдельно от QR)", () => {
  it("стабильна для одной версии", () => expect(sign(base)).toBe(sign({ ...base })));
  it("меняется при изменении суммы, позиции или версии", () => {
    expect(sign({ ...base, total: 1001 })).not.toBe(sign(base));
    expect(sign({ ...base, version: 2 })).not.toBe(sign(base));
    expect(sign({ ...base, items: [{ ...base.items[0], qty: 3 }] })).not.toBe(sign(base));
  });
});
