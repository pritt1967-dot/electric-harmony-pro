import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

function isOpaqueApiKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

function createBackendFetch(apiKey: string, accessToken?: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }
    if (isOpaqueApiKey(apiKey) && headers.get("Authorization") === `Bearer ${apiKey}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", apiKey);
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
    return fetch(input, { ...init, headers });
  };
}

/** Production-safe authentication used only by the AI panel transport. */
export const requirePanelAuth = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    // Desktop browsers can retain an expired/stale access token longer than
    // mobile browsers. Refresh the session before sending the server request
    // when there is no usable session, and retry once if the server rejects
    // the token as invalid.
    async function getAccessToken(): Promise<string | null> {
      const { data, error } = await supabase.auth.getSession();
      if (!error && data.session?.access_token) {
        return data.session.access_token;
      }

      const refreshed = await supabase.auth.refreshSession();
      if (refreshed.error || !refreshed.data.session?.access_token) return null;
      return refreshed.data.session.access_token;
    }

    let accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error("Unauthorized: No valid Supabase session");
    }

    const request = () =>
      next({
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

    try {
      return await request();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!/invalid token/i.test(message)) throw error;

      const refreshed = await supabase.auth.refreshSession();
      accessToken = refreshed.data.session?.access_token ?? "";
      if (refreshed.error || !accessToken) {
        throw new Error("Unauthorized: Session expired. Please sign in again.");
      }

      return request();
    }
  })
  .server(async ({ next }) => {
    const backendUrl =
      process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
    const publishableKey =
      process.env["SUPABASE_PUBLISHABLE_KEY"] ??
      process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ??
      process.env["VITE_SUPABASE_ANON_KEY"];

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
      global: {
        fetch: createBackendFetch(publishableKey, token),
      },
      auth: {
        storage: undefined,
        persistSession: false,
        autoRefreshToken: false,
      },
    });

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
  });
