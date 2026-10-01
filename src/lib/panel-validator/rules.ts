/**
 * Серверный инженерный валидатор щита — правила.
 * Каждое правило — отдельная чистая функция: получает замороженную копию проекта,
 * ничего не изменяет и не подставляет. Чтобы добавить правило — допишите функцию
 * и включите её в RULES.
 */

export type VStatus = "OK" | "WARNING" | "ERROR" | "INSUFFICIENT_DATA";

export type VCheck = { title: string; status: VStatus; detail: string };

export type VRuleResult = {
  checks: VCheck[];
  missing?: string[];
  suggestions?: string[];
};

/** Нормализованный (только чтение) вид проекта. */
export type VLine = {
  mark: string;
  name: string;
  currentA: number | null;
  breakerText: string;
  rating: number | null;
  curve: string;
  poles: number | null;
  phase: string;
  rcd: string;
  cable: string;
  modules: number | null;
  /** Явно указанная N-шина линии (если конструктор её передаёт). */
  nBus: string;
  /** Условия прокладки (если переданы). */
  installation: string;
};

export type VRcd = {
  mark: string;
  rating: number | null;
  type: string;
  leakage: string;
  lines: string[];
  poles: number | null;
  nBus: string;
};

export type VProject = {
  phases: 1 | 3 | null;
  grounding: string;
  mainBreakerText: string;
  mainRating: number | null;
  mainPoles: number | null;
  inputCable: string;
  pen: {
    splitPoint: string;
    penBus: string;
    peBus: string;
    nBus: string;
    jumper: string;
  };
  lines: VLine[];
  rcds: VRcd[];
  enclosureModules: number | null;
  usedModules: number | null;
  reserveModules: number | null;
  railsModules: number | null;
  specModules: number | null;
  nBuses: string[];
  peBusPresent: boolean | null;
};

const ok = (title: string, detail: string): VCheck => ({ title, status: "OK", detail });
const warn = (title: string, detail: string): VCheck => ({ title, status: "WARNING", detail });
const err = (title: string, detail: string): VCheck => ({ title, status: "ERROR", detail });
const nodata = (title: string, detail: string): VCheck => ({
  title,
  status: "INSUFFICIENT_DATA",
  detail,
});

const STANDARD_RATINGS = [1, 2, 3, 4, 6, 10, 13, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160];

// 1. Вводной аппарат
function ruleInput(p: VProject): VRuleResult {
  const t = "Вводной аппарат";
  if (!p.mainBreakerText && p.mainRating == null)
    return { checks: [err(t, "Вводной аппарат не указан.")], missing: ["Вводной аппарат (тип, номинал)"] };
  const checks: VCheck[] = [];
  const missing: string[] = [];
  if (p.mainRating == null) {
    checks.push(nodata(t, `Номинал вводного аппарата не распознан: «${p.mainBreakerText}».`));
    missing.push("Номинал вводного аппарата");
  } else if (!STANDARD_RATINGS.includes(p.mainRating)) {
    checks.push(warn(t, `Нестандартный номинал вводного аппарата ${p.mainRating} А — проверьте.`));
  } else checks.push(ok(t, `Указан: ${p.mainBreakerText || p.mainRating + " А"}.`));

  const tp = "Полюсность ввода";
  if (p.phases == null) {
    checks.push(nodata(tp, "Не указано число фаз питания."));
    missing.push("Число фаз питания");
  } else if (p.mainPoles == null) {
    checks.push(nodata(tp, "Полюсность вводного аппарата не указана."));
    missing.push("Полюсность вводного аппарата");
  } else if (p.phases === 3 && p.mainPoles < 3) {
    checks.push(err(tp, `Трёхфазный ввод, а вводной аппарат ${p.mainPoles}P.`));
  } else if (p.phases === 1 && p.mainPoles > 2) {
    checks.push(warn(tp, `Однофазный ввод, а вводной аппарат ${p.mainPoles}P.`));
  } else checks.push(ok(tp, `${p.mainPoles}P при ${p.phases}-фазном питании.`));
  return { checks, missing };
}

