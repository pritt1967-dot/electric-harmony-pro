import { createFileRoute } from "@tanstack/react-router";
import { createPublicSupabaseClient } from "@/lib/supabase-public";

/**
 * Health-check для поддержания активности Supabase-проекта.
 * ТОЛЬКО чтение: HEAD-запрос по существующей таблице site_content.
 * Никаких INSERT / UPDATE / DELETE и никаких новых таблиц.
 * Ключи не попадают в клиентский код — запрос выполняется на сервере.
 */
export const Route = createFileRoute("/api/public/supabase-keepalive")({
  server: {
    handlers: {
      GET: async () => {
        const started = Date.now();
        try {
          const supabase = createPublicSupabaseClient();
          const { count, error } = await supabase
            .from("site_content")
            .select("key", { count: "exact", head: true });

          if (error) {
            return Response.json(
              { ok: false, table: "site_content", error: error.message },
              { status: 200 },
            );
          }

          return Response.json({
            ok: true,
            table: "site_content",
            mode: "read-only",
            rows: count ?? 0,
            ms: Date.now() - started,
            at: new Date().toISOString(),
          });
        } catch (error) {
          return Response.json({
            ok: false,
            table: "site_content",
            error: error instanceof Error ? error.message : String(error),
          });
        }
      },
    },
  },
});
