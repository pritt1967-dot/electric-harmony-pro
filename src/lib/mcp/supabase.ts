import { createClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";
import { getPublicSupabaseConfig } from "@/lib/public-supabase-config";

type RuntimeGlobals = typeof globalThis & {
  Deno?: { env?: { get?: (name: string) => string | undefined } };
  process?: { env?: Record<string, string | undefined> };
};

function runtimeEnv(name: string): string | undefined {
  const runtime = globalThis as RuntimeGlobals;
  return runtime.Deno?.env?.get?.(name) ?? runtime.process?.env?.[name];
}

function configuredEnv(names: readonly string[]): string | undefined {
  for (const name of names) {
    const value = runtimeEnv(name)?.trim();
    if (value) return value;
  }
  return undefined;
}

function configuredPublishableKey(): string {
  const keyset = runtimeEnv("SUPABASE_PUBLISHABLE_KEYS");
  if (keyset) {
    try {
      const parsed: unknown = JSON.parse(keyset);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const keys = parsed as Record<string, unknown>;
        const key = [keys.default, ...Object.values(keys)]
          .find(
            (v): v is string =>
              typeof v === "string" && v.trim().startsWith("sb_publishable_"),
          )
          ?.trim();
        if (key) return key;
      }
    } catch {
      // Malformed dictionary; try the legacy names below.
    }
  }
  const legacy = configuredEnv(["SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY"]);
  if (legacy) return legacy;
  return getPublicSupabaseConfig().key;
}

// No caller identity — RLS runs as `anon`. Public data only.
export function supabaseAnon() {
  const { url } = getPublicSupabaseConfig();
  return createClient(url, configuredPublishableKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Forwards the verified bearer token so RLS runs as the signed-in user.
export function supabaseForUser(ctx: ToolContext) {
  const token = ctx.getToken();
  if (!token)
    throw new Error("supabaseForUser requires a verified OAuth token");
  const { url } = getPublicSupabaseConfig();
  return createClient(url, configuredPublishableKey(), {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
