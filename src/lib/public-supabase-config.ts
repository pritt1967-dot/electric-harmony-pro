const DEFAULT_SUPABASE_URL = "https://csqqjrbuajcymwhwaxva.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_nkgGme_KJeqG3wp-xETjPg_Ppen__qU";

type RuntimeGlobals = typeof globalThis & {
  Deno?: { env?: { get?: (name: string) => string | undefined } };
  process?: { env?: Record<string, string | undefined> };
};

function cleanPublicValue(value: string | undefined): string | undefined {
  if (typeof value !== "string") return undefined;
  const cleaned = value.trim().replace(/^['"]|['"]$/g, "").trim();
  return cleaned.length > 0 ? cleaned : undefined;
}

function runtimeValue(name: string): string | undefined {
  const runtime = globalThis as RuntimeGlobals;
  return cleanPublicValue(
    runtime.Deno?.env?.get?.(name) ?? runtime.process?.env?.[name],
  );
}

type Pair = { url: string; key: string };

function pair(
  url: string | undefined,
  ...keys: (string | undefined)[]
): Pair | undefined {
  const key = keys.find((k) => k !== undefined);
  return url && key ? { url, key } : undefined;
}

/**
 * Public backend connection settings for browsers and every server runtime.
 *
 * URL и ключ всегда берутся ПАРОЙ из одного источника, иначе можно получить
 * адрес одного проекта с ключом другого. Значения, зафиксированные Vite при
 * сборке, — каноническая конфигурация сайта: на стороннем хостинге серверные
 * переменные с теми же именами могут остаться от другого проекта (например,
 * финансового), и тогда публичный сайт уходит в чужую базу с ошибкой вида
 * "Could not find the table 'public.services' in the schema cache".
 * Поэтому runtime-переменные используются только как запасной вариант.
 */
export function getPublicSupabaseConfig(): Pair {
  return (
    pair(
      cleanPublicValue(import.meta.env.VITE_SUPABASE_URL as string | undefined),
      cleanPublicValue(
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined,
      ),
    ) ??
    pair(
      runtimeValue("VITE_SUPABASE_URL"),
      runtimeValue("VITE_SUPABASE_PUBLISHABLE_KEY"),
      runtimeValue("VITE_SUPABASE_ANON_KEY"),
    ) ??
    pair(
      runtimeValue("SUPABASE_URL"),
      runtimeValue("SUPABASE_PUBLISHABLE_KEY"),
      runtimeValue("SUPABASE_ANON_KEY"),
    ) ?? { url: DEFAULT_SUPABASE_URL, key: DEFAULT_SUPABASE_PUBLISHABLE_KEY }
  );
}

