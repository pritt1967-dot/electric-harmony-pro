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

export type ProjectImage = {
  id: string;
  image_url: string;
  caption: string;
  sort_order: number;
};

export type ProjectRow = {
  id: string;
  title: string;
  description: string;
  location: string;
  work_date: string | null;
  cover_image: string;
  sort_order: number;
  images: ProjectImage[];
};

export type SiteData = {
  services: ServiceRow[];
  works: WorkRow[];
  projects: ProjectRow[];
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

    const [services, works, reviews, content, projects] = await Promise.all([
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
          "id, title, description, location, work_date, cover_image, sort_order, project_images(id, image_url, caption, sort_order)",
        )
        .eq("is_published", true)
        .order("sort_order", { ascending: true }),
    ]);

    const contentMap: Record<string, string> = {};
    for (const row of content.data ?? []) {
      contentMap[row.key] = row.value;
    }

    const projectRows: ProjectRow[] = (projects.data ?? []).map((p) => ({
      id: p.id,
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

    return {
      services: services.data ?? [],
      works: works.data ?? [],
      projects: projectRows,
      reviews: reviews.data ?? [],
      content: contentMap,
    };
  },
);
