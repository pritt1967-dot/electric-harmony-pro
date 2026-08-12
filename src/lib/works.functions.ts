import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type WorkImage = {
  id: string;
  image_url: string;
  caption: string;
  alt: string;
  sort_order: number;
};

export type WorkProject = {
  id: string;
  slug: string;
  title: string;
  description: string;
  location: string;
  city: string;
  category: string;
  task: string;
  works_done: string;
  equipment: string;
  result_text: string;
  cost_text: string;
  service_slug: string;
  seo_title: string;
  seo_description: string;
  work_date: string | null;
  cover_image: string;
  sort_order: number;
  images: WorkImage[];
};

const SELECT =
  "id, slug, title, description, location, city, category, task, works_done, equipment, result_text, cost_text, service_slug, seo_title, seo_description, work_date, cover_image, sort_order, project_images(id, image_url, caption, alt, sort_order)";

export const getWorks = createServerFn({ method: "GET" }).handler(
  async (): Promise<WorkProject[]> => {
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data } = await supabase
      .from("projects")
      .select(SELECT)
      .eq("is_published", true)
      .order("sort_order", { ascending: true });

    type Raw = Omit<WorkProject, "images"> & { project_images: WorkImage[] };
    return ((data ?? []) as unknown as Raw[]).map(({ project_images, ...p }) => ({
      ...p,
      slug: p.slug ?? "",
      images: [...(project_images ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    }));
  },
);

export const getCategoryMinPrices = createServerFn({ method: "GET" }).handler(
  async (): Promise<Record<string, { price: number; unit: string; name: string }>> => {
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data } = await supabase
      .from("price_items")
      .select("category, name, price, unit");

    const out: Record<string, { price: number; unit: string; name: string }> = {};
    for (const row of data ?? []) {
      const price = Number(row.price);
      if (!price) continue;
      const cur = out[row.category];
      if (!cur || price < cur.price) {
        out[row.category] = { price, unit: row.unit, name: row.name };
      }
    }
    return out;
  },
);
