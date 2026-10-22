/** Review calendar days use Moscow time, independent of the viewer's timezone. */
export function reviewDateDay(value: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Moscow", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date(value));
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function reviewCalendarDate(day: string): Date {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(year, month - 1, date, 12);
}

export function calendarReviewDay(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function formatReviewDate(value: string): string {
  return new Date(value).toLocaleDateString("ru-RU", {
    day: "2-digit", month: "long", year: "numeric", timeZone: "Europe/Moscow",
  });
}

/** Preserve an untouched timestamp exactly; selected days are Moscow noon. */
export function savedReviewDate(
  row: { published_at: string | null; created_at: string },
  day: string,
  status: string,
): string | null {
  const original = row.published_at ?? row.created_at;
  if (day === reviewDateDay(original)) {
    return row.published_at ?? (status === "published" ? row.created_at : null);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error("Выберите дату отзыва.");
  const timestamp = `${day}T12:00:00+03:00`;
  if (reviewDateDay(timestamp) !== day) throw new Error("Некорректная дата отзыва.");
  return new Date(timestamp).toISOString();
}