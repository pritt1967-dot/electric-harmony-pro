import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type ServiceRow = {
  id: string;
  icon: string;
  title: string;
  text: string;
  sort_order: number;
};




export type ReviewRow = {
  id: string;
  name: string;
  role: string;
  text: string;
  sort_order: number;
};

export type ProjectImage = {
  id: string;
  image_url: string;
  caption: string;
  sort_order: number;
};

export type ProjectRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  location: string;
  work_date: string | null;
  cover_image: string;
  sort_order: number;
  images: ProjectImage[];
};

export type PriceHighlight = {
  key: string;
  title: string;
  note: string;
  price: number;
  unit: string;
};

export type SiteData = {
  services: ServiceRow[];
  works: WorkRow[];
  projects: ProjectRow[];
  reviews: ReviewRow[];
  content: Record<string, string>;
  priceHighlights: PriceHighlight[];
};

/**
 * Направления прайса на главной. Цифры берутся ТОЛЬКО из price_items:
 * минимальная цена внутри указанной категории.
 */
const PRICE_DIRECTIONS: { key: string; title: string; category: string }[] = [
  { key: "wiring", title: "Электромонтаж", category: "Прокладка кабеля" },
  {
    key: "panel",
    title: "Сборка электрощита",
    category: "Электрощит: сборка, подключение",
  },
  { key: "ground", title: "Заземление", category: "Заземление" },
  {
    key: "light",
    title: "Освещение",
    category: "Потолочное/настенное освещение",
  },
  { key: "measure", title: "Электроизмерения", category: "Электроизмерения" },
  { key: "ev", title: "Зарядные станции", category: "Зарядные станции" },
];

export const getSiteData = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteData> => {
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      {
        auth: {
          storage: undefined,
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );

    const [services, works, reviews, content, projects, prices] =
      await Promise.all([
        supabase
          .from("services")
          .select("id, icon, title, text, sort_order")
          .order("sort_order", { ascending: true }),
        supabase
          .from("works")
          .select("id, image_key, title, text, sort_order")
          .order("sort_order", { ascending: true }),
        supabase
          .from("reviews")
          .select("id, name, role, text, sort_order")
          .order("sort_order", { ascending: true }),
        supabase.from("site_content").select("key, value"),
        supabase
          .from("projects")
          .select(
            "id, slug, title, description, location, work_date, cover_image, sort_order, project_images(id, image_url, caption, sort_order)",
          )
          .eq("is_published", true)
          .order("sort_order", { ascending: true }),
        supabase.from("price_items").select("category, name, price, unit"),
      ]);

    const contentMap: Record<string, string> = {};
    for (const row of content.data ?? []) {
      contentMap[row.key] = row.value;
    }

    const projectRows: ProjectRow[] = (projects.data ?? []).map((p) => ({
      id: p.id,
      slug: p.slug ?? "",
      title: p.title,
      description: p.description,
      location: p.location,
      work_date: p.work_date,
      cover_image: p.cover_image,
      sort_order: p.sort_order,
      images: [...(p.project_images ?? [])].sort(
        (a, b) => a.sort_order - b.sort_order,
      ),
    }));

    const priceRows = prices.data ?? [];
    const priceHighlights: PriceHighlight[] = [];
    for (const dir of PRICE_DIRECTIONS) {
      const inCat = priceRows
        .filter((r) => r.category === dir.category && Number(r.price) > 0)
        .sort((a, b) => Number(a.price) - Number(b.price));
      const min = inCat[0];
      if (!min) continue;
      priceHighlights.push({
        key: dir.key,
        title: dir.title,
        note: min.name,
        price: Number(min.price),
        unit: min.unit,
      });
    }

    return {
      services: services.data ?? [],
      works: works.data ?? [],
      projects: projectRows,
      reviews: reviews.data ?? [],
      content: contentMap,
      priceHighlights,
    };
  },
);
