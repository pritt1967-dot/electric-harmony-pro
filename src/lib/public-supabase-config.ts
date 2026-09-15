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

/**
 * Public backend connection settings for browsers and every server runtime.
 * Runtime configuration wins; Vite build values and safe public defaults keep
 * standalone Node builds independent from Lovable-managed environment values.
 */
export function getPublicSupabaseConfig(): { url: string; key: string } {
  const url =
    runtimeValue("SUPABASE_URL") ??
    runtimeValue("VITE_SUPABASE_URL") ??
    cleanPublicValue(import.meta.env.VITE_SUPABASE_URL as string | undefined) ??
    DEFAULT_SUPABASE_URL;
  const key =
    runtimeValue("SUPABASE_PUBLISHABLE_KEY") ??
    runtimeValue("VITE_SUPABASE_PUBLISHABLE_KEY") ??
    runtimeValue("VITE_SUPABASE_ANON_KEY") ??
    cleanPublicValue(
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined,
    ) ??
    DEFAULT_SUPABASE_PUBLISHABLE_KEY;

  return { url, key };
}
