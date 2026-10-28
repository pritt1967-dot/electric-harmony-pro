import { describe, expect, it } from "bun:test";
import { summarizeObject, validateObjectLedger, workCost } from "./finance-objects-core";
import type { ObjectAllocation, ObjectOperation, ObjectReversal, ObjectWork } from "./finance-objects-core";

const work: ObjectWork = { id: "w", objectId: "a", date: "2026-10-10", quantity: 2, unitPrice: 500, status: "active" };
const payment: ObjectOperation = { id: "p", type: "income", date: "2026-10-11", amount: 400 };
const link: ObjectAllocation = { id: "l", objectId: "a", operationId: "p", amount: 400 };
const summary = (works: ObjectWork[] = [work], operations: ObjectOperation[] = [payment], allocations: ObjectAllocation[] = [link], reversals: ObjectReversal[] = []) => summarizeObject({ objectId: "a", works, operations, allocations, reversals });

describe("object accrual and money remain separate", () => {
  it("quantity times unit price, rounded once to kopecks", () => { expect(workCost(2.5, 100.01)).toBe(250.03); });
  it("several works accrue without creating income", () => {
    const s = summary([work, { ...work, id: "w2", quantity: 1 }], [], []);
    expect(s.workValue).toBe(1500); expect(s.receipts).toBe(0); expect(s.receivable).toBe(1500);
  });
  it("partial payment leaves debt", () => { expect(summary().receivable).toBe(600); });
  it("full payment leaves zero debt", () => { expect(summary([work], [{ ...payment, amount: 1000 }], [{ ...link, amount: 1000 }]).receivable).toBe(0); });
  it("advance before work remains separate from debt", () => {
    const s = summary([], [payment], [link]); expect(s.advance).toBe(400); expect(s.receivable).toBe(0); expect(s.workValue).toBe(0);
  });
  it("later work uses the advance without a second receipt", () => {
    const s = summary([{ ...work, quantity: 0.5 }]); expect(s.advance).toBe(150); expect(s.credited).toBe(250); expect(s.receipts).toBe(400);
  });
  it("one receipt splits across objects with no duplication", () => {
    const allocations = [{ ...link, amount: 250 }, { ...link, id: "lb", objectId: "b", amount: 150 }];
    const a = summary([work], [payment], allocations);
    const b = summarizeObject({ objectId: "b", works: [], operations: [payment], allocations, reversals: [] });
    expect(a.receipts + b.receipts).toBe(400); expect(a.receivable).toBe(750); expect(b.advance).toBe(150);
  });
  it("allocation exceeding the receipt is rejected", () => { expect(() => summary([work], [payment], [{ ...link, amount: 401 }])).toThrow(); });
  it("duplicate payment allocation is rejected", () => { expect(() => summary([work], [payment], [link, { ...link, id: "l2" }])).toThrow(); });
  it("customer refund reduces settled payment, not work costs", () => {
    const s = summary([work], [payment, { id: "r", type: "customer_refund", date: "2026-10-12", amount: 100 }], [link], [{ operationId: "r", allocationId: "l", amount: 100 }]);
    expect(s.receivable).toBe(700); expect(s.customerRefunds).toBe(100); expect(s.netExpenses).toBe(0); expect(s.cashResult).toBe(300);
  });
  it("combined refunds cannot exceed original allocation", () => {
    expect(() => summary([work], [payment, { id: "r", type: "customer_refund", date: "2026-10-12", amount: 300 }, { id: "r2", type: "customer_refund", date: "2026-10-13", amount: 200 }], [link], [{ operationId: "r", allocationId: "l", amount: 300 }, { operationId: "r2", allocationId: "l", amount: 200 }])).toThrow();
  });
  it("customer refund needs a full source link", () => { expect(() => validateObjectLedger([{ id: "r", type: "customer_refund", date: "2026-10-12", amount: 100 }], [], [])).toThrow(); });
  it("supplier refund reduces the original material cost", () => {
    const s = summary([work], [{ id: "e", type: "expense", date: "2026-10-11", amount: 300 }, { id: "r", type: "refund", date: "2026-10-12", amount: 50 }], [{ id: "le", operationId: "e", objectId: "a", amount: 300, costKind: "materials" }], [{ operationId: "r", allocationId: "le", amount: 50 }]);
    expect(s.netExpenses).toBe(250); expect(s.costs.materials).toBe(250); expect(s.accruedResult).toBe(750);
  });
  it("internal transfer cannot be allocated as revenue or cost", () => {
    const t: ObjectOperation = { id: "t", type: "transfer", date: "2026-10-12", amount: 500 };
    expect(summary([], [t], []).receipts).toBe(0); expect(summary([], [t], []).netExpenses).toBe(0);
    expect(() => summary([], [t], [{ ...link, operationId: "t" }])).toThrow();
  });
  it("old unallocated operations do not invent object settlements", () => { const s = summary([], [payment], []); expect(s.advance).toBe(0); expect(s.receipts).toBe(0); });
  it("cancelled work stops accruing while input history remains intact", () => {
    const works = [work, { ...work, id: "w2", status: "cancelled" as const }];
    expect(summary(works).workValue).toBe(1000); expect(works).toHaveLength(2); expect(works[1]?.status).toBe("cancelled");
  });
  it("period movement excludes old receipt but debt includes it", () => {
    const s = summarizeObject({ objectId: "a", works: [work], operations: [payment], allocations: [link], reversals: [], from: "2026-10-12", to: "2026-10-31" });
    expect(s.receipts).toBe(0); expect(s.workValue).toBe(0); expect(s.receivable).toBe(600);
  });
  it("cutoff excludes future work and receipts", () => {
    const s = summarizeObject({ objectId: "a", works: [work], operations: [payment], allocations: [link], reversals: [], to: "2026-10-09" });
    expect(s.receivable).toBe(0); expect(s.advance).toBe(0); expect(s.workValue).toBe(0);
  });
  it("does not mutate existing operation amounts", () => { const ops = structuredClone([payment]); summary([work], ops); expect(ops).toEqual([payment]); });
});