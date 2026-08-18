import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Публичный (anon / publishable) клиент Supabase для серверных функций.
 *
 * На некоторых хостингах (например Vercel) серверные переменные
 * SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY не заданы — там доступны только
 * VITE_* переменные, которые Vite инлайнит на этапе сборки.
 * Поэтому берём значения с фолбэком, чтобы обе среды работали с одним
 * и тем же backend-проектом.
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
    penv["SUPABASE_URL"],
    penv["VITE_SUPABASE_URL"],
    import.meta.env.VITE_SUPABASE_URL as string | undefined,
  );
  const key = envValue(
    penv["SUPABASE_PUBLISHABLE_KEY"],
    penv["VITE_SUPABASE_PUBLISHABLE_KEY"],
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined,
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
