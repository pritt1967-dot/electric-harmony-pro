import { createFileRoute } from "@tanstack/react-router";

/**
 * Public read-only video link for the private "work-videos" bucket.
 * Storage policy only lets anon sign files of published works; we redirect
 * to a short-lived signed URL so the browser streams with Range requests
 * directly from storage instead of buffering the whole file here.
 */
export const Route = createFileRoute("/api/public/video/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = (params as { _splat?: string })._splat ?? "";
        if (!path || path.includes("..") || !/\.(mp4|webm|mov)$/i.test(path)) {
          return new Response("Not found", { status: 404 });
        }
        const { createPublicSupabaseClient } = await import("@/lib/supabase-public");
        const supabase = createPublicSupabaseClient();
        const { data, error } = await supabase.storage
          .from("work-videos")
          .createSignedUrl(path, 60 * 60 * 6);
        if (error || !data?.signedUrl) return new Response("Not found", { status: 404 });
        return new Response(null, {
          status: 302,
          headers: { Location: data.signedUrl, "Cache-Control": "private, max-age=3600" },
        });
      },
    },
  },
});
