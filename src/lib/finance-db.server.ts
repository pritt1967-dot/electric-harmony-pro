/**
 * Прямой серверный доступ к финансовой базе.
 * Ключ сервисной роли читается только внутри серверного рантайма и
 * никогда не попадает в браузер.
 */

const FINANCE_PROJECT_REF = "nppincxonqwajdoxqbla";
const ALLOWED = /^(operations|participants|categories|projects|project_participants)(\?|$)/;

export async function financeRest(
  path: string,
  init: { method?: string; body?: string; prefer?: string } = {},
): Promise<any> {
  if (!ALLOWED.test(path)) throw new Error("Недопустимый финансовый запрос");

  const key =
    process.env["FINANCE_SUPABASE_SERVICE_ROLE_KEY"] ??
    process.env["FINANCE_SUPABASE_PUBLISHABLE_KEY"];
  if (!key) throw new Error("Финансовое подключение не настроено");

  const base = (
    process.env["FINANCE_SUPABASE_URL"] ?? `https://${FINANCE_PROJECT_REF}.supabase.co`
  ).replace(/\/+$/, "");

  const headers = new Headers();
  headers.set("apikey", key);
  headers.set("Authorization", `Bearer ${key}`);
  headers.set("Prefer", init.prefer ?? "return=representation");
  if (init.body) headers.set("Content-Type", "application/json");

  const response = await fetch(`${base}/rest/v1/${path}`, {
    method: init.method ?? "GET",
    headers,
    body: init.body,
  });

  const text = await response.text();
  if (!response.ok) {
    const message = text.slice(0, 300);
    if (response.status === 401) throw new Error("Ошибка авторизации финансового сервера");
    if (response.status === 403) throw new Error("Недостаточно прав для финансовых данных");
    if (response.status === 404) throw new Error("Финансовый endpoint не найден");
    if (response.status >= 500) throw new Error(`Финансовый сервер недоступен: ${message}`);
    throw new Error(`Финансовая база: ${response.status} ${message}`);
  }
  return text ? JSON.parse(text) : null;
}
