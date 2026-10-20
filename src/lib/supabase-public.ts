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
const PUBLIC_FETCH_TIMEOUT_MS = 10_000;

/** fetch с ограничением времени и понятной причиной сетевой ошибки. */
async function fetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const timeout = AbortSignal.timeout(PUBLIC_FETCH_TIMEOUT_MS);
  const signal = init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
  try {
    return await fetch(input, { ...init, signal });
  } catch (error) {
    if (timeout.aborted) {
      throw new Error(`База данных не ответила за ${PUBLIC_FETCH_TIMEOUT_MS / 1000} с`);
    }
    const cause = (error as { cause?: { code?: string; message?: string } })?.cause;
    const detail = cause?.code ?? cause?.message;
    throw new Error(
      `Сервер не смог связаться с базой данных${detail ? ` (${detail})` : ""}`,
    );
  }
}

export function createPublicSupabaseClient() {
  const { url, key } = getPublicSupabaseConfig();
  return createClient<Database>(url, key, {
    global: { fetch: fetchWithTimeout },
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
