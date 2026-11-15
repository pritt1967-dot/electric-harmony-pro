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
  let timer: ReturnType<typeof setTimeout> | undefined;
  const isPhotoUpload = method === "POST" && path.startsWith("storage/v1/object/projects/");
  const isPhotoInsert = method === "POST" && path === "rest/v1/project_images";
  let bodyBytes = 0;
  let bodyMs = 0;
  try {
    const body = method === "GET" || method === "HEAD" ? undefined : await request.arrayBuffer();
    bodyBytes = body?.byteLength ?? 0;
    bodyMs = Date.now() - started;
    // The existing 15-second limit covers the backend only: browser-to-site upload
    // time of a photo on a slow connection must not be reported as a backend TIMEOUT.
    timer = setTimeout(() => controller.abort(), 15_000);
    phase = "upstream-headers";
    if (isPhotoUpload || isPhotoInsert) console.info("[project-photo-stage]", JSON.stringify({ event: isPhotoUpload ? "STORAGE_UPLOAD_START" : "DB_INSERT_START", requestId, method, endpoint: isPhotoUpload ? "storage/v1/object/projects/<object>" : path, bucket: "projects", sizeBytes: bodyBytes, mime: headers.get("content-type"), phase, bodyMs }));
    const upstream = await fetch(target, { method, headers, body, redirect: "manual", signal: controller.signal });
    phase = "upstream-body";
    if (isPhotoUpload) {
      const raw = await upstream.clone().text();
      // Storage error payload only: redact paths, credentials and URLs, cap log size.
      const response = raw.replace(/Bearer\s+\S+|sb_(?:secret|publishable)_[\w-]+|eyJ[\w-]+\.[\w-]+\.[\w-]+/g, "[redacted]")
        .split(path.slice("storage/v1/object/".length)).join("[object]")
        .replace(/https?:\/\/[^\s"<>]+/g, "[url]").slice(0, 2000);
      const log = { event: upstream.ok ? "STORAGE_UPLOAD_SUCCESS" : "STORAGE_UPLOAD_ERROR", requestId, method, endpoint: "storage/v1/object/projects", bucket: "projects", sizeBytes: bodyBytes, mime: headers.get("content-type") ?? "", status: upstream.status, phase, bodyMs, upstreamMs: Date.now() - started - bodyMs, response };
      if (upstream.ok) console.info("[project-photo-storage-response]", JSON.stringify(log));
      else console.error("[project-photo-storage-response]", JSON.stringify(log));
    }
    if (isPhotoInsert) {
      // Only errors are logged: successful rows contain private object paths.
      const response = upstream.ok ? "row returned" : (await upstream.clone().text())
        .replace(/Bearer\s+\S+|sb_(?:secret|publishable)_[\w-]+|eyJ[\w-]+\.[\w-]+\.[\w-]+/g, "[redacted]")
        .replace(/"details"\s*:\s*"(?:[^"\\]|\\.)*"/g, '"details":"[redacted]"').slice(0, 2000);
      console.info("[project-photo-stage]", JSON.stringify({ event: upstream.ok ? "DB_INSERT_SUCCESS" : "DB_INSERT_ERROR", requestId, method, endpoint: path, status: upstream.status, response, phase, elapsedMs: Date.now() - started }));
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
    console.error("[site-backend-proxy]", JSON.stringify({ event: reason === "TIMEOUT" ? "REQUEST_TIMEOUT" : "REQUEST_ERROR", requestId, method, endpoint: path.startsWith("rest/v1/") ? path.split("/").slice(0, 3).join("/") : path.split("/").slice(0, 2).join("/"), backendHost: target.hostname, phase, reason, networkCode: code, elapsedMs: Date.now() - started,
      ...(isPhotoUpload ? { bucket: "projects", sizeBytes: bodyBytes, mime: headers.get("content-type") ?? "", bodyMs, upstreamMs: Date.now() - started - bodyMs } : {}) }));
    const message = "Сервер данных не ответил. Сохранение не подтверждено. Обновите объект перед повторной попыткой.";
    return Response.json({ code: reason, message, error: `Backend unreachable from the site server (${reason})`, request_id: requestId }, {
      status: 504, headers: { "cache-control": "no-store", "x-request-id": requestId },
    });
  } finally {
    if (timer) clearTimeout(timer);
  }
}