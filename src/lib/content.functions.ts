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

export type WorkRow = {
  id: string;
  image_key: string;
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

export type SiteData = {
  services: ServiceRow[];
  works: WorkRow[];
  reviews: ReviewRow[];
  content: Record<string, string>;
};

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

    const [services, works, reviews, content] = await Promise.all([
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
    ]);

    const contentMap: Record<string, string> = {};
    for (const row of content.data ?? []) {
      contentMap[row.key] = row.value;
    }

    return {
      services: services.data ?? [],
      works: works.data ?? [],
      reviews: reviews.data ?? [],
      content: contentMap,
    };
  },
);
