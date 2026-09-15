import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { getPublicSupabaseConfig } from "@/lib/public-supabase-config";

/**
 * Публичный (anon / publishable) клиент Supabase для серверных функций.
 *
 * Публичные VITE_* значения — каноническая конфигурация сайта: Vite
 * фиксирует их в production build. На Vercel одноимённые server runtime
 * variables могут остаться от другого проекта, поэтому они используются
 * только как fallback и не могут переопределить backend готовой сборки.
 */
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
