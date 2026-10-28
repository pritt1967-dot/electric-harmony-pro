import { toKopecks } from "./finance-documents-core";

/** Values used by the additive object ledger, independent of participant balances. */
export type ObjectWork = {
  id: string;
  objectId: string;
  date: string;
  quantity: number;
  unitPrice: number;
  status: "active" | "cancelled";
};
export type ObjectAllocation = {
  id: string;
  operationId: string;
  objectId: string;
  amount: number;
  costKind?: "materials" | "labor" | "other";
};
export type ObjectOperation = {
  id: string;
  date: string;
  type: "income" | "expense" | "refund" | "transfer" | "customer_refund";
  amount: number;
  affectsProjectBalance?: boolean;
};
export type ObjectReversal = {
  operationId: string;
  allocationId: string;
  amount: number;
};

function positiveMoney(value: number): number {
  const cents = toKopecks(value);
  if (!Number.isSafeInteger(cents) || cents <= 0) throw new Error("Сумма должна быть больше нуля");
  return cents;
}

export function workCost(quantity: number, unitPrice: number): number {
  if (!Number.isFinite(quantity) || quantity <= 0) throw new Error("Количество должно быть больше нуля");
  if (!Number.isFinite(unitPrice) || unitPrice < 0) throw new Error("Цена не может быть отрицательной");
  const cents = toKopecks(quantity * unitPrice);
  if (!Number.isSafeInteger(cents)) throw new Error("Стоимость слишком велика");
  return cents / 100;
}

/** Validate the complete proposed state. The database must also lock source rows atomically. */
export function validateObjectLedger(
  operations: ObjectOperation[], allocations: ObjectAllocation[], reversals: ObjectReversal[],
): void {
  const ops = new Map(operations.map(o => [o.id, o]));
  if (ops.size !== operations.length) throw new Error("Повтор операции");
  const links = new Map(allocations.map(a => [a.id, a]));
  if (links.size !== allocations.length) throw new Error("Повтор распределения");
  const allocated = new Map<string, number>();
  const pairs = new Set<string>();
  for (const a of allocations) {
    const op = ops.get(a.operationId);
    if (!op || !a.id || !a.objectId) throw new Error("Не найдена операция или объект");
    if (op.type !== "income" && op.type !== "expense") throw new Error("Распределять можно только приход или расход");
    const pair = `${a.operationId}:${a.objectId}`;
    if (pairs.has(pair)) throw new Error("Объект указан в платеже повторно");
    pairs.add(pair);
    allocated.set(op.id, (allocated.get(op.id) ?? 0) + positiveMoney(a.amount));
    if ((allocated.get(op.id) ?? 0) > positiveMoney(op.amount)) throw new Error("Распределение превышает сумму операции");
  }
  const reversedLinks = new Map<string, number>();
  const reversedOps = new Map<string, number>();
  const reversalPairs = new Set<string>();
  for (const r of reversals) {
    const op = ops.get(r.operationId);
    const link = links.get(r.allocationId);
    const source = link ? ops.get(link.operationId) : undefined;
    if (!op || !link || !source) throw new Error("Не найден исходный платёж возврата");
    if (!((op.type === "customer_refund" && source.type === "income") || (op.type === "refund" && source.type === "expense"))) {
      throw new Error("Возврат не соответствует исходной операции");
    }
    if (op.date < source.date) throw new Error("Возврат не может предшествовать исходному платежу");
    const pair = `${r.operationId}:${r.allocationId}`;
    if (reversalPairs.has(pair)) throw new Error("Повтор связи возврата");
    reversalPairs.add(pair);
    const cents = positiveMoney(r.amount);
    reversedLinks.set(link.id, (reversedLinks.get(link.id) ?? 0) + cents);
    reversedOps.set(op.id, (reversedOps.get(op.id) ?? 0) + cents);
    if ((reversedLinks.get(link.id) ?? 0) > positiveMoney(link.amount)) throw new Error("Возвраты превышают исходную оплату");
    if ((reversedOps.get(op.id) ?? 0) > positiveMoney(op.amount)) throw new Error("Распределение возврата превышает сумму операции");
  }
  for (const op of operations) {
    if (op.type === "customer_refund" && (reversedOps.get(op.id) ?? 0) !== positiveMoney(op.amount)) {
      throw new Error("Возврат заказчику должен полностью ссылаться на исходные оплаты");
    }
  }
}

