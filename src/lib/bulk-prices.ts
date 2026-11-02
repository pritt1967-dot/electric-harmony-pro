import { z } from "zod";

export const priceChangeSchema = z.object({
  direction: z.enum(["increase", "decrease"]),
  percent: z.number().finite().positive("Введите процент больше нуля"),
  scope: z.enum(["all", "selected", "category"]),
  category: z.string().default(""),
  ids: z.array(z.string().uuid()).default([]),
}).superRefine((value, ctx) => {
  if (value.direction === "decrease" && value.percent > 100)
    ctx.addIssue({ code: "custom", message: "Уменьшение не может превышать 100%" });
  if (value.scope === "selected" && !value.ids.length)
    ctx.addIssue({ code: "custom", message: "Выберите позиции прайса" });
  if (value.scope === "category" && !value.category)
    ctx.addIssue({ code: "custom", message: "Выберите категорию работ" });
});

export function changedPrice(price: number, percent: number, direction: "increase" | "decrease") {
  priceChangeSchema.parse({ direction, percent, scope: "all" });
  if (!Number.isFinite(price) || price < 0) throw new Error("Некорректная исходная цена");
  const result = Math.round(price * (1 + (direction === "increase" ? percent : -percent) / 100));
  if (result < 0 || result > 9999999999.99) throw new Error("Цена вне допустимого диапазона");
  return result;
}

export function selectPriceIds<T extends { id: string; category: string }>(rows: T[], scope: "all" | "selected" | "category", selected: string[], category: string) {
  return rows.filter(row => scope === "all" || (scope === "selected" ? selected.includes(row.id) : row.category === category)).map(row => row.id);
}

export type PriceChangeItem = { id: string; name: string; old_price: number; new_price: number; updated_at: string };
export type PriceChangeBatch = {
  id: string; direction: "increase" | "decrease"; percent: number;
  scope: "all" | "selected" | "category"; category: string;
  items: PriceChangeItem[]; status: "pending" | "applied" | "restored"; created_at: string;
};

export function readPriceBatch(value: unknown): PriceChangeBatch {
  return z.object({
    id: z.string().uuid(), direction: z.enum(["increase", "decrease"]), percent: z.number(),
    scope: z.enum(["all", "selected", "category"]), category: z.string(),
    items: z.array(z.object({ id: z.string().uuid(), name: z.string(), old_price: z.number(), new_price: z.number(), updated_at: z.string() })),
    status: z.enum(["pending", "applied", "restored"]), created_at: z.string(),
  }).parse(value);
}