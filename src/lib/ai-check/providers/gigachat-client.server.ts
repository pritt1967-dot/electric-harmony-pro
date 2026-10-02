/**
 * Общий серверный транспорт GigaChat для всех AI-вызовов сайта.
 * Ключ GIGACHAT_AUTH_KEY читается только на сервере, не логируется и не возвращается.
 *
 *  GIGACHAT_AUTH_KEY   — Authorization key (base64 client_id:secret), обязателен.
 *  GIGACHAT_MODEL      — модель, по умолчанию GigaChat-3-Ultra.
 *  GIGACHAT_API_URL    — база API, по умолчанию https://api.giga.chat/v1
 *  GIGACHAT_OAUTH_URL  — получение токена, по умолчанию https://ngw.devices.sberbank.ru:9443/api/v2/oauth
 *  GIGACHAT_SCOPE      — по умолчанию GIGACHAT_API_PERS
 */
export const DEFAULT_GIGACHAT_MODEL = "GigaChat-3-Ultra";
const DEFAULT_API_URL = "https://api.giga.chat/v1";
const DEFAULT_OAUTH_URL = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth";

export class GigaChatError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const redactSecrets = (s: string) =>
  s.replace(/(Bearer|Basic)\s+[A-Za-z0-9._\-+/=]+/gi, "$1 ***").replace(/[A-Za-z0-9+/=_\-]{40,}/g, "***");

export const gigaModel = () => process.env["GIGACHAT_MODEL"]?.trim() || DEFAULT_GIGACHAT_MODEL;
export const gigaApiUrl = () => (process.env["GIGACHAT_API_URL"]?.trim() || DEFAULT_API_URL).replace(/\/$/, "");

let tokenCache: { token: string; expiresAt: number } | null = null;

export async function getGigaToken(signal?: AbortSignal): Promise<string> {
  const authKey = process.env["GIGACHAT_AUTH_KEY"]?.trim();
  if (!authKey) throw new GigaChatError(0, "на сервере не задан GIGACHAT_AUTH_KEY");
  if (tokenCache && tokenCache.expiresAt - 60_000 > Date.now()) return tokenCache.token;
  let res: Response;
  try {
    res = await fetch(process.env["GIGACHAT_OAUTH_URL"]?.trim() || DEFAULT_OAUTH_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authKey}`,
        RqUID: crypto.randomUUID(),
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: `scope=${encodeURIComponent(process.env["GIGACHAT_SCOPE"]?.trim() || "GIGACHAT_API_PERS")}`,
      signal,
    });
  } catch (e) {
    throw new GigaChatError(0, `OAuth: нет соединения (${redactSecrets(e instanceof Error ? e.message : String(e))})`);
  }
  if (!res.ok) {
    const body = redactSecrets((await res.text().catch(() => "")).slice(0, 300));
    throw new GigaChatError(res.status, `OAuth HTTP ${res.status}${body ? `: ${body}` : ""}`);
  }
  const j = (await res.json()) as { access_token?: string; expires_at?: number };
  if (!j.access_token) throw new GigaChatError(res.status, "OAuth: нет access_token");
  tokenCache = { token: j.access_token, expiresAt: j.expires_at ?? Date.now() + 25 * 60_000 };
  return j.access_token;
}

type Msg = { role: "system" | "user" | "assistant"; content: string };

/** Запрос chat/completions. Возвращает текст ответа; ошибки — GigaChatError без секретов. */
export type GigaMeta = {
  status: number;
  contentType: string;
  hasChoices: boolean;
  hasChoice0: boolean;
  hasMessage: boolean;
  hasContent: boolean;
  contentType_: string;
  preview: string;
};

export async function gigaChat(
  messages: Msg[],
  opts: { temperature?: number; timeoutMs?: number; functionCall?: "auto"; onMeta?: (m: GigaMeta) => void } = {},
): Promise<string> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 90_000);
  try {
    const token = await getGigaToken(ctrl.signal);
    let res: Response;
    try {
      res = await fetch(`${gigaApiUrl()}/chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          model: gigaModel(),
          temperature: opts.temperature ?? 0.1,
          messages,
          ...(opts.functionCall ? { function_call: opts.functionCall } : {}),
        }),
        signal: ctrl.signal,
      });
    } catch (e) {
      if (ctrl.signal.aborted) throw new GigaChatError(0, "таймаут ответа GigaChat");
      throw new GigaChatError(0, `нет соединения (${redactSecrets(e instanceof Error ? e.message : String(e))})`);
    }
    if (!res.ok) {
      const body = redactSecrets((await res.text().catch(() => "")).slice(0, 400));
      if (res.status === 401) tokenCache = null;
      throw new GigaChatError(res.status, `HTTP ${res.status}${body ? `: ${body}` : ""}`);
    }
    const raw = await res.text();
    let j: any = null;
    try {
      j = JSON.parse(raw);
    } catch {
      j = null;
    }
    const choice0 = Array.isArray(j?.choices) ? j.choices[0] : undefined;
    const c = choice0?.message?.content;
    const content =
      typeof c === "string"
        ? c
        : c == null
          ? ""
          : Array.isArray(c)
            ? c.map((p: any) => (typeof p === "string" ? p : typeof p?.text === "string" ? p.text : JSON.stringify(p))).join("")
            : JSON.stringify(c);
    const meta: GigaMeta = {
      status: res.status,
      contentType: res.headers.get("content-type") ?? "",
      hasChoices: Array.isArray(j?.choices),
      hasChoice0: !!choice0,
      hasMessage: !!choice0?.message,
      hasContent: c != null,
      contentType_: typeof c,
      preview: redactSecrets((j ? content : raw).slice(0, 500)),
    };
    console.info("[gigachat] ответ", JSON.stringify(meta));
    opts.onMeta?.(meta);
    return content;
  } finally {
    clearTimeout(timer);
  }
}

/** Картинка: GigaChat рисует через встроенную функцию text2image и возвращает <img src="file_id">. */
export async function gigaImage(prompt: string): Promise<string> {
  const content = await gigaChat(
    [
      { role: "system", content: "Ты художник-визуализатор. Нарисуй изображение по описанию." },
      { role: "user", content: `Нарисуй: ${prompt}` },
    ],
    { functionCall: "auto", temperature: 0.7, timeoutMs: 120_000 },
  );
  const id = content.match(/<img[^>]+src="([^"]+)"/i)?.[1];
  if (!id) throw new GigaChatError(0, "GigaChat не вернул изображение");
  const token = await getGigaToken();
  const res = await fetch(`${gigaApiUrl()}/files/${encodeURIComponent(id)}/content`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/jpg" },
  });
  if (!res.ok) throw new GigaChatError(res.status, `загрузка изображения HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const type = res.headers.get("content-type")?.split(";")[0] || "image/jpeg";
  return `data:${type};base64,${buf.toString("base64")}`;
}

export function extractJson(text: string): unknown {
  const t = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  return JSON.parse(a >= 0 && b > a ? t.slice(a, b + 1) : t);
}
