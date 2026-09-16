import { createServerFn } from "@tanstack/react-start";
import { requirePanelAuth } from "./panel-auth.middleware";

import type { PanelDesign, PanelInput } from "./panel";

export type PanelAiError = {
  ok: false;
  code: "payment_required" | "policy_blocked" | "rate_limited" | "unavailable";
  message: string;
};

export type DesignPanelResult = { ok: true; design: PanelDesign } | PanelAiError;
export type RenderPanelImageResult = { ok: true; image: string } | PanelAiError;

const SYSTEM = `Ты — инженер-проектировщик низковольтных электроустановок (НКУ) и специалист по сборке модульных распределительных щитов, работаешь по ПУЭ 7 и ГОСТ IEC 61439.

ОБЯЗАТЕЛЬНО В КАЖДОМ ПРОЕКТЕ ЩИТА:
— вводной автомат;
— противопожарное селективное УЗО 100 мА (тип S) сразу после ввода;
— реле контроля напряжения;
— корректное разделение PEN на PE и N при системе TN-C-S (точка разделения, перемычка PE-корпус);
— отдельная PE-шина и отдельная N-шина (для TN-S/TN-C-S — изолированная N, PE на корпусе);
— групповые автоматы на каждую линию;
— УЗО 30 мА или дифавтоматы на розеточные, влажные и уличные линии;
— резерв свободных модулей не менее 20 % от занятых.

АНАЛИЗ ЛИНИЙ (не просто переписывай список):
— разбери каждую исходную позицию: назначение, тип нагрузки, помещение;
— объединяй совместимые потребители в одну линию, если это допустимо (например освещение разных помещений одного этажа);
— выделяй в отдельные линии мощные, влажные и критичные потребители (стиральная и посудомоечная машины, духовка, холодильник, котёл, утюг, уличные линии);
— явно объясняй каждое решение об объединении и о выделении в поле note линии и в assumptions: в note всегда пиши «Объединено, потому что …» или «Отдельная линия, потому что …».

ПРАВИЛА ГРУППИРОВКИ УЗО (не ставь УЗО «для количества», у каждого должно быть назначение):
— котёл/отопление и холодильник НЕ объединять под одним УЗО со стиральной, посудомоечной машиной и другой техникой с высокими токами утечки: ложное срабатывание оставит дом без отопления и разморозит продукты. Для них — отдельное УЗО 30 мА тип A (можно одно общее «линии непрерывного питания») или дифавтомат;
— линии освещения не объединять под одним УЗО с мощными кухонными и влажными потребителями: при срабатывании помещение остаётся без света. Освещение — под отдельным УЗО или дифавтоматом;
— стиральная машина, посудомоечная машина, духовка — силовые влажные/термические линии, их допускается группировать между собой, но не более 3–4 линий на одно УЗО 30 мА;
— уличные линии (наружные розетки, подсветка) — всегда отдельное УЗО 30 мА тип A;
— УЗО типа AC не применять ни на одной линии (минимум тип A), включая линии освещения;
— N каждой группы УЗО идёт на СВОЮ изолированную N-шину, объединять нули разных УЗО запрещено; PE никогда не проходит через УЗО и идёт напрямую на PE-шину;
— вводное противопожарное УЗО 100 мА обязательно тип S (селективное, с выдержкой времени), его номинальный ток — не меньше номинала вводного автомата;
— реле контроля напряжения ставится после вводного автомата, на каждую фазу своё (или трёхфазное), номинальный ток не меньше вводного автомата; при токе группы свыше номинала реле — через контактор.

НЕДОСТАЮЩИЕ ДАННЫЕ: если не хватает исходных данных (фазность, выделенная мощность, номинал вводного автомата, сечение вводного кабеля, система заземления, мощности потребителей), НЕ придумывай их. В этом случае заполни массив questions конкретными вопросами пользователю и всё равно верни максимально полный предварительный расчёт с пометками в assumptions. Если данных достаточно — questions оставь пустым массивом.

Работай строго по этапам и не пропускай их:
1. Анализ нагрузок: для каждой линии определи назначение, мощность, рабочий ток, номинал и характеристику автомата (B/C), число полюсов, необходимость УЗО/дифавтомата, сечение кабеля, число модулей.
2. Проверка ввода: соответствие вводного автомата мощности, сечение вводного кабеля, распределение по фазам L1/L2/L3, перекос фаз (при 1 фазе — только L1).
3. Структура защиты: ВВОД → вводной автомат → реле напряжения → контактор (если нужен) → УЗИП → УЗО/дифзащита → групповые автоматы.
4. УЗО: логичная группировка, номинал, тип (AC/A/F/B), ток утечки (обычно 30 мА, противопожарное 100/300 мА). Ванная, уличные и кухонные розетки, стиральная машина, бойлер, насос, отопление — отдельная/усиленная защита.
5. Модули: посчитай сумму модулей, добавь резерв 15–20 %, выбери СТАНДАРТНЫЙ корпус из ряда 12/18/24/36/48/54/72/96 модулей (никогда нестандартный размер).
6. Компоновка DIN-реек: верхняя рейка — вводные аппараты (QF1, реле, контактор, УЗИП), средние — УЗО и групповые автоматы логическими блоками (кухня, техпомещение, ванная, комнаты, освещение), нижняя — резерв. Сумма модулей на КАЖДОЙ рейке не должна превышать вместимость рейки корпуса; свободные модули распределяй по рейкам так, чтобы каждая рейка была заполнена ровно до вместимости, а сумма всех свободных мест равнялась reserve_modules. Для линий освещения используй характеристику B.
7. Маркировка: QF1 — ВВОД, KV1 — реле напряжения, QF2… — группы. Каждая линия имеет маркировку.
8. Спецификация: аппараты + корпус, DIN-рейки, шины N и PE, гребёнки, перемычки, наконечники, маркировка, провод внутри щита.
9. Контроль: сумма модулей сходится, аппараты помещаются, есть резерв, номиналы соответствуют линиям, N и PE разделены по выбранной системе заземления, схема соответствует компоновке и спецификации.

Не выдумывай исходные данные: любое инженерное предположение явно перечисли в assumptions. Найденные противоречия перечисли в issues.

Отвечай ТОЛЬКО валидным JSON без markdown-ограждений, строго по структуре:
{
 "summary": {"object_type":"","supply":"","grounding":"","total_power_kw":0,"calculated_power_kw":0,"main_breaker":"","used_modules":0,"reserve_modules":0,"enclosure":"","enclosure_modules":0,"ip":""},
 "phase_load": [{"phase":"L1","kw":0,"current_a":0,"lines":["QF2"]}],
 "protection_chain": ["Ввод 3P+N","QF1 ..."],
 "lines": [{"mark":"QF2","name":"","power_kw":0,"current_a":0,"breaker":"C16","curve":"C","poles":1,"phase":"L1","rcd":"QD1","cable":"ВВГнг-LS 3х2,5","modules":1,"note":""}],
 "rcd_groups": [{"mark":"QD1","rating":"40А","type":"A","leakage":"30 мА","lines":["QF2"],"note":""}],
 "rails": [{"index":1,"title":"Рейка 1 — ввод","items":[{"mark":"QF1","label":"ВВОД 3P C25","modules":3}]}],
 "spec": [{"pos":1,"name":"","manufacturer":"","model":"","rating":"","modules":0,"qty":1,"unit":"шт"}],
 "materials": [{"pos":1,"name":"Корпус навесной 54 мод.","manufacturer":"","model":"","rating":"","modules":0,"qty":1,"unit":"шт"}],
 "checks": [{"text":"Количество модулей сходится","ok":true}],
 "issues": [{"severity":"warning","text":"","fix":""}],
 "assumptions": ["..."],
 "questions": ["вопрос пользователю о недостающих исходных данных"],
 "image_prompt": "детальное английское описание собранного щита для фотореалистичной визуализации"
}
Все тексты (кроме image_prompt) — на русском языке.`;