// 2. Групповые аппараты: наличие, номинал, полюсность
function ruleGroups(p: VProject): VRuleResult {
  if (!p.lines.length)
    return { checks: [err("Групповые аппараты", "В проекте нет отходящих линий.")] };
  const checks: VCheck[] = [];
  const missing: string[] = [];
  for (const l of p.lines) {
    const t = `Линия ${l.mark}: аппарат`;
    if (!l.breakerText && l.rating == null) {
      checks.push(err(t, "Аппарат защиты не указан."));
      continue;
    }
    if (l.rating == null) {
      checks.push(nodata(t, `Номинал не распознан: «${l.breakerText}».`));
      missing.push(`Номинал аппарата линии ${l.mark}`);
      continue;
    }
    if (p.mainRating != null && l.rating > p.mainRating)
      checks.push(err(t, `Номинал ${l.rating} А больше вводного ${p.mainRating} А.`));
    else checks.push(ok(t, `${l.breakerText || l.rating + " А"}.`));

    if (l.poles == null) missing.push(`Полюсность аппарата линии ${l.mark}`);
    else if (p.phases === 1 && l.poles >= 3)
      checks.push(err(`Линия ${l.mark}: полюсность`, `${l.poles}P при однофазном питании.`));
  }
  return { checks, missing };
}

// 3. Расчётный ток vs номинал (без вывода по сумме номиналов)
function ruleCurrent(p: VProject): VRuleResult {
  const checks: VCheck[] = [];
  for (const l of p.lines) {
    if (l.rating == null) continue;
    const t = `Линия ${l.mark}: ток нагрузки`;
    if (l.currentA == null) checks.push(nodata(t, "Расчётный ток не указан."));
    else if (l.currentA > l.rating)
      checks.push(err(t, `Расчётный ток ${l.currentA} А больше номинала ${l.rating} А.`));
    else checks.push(ok(t, `${l.currentA} А ≤ ${l.rating} А.`));
  }
  return { checks };
}

// 4. Кабель vs автомат — только при наличии сечения И условий прокладки
function ruleCable(p: VProject): VRuleResult {
  const checks: VCheck[] = [];
  const missing: string[] = [];
  for (const l of p.lines) {
    const t = `Линия ${l.mark}: кабель`;
    if (!l.cable) {
      checks.push(nodata(t, "Кабель не указан."));
      missing.push(`Кабель линии ${l.mark}`);
      continue;
    }
    if (!l.installation) {
      checks.push(
        nodata(
          t,
          `Кабель «${l.cable}» указан, но нет условий прокладки (способ, группировка, температура, длина) — соответствие аппарату не подтверждается.`,
        ),
      );
      missing.push(`Условия прокладки линии ${l.mark}`);
      continue;
    }
    checks.push(
      nodata(t, "Таблицы допустимых токов по ПУЭ пока не подключены — соответствие не оценивается."),
    );
  }
  return { checks, missing };
}

// 5. УЗО: наличие, тип, ток утечки, номинал (равенство с автоматом не ошибка)
function ruleRcd(p: VProject): VRuleResult {
  const checks: VCheck[] = [];
  const missing: string[] = [];
  if (!p.rcds.length && !p.lines.some((l) => l.rcd)) {
    checks.push(nodata("УЗО / дифавтоматы", "Данных об УЗО и дифавтоматах нет."));
    return { checks, missing };
  }
  for (const r of p.rcds) {
    const t = `УЗО ${r.mark}`;
    if (!r.type) {
      checks.push(nodata(`${t}: тип`, "Тип (AC/A/F/B) не указан — не определяется."));
      missing.push(`Тип УЗО ${r.mark}`);
    } else checks.push(ok(`${t}: тип`, `Тип ${r.type}.`));
    if (!r.leakage) missing.push(`Ток утечки УЗО ${r.mark}`);
    if (!r.lines.length) checks.push(warn(t, "К УЗО не привязано ни одной линии."));
    if (r.rating == null) {
      checks.push(nodata(`${t}: номинал`, "Номинал не указан."));
      missing.push(`Номинал УЗО ${r.mark}`);
      continue;
    }
    const lines = p.lines.filter((l) => r.lines.includes(l.mark));
    const maxDown = Math.max(0, ...lines.map((l) => l.rating ?? 0));
    if (maxDown > r.rating)
      checks.push(
        err(`${t}: номинал`, `Номинал УЗО ${r.rating} А меньше нижестоящего автомата ${maxDown} А.`),
      );
    else if (p.mainRating != null && r.rating < p.mainRating && lines.length > 1)
      checks.push(
        warn(
          `${t}: номинал`,
          `УЗО ${r.rating} А ниже вводного ${p.mainRating} А при ${lines.length} линиях — защита от перегрузки УЗО не подтверждена (сумма номиналов как довод не используется).`,
        ),
      );
    else checks.push(ok(`${t}: номинал`, `${r.rating} А.`));
  }
  return { checks, missing };
}

