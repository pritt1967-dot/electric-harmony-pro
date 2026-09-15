import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

const DEFAULT_SUPABASE_URL = "https://csqqjrbuajcymwhwaxva.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_nkgGme_KJeqG3wp-xETjPg_Ppen__qU";

function cleanEnvironmentValue(value: string | undefined): string | undefined {
  if (typeof value !== "string") return undefined;
  const cleaned = value.trim().replace(/^['"]|['"]$/g, "").trim();
  return cleaned.length > 0 ? cleaned : undefined;
}

/**
 * Self-hosted Node.js deployments do not always expose build-time VITE_*
 * values through process.env. Populate only the public backend connection
 * values before importing TanStack's server entry so every server middleware
 * receives the same configuration. Runtime values always take priority.
 */
function configurePublicBackendEnvironment(): void {
  const url =
    cleanEnvironmentValue(process.env["SUPABASE_URL"]) ??
    cleanEnvironmentValue(process.env["VITE_SUPABASE_URL"]) ??
    cleanEnvironmentValue(import.meta.env.VITE_SUPABASE_URL as string | undefined) ??
    DEFAULT_SUPABASE_URL;
  const publishableKey =
    cleanEnvironmentValue(process.env["SUPABASE_PUBLISHABLE_KEY"]) ??
    cleanEnvironmentValue(process.env["VITE_SUPABASE_PUBLISHABLE_KEY"]) ??
    cleanEnvironmentValue(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
    DEFAULT_SUPABASE_PUBLISHABLE_KEY;

  process.env["SUPABASE_URL"] = url;
  process.env["SUPABASE_PUBLISHABLE_KEY"] = publishableKey;
  process.env["VITE_SUPABASE_URL"] ??= url;
  process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ??= publishableKey;
}

configurePublicBackendEnvironment();

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
