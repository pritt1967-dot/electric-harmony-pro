/**
 * Серверный инженерный валидатор щита (детерминированный, без LLM).
 * Цепочка на будущее: конструктор → validatePanel → (LLM-советник) → validateAdvice → результат.
 * LLM не принимает окончательного решения: его ответ проходит через validateAdvice.
 */
import { z } from "zod";
import { RULES, type VCheck, type VProject, type VStatus } from "./rules";

export type { VCheck, VStatus } from "./rules";

export const ValidationResultSchema = z.object({
  status: z.enum(["OK", "WARNING", "ERROR", "INSUFFICIENT_DATA"]),
  summary: z.string(),
  checks: z.array(
    z.object({
      title: z.string(),
      status: z.enum(["OK", "WARNING", "ERROR", "INSUFFICIENT_DATA"]),
      detail: z.string(),
    }),
  ),
  missing_data: z.array(z.string()),
  suggestions: z.array(z.string()),
});
export type ValidationResult = z.infer<typeof ValidationResultSchema>;

const str = (v: unknown) => (typeof v === "string" ? v.trim() : v == null ? "" : String(v).trim());
const numOrNull = (v: unknown): number | null => {
  if (v === "" || v == null) return null;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
};
const ratingOf = (t: string): number | null => {
  const m = t.match(/(\d{1,3})\s*(?:А|A)\b/i) ?? t.match(/\b[BCDСс]\s?(\d{1,3})\b/);
  return m ? Number(m[1]) : null;
};
const polesOf = (t: string): number | null => {
  const m = t.match(/\b([1-4])\s*[PР]\b/i);
  if (m) return Number(m[1]);
  if (/3P\+N|4P/i.test(t)) return 4;
  return null;
};
const obj = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

/** Нормализация без изменения входа: читаем только известные поля. */
export function normalize(raw: unknown): VProject {
  const root = obj(raw);
  const design = obj(root["design"] ?? root);
  const input = obj(root["input"]);
  const s = obj(design["summary"]);
  const pen = obj(design["pen"] ?? root["pen"]);
  const buses = obj(design["buses"] ?? root["buses"]);

  const supply = str(s["supply"]);
  const phasesRaw = str(input["phases"]) || (supply.includes("400") ? "3" : supply.includes("230") ? "1" : "");
  const mainText = str(s["main_breaker"]) || (numOrNull(input["main_breaker_a"]) ? `${input["main_breaker_a"]} А` : "");

  const lines = arr(design["lines"]).map((x, i) => {
    const l = obj(x);
    const breaker = str(l["breaker"]);
    return {
      mark: str(l["mark"]) || `W${i + 1}`,
      name: str(l["name"]),
      currentA: numOrNull(l["current_a"]),
      breakerText: breaker,
      rating: ratingOf(breaker),
      curve: str(l["curve"]),
      poles: numOrNull(l["poles"]) ?? polesOf(breaker),
      phase: str(l["phase"]).toUpperCase(),
      rcd: str(l["rcd"]),
      cable: str(l["cable"]),
      modules: numOrNull(l["modules"]),
      nBus: str(l["n_bus"]),
      installation: str(l["installation"] ?? l["laying"]),
    };
  });

  const rcds = arr(design["rcd_groups"]).map((x) => {
    const r = obj(x);
    const rating = str(r["rating"]);
    return {
      mark: str(r["mark"]),
      rating: ratingOf(rating) ?? numOrNull(rating),
      type: str(r["type"]),
      leakage: str(r["leakage"]),
      lines: arr(r["lines"]).map(str).filter(Boolean),
      poles: polesOf(rating),
      nBus: str(r["n_bus"]),
    };
  });

  const rails = arr(design["rails"]);
  const railsModules = rails.length
    ? rails.reduce<number>(
        (a, r) => a + arr(obj(r)["items"]).reduce<number>((b, it) => b + (numOrNull(obj(it)["modules"]) ?? 0), 0),
        0,
      )
    : null;
  const spec = arr(design["spec"]);
  const specModules = spec.length
    ? spec.reduce<number>((a, x) => {
        const r = obj(x);
        return a + (numOrNull(r["modules"]) ?? 0) * (numOrNull(r["qty"]) ?? 0);
      }, 0) || null
    : null;

  const peRaw = buses["pe"] ?? design["pe_bus"];
  return {
    phases: phasesRaw === "3" ? 3 : phasesRaw === "1" ? 1 : null,
    grounding: str(s["grounding"]) || str(input["grounding"]),
    mainBreakerText: mainText,
    mainRating: ratingOf(mainText) ?? numOrNull(input["main_breaker_a"]),
    mainPoles: polesOf(mainText) ?? polesOf(str(input["input_type"])),
    inputCable: str(input["input_cable"]),
    pen: {
      splitPoint: str(pen["split_point"]),
      penBus: str(pen["pen_bus"]),
      peBus: str(pen["pe_bus"]),
      nBus: str(pen["n_bus"]),
      jumper: str(pen["jumper"]),
    },
    lines,
    rcds,
    enclosureModules: numOrNull(s["enclosure_modules"]),
    usedModules: numOrNull(s["used_modules"]),
    reserveModules: s["reserve_modules"] == null || s["reserve_modules"] === "" ? null : Number(s["reserve_modules"]),
    railsModules,
    specModules,
    nBuses: arr(buses["n"]).map(str).filter(Boolean),
    peBusPresent: peRaw == null ? null : Boolean(peRaw),
  };
}

