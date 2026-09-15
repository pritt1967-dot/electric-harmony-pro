import { createClient } from "@supabase/supabase-js";

import type { Database } from "./types";
import { supabase as generatedSupabase } from "./client";
import { getPublicSupabaseConfig } from "@/lib/public-supabase-config";

/**
 * Admin-side Supabase client that never talks to *.supabase.co from the
 * browser: all requests go to the site's own origin (/api/public/sb/*), and
 * the site server forwards them to the backend.
 *
 * Only the browser, on a self-hosted domain, uses the proxy. Lovable preview
 * surfaces and SSR keep the generated client (session brokering, direct calls).
 */

const PREVIEW_ZONES = [
  "lovableproject.com",
  "lovableproject-dev.com",
  "lovable.app",
  "gpt-eng.com",
  "gptengineer.run",
];

function usesProxy(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return false;
  return !PREVIEW_ZONES.some((zone) => host === zone || host.endsWith(`.${zone}`));
}

function projectRef(url: string): string {
  const match = url.match(/^https?:\/\/([^.]+)\./);
  return match?.[1] ?? "backend";
}

function createProxyClient() {
  const { url, key } = getPublicSupabaseConfig();
  return createClient<Database>(`${window.location.origin}/api/public/sb`, key, {
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        // Opaque publishable keys are not bearer JWTs.
        if (headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
    auth: {
      // Keep the original storage key so existing sessions stay valid and the
      // generated client (SSR/preview) reads the very same session.
      storageKey: `sb-${projectRef(url)}-auth-token`,
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

let _client: ReturnType<typeof createProxyClient> | undefined;

export const supabase = new Proxy({} as ReturnType<typeof createProxyClient>, {
  get(_target, prop, receiver) {
    if (!usesProxy()) {
      return Reflect.get(generatedSupabase as unknown as object, prop, receiver);
    }
    if (!_client) _client = createProxyClient();
    return Reflect.get(_client, prop, receiver);
  },
});
