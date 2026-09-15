// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";
import type { Plugin } from "vite";

// --- Supabase build-time env (для self-hosted Node.js, напр. REG.RU) ---
// VITE_* значения вшиваются в бандл на этапе `npm run build`.
// Если на сервере сборки заданы только SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY,
// подставляем их в VITE_* эквиваленты. Значения по умолчанию — текущий
// Supabase-проект сайта (csqqjrbuajcymwhwaxva), чтобы сборка не ломалась.
const DEFAULT_SUPABASE_URL = "https://csqqjrbuajcymwhwaxva.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_nkgGme_KJeqG3wp-xETjPg_Ppen__qU";
const DEFAULT_SUPABASE_PROJECT_ID = "csqqjrbuajcymwhwaxva";

function clean(value?: string): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().replace(/^['"]|['"]$/g, "").trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function pick(...values: (string | undefined)[]): string | undefined {
  for (const value of values) {
    const cleaned = clean(value);
    if (cleaned) return cleaned;
  }
  return undefined;
}

const env = process.env;

env.VITE_SUPABASE_URL =
  pick(env.VITE_SUPABASE_URL, env.SUPABASE_URL) ?? DEFAULT_SUPABASE_URL;
env.VITE_SUPABASE_PUBLISHABLE_KEY =
  pick(
    env.VITE_SUPABASE_PUBLISHABLE_KEY,
    env.SUPABASE_PUBLISHABLE_KEY,
    env.VITE_SUPABASE_ANON_KEY,
    env.SUPABASE_ANON_KEY,
  ) ?? DEFAULT_SUPABASE_PUBLISHABLE_KEY;
env.VITE_SUPABASE_PROJECT_ID =
  pick(env.VITE_SUPABASE_PROJECT_ID, env.SUPABASE_PROJECT_ID) ?? DEFAULT_SUPABASE_PROJECT_ID;

// Обратная подстановка: runtime-модули (auth-middleware) читают имена без VITE_.
env.SUPABASE_URL = pick(env.SUPABASE_URL) ?? env.VITE_SUPABASE_URL;
env.SUPABASE_PUBLISHABLE_KEY =
  pick(env.SUPABASE_PUBLISHABLE_KEY) ?? env.VITE_SUPABASE_PUBLISHABLE_KEY;
env.SUPABASE_PROJECT_ID = pick(env.SUPABASE_PROJECT_ID) ?? env.VITE_SUPABASE_PROJECT_ID;

function ensureAuthMiddlewarePublicFallback(): Plugin {
  const authMiddlewarePath = "/src/integrations/supabase/auth-middleware.ts";
  return {
    name: "sm-electric:auth-public-config-fallback",
    enforce: "pre",
    transform(code, id) {
      if (!id.replace(/\\/g, "/").includes(authMiddlewarePath)) return null;

      const urlExpression =
        /process\.env(?:\.|\[\s*["'])SUPABASE_URL(?:["']\s*\])?\s*\?\?\s*process\.env(?:\.|\[\s*["'])VITE_SUPABASE_URL(?:["']\s*\])?\s*\?\?/;
      const keyExpression =
        /process\.env(?:\.|\[\s*["'])SUPABASE_PUBLISHABLE_KEY(?:["']\s*\])?\s*\?\?\s*process\.env(?:\.|\[\s*["'])VITE_SUPABASE_PUBLISHABLE_KEY(?:["']\s*\])?\s*\?\?/;
      if (!urlExpression.test(code) || !keyExpression.test(code)) {
        throw new Error(
          "Generated auth middleware no longer matches the expected public configuration pattern.",
        );
      }

      return code
        .replace(
          urlExpression,
          "process.env.SUPABASE_URL?.trim() || process.env.VITE_SUPABASE_URL?.trim() ||",
        )
        .replace(
          keyExpression,
          "process.env.SUPABASE_PUBLISHABLE_KEY?.trim() || process.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||",
        );
    },
  };
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  nitro: {
    preset: "node-server",
  },
  vite: {
    plugins: [ensureAuthMiddlewarePublicFallback(), mcpPlugin()],
  },
});
