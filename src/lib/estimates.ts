export type EstimateItem = {
  id: string;
  name: string;
  unit: string;
  qty: number;
  price: number;
  comment?: string;
};

export type DiscountType = "percent" | "fixed";

export type EstimateStatus = "draft" | "sent" | "approved" | "done";

export type Estimate = {
  id?: string;
  number: string;
  doc_date: string;
  customer_name: string;
  address: string;
  object_name: string;
  phone: string;
  email: string;
  work_period: string;
  valid_until: string;
  note: string;
  discount_type: DiscountType;
  discount_value: number;
  status: EstimateStatus;
  total: number;
  items: EstimateItem[];
  version?: number;
  public_token?: string;
  approved_at?: string | null;
  approved_by_name?: string;
};

export const STATUS_LABEL: Record<EstimateStatus, string> = {
  draft: "Черновик",
  sent: "Отправлена",
  approved: "Согласована",
  done: "Выполнена",
};


export const UNITS = ["шт", "м", "м²", "компл", "точка", "линия", "изм", "усл", "ч"];

export function lineTotal(item: EstimateItem) {
  return Math.round(item.qty * item.price * 100) / 100;
}

export function subtotal(items: EstimateItem[]) {
  return Math.round(items.reduce((s, i) => s + lineTotal(i), 0) * 100) / 100;
}

export function discountAmount(
  items: EstimateItem[],
  type: DiscountType,
  value: number,
) {
  const sub = subtotal(items);
  const raw = type === "percent" ? (sub * (value || 0)) / 100 : value || 0;
  return Math.round(Math.min(Math.max(raw, 0), sub) * 100) / 100;
}

export function grandTotal(
  items: EstimateItem[],
  type: DiscountType,
  value: number,
) {
  return Math.round((subtotal(items) - discountAmount(items, type, value)) * 100) / 100;
}

export function money(n: number) {
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n || 0);
}

export function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ru-RU");
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function nextNumber(existing: string[]) {
  const year = new Date().getFullYear();
  const nums = existing
    .map((n) => {
      const m = /^(\d+)\//.exec(n.trim());
      return m ? Number(m[1]) : 0;
    })
    .filter((n) => Number.isFinite(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${String(next).padStart(3, "0")}/${year}`;
}

export function emptyEstimate(number: string): Estimate {
  return {
    number,
    doc_date: todayISO(),
    customer_name: "",
    address: "",
    phone: "",
    email: "",
    work_period: "",
    valid_until: "",
    note: "",
    discount_type: "percent",
    discount_value: 0,
    status: "draft",
    total: 0,
    items: [],
  };
}

export const FOOTER_LINES = [
  "S&M Electric",
  "Электромонтаж любой сложности",
  "Монтаж электрических щитов",
  "Монтаж заземления",
  "Электроизмерения",
  "Гарантия на выполненные работы",
];