// 6. Конфликты цепей УЗО: линия в нескольких УЗО, ссылки на несуществующие линии/УЗО
function ruleRcdConflicts(p: VProject): VRuleResult {
  const t = "Конфликты цепей УЗО";
  const out: string[] = [];
  const marks = new Set(p.lines.map((l) => l.mark));
  const owner = new Map<string, string[]>();
  for (const r of p.rcds)
    for (const m of r.lines) {
      if (!marks.has(m)) out.push(`УЗО ${r.mark} ссылается на несуществующую линию ${m}`);
      owner.set(m, [...(owner.get(m) ?? []), r.mark]);
    }
  // Каскад (вышестоящее УЗО, состав которого полностью включает состав нижестоящего) — не конфликт.
  // Конфликт — только если составы УЗО, общие для линии, не вложены друг в друга.
  const setOf = new Map(p.rcds.map((r) => [r.mark, new Set(r.lines)]));
  const nested = (a: string, b: string) => {
    const A = setOf.get(a), B = setOf.get(b);
    if (!A || !B) return false;
    const sub = (x: Set<string>, y: Set<string>) => [...x].every((v) => y.has(v));
    return sub(A, B) || sub(B, A);
  };
  for (const [m, rs] of owner) {
    if (rs.length < 2) continue;
    const bad = rs.some((a, i) => rs.slice(i + 1).some((b) => !nested(a, b)));
    if (bad) out.push(`линия ${m} в нескольких независимых УЗО: ${rs.join(", ")}`);
  }
  const rcdMarks = new Set(p.rcds.map((r) => r.mark));
  for (const l of p.lines) {
    if (!l.rcd || /^(нет|—|-|без)/i.test(l.rcd)) continue;
    const ref = p.rcds.find((r) => l.rcd.includes(r.mark));
    if (ref && !ref.lines.includes(l.mark))
      out.push(`линия ${l.mark} указывает ${ref.mark}, но в составе ${ref.mark} её нет`);
    if (!ref && rcdMarks.size && !/диф|rcbo|авдт/i.test(l.rcd))
      out.push(`линия ${l.mark}: УЗО «${l.rcd}» не найдено среди групп УЗО`);
  }
  return { checks: [out.length ? err(t, out.join("; ") + ".") : ok(t, "Противоречий не найдено.")] };
}

// 7. N-шины и принадлежность линий
function ruleNBuses(p: VProject): VRuleResult {
  const t = "N-шины и принадлежность линий";
  if (!p.nBuses.length && !p.lines.some((l) => l.nBus) && !p.rcds.some((r) => r.nBus))
    return {
      checks: [
        nodata(
          t,
          "Нет данных о N-шинах и подключении нулевых проводников линий — нельзя проверить, что N линий под УЗО не объединены с общей N.",
        ),
      ],
      missing: ["Состав N-шин и привязка N линий к шинам"],
    };
  const out: string[] = [];
  for (const r of p.rcds)
    for (const m of r.lines) {
      const l = p.lines.find((x) => x.mark === m);
      if (!l) continue;
      if (!l.nBus) out.push(`линия ${m}: N-шина не указана`);
      else if (r.nBus && l.nBus !== r.nBus) out.push(`линия ${m} на N-шине ${l.nBus}, а УЗО ${r.mark} — ${r.nBus}`);
    }
  return { checks: [out.length ? err(t, out.join("; ") + ".") : ok(t, "Привязка согласована.")] };
}

// 8. PE-шина
function rulePe(p: VProject): VRuleResult {
  const t = "PE-шина";
  if (p.peBusPresent == null)
    return { checks: [nodata(t, "Наличие PE-шины не указано.")], missing: ["PE-шина"] };
  return { checks: [p.peBusPresent ? ok(t, "PE-шина предусмотрена.") : err(t, "PE-шина отсутствует.")] };
}

