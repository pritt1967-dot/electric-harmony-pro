const ALLOWED_PREFIXES = ["auth/v1/", "rest/v1/", "storage/v1/", "functions/v1/"];
const REQUEST_HEADERS = ["authorization", "apikey", "content-type", "accept", "accept-language", "accept-profile", "content-profile", "prefer", "range", "x-client-info", "x-upsert", "x-supabase-api-version", "cache-control"];
const SKIP_HEADERS = new Set(["content-encoding", "content-length", "transfer-encoding", "connection", "keep-alive"]);

/** Same-origin transport: caller credentials only; never retry an ambiguous write. */
export async function proxySiteBackend(request: Request, splat: string, config: { url: string; key: string }) {
  const path = splat.replace(/^\/+/, "");
  if (!path || path.includes("..") || !ALLOWED_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return new Response("Not found", { status: 404 });
  }
  const target = new URL(`${config.url.replace(/\/+$/, "")}/${path}`);
  target.search = new URL(request.url).search;
  const headers = new Headers();
  for (const name of REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  if (!headers.has("apikey")) headers.set("apikey", config.key);
  const method = request.method.toUpperCase();
  const requestId = crypto.randomUUID();
  const started = Date.now();
  let phase = "request-body";
  const controller = new AbortController();
  // Preserve the existing limit; increasing it would hide connection failures.
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const body = method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer();
    phase = "upstream-headers";
    const upstream = await fetch(target, { method, headers, body, redirect: "manual", signal: controller.signal });
    phase = "upstream-body";
    if (!upstream.ok && method === "POST" && path.startsWith("storage/v1/object/projects/")) {
      const raw = await upstream.clone().text();
      // Storage error payload only: redact paths, credentials and URLs, cap log size.
      const response = raw.replace(/Bearer\s+\S+|sb_(?:secret|publishable)_[\w-]+|eyJ[\w-]+\.[\w-]+\.[\w-]+/g, "[redacted]")
        .split(path.slice("storage/v1/object/".length)).join("[object]")
        .replace(/https?:\/\/[^\s"<>]+/g, "[url]").slice(0, 2000);
      console.error("[project-photo-storage-response]", JSON.stringify({ requestId, status: upstream.status, phase, response }));
    }
    const responseHeaders = new Headers();
    upstream.headers.forEach((value, name) => {
      if (!SKIP_HEADERS.has(name.toLowerCase())) responseHeaders.set(name, value);
    });
    responseHeaders.set("cache-control", "no-store");
    responseHeaders.set("x-request-id", requestId);
    return new Response(upstream.body ? await upstream.arrayBuffer() : null, {
      status: upstream.status, statusText: upstream.statusText, headers: responseHeaders,
    });
  } catch (error) {
    const reason = controller.signal.aborted || (error instanceof Error && error.name === "AbortError") ? "TIMEOUT" : "NETWORK";
    const cause = error && typeof error === "object" && "cause" in error ? error.cause : undefined;
    const code = cause && typeof cause === "object" && "code" in cause && typeof cause.code === "string" ? cause.code : "UNKNOWN";
    // No tokens, query filters, object filenames, bodies or raw errors in logs.
    console.error("[site-backend-proxy]", JSON.stringify({ requestId, method, endpoint: path.startsWith("rest/v1/") ? path.split("/").slice(0, 3).join("/") : path.split("/").slice(0, 2).join("/"), backendHost: target.hostname, phase, reason, networkCode: code, elapsedMs: Date.now() - started }));
    const message = "Сервер данных не ответил. Сохранение не подтверждено. Обновите объект перед повторной попыткой.";
    return Response.json({ code: reason, message, error: `Backend unreachable from the site server (${reason})`, request_id: requestId }, {
      status: 504, headers: { "cache-control": "no-store", "x-request-id": requestId },
    });
  } finally {
    clearTimeout(timer);
  }
}