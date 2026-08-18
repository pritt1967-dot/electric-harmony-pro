import { createFileRoute } from "@tanstack/react-router";

/**
 * Public read-only image proxy for the private "projects" storage bucket.
 * Only serves objects from that bucket, never accepts writes.
 */
export const Route = createFileRoute("/api/public/photo/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = (params as { _splat?: string })._splat ?? "";
        if (!path || path.includes("..")) {
          return new Response("Not found", { status: 404 });
        }

        const { createPublicSupabaseClient } = await import(
          "@/lib/supabase-public"
        );
        const supabase = createPublicSupabaseClient();
        const { data, error } = await supabase.storage
          .from("projects")
          .download(path);

        if (error || !data) return new Response("Not found", { status: 404 });


        return new Response(await data.arrayBuffer(), {
          headers: {
            "Content-Type": data.type || "image/jpeg",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