// 9. PEN / PE / N — само слово «TN-C-S» не принимается как доказательство
function rulePen(p: VProject): VRuleResult {
  const t = "Система заземления / PEN";
  const g = p.grounding.toUpperCase().replace(/\s/g, "");
  if (!g) return { checks: [nodata(t, "Система заземления не указана.")], missing: ["Система заземления"] };
  if (g.includes("TN-C-S")) {
    const miss: string[] = [];
    if (!p.pen.splitPoint) miss.push("точка разделения PEN на PE и N");
    if (!p.pen.penBus && !p.pen.peBus) miss.push("шина подключения PEN");
    if (!p.pen.jumper) miss.push("перемычка PE–N в точке разделения");
    if (miss.length)
      return {
        checks: [nodata(t, `Указано TN-C-S, но нет данных: ${miss.join(", ")}.`)],
        missing: miss.map((m) => `PEN: ${m}`),
      };
    return { checks: [ok(t, `TN-C-S: разделение — ${p.pen.splitPoint}.`)] };
  }
  if (g.includes("TN-C") && !g.includes("TN-C-S"))
    return { checks: [warn(t, "Система TN-C: УЗО без разделения PEN применять нельзя — проверьте.")] };
  return { checks: [nodata(t, `Система «${p.grounding}»: детальные правила пока не реализованы.`)] };
}

// 10. Модули, корпус, резерв
function ruleModules(p: VProject): VRuleResult {
  const checks: VCheck[] = [];
  const missing: string[] = [];
  const t = "Количество модулей";
  const used = p.usedModules ?? p.railsModules ?? p.specModules;
  if (used == null) {
    checks.push(nodata(t, "Занятые модули не определены."));
    missing.push("Количество модулей аппаратов");
  } else {
    const src = [
      ["сводка", p.usedModules],
      ["рейки", p.railsModules],
      ["спецификация", p.specModules],
    ].filter(([, v]) => v != null) as [string, number][];
    const diff = src.filter(([, v]) => v !== src[0]![1]);
    if (diff.length)
      checks.push(warn(t, `Расхождение: ${src.map(([k, v]) => `${k} ${v}`).join(", ")}.`));
    else checks.push(ok(t, `${used} мод.`));
  }
  const tc = "Вместимость корпуса";
  if (p.enclosureModules == null) {
    checks.push(nodata(tc, "Размер корпуса не указан."));
    missing.push("Размер корпуса (модулей)");
  } else if (used != null) {
    if (used > p.enclosureModules) checks.push(err(tc, `Занято ${used} из ${p.enclosureModules}.`));
    else checks.push(ok(tc, `Занято ${used} из ${p.enclosureModules}.`));
    const tr = "Заявленный резерв";
    if (p.reserveModules == null) checks.push(nodata(tr, "Резерв не заявлен."));
    else if (p.reserveModules > p.enclosureModules - used)
      checks.push(err(tr, `Заявлено ${p.reserveModules}, фактически свободно ${p.enclosureModules - used}.`));
    else checks.push(ok(tr, `Заявлено ${p.reserveModules}, свободно ${p.enclosureModules - used}.`));
  }
  return { checks, missing };
}

// 11. Цепочка защиты: селективность по номиналам и фазировка
function ruleChain(p: VProject): VRuleResult {
  const checks: VCheck[] = [];
  const t = "Фазировка линий";
  if (p.phases === 3) {
    const bad = p.lines.filter((l) => (l.poles ?? 1) < 3 && !/^L[123]$/.test(l.phase));
    checks.push(
      bad.length
        ? nodata(t, `Фаза не назначена: ${bad.map((l) => l.mark).join(", ")}.`)
        : ok(t, "Фазы назначены всем однофазным линиям."),
    );
  }
  checks.push(
    nodata(
      "Селективность",
      "Время-токовые характеристики аппаратов не переданы — селективность не оценивается.",
    ),
  );
  return { checks };
}

export const RULES: ((p: VProject) => VRuleResult)[] = [
  ruleInput,
  ruleGroups,
  ruleCurrent,
  ruleCable,
  ruleRcd,
  ruleRcdConflicts,
  ruleNBuses,
  rulePe,
  rulePen,
  ruleModules,
  ruleChain,
];