const RANK: Record<VStatus, number> = { OK: 0, INSUFFICIENT_DATA: 1, WARNING: 2, ERROR: 3 };

export function validatePanel(raw: unknown): ValidationResult {
  // Глубокая копия + заморозка: правила физически не могут изменить вход.
  const p = Object.freeze(normalize(structuredClone(raw))) as VProject;
  const checks: VCheck[] = [];
  const missing = new Set<string>();
  const suggestions = new Set<string>();
  for (const rule of RULES) {
    try {
      const r = rule(p);
      checks.push(...r.checks);
      r.missing?.forEach((m) => missing.add(m));
      r.suggestions?.forEach((m) => suggestions.add(m));
    } catch (e) {
      checks.push({ title: `Правило ${rule.name}`, status: "INSUFFICIENT_DATA", detail: "Не удалось выполнить проверку." });
    }
  }
  const count = (s: VStatus) => checks.filter((c) => c.status === s).length;
  const status = checks.reduce<VStatus>((a, c) => (RANK[c.status] > RANK[a] ? c.status : a), "OK");
  if (missing.size) suggestions.add("Дополните недостающие данные — проверки с INSUFFICIENT_DATA будут выполнены повторно.");
  if (count("ERROR")) suggestions.add("Устраните фактические противоречия (ERROR); аппараты и номиналы автоматически не заменяются.");
  return ValidationResultSchema.parse({
    status,
    summary: `Ошибок: ${count("ERROR")}, предупреждений: ${count("WARNING")}, не проверено из-за нехватки данных: ${count("INSUFFICIENT_DATA")}, в норме: ${count("OK")}.`,
    checks,
    missing_data: [...missing],
    suggestions: [...suggestions],
  });
}

/**
 * Заготовка для этапа с внешним LLM: его ответ принимается только как
 * рекомендации и не может понизить статус детерминированных проверок.
 */
export function validateAdvice(base: ValidationResult, advice: unknown): ValidationResult {
  const parsed = z.object({ suggestions: z.array(z.string().max(500)).max(20) }).safeParse(advice);
  if (!parsed.success) return base;
  return { ...base, suggestions: [...base.suggestions, ...parsed.data.suggestions.map((s) => `Совет ИИ (не проверен): ${s}`)] };
}
