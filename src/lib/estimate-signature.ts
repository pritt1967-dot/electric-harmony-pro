/**
 * Подпись подлинности конкретной версии сметы. Не связана с QR заказчика:
 * QR указывает на заказчика, подпись — на содержимое версии документа.
 */
export type SignableEstimate = {
  number: string;
  version: number;
  doc_date: string;
  total: number;
  discount_type: string;
  discount_value: number;
  items: Array<{ name?: string; unit?: string; qty?: number; price?: number }>;
};

export function canonicalEstimate(e: SignableEstimate): string {
  return JSON.stringify([
    "est1",
    String(e.number),
    Number(e.version),
    String(e.doc_date),
    Number(e.total).toFixed(2),
    String(e.discount_type),
    Number(e.discount_value).toFixed(2),
    e.items.map((i) => [
      String(i.name ?? ""),
      String(i.unit ?? ""),
      Number(i.qty ?? 0),
      Number(i.price ?? 0).toFixed(2),
    ]),
  ]);
}

/** Короткий код из HMAC-SHA256 — вычисляется только на сервере с секретным ключом. */
export function formatSignatureCode(hex: string): string {
  return hex.slice(0, 16).toUpperCase().replace(/(.{4})(?=.)/g, "$1-");
}
