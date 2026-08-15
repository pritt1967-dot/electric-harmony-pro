/** Определяет метку «Было» / «Стало» по подписи к фотографии. */
export type BeforeAfter = "before" | "after" | null;

export function detectBeforeAfter(caption?: string | null, alt?: string | null): BeforeAfter {
  const t = `${caption ?? ""} ${alt ?? ""}`.toLowerCase();
  if (!t.trim()) return null;
  if (/\b(было|до\s|до:|before)\b/.test(t)) return "before";
  if (/\b(стало|после|after)\b/.test(t)) return "after";
  return null;
}

export function beforeAfterLabel(v: BeforeAfter): string {
  return v === "before" ? "Было" : v === "after" ? "Стало" : "";
}
