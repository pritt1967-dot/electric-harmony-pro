import { createHash, createHmac, randomInt, timingSafeEqual } from "node:crypto";

import { financeRest } from "@/lib/finance-db.server";
import {
  canonicalDocument,
  FIN_DOC_FORMAT_VERSION,
  FIN_DOC_TYPE_LABEL,
  FIN_DOC_TYPE_BY_OPERATION,
  FIN_DOC_TYPE_REPORT,
  isDocumentId,
  type CanonicalOperationInput,
} from "@/lib/finance-documents-core";

const OPS_SELECT = "id,operation_date,operation_type,amount,from_participant_id,to_participant_id,from_name,to_name,category_id,comment";
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const CURRENT_KEY_VERSION = "v2";

/** Ключи читаются только на сервере. v1 — прежний (только проверка), v2 — для новых документов. */
function keyFor(version: string): string | null {
  const name = version === "v1" ? "FIN_DOC_SIGNING_KEY" : version === "v2" ? "FIN_DOC_SIGNING_KEY_V2" : null;
  if (!name) return null;
  const raw = process.env[name]?.trim();
  return raw && raw.length >= 32 ? raw : null;
}

function signingKey(): string {
  const k = keyFor(CURRENT_KEY_VERSION);
  if (!k) throw new Error("Защита документов не настроена: добавьте FIN_DOC_SIGNING_KEY_V2 на сервере сайта.");
  return k;
}

export function fingerprintOf(canonical: string): string {
  return createHash("sha256").update(canonical, "utf8").digest("hex");
}

function hmac(key: string, payload: string): string {
  return createHmac("sha256", key).update(payload, "utf8").digest("hex");
}

export function signRecord(key: string, r: { id: string; doc_type: string; project_id: string; issued_at: string; fingerprint: string; format_version: number }): string {
  return hmac(key, ["doc", r.id, r.doc_type, r.project_id, new Date(r.issued_at).toISOString(), r.fingerprint, r.format_version].join("|"));
}

/** Короткая подпись для QR: без неё ссылка недействительна, подобрать её нельзя. */
export function qrToken(key: string, id: string): string {
  return hmac(key, `qr|${id}`).slice(0, 20);
}

export type SignedRecordV2 = { id: string; doc_type: string; project_id: string; issued_at: string; fingerprint: string; format_version: number; key_version: string; qr_fingerprint: string; operation_ids: string[] };

/** Подпись v2 охватывает также версию ключа, отпечаток QR и состав операций. */
export function signRecordV2(key: string, r: SignedRecordV2): string {
  return hmac(key, ["doc2", r.id, r.doc_type, r.project_id, new Date(r.issued_at).toISOString(), r.fingerprint, r.format_version, r.key_version, r.qr_fingerprint, [...r.operation_ids].map(String).sort().join(",")].join("|"));
}

export function qrTokenV2(key: string, id: string): string {
  return hmac(key, `qr2|${id}`).slice(0, 32);
}

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

function newId(now: Date): string {
  const digits = String(randomInt(0, 1_000_000)).padStart(6, "0");
  let tail = "";
  for (let i = 0; i < 4; i += 1) tail += ALPHABET[randomInt(0, ALPHABET.length)];
  return `SME-FIN-${now.getUTCFullYear()}-${digits}-${tail}`;
}

async function loadOperations(projectId: string): Promise<CanonicalOperationInput[]> {
  return ((await financeRest(`operations?select=${OPS_SELECT}&project_id=eq.${encodeURIComponent(projectId)}`)) ?? []) as CanonicalOperationInput[];
}

async function loadOperationsByIds(ids: string[]): Promise<Array<CanonicalOperationInput & { project_id?: string }>> {
  if (!ids.length) return [];
  const list = ids.map((id) => `"${id.replace(/"/g, "")}"`).join(",");
  return ((await financeRest(`operations?select=${OPS_SELECT},project_id&id=in.(${encodeURIComponent(list)})`)) ?? []) as Array<CanonicalOperationInput & { project_id?: string }>;
}

export type IssuedDocument = { id: string; issuedAt: string; verifyUrl: string; checkCode: string; docType: string };

