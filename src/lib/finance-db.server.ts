/**
 * Прямой серверный доступ к финансовой базе (проект nppincxonqwajdoxqbla).
 *
 * Модуль выполняется ТОЛЬКО на сервере (Node/Nitro). Секретный ключ читается
 * из переменных окружения хостинга и никогда не попадает в браузерный бандл.
 * Внешние relay-сервисы не используются.
 */

const DEFAULT_FINANCE_URL = "https://nppincxonqwajdoxqbla.supabase.co";

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

const ALLOWED_TABLES = /^(operations|participants|categories|projects|project_participants)(\?|$)/;

/** Запрос к PostgREST финансовой базы напрямую, без промежуточных сервисов. */
export async function financeRest(
  path: string,
  init: { method?: string; body?: unknown; prefer?: string } = {},
): Promise<any> {
  if (!ALLOWED_TABLES.test(path)) throw new Error("Недопустимый финансовый запрос");
  const { url, key } = financeConfig();

  const headers = new Headers();
  headers.set("apikey", key);
  headers.set("Authorization", `Bearer ${key}`);
  headers.set("Prefer", init.prefer ?? "return=representation");
  const payload =
    init.body === undefined || init.body === null ? undefined : JSON.stringify(init.body);
  if (payload) headers.set("Content-Type", "application/json");

  const response = await fetch(`${url}/rest/v1/${path}`, {
    method: init.method ?? "GET",
    headers,
    body: payload,
  });

  const text = await response.text();
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
