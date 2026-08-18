import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Публичный (anon / publishable) клиент Supabase для серверных функций.
 *
 * Публичные VITE_* значения — каноническая конфигурация сайта: Vite
 * фиксирует их в production build. На Vercel одноимённые server runtime
 * variables могут остаться от другого проекта, поэтому они используются
 * только как fallback и не могут переопределить backend готовой сборки.
 */
function envValue(...values: (string | undefined)[]): string | undefined {
  for (const v of values) {
    if (typeof v === "string" && v.length > 0) return v;
  }
  return undefined;
}

export function getPublicSupabaseConfig(): { url: string; key: string } {
  const penv = typeof process !== "undefined" ? process.env : ({} as Record<string, string | undefined>);

  const url = envValue(
    import.meta.env.VITE_SUPABASE_URL as string | undefined,
    penv["VITE_SUPABASE_URL"],
    penv["SUPABASE_URL"],
  );
  const key = envValue(
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined,
    penv["VITE_SUPABASE_PUBLISHABLE_KEY"],
    penv["SUPABASE_PUBLISHABLE_KEY"],
  );

  if (!url || !key) {
    throw new Error(
      "Не настроено подключение к базе: отсутствуют SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY (или VITE_ аналоги).",
    );
  }
  return { url, key };
}

export function createPublicSupabaseClient() {
  const { url, key } = getPublicSupabaseConfig();
  return createClient<Database>(url, key, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