async function issueDocument(docType: string, projectId: string, operations: CanonicalOperationInput[]): Promise<IssuedDocument> {
  const key = signingKey();
  const fingerprint = fingerprintOf(canonicalDocument({ docType, projectId, operations }));
  const now = new Date();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const id = newId(now);
    const token = qrTokenV2(key, id);
    const record: SignedRecordV2 = {
      id,
      doc_type: docType,
      project_id: projectId,
      issued_at: now.toISOString(),
      fingerprint,
      format_version: FIN_DOC_FORMAT_VERSION,
      key_version: CURRENT_KEY_VERSION,
      qr_fingerprint: fingerprintOf(token),
      operation_ids: operations.map((o) => String(o.id)),
    };
    try {
      await financeRest("finance_documents", { method: "POST", prefer: "return=minimal", body: { ...record, signature: signRecordV2(key, record) } });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/duplicate|23505|409/.test(msg)) continue;
      if (/key_version|qr_fingerprint|PGRST204/.test(msg)) throw new Error("В таблице finance_documents нет новых полей. Выполните SQL из docs/finance-documents-v2.sql.");
      if (/finance_documents|PGRST205|42P01/.test(msg)) throw new Error("В финансовой базе нет таблицы finance_documents. Выполните SQL из docs/finance-documents.sql.");
      throw e;
    }
    const base = (process.env["PUBLIC_SITE_URL"]?.trim() || "https://sm-electric.ru").replace(/\/+$/, "");
    return { id, issuedAt: record.issued_at, verifyUrl: `${base}/verify/${id}?s=${token}`, checkCode: fingerprint.slice(0, 8).toUpperCase(), docType: FIN_DOC_TYPE_LABEL[docType] ?? "Финансовый документ" };
  }
  throw new Error("Не удалось выдать номер документа, повторите попытку");
}

/** Сервер сам читает операции из базы: цифрам из браузера не доверяем. */
export async function issueReportDocument(projectId: string): Promise<IssuedDocument> {
  signingKey();
  return issueDocument(FIN_DOC_TYPE_REPORT, projectId, await loadOperations(projectId));
}

/** Документ по одной операции (приход, расход, возврат, перевод). */
export async function issueOperationDocument(projectId: string, operationId: string): Promise<IssuedDocument> {
  signingKey();
  const [op] = (await loadOperationsByIds([operationId])).filter((o) => String(o.project_id) === String(projectId));
  if (!op) throw new Error("Операция не найдена в выбранном проекте");
  const docType = FIN_DOC_TYPE_BY_OPERATION[String(op.operation_type)];
  if (!docType) throw new Error("Для этого типа операции документ не предусмотрен");
  const { project_id: _p, ...clean } = op;
  return issueDocument(docType, projectId, [clean]);
}

export type VerifyStatus = "valid" | "modified" | "invalid" | "not_found" | "rate_limited" | "unavailable";
export type VerifyResult = { status: VerifyStatus; docType?: string; issuedAt?: string; checkCode?: string };

const hits = new Map<string, number[]>();
export function rateLimited(ip: string, limit = 20, windowMs = 10 * 60_000): boolean {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > limit;
}

type DocRow = SignedRecordV2 & { signature: string; key_version: string | null; qr_fingerprint: string | null };

/** Проверка без раскрытия данных; действителен только при совпадении QR-метки, подписи записи и отпечатка операций. */
export async function verifyDocument(id: string, token: string): Promise<VerifyResult> {
  if (!keyFor("v1") && !keyFor("v2")) return { status: "unavailable" };
  if (!isDocumentId(id) || !token) return { status: "not_found" };
  let rows: DocRow[];
  try {
    rows = (await financeRest(`finance_documents?select=*&id=eq.${encodeURIComponent(id)}&limit=1`)) ?? [];
  } catch {
    return { status: "unavailable" };
  }
  const doc = rows[0];
  if (!doc) return { status: "not_found" };
  const version = doc.key_version ?? "v1";
  const key = keyFor(version);
  if (!key) return { status: version === "v1" || version === "v2" ? "unavailable" : "not_found" };
  const tokenOk = version === "v1"
    ? safeEqual(qrToken(key, id), String(token))
    : safeEqual(qrTokenV2(key, id), String(token)) && !!doc.qr_fingerprint && safeEqual(fingerprintOf(String(token)), doc.qr_fingerprint);
  // Неверная метка ссылки и отсутствующий документ неразличимы снаружи.
  if (!tokenOk) return { status: "not_found" };
  const meta = { docType: FIN_DOC_TYPE_LABEL[doc.doc_type] ?? "Финансовый документ", issuedAt: doc.issued_at, checkCode: doc.fingerprint.slice(0, 8).toUpperCase() };
  const expected = version === "v1" ? signRecord(key, doc) : signRecordV2(key, { ...doc, key_version: version, qr_fingerprint: doc.qr_fingerprint ?? "", operation_ids: doc.operation_ids ?? [] });
  if (!safeEqual(expected, doc.signature)) return { status: "invalid", ...meta };
  let current: CanonicalOperationInput[];
  try {
    // Изменённая, удалённая или перенесённая в другой проект операция меняет отпечаток.
    current = (await loadOperationsByIds(doc.operation_ids ?? [])).filter((o) => String(o.project_id) === String(doc.project_id)).map(({ project_id: _p, ...o }) => o);
  } catch {
    return { status: "unavailable" };
  }
  const fp = fingerprintOf(canonicalDocument({ docType: doc.doc_type, projectId: doc.project_id, operations: current, formatVersion: doc.format_version }));
  return { status: safeEqual(fp, doc.fingerprint) ? "valid" : "modified", ...meta };
}
