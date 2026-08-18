import { createServerFn } from "@tanstack/react-start";
import type { Database } from "@/integrations/supabase/types";
import { createPublicSupabaseClient } from "@/lib/supabase-public";

export type PublicPriceItem = {
  id: string;
  name: string;
  description: string;
  unit: string;
  price: number;
  price_from: boolean;
  in_calculator: boolean;
  public_category: string;
  sort_order: number;
};

/** Клиентские категории страницы «Цены» — порядок отображения. */
export const PUBLIC_CATEGORIES = [
  "Электромонтажные работы",
  "Электрические щиты",
  "Освещение",
  "Розетки и выключатели",
  "Кабельные линии",
  "Заземление",
  "Поиск и устранение неисправностей",
  "Работы в квартире",
  "Работы в частном доме",
  "Дополнительные работы",
] as const;

export const getPublicPrices = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicPriceItem[]> => {
    const supabase = createPublicSupabaseClient();

    const { data } = await supabase
      .from("price_items")
      .select(
        "id, name, description, unit, price, price_from, in_calculator, public_category, sort_order",
      )
      .eq("is_public", true)
      .order("sort_order", { ascending: true })
      .order("price", { ascending: true });

    return (data ?? []).map((r) => ({
      ...r,
      price: Number(r.price),
      public_category: r.public_category || "Дополнительные работы",
    }));
  },
);
