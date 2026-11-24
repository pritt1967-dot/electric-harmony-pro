import { createServerFn } from "@tanstack/react-start";
import type { Database } from "@/integrations/supabase/types";
import { createPublicSupabaseClient } from "@/lib/supabase-public";

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
  customer_name: string;
  task: string;
  works_done: string;
  notes_text: string;
  equipment: string;
  lights_text: string;
  result_text: string;
  warranty_text: string;
  cost_text: string;
  service_slug: string;
  seo_title: string;
  seo_description: string;
  work_date: string | null;
  cover_image: string;
  sort_order: number;
  images: WorkImage[];
  videos: WorkVideo[];
};

export type WorkVideo = {
  id: string;
  storage_path: string;
  mime_type: string;
  poster_url: string;
  caption: string;
  sort_order: number;
};

const PROJECT_FIELDS =
  "id, slug, title, description, location, city, category, customer_name, task, works_done, notes_text, equipment, lights_text, result_text, warranty_text, cost_text, service_slug, seo_title, seo_description, work_date, cover_image, sort_order";

export const getWorks = createServerFn({ method: "GET" }).handler(
  async (): Promise<WorkProject[]> => {
    const supabase = createPublicSupabaseClient();

    // Do not use PostgREST embedded relations here. The site must remain
    // independent from the timing/state of PostgREST's relationship cache.
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select(PROJECT_FIELDS)
      .eq("is_published", true)
      .order("sort_order", { ascending: true });

    if (projectsError) {
      throw new Error(`Не удалось загрузить объекты: ${projectsError.message}`);
    }

    const projectRows = (projects ?? []) as unknown as Omit<WorkProject, "images" | "videos">[];
    if (projectRows.length === 0) return [];

    const projectIds = projectRows.map((p) => p.id);

    const [{ data: imageRows, error: imagesError }, { data: videoRows, error: videosError }] =
      await Promise.all([
        supabase
          .from("project_images")
          .select("id, project_id, image_url, caption, alt, sort_order")
          .in("project_id", projectIds)
          .order("sort_order", { ascending: true }),
        supabase
          .from("project_videos")
          .select("id, project_id, storage_path, mime_type, poster_url, caption, sort_order")
          .in("project_id", projectIds)
          .order("sort_order", { ascending: true }),
      ]);

    if (imagesError) {
      throw new Error(`Не удалось загрузить фотографии объектов: ${imagesError.message}`);
    }
    if (videosError) {
      throw new Error(`Не удалось загрузить видео объектов: ${videosError.message}`);
    }

    const imagesByProject = new Map<string, WorkImage[]>();
    for (const row of imageRows ?? []) {
      const image = row as WorkImage & { project_id: string };
      const list = imagesByProject.get(image.project_id) ?? [];
      list.push(image);
      imagesByProject.set(image.project_id, list);
    }

    const videosByProject = new Map<string, WorkVideo[]>();
    for (const row of videoRows ?? []) {
      const video = row as WorkVideo & { project_id: string };
      const list = videosByProject.get(video.project_id) ?? [];
      list.push(video);
      videosByProject.set(video.project_id, list);
    }

    return projectRows.map((p) => ({
      ...p,
      slug: p.slug ?? "",
      images: [...(imagesByProject.get(p.id) ?? [])].sort((a, b) => a.sort_order - b.sort_order),
      videos: [...(videosByProject.get(p.id) ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    }));
  },
);

export const getCategoryMinPrices = createServerFn({ method: "GET" }).handler(
  async (): Promise<Record<string, { price: number; unit: string; name: string }>> => {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase
      .from("price_items")
      .select("category, name, price, unit");

    if (error) {
      throw new Error(`Не удалось загрузить цены: ${error.message}`);
    }


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
