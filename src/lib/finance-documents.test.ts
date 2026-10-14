import { describe, expect, test } from "bun:test";
import { canonicalDocument, isDocumentId, toKopecks } from "./finance-documents-core";
import { fingerprintOf, qrToken, signRecord, rateLimited } from "./finance-documents.server";

const op = (id: string, amount: number | string, extra = {}) => ({ id, operation_date: "2026-10-01T00:00:00", operation_type: "income", amount, ...extra });
const fp = (ops: ReturnType<typeof op>[]) => fingerprintOf(canonicalDocument({ docType: "finance_report", projectId: "p1", operations: ops }));

describe("finance documents", () => {
  test("нормализация сумм и порядка", () => {
    expect(toKopecks("1000.00")).toBe(toKopecks(1000));
    expect(fp([op("a", 1000), op("b", "5,5")])).toBe(fp([op("b", 5.5), op("a", "1000.00")]));
  });
  test("изменение суммы на 1 копейку меняет отпечаток", () => {
    expect(fp([op("a", 1000)])).not.toBe(fp([op("a", 1000.01)]));
  });
  test("добавление/удаление операции и смена даты меняют отпечаток", () => {
    expect(fp([op("a", 1)])).not.toBe(fp([op("a", 1), op("b", 1)]));
    expect(fp([op("a", 1)])).not.toBe(fp([op("a", 1, { operation_date: "2026-10-02" })]));
  });
  test("подпись и QR-токен зависят от секрета и номера", () => {
    const r = { id: "SME-FIN-2026-000001-ABCD", doc_type: "finance_report", project_id: "p1", issued_at: "2026-10-14T03:00:00Z", fingerprint: "f", format_version: 1 };
    expect(signRecord("k".repeat(40), r)).not.toBe(signRecord("x".repeat(40), r));
    expect(signRecord("k".repeat(40), r)).not.toBe(signRecord("k".repeat(40), { ...r, fingerprint: "g" }));
    expect(qrToken("k".repeat(40), r.id)).not.toBe(qrToken("k".repeat(40), "SME-FIN-2026-000002-ABCD"));
  });
  test("формат номера и ограничение запросов", () => {
    expect(isDocumentId("SME-FIN-2026-000123-K7QX")).toBe(true);
    expect(isDocumentId("SME-FIN-2026-1")).toBe(false);
    let blocked = false;
    for (let i = 0; i < 25; i += 1) blocked = rateLimited("t-ip");
    expect(blocked).toBe(true);
  });
});
