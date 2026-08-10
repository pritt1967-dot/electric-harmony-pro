export type OrderStatus =
  | "new"
  | "approved"
  | "awaiting_payment"
  | "paid"
  | "in_progress"
  | "done"
  | "cancelled";

export type PaymentStatus = "unpaid" | "awaiting" | "partial" | "paid";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  new: "Новый",
  approved: "Согласован",
  awaiting_payment: "Ожидает оплаты",
  paid: "Оплачен",
  in_progress: "В работе",
  done: "Завершён",
  cancelled: "Отменён",
};

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "new",
  "approved",
  "awaiting_payment",
  "paid",
  "in_progress",
  "done",
  "cancelled",
];

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  unpaid: "Не оплачено",
  awaiting: "Ожидает оплаты",
  partial: "Оплачено частично",
  paid: "Оплачено",
};

export function orderStatusLabel(status: string) {
  return ORDER_STATUS_LABEL[status as OrderStatus] ?? status;
}

export function paymentStatusLabel(status: string) {
  return PAYMENT_STATUS_LABEL[status as PaymentStatus] ?? status;
}

/** Payment status derived from amounts — single source of truth for the UI. */
export function derivePaymentStatus(total: number, paid: number): PaymentStatus {
  if (paid <= 0) return "unpaid";
  if (paid + 0.009 >= total) return "paid";
  return "partial";
}

export function remainingAmount(total: number, paid: number) {
  return Math.max(Math.round((total - paid) * 100) / 100, 0);
}

/** ORD-2026-00087 */
export function formatOrderNumber(year: number, seq: number) {
  return `ORD-${year}-${String(seq).padStart(5, "0")}`;
}

/** EST-2026-00125 */
export function formatEstimateNumber(year: number, seq: number) {
  return `EST-${year}-${String(seq).padStart(5, "0")}`;
}