/** Адрес AI-реле Lovable по умолчанию (там доступен управляемый LOVABLE_API_KEY). */
const DEFAULT_RELAY_URL =
  "https://project--a97cfcc1-6e84-4897-ab6b-f8f8a9da8d9d.lovable.app/api/public/ai-relay";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!data) throw new Error("Доступ только для администратора");
}

/**
 * Транспорт к Lovable AI Gateway.
 * Внутри Lovable ключ доступен локально — идём напрямую.
 * На внешнем деплое (Vercel) ключа нет: запрос уходит через AI-реле
 * (маршрут /api/public/ai-relay в инфраструктуре Lovable).
 * Логика проектировщика, промпты и модели при этом не меняются.
 */
async function callGateway(
  kind: "design" | "image",
  payload: { system?: string; prompt: string },
): Promise<Response> {
  const key = process.env["LOVABLE_API_KEY"];
  if (key) {
    const body =
      kind === "design"
        ? {
            model: "google/gemini-3.6-flash",
            temperature: 0.2,
            messages: [
              { role: "system", content: payload.system },
              { role: "user", content: payload.prompt },
            ],
          }
        : {
            model: "google/gemini-3-pro-image",
            messages: [{ role: "user", content: payload.prompt }],
            modalities: ["image", "text"],
          };

    return fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Lovable-API-Key": key, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  // Стабильный адрес реле в инфраструктуре Lovable — используется, когда
  // внешний деплой (REG.RU / Vercel) не задал собственный AI_RELAY_URL.
  const relayUrl = process.env["AI_RELAY_URL"] || DEFAULT_RELAY_URL;
  const relaySecret = process.env["AI_RELAY_SECRET"];
  if (!relaySecret) {
    throw new Error(
      "AI недоступен: на сервере не задан AI_RELAY_SECRET для доступа к AI Lovable.",
    );
  }

  return fetch(relayUrl.replace(/\/+$/, ""), {
    method: "POST",
    headers: { "X-Relay-Secret": relaySecret, "Content-Type": "application/json" },
    body: JSON.stringify({ kind, ...payload }),
  });
}


export const designPanel = createServerFn({ method: "POST" })
  .middleware([requirePanelAuth])
  .inputValidator((input: PanelInput) => input)
  .handler(async ({ data, context }): Promise<DesignPanelResult> => {
    await assertAdmin(context as never);





    const prompt = `ИСХОДНЫЕ ДАННЫЕ
Объект: ${data.object_type}
Питание: ${data.phases === "3" ? "230/400 В, 3 фазы" : "230 В, 1 фаза"}, 50 Гц
Ввод: ${data.input_type}
Выделенная мощность: ${data.power_kw} кВт
Вводной автомат: ${data.main_breaker_a} А
Система заземления: ${data.grounding}
Корпус: настенный, ${data.ip}, прозрачная дверца, количество модулей определить автоматически
Дополнительно: ${data.notes || "нет"}

СПИСОК ЛИНИЙ:
${data.lines_text}`;

    async function askModel(extra: string): Promise<{ text?: string; error?: PanelAiError }> {
      const res = await callGateway("design", {
        system: SYSTEM,
        prompt: prompt + extra,
      });

      if (res.status === 429) return { error: { ok: false, code: "rate_limited", message: "Слишком много запросов. Попробуйте позже." } };
      if (res.status === 402) return { error: { ok: false, code: "payment_required", message: "Недостаточно кредитов AI. Пополните баланс в разделе «Настройки → Планы и кредиты»." } };
      if (res.status === 403) return { error: { ok: false, code: "policy_blocked", message: "Доступ к AI ограничен настройками рабочего пространства. Обратитесь к администратору." } };
      if (!res.ok) return { error: { ok: false, code: "unavailable", message: "Сервис AI временно недоступен. Попробуйте позже." } };
      const json = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      return { text: json.choices?.[0]?.message?.content ?? "" };
    }

    /** Детерминированная проверка расчёта: то, что нельзя доверять только модели. */
    function auditDesign(d: PanelDesign): PanelDesign {
      const issues = [...(d.issues ?? [])];
      const add = (severity: "error" | "warning" | "info", text: string, fix: string) =>
        issues.push({ severity, text, fix } as PanelDesign["issues"][number]);

      const rails = d.rails ?? [];
      const capacity = rails.length ? Math.round((d.summary?.enclosure_modules ?? 0) / rails.length) : 0;
      if (capacity > 0) {
        for (const rail of rails) {
          const sum = (rail.items ?? []).reduce((s, i) => s + (i.modules ?? 0), 0);
          if (sum > capacity) {
            add(
              "error",
              `Рейка ${rail.index ?? ""}: занято ${sum} модулей при вместимости ${capacity}.`,
              "Перенести часть аппаратов на соседнюю рейку или выбрать корпус большего размера.",
            );
          }
        }
      }

      const used = d.summary?.used_modules ?? 0;
      const reserve = d.summary?.reserve_modules ?? 0;
      if (used > 0 && reserve < used * 0.2) {
        add(
          "error",
          `Резерв ${reserve} мод. меньше 20 % от занятых (${used} мод.).`,
          "Выбрать корпус на следующий типоразмер из ряда 12/18/24/36/48/54/72/96 модулей.",
        );
      }

      const rcds = d.rcd_groups ?? [];
      if (!rcds.some((g) => /100|300/.test(g.leakage ?? "") && /S/i.test(g.type ?? ""))) {
        add("error", "Не найдено вводное противопожарное селективное УЗО 100 мА типа S.", "Установить 4P (или 2P) УЗО 100 мА тип S сразу после вводного автомата.");
      }
      for (const g of rcds) {
        if ((g.type ?? "").trim().toUpperCase() === "AC") {
          add("warning", `УЗО ${g.mark}: тип AC устарел для бытовых линий.`, "Заменить на тип A.");
        }
      }
      const chain = (d.protection_chain ?? []).join(" ").toLowerCase();
      if (!chain.includes("реле")) {
        add("error", "В цепи защиты нет реле контроля напряжения.", "Добавить реле напряжения после вводного автомата, по одному на фазу или трёхфазное.");
      }
      const lines = d.lines ?? [];
      const noRcd = lines.filter((l) => !l.rcd || !String(l.rcd).trim());
      if (noRcd.length) {
        add("warning", `Линии без дифференциальной защиты: ${noRcd.map((l) => l.mark).join(", ")}.`, "Проверить, обоснованно ли отсутствие УЗО на этих линиях.");
      }

      return { ...d, issues };
    }

    function parse(text: string): PanelDesign | null {
      const cleaned = text
        .replace(/^```(?:json)?/i, "")
        .replace(/```$/, "")
        .trim();
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      if (start < 0 || end < 0) return null;
      try {
        return JSON.parse(cleaned.slice(start, end + 1)) as PanelDesign;
      } catch {
        return null;
      }
    }

    for (let attempt = 0; attempt < 3; attempt++) {
      const response = await askModel(
        attempt === 0 ? "" : "\n\nВерни ТОЛЬКО JSON-объект без пояснений и markdown.",
      );
      if (response.error) return response.error;
      const design = parse(response.text ?? "");
      if (design) return { ok: true, design: auditDesign(design) };
    }
    return { ok: false, code: "unavailable", message: "Модель не вернула расчёт. Попробуйте ещё раз." };
  });


export const renderPanelImage = createServerFn({ method: "POST" })
  .middleware([requirePanelAuth])
  .inputValidator((input: { prompt: string }) => input)
  .handler(async ({ data, context }): Promise<RenderPanelImageResult> => {
    await assertAdmin(context as never);

    const prompt = `Photorealistic studio photograph of a professionally assembled white modular wall-mounted electrical distribution board with a transparent hinged door open. ${data.prompt}
Realistic European DIN-rail modular devices in correct 17.5 mm module sizes, neatly combed busbars, colour-coded wiring, separate N (blue) and PE (yellow-green) terminal bars, printed group labels under every breaker, empty reserve modules covered with blank plates, a small engraved plate reading "S&M ELECTRIC" on the enclosure. Sharp focus, even neutral lighting, no fictional components, no text errors.`;

    const res = await callGateway("image", { prompt });


    if (res.status === 429) return { ok: false, code: "rate_limited", message: "Слишком много запросов. Попробуйте позже." };
    if (res.status === 402) return { ok: false, code: "payment_required", message: "Недостаточно кредитов AI. Пополните баланс в разделе «Настройки → Планы и кредиты»." };
    if (res.status === 403) return { ok: false, code: "policy_blocked", message: "Доступ к AI ограничен настройками рабочего пространства. Обратитесь к администратору." };
    if (!res.ok) return { ok: false, code: "unavailable", message: "Сервис AI временно недоступен. Попробуйте позже." };

    const json = (await res.json()) as {
      choices?: { message?: { images?: { image_url?: { url?: string } }[] } }[];
    };
    const url = json.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!url) return { ok: false, code: "unavailable", message: "Модель не вернула изображение. Попробуйте ещё раз." };
    return { ok: true, image: url };
  });
