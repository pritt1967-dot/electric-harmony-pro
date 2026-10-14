import { createHash, createHmac, randomInt, timingSafeEqual } from "node:crypto";

import { financeRest } from "@/lib/finance-db.server";
import {
  canonicalDocument,
  FIN_DOC_FORMAT_VERSION,
  FIN_DOC_TYPE_LABEL,
  FIN_DOC_TYPE_REPORT,
  isDocumentId,
  type CanonicalOperationInput,
} from "@/lib/finance-documents-core";

const OPS_SELECT = "id,operation_date,operation_type,amount,from_participant_id,to_participant_id,from_name,to_name,category_id,comment";
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function signingKey(): string {
  const raw = process.env["FIN_DOC_SIGNING_KEY"]?.trim();
  if (!raw || raw.length < 32) {
    throw new Error("Защита документов не настроена: добавьте FIN_DOC_SIGNING_KEY на сервере сайта.");
  }
  return raw;
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

async function loadOperationsByIds(ids: string[]): Promise<CanonicalOperationInput[]> {
  if (!ids.length) return [];
  const list = ids.map((id) => `"${id.replace(/"/g, "")}"`).join(",");
  return ((await financeRest(`operations?select=${OPS_SELECT}&id=in.(${encodeURIComponent(list)})`)) ?? []) as CanonicalOperationInput[];
}

export type IssuedDocument = { id: string; issuedAt: string; verifyUrl: string; checkCode: string };

/** Сервер сам читает операции из базы: цифрам из браузера не доверяем. */
export async function issueReportDocument(projectId: string): Promise<IssuedDocument> {
  const key = signingKey();
  const operations = await loadOperations(projectId);
  const fingerprint = fingerprintOf(canonicalDocument({ docType: FIN_DOC_TYPE_REPORT, projectId, operations }));
  const now = new Date();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const record = {
      id: newId(now),
      doc_type: FIN_DOC_TYPE_REPORT,
      project_id: projectId,
      issued_at: now.toISOString(),
      fingerprint,
      format_version: FIN_DOC_FORMAT_VERSION,
    };
    try {
      await financeRest("finance_documents", {
        method: "POST",
        prefer: "return=minimal",
        body: { ...record, signature: signRecord(key, record), operation_ids: operations.map((o) => String(o.id)) },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/duplicate|23505|409/.test(msg)) continue;
      if (/finance_documents|PGRST205|42P01/.test(msg)) throw new Error("В финансовой базе нет таблицы finance_documents. Выполните SQL из docs/finance-documents.sql.");
      throw e;
    }
    const base = (process.env["PUBLIC_SITE_URL"]?.trim() || "https://sm-electric.ru").replace(/\/+$/, "");
    return {
      id: record.id,
      issuedAt: record.issued_at,
      verifyUrl: `${base}/verify/${record.id}?s=${qrToken(key, record.id)}`,
      checkCode: fingerprint.slice(0, 8).toUpperCase(),
    };
  }
  throw new Error("Не удалось выдать номер документа, повторите попытку");
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

export async function verifyDocument(id: string, token: string): Promise<VerifyResult> {
  let key: string;
  try { key = signingKey(); } catch { return { status: "unavailable" }; }
  // Неверный формат, неверная подпись ссылки и отсутствующий документ неразличимы снаружи.
  if (!isDocumentId(id) || !safeEqual(qrToken(key, id), String(token ?? ""))) return { status: "not_found" };
  let rows: Array<{ id: string; doc_type: string; project_id: string; issued_at: string; fingerprint: string; signature: string; format_version: number; operation_ids: string[] }>;
  try {
    rows = (await financeRest(`finance_documents?select=id,doc_type,project_id,issued_at,fingerprint,signature,format_version,operation_ids&id=eq.${encodeURIComponent(id)}&limit=1`)) ?? [];
  } catch {
    return { status: "unavailable" };
  }
  const doc = rows[0];
  if (!doc) return { status: "not_found" };
  const meta = { docType: FIN_DOC_TYPE_LABEL[doc.doc_type] ?? "Финансовый документ", issuedAt: doc.issued_at, checkCode: doc.fingerprint.slice(0, 8).toUpperCase() };
  if (!safeEqual(signRecord(key, doc), doc.signature)) return { status: "invalid", ...meta };
  let current: CanonicalOperationInput[];
  try {
    const [byIds, all] = await Promise.all([loadOperationsByIds(doc.operation_ids ?? []), loadOperations(doc.project_id)]);
    // Учитываем изменённые, удалённые и перенесённые операции документа.
    current = byIds;
    void all;
  } catch {
    return { status: "unavailable" };
  }
  const fp = fingerprintOf(canonicalDocument({ docType: doc.doc_type, projectId: doc.project_id, operations: current, formatVersion: doc.format_version }));
  return { status: safeEqual(fp, doc.fingerprint) ? "valid" : "modified", ...meta };
}
