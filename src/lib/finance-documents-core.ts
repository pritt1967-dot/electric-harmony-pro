/**
 * Каноническое представление финансового документа для отпечатка.
 * Чистые функции без секретов: одинаково работают в тестах и на сервере.
 */

export const FIN_DOC_FORMAT_VERSION = 1;
export const FIN_DOC_TYPE_REPORT = "finance_report";

export type CanonicalOperationInput = {
  id: string;
  operation_date: string;
  operation_type: string;
  amount: number | string;
  from_participant_id?: string | null;
  to_participant_id?: string | null;
  from_name?: string | null;
  to_name?: string | null;
  category_id?: string | null;
  comment?: string | null;
};

/** Сумма в копейках целым числом: 1000, "1000.00" и 1000.004 дают одно значение. */
export function toKopecks(amount: number | string): number {
  const n = typeof amount === "number" ? amount : Number(String(amount).replace(",", ".").replace(/\s/g, ""));
  if (!Number.isFinite(n)) throw new Error("Некорректная сумма операции");
  return Math.round(n * 100);
}

function normDate(v: string): string {
  return String(v ?? "").slice(0, 10);
}

function normText(v: string | null | undefined): string {
  return String(v ?? "").normalize("NFC").trim().replace(/\s+/g, " ");
}

/** Строка для хеширования: тип, проект, валюта, версия и операции в устойчивом порядке. */
export function canonicalDocument(input: {
  docType: string;
  projectId: string;
  operations: CanonicalOperationInput[];
  formatVersion?: number;
}): string {
  const ops = input.operations
    .map((o) => [
      String(o.id),
      normDate(o.operation_date),
      normText(o.operation_type),
      toKopecks(o.amount),
      normText(o.from_participant_id),
      normText(o.to_participant_id),
      normText(o.from_name),
      normText(o.to_name),
      normText(o.category_id),
      normText(o.comment),
    ])
    .sort((a, b) => (String(a[0]) < String(b[0]) ? -1 : String(a[0]) > String(b[0]) ? 1 : 0));
  return JSON.stringify({
    v: input.formatVersion ?? FIN_DOC_FORMAT_VERSION,
    type: input.docType,
    project: String(input.projectId),
    currency: "RUB",
    ops,
  });
}

const ID_RE = /^SME-FIN-\d{4}-\d{6}-[A-Z2-9]{4}$/;
export function isDocumentId(v: string): boolean {
  return ID_RE.test(v);
}

/** Документ по одной операции: тип документа выводится сервером из типа операции в базе. */
export const FIN_DOC_TYPE_BY_OPERATION: Record<string, string> = {
  income: "finance_income",
  expense: "finance_expense",
  refund: "finance_refund",
  transfer: "finance_transfer",
};

export const FIN_DOC_TYPE_LABEL: Record<string, string> = {
  [FIN_DOC_TYPE_REPORT]: "Финансовый отчёт по проекту",
  finance_income: "Приходный документ",
  finance_expense: "Расходный документ",
  finance_refund: "Документ возврата",
  finance_transfer: "Документ перевода между участниками",
};
