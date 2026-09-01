import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

function isOpaqueApiKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

function createBackendFetch(apiKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request
        ? input.headers
        : undefined,
    );
    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }
    if (isOpaqueApiKey(apiKey) && headers.get("Authorization") === `Bearer ${apiKey}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", apiKey);
    return fetch(input, { ...init, headers });
  };
}

/** Production-safe authentication used only by the AI panel transport. */
export const requirePanelAuth = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const backendUrl =
      process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
    const publishableKey =
      process.env["SUPABASE_PUBLISHABLE_KEY"] ??
      process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];

    if (!backendUrl || !publishableKey) {
      throw new Error("Unauthorized: Backend authentication is not configured");
    }

    const authHeader = getRequest()?.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : "";
    if (!token) {
      throw new Error("Unauthorized: No authorization token provided");
    }

    const backend = createClient<Database>(backendUrl, publishableKey, {
      accessToken: async () => token,
      global: {
        fetch: createBackendFetch(publishableKey),
      },
      auth: {
        storage: undefined,
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Validate against the configured Auth service instead of locally parsing
    // or verifying the JWT. This also supports signing-key rotation.
    const { data, error } = await backend.auth.getUser(token);
    if (error || !data.user) {
      throw new Error("Unauthorized: Invalid token");
    }

    return next({
      context: {
        supabase: backend,
        userId: data.user.id,
        claims: data.user,
      },
    });
  },
);