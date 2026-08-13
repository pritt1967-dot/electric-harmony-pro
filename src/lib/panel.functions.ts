import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { streamText } from "ai";

import type { PanelDesign, PanelInput } from "./panel";

const SYSTEM = `Ты — инженер-проектировщик низковольтных электроустановок (НКУ) и специалист по сборке модульных распределительных щитов, работаешь по ПУЭ 7 и ГОСТ IEC 61439.

Работай строго по этапам и не пропускай их:
1. Анализ нагрузок: для каждой линии определи назначение, мощность, рабочий ток, номинал и характеристику автомата (B/C), число полюсов, необходимость УЗО/дифавтомата, сечение кабеля, число модулей.
2. Проверка ввода: соответствие вводного автомата мощности, сечение вводного кабеля, распределение по фазам L1/L2/L3, перекос фаз (при 1 фазе — только L1).
3. Структура защиты: ВВОД → вводной автомат → реле напряжения → контактор (если нужен) → УЗИП → УЗО/дифзащита → групповые автоматы.
4. УЗО: логичная группировка, номинал, тип (AC/A/F/B), ток утечки (обычно 30 мА, противопожарное 100/300 мА). Ванная, уличные и кухонные розетки, стиральная машина, бойлер, насос, отопление — отдельная/усиленная защита.
5. Модули: посчитай сумму модулей, добавь резерв 15–20 %, выбери СТАНДАРТНЫЙ корпус из ряда 12/18/24/36/48/54/72/96 модулей (никогда нестандартный размер).
6. Компоновка DIN-реек: верхняя рейка — вводные аппараты (QF1, реле, контактор, УЗИП), средние — УЗО и групповые автоматы логическими блоками (кухня, техпомещение, ванная, комнаты, освещение), нижняя — резерв.
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
 "image_prompt": "детальное английское описание собранного щита для фотореалистичной визуализации"
}
Все тексты (кроме image_prompt) — на русском языке.`;

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!data) throw new Error("Доступ только для администратора");
}

export const designPanel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: PanelInput) => input)
  .handler(async ({ data, context }): Promise<PanelDesign> => {
    await assertAdmin(context as never);

    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI недоступен: нет ключа");

    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);

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

    async function askModel(extra: string): Promise<string> {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Lovable-API-Key": key!, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3.6-flash",
          temperature: 0.2,
          messages: [
            { role: "system", content: SYSTEM },
            { role: "user", content: prompt + extra },
          ],
        }),
      });
      if (res.status === 429) throw new Error("Слишком много запросов, попробуйте позже");
      if (res.status === 402) throw new Error("Закончились кредиты AI");
      if (!res.ok) throw new Error("Не удалось выполнить расчёт");
      const json = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      return json.choices?.[0]?.message?.content ?? "";
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
      const text = await askModel(
        attempt === 0 ? "" : "\n\nВерни ТОЛЬКО JSON-объект без пояснений и markdown.",
      );
      const design = parse(text);
      if (design) return design;
    }
    throw new Error("Модель не вернула расчёт, попробуйте ещё раз");
  });


export const renderPanelImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { prompt: string }) => input)
  .handler(async ({ data, context }): Promise<{ image: string }> => {
    await assertAdmin(context as never);

    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI недоступен: нет ключа");

    const prompt = `Photorealistic studio photograph of a professionally assembled white modular wall-mounted electrical distribution board with a transparent hinged door open. ${data.prompt}
Realistic European DIN-rail modular devices in correct 17.5 mm module sizes, neatly combed busbars, colour-coded wiring, separate N (blue) and PE (yellow-green) terminal bars, printed group labels under every breaker, empty reserve modules covered with blank plates, a small engraved plate reading "S&M ELECTRIC" on the enclosure. Sharp focus, even neutral lighting, no fictional components, no text errors.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Lovable-API-Key": key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (res.status === 429) throw new Error("Слишком много запросов, попробуйте позже");
    if (res.status === 402) throw new Error("Закончились кредиты AI");
    if (!res.ok) throw new Error("Не удалось создать визуализацию");

    const json = (await res.json()) as {
      choices?: { message?: { images?: { image_url?: { url?: string } }[] } }[];
    };
    const url = json.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!url) throw new Error("Модель не вернула изображение");
    return { image: url };
  });
