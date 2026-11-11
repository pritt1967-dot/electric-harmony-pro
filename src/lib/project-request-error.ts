/** SDK errors can be plain objects, not Error instances. */
export function projectRequestError(error: unknown): string {
  const value = error && typeof error === "object" ? error as Record<string, unknown> : {};
  const message = typeof value.message === "string" ? value.message : typeof value.error === "string" ? value.error : "";
  if (/TIMEOUT|NETWORK|unreachable|fetch failed|Failed to fetch|не ответил|недоступ/i.test(message)) {
    return "Нет связи с сервером данных. Сохранение не подтверждено. Обновите объект и проверьте данные перед повторной попыткой.";
  }
  return message || "Не удалось выполнить запрос. Сохранение не подтверждено. Обновите объект перед повторной попыткой.";
}