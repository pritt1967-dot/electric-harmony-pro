/**
 * Прямой серверный доступ к финансовой базе (проект nppincxonqwajdoxqbla).
 *
 * Модуль выполняется ТОЛЬКО на сервере (Node/Nitro). Секретный ключ читается
 * из переменных окружения хостинга и никогда не попадает в браузерный бандл.
 * Внешние relay-сервисы не используются.
 */

const DEFAULT_FINANCE_URL = "https://nppincxonqwajdoxqbla.supabase.co";
const FINANCE_REQUEST_TIMEOUT_MS = 10_000;

type FinanceRequestInit = { method?: string; body?: unknown; prefer?: string };

type FinanceHealth = {
  ok: boolean;
  configured: boolean;
  status: number | null;
  ms: number;
  error: string | null;
};

function envValue(name: string): string | undefined {
  const raw = process.env[name];
  if (typeof raw !== "string") return undefined;
  const cleaned = raw.trim().replace(/^['"]|['"]$/g, "").trim();
  return cleaned.length > 0 ? cleaned : undefined;
}

function financeConfig(): { url: string; key: string } {
  const url = (envValue("FINANCE_SUPABASE_URL") ?? DEFAULT_FINANCE_URL).replace(/\/+$/, "");
  const key =
    envValue("FINANCE_SUPABASE_SERVICE_ROLE_KEY") ??
    envValue("FINANCE_SUPABASE_KEY") ??
    envValue("FINANCE_SUPABASE_PUBLISHABLE_KEY");
  if (!key) {
    throw new Error(
      "Нет ключа финансовой базы. Добавьте переменную окружения FINANCE_SUPABASE_SERVICE_ROLE_KEY на сервере сайта.",
    );
  }
  return { url, key };
}

function connectionError(error: unknown): Error {
  if (error instanceof Error && error.name === "AbortError") {
    return new Error("Финансовая база недоступна с сервера REG.RU (TIMEOUT: превышено 10 секунд)");
  }

  const cause = error instanceof Error
    ? (error.cause as { code?: unknown; message?: unknown } | undefined)
    : undefined;
  const code = typeof cause?.code === "string" ? cause.code : "NETWORK_ERROR";
  const detail = typeof cause?.message === "string"
    ? cause.message
    : error instanceof Error ? error.message : String(error);
  return new Error(`Финансовая база недоступна с сервера REG.RU (${code}: ${detail})`);
}

async function requestFinance(
  path: string,
  init: FinanceRequestInit = {},
): Promise<{ response: Response; text: string }> {
  if (!ALLOWED_TABLES.test(path)) throw new Error("Недопустимый финансовый запрос");
  const { url, key } = financeConfig();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FINANCE_REQUEST_TIMEOUT_MS);

  const headers = new Headers();
  headers.set("apikey", key);
  headers.set("Authorization", `Bearer ${key}`);
  headers.set("Prefer", init.prefer ?? "return=representation");
  const payload = init.body === undefined || init.body === null
    ? undefined
    : JSON.stringify(init.body);
  if (payload) headers.set("Content-Type", "application/json");

  try {
    const response = await fetch(`${url}/rest/v1/${path}`, {
      method: init.method ?? "GET",
      headers,
      body: payload,
      signal: controller.signal,
    });
    const text = await response.text();
    return { response, text };
  } catch (error) {
    throw connectionError(error);
  } finally {
    clearTimeout(timer);
  }
}

const ALLOWED_TABLES = /^(operations|participants|categories|projects|project_participants)(\?|$)/;

/** Запрос к PostgREST финансовой базы напрямую, без промежуточных сервисов. */
export async function financeRest(
  path: string,
  init: FinanceRequestInit = {},
): Promise<any> {
  const { response, text } = await requestFinance(path, init);
  if (!response.ok) {
    let message = text.slice(0, 300);
    try {
      const parsed = JSON.parse(text) as { message?: unknown; error?: unknown };
      if (typeof parsed.message === "string") message = parsed.message;
      else if (typeof parsed.error === "string") message = parsed.error;
    } catch {
      // оставляем исходный текст ответа
    }
    throw new Error(`Финансовая база: ${response.status} ${message}`);
  }

  return text ? JSON.parse(text) : null;
}

/** Безопасная серверная проверка: секрет не возвращается и не логируется. */
export async function financeHealthCheck(): Promise<FinanceHealth> {
  const started = Date.now();
  try {
    financeConfig();
  } catch (error) {
    return {
      ok: false,
      configured: false,
      status: null,
      ms: Date.now() - started,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  try {
    const { response, text } = await requestFinance("categories?select=id&limit=1", {
      method: "GET",
      prefer: "return=minimal",
    });
    let error: string | null = null;
    if (!response.ok) {
      try {
        const parsed = JSON.parse(text) as { message?: unknown };
        error = typeof parsed.message === "string" ? parsed.message : `HTTP ${response.status}`;
      } catch {
        error = `HTTP ${response.status}`;
      }
    }
    return {
      ok: response.ok,
      configured: true,
      status: response.status,
      ms: Date.now() - started,
      error,
    };
  } catch (error) {
    return {
      ok: false,
      configured: true,
      status: null,
      ms: Date.now() - started,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
