import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

const DEFAULT_SUPABASE_URL = "https://nppincxonqwajdoxqbla.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_-SQWM_0x8kxnwjRFDBWTPA_ofvPJgKo";
const DEFAULT_SUPABASE_PROJECT_ID = "nppincxonqwajdoxqbla";

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

env.SUPABASE_URL = pick(env.SUPABASE_URL) ?? env.VITE_SUPABASE_URL;
env.SUPABASE_PUBLISHABLE_KEY =
  pick(env.SUPABASE_PUBLISHABLE_KEY) ?? env.VITE_SUPABASE_PUBLISHABLE_KEY;
env.SUPABASE_PROJECT_ID = pick(env.SUPABASE_PROJECT_ID) ?? env.VITE_SUPABASE_PROJECT_ID;

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    tanstackStart({
      server: { entry: "./server.ts" },
    }),
    viteReact(),
    nitro({ preset: "node_server" }),
  ],
});
