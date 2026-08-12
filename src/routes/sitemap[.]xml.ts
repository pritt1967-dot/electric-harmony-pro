import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

import { SERVICE_PAGES } from "@/lib/services-seo";
import { SITE_URL } from "@/lib/seo";

interface SitemapEntry {
  path: string;
  changefreq?: "weekly" | "monthly";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/prices", changefreq: "weekly", priority: "0.9" },
          { path: "/raboty", changefreq: "weekly", priority: "0.9" },
          ...SERVICE_PAGES.map((s) => ({
            path: `/${s.slug}`,
            changefreq: "monthly" as const,
            priority: "0.8",
          })),
        ];

        try {
          const supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_PUBLISHABLE_KEY!,
            { auth: { persistSession: false, autoRefreshToken: false } },
          );
          const { data } = await supabase
            .from("projects")
            .select("slug")
            .eq("is_published", true)
            .order("sort_order", { ascending: true });
          for (const row of data ?? []) {
            if (row.slug)
              entries.push({
                path: `/raboty/${row.slug}`,
                changefreq: "monthly",
                priority: "0.7",
              });
          }
        } catch {
          // проект-объекты недоступны — отдаём статическую часть карты сайта
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${SITE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
