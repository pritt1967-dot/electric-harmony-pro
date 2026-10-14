import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { canonicalDocument, FIN_DOC_TYPE_BY_OPERATION, isDocumentId, toKopecks } from "./finance-documents-core";
import { fingerprintOf, qrToken, qrTokenV2, signRecord, signRecordV2, rateLimited, verifyDocument } from "./finance-documents.server";

const op = (id: string, amount: number | string, extra = {}) => ({ id, operation_date: "2026-10-01T00:00:00", operation_type: "income", amount, ...extra });
const fp = (ops: ReturnType<typeof op>[]) => fingerprintOf(canonicalDocument({ docType: "finance_report", projectId: "p1", operations: ops }));

describe("finance documents", () => {
  test("нормализация сумм и порядка", () => {
    assert.equal(toKopecks("1000.00"), toKopecks(1000));
    assert.equal(fp([op("a", 1000), op("b", "5,5")]), fp([op("b", 5.5), op("a", "1000.00")]));
  });
  test("изменение суммы на 1 копейку меняет отпечаток", () => {
    assert.notEqual(fp([op("a", 1000)]), fp([op("a", 1000.01)]));
  });
  test("добавление/удаление операции и смена даты меняют отпечаток", () => {
    assert.notEqual(fp([op("a", 1)]), fp([op("a", 1), op("b", 1)]));
    assert.notEqual(fp([op("a", 1)]), fp([op("a", 1, { operation_date: "2026-10-02" })]));
  });
  test("подпись и QR-токен зависят от секрета и номера", () => {
    const r = { id: "SME-FIN-2026-000001-ABCD", doc_type: "finance_report", project_id: "p1", issued_at: "2026-10-14T03:00:00Z", fingerprint: "f", format_version: 1 };
    assert.notEqual(signRecord("k".repeat(40), r), signRecord("x".repeat(40), r));
    assert.notEqual(signRecord("k".repeat(40), r), signRecord("k".repeat(40), { ...r, fingerprint: "g" }));
    assert.notEqual(qrToken("k".repeat(40), r.id), qrToken("k".repeat(40), "SME-FIN-2026-000002-ABCD"));
  });
  test("формат номера и ограничение запросов", () => {
    assert.equal(isDocumentId("SME-FIN-2026-000123-K7QX"), true);
    assert.equal(isDocumentId("SME-FIN-2026-1"), false);
    let blocked = false;
    for (let i = 0; i < 25; i += 1) blocked = rateLimited("t-ip");
    assert.equal(blocked, true);
  });

  const K2 = "z".repeat(40);
  const rec = { id: "SME-FIN-2026-000010-ABCD", doc_type: "finance_expense", project_id: "p1", issued_at: "2026-10-14T03:00:00Z", fingerprint: "f", format_version: 1, key_version: "v2", qr_fingerprint: fingerprintOf(qrTokenV2(K2, "SME-FIN-2026-000010-ABCD")), operation_ids: ["a"] };
  test("v2: подпись охватывает версию ключа, отпечаток QR и состав операций", () => {
    const base = signRecordV2(K2, rec);
    assert.equal(base, signRecordV2(K2, { ...rec }));
    assert.notEqual(base, signRecordV2(K2, { ...rec, key_version: "v1" }));
    assert.notEqual(base, signRecordV2(K2, { ...rec, qr_fingerprint: "x" }));
    assert.notEqual(base, signRecordV2(K2, { ...rec, operation_ids: ["a", "b"] }));
    assert.notEqual(base, signRecordV2(K2, { ...rec, fingerprint: "g" }));
    assert.notEqual(base, signRecordV2("y".repeat(40), rec));
  });
  test("v2: QR-метка отличается от v1 и зависит от ключа", () => {
    assert.notEqual(qrTokenV2(K2, rec.id), qrToken(K2, rec.id));
    assert.notEqual(qrTokenV2(K2, rec.id), qrTokenV2("y".repeat(40), rec.id));
  });
  test("все виды операций имеют тип документа", () => {
    for (const t of ["income", "expense", "refund", "transfer"]) assert.ok(FIN_DOC_TYPE_BY_OPERATION[t]);
  });
  test("без ключей проверка недоступна, а не «действителен»", async () => {
    const a = process.env.FIN_DOC_SIGNING_KEY, b = process.env.FIN_DOC_SIGNING_KEY_V2;
    delete process.env.FIN_DOC_SIGNING_KEY; delete process.env.FIN_DOC_SIGNING_KEY_V2;
    try { assert.equal((await verifyDocument(rec.id, "t")).status, "unavailable"); }
    finally { if (a) process.env.FIN_DOC_SIGNING_KEY = a; if (b) process.env.FIN_DOC_SIGNING_KEY_V2 = b; }
  });
  test("неверный формат номера или пустая метка — не найден", async () => {
    process.env.FIN_DOC_SIGNING_KEY_V2 ??= K2;
    assert.equal((await verifyDocument("bad", "t")).status, "not_found");
    assert.equal((await verifyDocument(rec.id, "")).status, "not_found");
  });
});
