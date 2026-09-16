import { createServerFn } from "@tanstack/react-start";
import { requirePanelAuth } from "./panel-auth.middleware";

import { ENCLOSURE_SIZES } from "./panel";
import type { PanelDesign, PanelInput, PanelRail } from "./panel";

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
— вводное противопожарное УЗО 100 мА обязательно тип S (селективное). Номинальный ток НЕ фиксируй в 40 А по привычке: выбери его расчётом от номинала вводного автомата и расчётного тока ввода, ближайший стандартный номинал на ступень выше вводного автомата (25/32/40/63/80/100 А), и обоснуй выбор в note;
— реле контроля напряжения: сначала определи тип устройства по схеме ввода. Для трёхфазного ввода с однофазными группами по умолчанию применяй ТРЁХФАЗНОЕ реле или три однофазных — выбор объясни в note и assumptions (пофазное отключение против общего, ток нагрузки на полюс, необходимость контактора). Три отдельных устройства без объяснения не предлагай. Номинальный ток реле не ниже номинала вводного автомата; при превышении — через контактор;
— ЯЗЫК И ФОРМАТ: все названия и обозначения пиши нормальным русским техническим языком, без искажений, транслитерации и автозамен. Только «УЗО», «30 мА», «100 мА тип S», «Освещение спальни 1», «Холодильник». Запрещены формы «У Зо», «30 мая», «Свет Пляж», «поздний» и любые бессмысленные слова;
— реле напряжения для трёхфазного ввода выбирай после анализа: контроль каждой фазы, контроль порядка и обрыва фаз, контроль нулевого рабочего проводника, последствия потери или смещения N (перекос до 400 В на однофазных потребителях), нужно ли одновременное отключение всех трёх фаз. Результат анализа изложи в assumptions. Три однофазных реле применяй только с техническим обоснованием и обязательно укажи, что они НЕ защищают от обрыва N — если такая защита нужна, применяй трёхфазное реле с контролем нуля или реле с общим отключением через контактор;
— для каждой объединённой линии в note укажи расчётную мощность (кВт), расчётный ток (А), номинал автомата и сечение кабеля;
— если паспортная мощность потребителя не задана, добавь в note фразу «Расчёт выполнен по принятой предварительной нагрузке» и не выдавай расчётное значение за паспортное;
— схему реле напряжения описывай подробно: к какой фазе подключён каждый прибор, откуда берётся нулевой рабочий проводник для измерительной цепи, что именно размыкает контакт реле (только свою фазу или всю нагрузку через контактор), и где реле стоит относительно противопожарного УЗО. При трёх однофазных реле каждая фаза коммутируется своим реле, N общий после противопожарного УЗО и через контакты реле НЕ разрывается — напиши это прямо в protection_chain и в note;
— порядок аппаратов по умолчанию: вводной автомат → противопожарное УЗО 100 мА тип S → реле напряжения (при необходимости контактор) → групповые УЗО 30 мА → групповые автоматы. Иной порядок допустим только с инженерным обоснованием в assumptions;
— в поле note каждой группы УЗО перечисли ВСЕ её линии по маркировкам и названиям (например «QF7 газовый котёл, QF10 холодильник»), без общих формулировок вида «кухня» или «комнаты»;
— мощность потребителя не определяй по одному названию: если фактическая мощность не задана, в name или note линии поставь пометку «предварительно» и вынеси это в assumptions либо задай вопрос в questions;
— для каждой объединённой линии в note укажи суммарную расчётную нагрузку и подтверди, что она не превышает допустимый ток кабеля и номинал автомата;
— для КАЖДОЙ группы 30 мА укажи тип (A/F/B), число полюсов (2P для однофазных групп, 4P для трёхфазных) и номинал не ниже суммы токов защищаемых линий с учётом одновременности;
— обязательно отдельными линиями: стиральная машина, посудомоечная машина, электрическая духовка, холодильник, газовый котёл, утюг, наружные розетки. Объединять их с другими потребителями запрещено;
— объединять линии допускается только после проверки суммарной расчётной нагрузки, сечения кабеля, номинала автомата, назначения линии и условий эксплуатации; результат этой проверки коротко отражай в note;
— note каждой линии начинается строго словами «Объединено, потому что …» либо «Отдельная линия, потому что …»;
— у каждой линии обязательно заполнены: name (назначение), cable, breaker, current_a, poles, phase, rcd, modules;
— ВВОДНОЙ КАБЕЛЬ: не существует универсального минимального сечения под номинал вводного автомата. Никогда не пиши формулировок вида «под C25 нужно минимум 5×6 мм²». Сечение ввода определяй только по совокупности: материал жил (медь/алюминий), способ и условия прокладки (воздух, земля, труба, лоток, группировка кабелей, температура), допустимый длительный ток, длина линии, падение напряжения, система заземления и тип сети, исходные данные проекта. Если хотя бы одного из этих данных нет — НЕ назначай сечение: поставь пометку «требуется уточнение» в assumptions и задай конкретные вопросы в questions;
— ГРУППОВЫЕ УЗО, ЭКСПЛУАТАЦИОННАЯ ПРОВЕРКА: помимо токов проверь последствия одного срабатывания. Если под одним УЗО 30 мА оказываются розеточные линии более чем двух независимых помещений или более 4 линий, вынеси это в assumptions как инженерное замечание и предложи конкретный вариант разделения (какие линии в какую новую группу и сколько это добавит модулей). Состав групп при этом сам не меняй без инженерной причины, а причину изменения прямо назови;
— РЕЛЕ НАПРЯЖЕНИЯ, ДВА ВАРИАНТА: для трёхфазного ввода всегда изложи в assumptions оба варианта и НЕ выбирай молча. Вариант А — три независимых однофазных реле; вариант Б — общее трёхфазное отключение с контролем всех фаз и нейтрали (трёхфазное реле, при необходимости с контактором). Для каждого варианта опиши: поведение при пропадании одной фазы, поведение при аварии нейтрали (обрыв, смещение, перекос до 400 В), какие линии отключатся, какие останутся под напряжением, преимущества и ограничения. Затем назови принятый в проекте вариант и причину выбора.