export type ObjectSummary = {
  workValue: number;
  receipts: number;
  customerRefunds: number;
  expenses: number;
  supplierRefunds: number;
  netExpenses: number;
  receivable: number;
  advance: number;
  credited: number;
  netPayments: number;
  accruedResult: number;
  cashResult: number;
  costs: Record<"materials" | "labor" | "other", number>;
};

/** Movement is period-scoped; debt and advances include all history up to the cutoff. */
export function summarizeObject(input: {
  objectId: string;
  works: ObjectWork[];
  operations: ObjectOperation[];
  allocations: ObjectAllocation[];
  reversals: ObjectReversal[];
  from?: string;
  to?: string;
}): ObjectSummary {
  validateObjectLedger(input.operations, input.allocations, input.reversals);
  const { from, to } = input;
  if (from && to && from > to) throw new Error("Начало периода позже окончания");
  const beforeCutoff = (date: string) => !to || date <= to;
  const inPeriod = (date: string) => beforeCutoff(date) && (!from || date >= from);
  const ops = new Map(input.operations.map(o => [o.id, o]));
  const links = new Map(input.allocations.map(a => [a.id, a]));
  let workValue = 0, cumulativeWork = 0, receipts = 0, paid = 0;
  let customerRefunds = 0, cumulativeRefunds = 0, expenses = 0, supplierRefunds = 0;
  const costs = { materials: 0, labor: 0, other: 0 };
  for (const w of input.works) {
    if (w.objectId !== input.objectId || w.status !== "active" || !beforeCutoff(w.date)) continue;
    const cents = toKopecks(workCost(w.quantity, w.unitPrice));
    cumulativeWork += cents;
    if (inPeriod(w.date)) workValue += cents;
  }
  for (const a of input.allocations) {
    const op = ops.get(a.operationId);
    if (a.objectId !== input.objectId || !op || !beforeCutoff(op.date)) continue;
    const cents = positiveMoney(a.amount);
    if (op.type === "income") {
      paid += cents;
      if (inPeriod(op.date)) receipts += cents;
    } else if (op.type === "expense" && op.affectsProjectBalance !== false && inPeriod(op.date)) {
      expenses += cents;
      costs[a.costKind ?? "other"] += cents;
    }
  }
  for (const r of input.reversals) {
    const op = ops.get(r.operationId);
    const link = links.get(r.allocationId);
    if (!op || !link || link.objectId !== input.objectId || !beforeCutoff(op.date)) continue;
    const cents = positiveMoney(r.amount);
    if (op.type === "customer_refund") {
      cumulativeRefunds += cents;
      if (inPeriod(op.date)) customerRefunds += cents;
    } else if (op.type === "refund" && ops.get(link.operationId)?.affectsProjectBalance !== false && inPeriod(op.date)) {
      supplierRefunds += cents;
      costs[link.costKind ?? "other"] -= cents;
    }
  }
  const netPayments = paid - cumulativeRefunds;
  const netExpenses = expenses - supplierRefunds;
  return {
    workValue: workValue / 100, receipts: receipts / 100,
    customerRefunds: customerRefunds / 100, expenses: expenses / 100,
    supplierRefunds: supplierRefunds / 100, netExpenses: netExpenses / 100,
    netPayments: netPayments / 100, credited: Math.min(cumulativeWork, netPayments) / 100,
    receivable: Math.max(cumulativeWork - netPayments, 0) / 100,
    advance: Math.max(netPayments - cumulativeWork, 0) / 100,
    accruedResult: (workValue - netExpenses) / 100,
    cashResult: (receipts - customerRefunds - netExpenses) / 100,
    costs: { materials: costs.materials / 100, labor: costs.labor / 100, other: costs.other / 100 },
  };
}