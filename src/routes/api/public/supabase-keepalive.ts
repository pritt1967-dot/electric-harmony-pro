import { createFileRoute } from "@tanstack/react-router";
import { createPublicSupabaseClient } from "@/lib/supabase-public";

/**
 * Health-check для поддержания активности Supabase-проектов.
 * ТОЛЬКО чтение: лёгкие запросы по существующим таблицам.
 * Никаких INSERT / UPDATE / DELETE и никаких новых таблиц.
 * Ключи не попадают в клиентский код — запросы выполняются на сервере.
 *
 * Пингуются ОБЕ базы: основная (site_content) и финансовая (categories).
 * Финансовая база — отдельный проект и без регулярных запросов уходит
 * в паузу; первый запрос после паузы зависает на десятки секунд, что и
 * давало ошибку тайм-аута во вкладке «Деньги».
 */
export const Route = createFileRoute("/api/public/supabase-keepalive")({
  server: {
    handlers: {
      GET: async () => {
        const started = Date.now();

        // Основная база сайта.
        let main: { ok: boolean; ms: number; error: string | null };
        try {
          const supabase = createPublicSupabaseClient();
          const { error } = await supabase
            .from("site_content")
            .select("key", { count: "exact", head: true });
          main = { ok: !error, ms: Date.now() - started, error: error?.message ?? null };
        } catch (error) {
          main = {
            ok: false,
            ms: Date.now() - started,
            error: error instanceof Error ? error.message : String(error),
          };
        }

        // Финансовая база. Сбой здесь не роняет общий ответ: главное —
        // сам факт запроса, который будит базу. Ключ не возвращается.
        const financeStarted = Date.now();
        let finance: { ok: boolean; ms: number; error: string | null };
        try {
          const { financeHealthCheck } = await import("@/lib/finance-db.server");
          const health = await financeHealthCheck();
          finance = {
            ok: health.ok,
            ms: Date.now() - financeStarted,
            error: health.configured ? health.error : "not-configured",
          };
        } catch (error) {
          finance = {
            ok: false,
            ms: Date.now() - financeStarted,
            error: error instanceof Error ? error.message : String(error),
          };
        }

        return Response.json({
          ok: main.ok,
          table: "site_content",
          mode: "read-only",
          ms: main.ms,
          finance,
          at: new Date().toISOString(),
        });
      },
    },
  },
});