ЕДИНЫЙ ИТОГ: делай ОДИН расчёт. Список линий, УЗО, раскладка реек, спецификация, материалы и summary должны описывать один и тот же щит: summary.used_modules = сумма модулей всех аппаратов на рейках без резерва; сумма модулей каждой рейки = вместимости рейки корпуса; количество и номиналы аппаратов в spec точно совпадают с lines/rcd_groups/rails. Не пересчитывай части проекта отдельно и не давай альтернативных вариантов.

НЕДОСТАЮЩИЕ ДАННЫЕ: если не хватает исходных данных (фазность, выделенная мощность, номинал вводного автомата, сечение вводного кабеля, система заземления, мощности потребителей), НЕ придумывай их. В этом случае заполни массив questions конкретными вопросами пользователю и всё равно верни максимально полный предварительный расчёт с пометками в assumptions. Если данных достаточно — questions оставь пустым массивом.

Работай строго по этапам и не пропускай их:
1. Анализ нагрузок: для каждой линии определи назначение, мощность, рабочий ток, номинал и характеристику автомата (B/C), число полюсов, необходимость УЗО/дифавтомата, сечение кабеля, число модулей.
2. Проверка ввода: соответствие вводного автомата мощности, сечение вводного кабеля, распределение по фазам L1/L2/L3, перекос фаз (при 1 фазе — только L1).
3. Структура защиты: ВВОД → вводной автомат → реле напряжения → контактор (если нужен) → УЗИП → УЗО/дифзащита → групповые автоматы.
4. УЗО: логичная группировка, номинал, тип (AC/A/F/B), ток утечки (обычно 30 мА, противопожарное 100/300 мА). Ванная, уличные и кухонные розетки, стиральная машина, бойлер, насос, отопление — отдельная/усиленная защита.
5. Модули: посчитай сумму модулей, добавь резерв 15–20 %, выбери СТАНДАРТНЫЙ корпус из ряда 12/18/24/36/48/54/72/96 модулей (никогда нестандартный размер).
6. Компоновка DIN-реек: верхняя рейка — вводные аппараты (QF1, реле, контактор, УЗИП), средние — УЗО и групповые автоматы логическими блоками (кухня, техпомещение, ванная, комнаты, освещение), нижняя — резерв. Сумма модулей на КАЖДОЙ рейке не должна превышать вместимость рейки корпуса; свободные модули распределяй по рейкам так, чтобы каждая рейка была заполнена ровно до вместимости, а сумма всех свободных мест равнялась reserve_modules. Для линий освещения используй характеристику B.
7. Маркировка: QF1 — ТОЛЬКО вводной автомат, QD1 — противопожарное УЗО, KV1… — реле напряжения, QD2… — групповые УЗО, групповые автоматы линий нумеруются подряд начиная с QF2 (QF1 в списке lines быть не должно).
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
            temperature: 0,
            top_p: 0,
            seed: 20260916,
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


/**
 * Кэш готовых расчётов: одинаковые исходные данные всегда дают один и тот же
 * проект (модель сама по себе не гарантирует побайтовую повторяемость).
 * Память — быстрый слой, таблица panel_designs — устойчивый слой между
 * перезапусками и экземплярами сервера (служебные записи скрыты из списка).
 */
const designCache = new Map<string, PanelDesign>();

const CACHE_PREFIX = "__cache__";
function hashKey(value: string) {
  let h = 5381;
  for (let i = 0; i < value.length; i += 1) h = ((h << 5) + h + value.charCodeAt(i)) >>> 0;
  return `${CACHE_PREFIX}${h.toString(36)}-${value.length.toString(36)}`;
}

export const designPanel = createServerFn({ method: "POST" })
  .middleware([requirePanelAuth])
  .inputValidator((input: PanelInput) => input)
  .handler(async ({ data, context }): Promise<DesignPanelResult> => {
    await assertAdmin(context as never);

    const { customer: _c, address: _a, doc_date: _d, ...calcData } = data;
    const cacheKey = JSON.stringify(calcData);
    const cacheTitle = hashKey(cacheKey);
    const cached = designCache.get(cacheKey);
    if (cached) return { ok: true, design: cached };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const stored = await supabaseAdmin
      .from("panel_designs")
      .select("design")
      .eq("title", cacheTitle)
      .maybeSingle();
    if (stored.data?.design) {
      const design = stored.data.design as unknown as PanelDesign;
      designCache.set(cacheKey, design);
      return { ok: true, design };
    }







    const prompt = `ИСХОДНЫЕ ДАННЫЕ
Объект: ${data.object_type}
Питание: ${data.phases === "3" ? "230/400 В, 3 фазы" : "230 В, 1 фаза"}, 50 Гц
Ввод: ${data.input_type}
Выделенная мощность: ${data.power_kw} кВт
Вводной автомат: ${data.main_breaker_a} А
Площадь объекта: ${data.area_m2 ? `${data.area_m2} м²` : "не указана"}
Вводной кабель: ${data.input_cable?.trim() || "не указан"}
Помещения: ${data.rooms_text?.trim() ? data.rooms_text.replace(/\s+/g, " ").trim() : "не указаны"}
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
    function auditDesign(input: PanelDesign): PanelDesign {
      let d = input;
      // --- чистка искажений в текстах (защита от автозамен и транслитерации)
      const FIX: [RegExp, string][] = [
        [/\bУ\s?[Зз]о\b/g, "УЗО"],
        [/\b(\d+)\s*м(?:ая|ая\.|аи)\b/gi, "$1 мА"],
        [/\bмилиампер\w*/gi, "мА"],
        [/\bСвет\s+Пляж\w*/gi, "Освещение"],
        [/\bСвет\s+Стран\w*/gi, "Освещение"],
        [/\bпоздний\b/gi, ""],
        [/\blighting\b/gi, "освещения"],
        [/\blight\b/gi, "свет"],
        [/\s{2,}/g, " "],
      ];
      const fix = (t: unknown) =>
        typeof t === "string" ? FIX.reduce((acc, [re, to]) => acc.replace(re, to), t).trim() : t;
      const clean = <T,>(v: T): T => {
        if (typeof v === "string") return fix(v) as T;
        if (Array.isArray(v)) return v.map(clean) as T;
        if (v && typeof v === "object") {
          return Object.fromEntries(Object.entries(v).map(([k, val]) => [k, clean(val)])) as T;
        }
        return v;
      };
      d = clean(d);

      const issues = [...(d.issues ?? [])];
      const add = (severity: "error" | "warning" | "info", text: string, fix: string) =>
        issues.push({ severity, text, fix } as PanelDesign["issues"][number]);

      // --- единый итог: рейки, занятые модули, резерв и корпус считаются здесь
      const srcRails = d.rails ?? [];
      const capacity = 18;
      const devices = srcRails
        .flatMap((r) => r.items ?? [])
        .filter((i) => !/резерв|reserve|свободн/i.test(`${i.mark} ${i.label}`))
        .map((i) => ({ ...i, modules: Math.max(1, Math.round(i.modules || 1)) }));

      let rails: PanelRail[] = srcRails;
      let used = devices.reduce((s, i) => s + i.modules, 0);
      let enclosure = d.summary?.enclosure_modules ?? 0;

      if (devices.length) {
        const needed = Math.ceil(used * 1.2);
        const fromRow = ENCLOSURE_SIZES.find((s) => s >= needed && s % capacity === 0);
        enclosure = fromRow ?? Math.ceil(needed / capacity) * capacity;
        const railCount = Math.max(1, Math.round(enclosure / capacity));

        const overflow = srcRails.some(
          (r) => (r.items ?? []).reduce((s, i) => s + (i.modules || 0), 0) > capacity,
        );

        const packed: PanelRail[] = [];
        let queue = [...devices];
        for (let r = 0; r < railCount; r++) {
          const items: PanelRail["items"] = [];
          let free = capacity;
          while (queue.length && queue[0]!.modules <= free) {
            const item = queue.shift()!;
            items.push(item);
            free -= item.modules;
          }
          if (free > 0) items.push({ mark: "RESERVE", label: `Свободно (${free} мод.)`, modules: free });
          packed.push({ index: r + 1, title: srcRails[r]?.title ?? `Рейка ${r + 1}`, items });
        }
        if (queue.length) {
          const rest = queue.reduce((s, i) => s + i.modules, 0);
          add(
            "error",
            `Аппараты на ${rest} мод. не поместились в корпус ${enclosure} мод.`,
            "Выбрать корпус большего типоразмера или вынести часть групп в отдельный щит.",
          );
        } else {
          rails = packed;
          if (overflow) {
            add(
              "info",
              `Раскладка выровнена автоматически: на рейке было больше ${capacity} модулей, аппараты перенесены на следующую рейку.`,
              "Проверить порядок групп на рейках перед сборкой.",
            );
          }
        }
      }

      const reserve = Math.max(0, enclosure - used);
      const reservePct = used ? Math.round((reserve / used) * 100) : 0;
      if (used > 0 && reserve < used * 0.2) {
        add(
          "error",
          `Резерв ${reserve} мод. меньше 20 % от занятых (${used} мод.).`,
          "Выбрать корпус на следующий типоразмер из ряда 12/18/24/36/48/54/72/96 модулей.",
        );
      }

      // --- линии: полнота данных, обязательные отдельные линии, формулировки
      const linesAll = d.lines ?? [];
      const incomplete = linesAll.filter(
        (l) => !l.name?.trim() || !l.cable?.trim() || !l.breaker?.trim() || !l.modules,
      );
      if (incomplete.length) {
        add(
          "error",
          `Не заполнены данные линий: ${incomplete.map((l) => l.mark).join(", ")}.`,
          "Указать назначение, кабель, автомат и количество модулей для каждой линии.",
        );
      }
      const MUST_BE_SEPARATE: [string, RegExp][] = [
        ["стиральная машина", /стиральн/i],
        ["посудомоечная машина", /посудомо/i],
        ["электрическая духовка", /духов/i],
        ["холодильник", /холодильник/i],
        ["газовый котёл", /кот[её]л/i],
        ["утюг", /утюг/i],
        ["наружные розетки", /наружн\w*\s+розетк|уличн\w*\s+розетк/i],
      ];
      for (const [label, re] of MUST_BE_SEPARATE) {
        const hit = linesAll.filter((l) => re.test(l.name ?? ""));
        if (!hit.length) {
          add("warning", `В проекте нет отдельной линии: ${label}.`, "Добавить выделенную линию для этого потребителя.");
        } else if (hit.some((l) => /\+|,|и\s/i.test(l.name.replace(/^[^:]*:/, "")))) {
          add("error", `Линия «${hit[0]!.name}» объединяет ${label} с другими потребителями.`, "Вынести потребителя на отдельную линию.");
        }
      }
      const clash = linesAll.filter((l) => /^QF1$/i.test((l.mark ?? "").trim()));
      if (clash.length) {
        add("error", "Маркировка QF1 занята вводным автоматом, но использована для групповой линии.", "Перенумеровать групповые автоматы начиная с QF2.");
      }
      const badNote = linesAll.filter(
        (l) => !/^(Объединено, потому что|Отдельная линия, потому что)/i.test((l.note ?? "").trim()),
      );
      if (badNote.length) {
        add(
          "warning",
          `Нет обоснования решения по линиям: ${badNote.map((l) => l.mark).join(", ")}.`,
          "Дополнить пояснение «Объединено, потому что …» или «Отдельная линия, потому что …».",
        );
      }

      const rcds = d.rcd_groups ?? [];
      const mainA = Number(/(\d+)/.exec(d.summary?.main_breaker ?? "")?.[1] ?? 0);
      const fire = rcds.find((g) => /100|300/.test(g.leakage ?? ""));
      const fireA = Number(/(\d+)/.exec(fire?.rating ?? "")?.[1] ?? 0);
      if (fire && mainA && fireA && fireA < mainA) {
        add(
          "error",
          `Противопожарное УЗО ${fire.mark} ${fireA} А меньше вводного автомата ${mainA} А.`,
          "Выбрать номинал противопожарного УЗО на ступень выше вводного автомата.",
        );
      }
      for (const g of rcds) {
        if (!g.leakage?.trim() || !g.type?.trim() || !g.rating?.trim()) {
          add("warning", `У УЗО ${g.mark} не указан номинал, тип или ток утечки.`, "Дополнить параметры аппарата.");
        }
      }
      if (!fire) {
        add("error", "Не найдено вводное противопожарное УЗО 100 мА.", "Установить 4P (или 2P) УЗО 100 мА тип S сразу после вводного автомата.");
      } else if (!/\bS\b|селектив/i.test(`${fire.type ?? ""} ${fire.rating ?? ""} ${fire.note ?? ""}`)) {
        add("error", `Противопожарное УЗО ${fire.mark} не селективное (нет типа S).`, "Применить селективное УЗО тип S, иначе теряется селективность с групповыми 30 мА.");
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
      const noRcd = linesAll.filter((l) => !l.rcd || !String(l.rcd).trim());
      if (noRcd.length) {
        add("warning", `Линии без дифференциальной защиты: ${noRcd.map((l) => l.mark).join(", ")}.`, "Проверить, обоснованно ли отсутствие УЗО на этих линиях.");
      }

      // --- координация «кабель ↔ автомат ↔ расчётный ток» по каждой линии.
      // Значения — ориентир для медных кабелей при обычных условиях прокладки,
      // это НЕ норматив: окончательное сечение проверяется по способу прокладки,
      // температуре, группировке, длине и падению напряжения.
      const CABLE_LIMIT: Record<string, number> = {
        "1.5": 16, "2.5": 25, "4": 32, "6": 40, "10": 50, "16": 63,
      };
      for (const l of linesAll) {
        const sec = /[хx*]\s*([\d.,]+)/i.exec(l.cable ?? "")?.[1]?.replace(",", ".");
        const inA = Number(/(\d+)/.exec(l.breaker ?? "")?.[1] ?? 0);
        const limit = sec ? CABLE_LIMIT[sec] : undefined;
        if (limit && inA && inA > limit) {
          add("warning", `${l.mark} «${l.name}»: автомат ${l.breaker} выше ориентировочного допустимого тока меди ${sec} мм² (≈${limit} А при обычных условиях прокладки).`, "Проверить сечение по материалу, способу прокладки, длине и падению напряжения; при подтверждении — увеличить сечение или снизить номинал автомата.");
        }
        if (inA && Number(l.current_a) > inA) {
          add("error", `${l.mark} «${l.name}»: расчётный ток ${l.current_a} А выше номинала автомата ${inA} А.`, "Поднять номинал автомата на ступень и проверить сечение кабеля.");
        }
        if (/освещен|подсветк|свет/i.test(l.name ?? "") && /^C/i.test((l.breaker ?? "").trim())) {
          add("warning", `${l.mark} «${l.name}»: для линии освещения выбрана характеристика C.`, "Применить характеристику B (B6/B10).");
        }
      }

      // --- групповые УЗО: номинал против суммы токов и принадлежность линий
      const byMark = new Map(linesAll.map((l) => [l.mark, l]));
      const assigned = new Map<string, string[]>();
      for (const g of rcds) {
        if (/100|300/.test(g.leakage ?? "")) continue;
        const marks = (g.lines ?? []).map((t) => /QF\d+/i.exec(String(t))?.[0] ?? "").filter(Boolean);
        const sum = marks.reduce((s, m) => s + Number(byMark.get(m)?.current_a ?? 0), 0);
        const rating = Number(/(\d+)/.exec(g.rating ?? "")?.[1] ?? 0);
        if (rating && sum > rating * 1.6) {
          add("warning", `УЗО ${g.mark} ${rating} А: сумма расчётных токов линий ${Math.round(sum)} А.`, "Увеличить номинал УЗО или разделить группу.");
        }
        const socketLines = marks
          .map((m) => byMark.get(m))
          .filter((l) => l && /розет/i.test(l.name ?? ""));
        if (socketLines.length > 4) {
          const names = socketLines.map((l) => `${l!.mark} ${l!.name}`).join(", ");
          const half = Math.ceil(socketLines.length / 2);
          add(
            "warning",
            `Эксплуатационное замечание: под УЗО ${g.mark} объединены ${socketLines.length} розеточных линий независимых помещений (${names}). Одно срабатывание обесточит розетки во всех этих помещениях сразу.`,
            `Разделить на две группы 30 мА тип A: первые ${half} линий оставить на ${g.mark}, остальные перевести на новое УЗО (+2 модуля и отдельная N-шина). Электрических нарушений в текущем варианте нет — решение эксплуатационное.`,
          );
        } else if (marks.length > 6) {
          add("warning", `УЗО ${g.mark} защищает ${marks.length} линий.`, "Рассмотреть разделение группы: при утечке обесточивается большой объём нагрузки.");
        }
        for (const m of marks) assigned.set(m, [...(assigned.get(m) ?? []), g.mark]);
      }
      for (const l of linesAll) {
        const owners = assigned.get(l.mark) ?? [];
        if (owners.length > 1) {
          add("error", `Линия ${l.mark} отнесена сразу к нескольким УЗО 30 мА (${owners.join(", ")}).`, "Оставить линию в одной группе: нули разных УЗО объединять нельзя.");
        }
        if (!owners.length && l.rcd && !/100|300/.test(String(l.rcd))) {
          add("warning", `Линия ${l.mark} указывает УЗО ${l.rcd}, но в составе групп её нет.`, "Синхронизировать состав групп УЗО с таблицей линий.");
        }
      }

      // --- таблица и раскладка реек должны описывать один и тот же щит
      const railMarks = new Set(rails.flatMap((r) => (r.items ?? []).map((i) => i.mark)));
      const missingOnRails = linesAll.filter((l) => !railMarks.has(l.mark));
      if (missingOnRails.length) {
        add("error", `Нет на DIN-рейках: ${missingOnRails.map((l) => l.mark).join(", ")}.`, "Разместить все аппараты таблицы на рейках — схема и раскладка должны совпадать.");
      }

      // --- перекос фаз
      const phases = d.phase_load ?? [];
      if (phases.length > 1) {
        const kws = phases.map((p) => Number(p.kw) || 0);
        const max = Math.max(...kws), min = Math.min(...kws);
        if (max > 0 && (max - min) / max > 0.3) {
          add("warning", `Перекос фаз: ${kws.map((k) => `${k} кВт`).join(" / ")}.`, "Перераспределить однофазные линии между фазами.");
        }
      }

      const checks = [
        ...(d.checks ?? []),
        { text: `Занято ${used} мод., свободно ${reserve} мод. (${reservePct} % резерва), корпус ${enclosure} мод., ${rails.length} рейки по ${capacity}`, ok: reserve >= used * 0.2 },
        { text: `Линий в проекте: ${linesAll.length}, групп УЗО: ${rcds.length}`, ok: true },
        { text: "Селективность вводного УЗО 100 мА тип S с групповыми 30 мА подтверждается только по каталожным характеристикам выбранного производителя", ok: true },
      ];


      return {
        ...d,
        rails,
        checks,
        issues,
        summary: {
          ...d.summary,
          used_modules: used,
          reserve_modules: reserve,
          enclosure_modules: enclosure,
          enclosure: d.summary?.enclosure?.replace(/\d+\s*модул\w*/i, `${enclosure} модулей`) || `Настенный щит ${enclosure} модулей`,
        },
      };
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
      if (design) {
        const audited = auditDesign(design);
        if (designCache.size > 20) designCache.clear();
        designCache.set(cacheKey, audited);
        // Устойчивая повторяемость: тот же ввод всегда отдаёт этот же проект,
        // даже после перезапуска сервера.
        await supabaseAdmin
          .from("panel_designs")
          .insert({ title: cacheTitle, input: calcData as never, design: audited as never, image: "" })
          .then(
            () => undefined,
            () => undefined,
          );
        return { ok: true, design: audited };
      }
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
