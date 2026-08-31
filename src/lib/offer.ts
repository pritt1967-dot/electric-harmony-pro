import { supabase } from "@/integrations/supabase/client";
import {
  type Estimate,
  type EstimateItem,
  computeEstimateTotals,
  formatDate,
  todayISO,
} from "@/lib/estimates";

/* ── Фирменные реквизиты бланка КП ─────────────────────────── */

export const OFFER_BRAND = {
  name: "S&M Electric",
  slogan: "Электромонтаж без компромиссов.",
  phone1: "+7 911 733 55 67",
  phone2: "+7 981 772 66 63",
  email: "fls@inbox.ru",
  site: "sm-electric.ru",
  /** Фирменный красный. */
  red: [199, 32, 39] as [number, number, number],
  redHex: "C72027",
};

export const OFFER_INTRO =
  "Предлагаем выполнить комплекс электромонтажных работ на объекте.";
export const OFFER_TERM = "согласовывается с заказчиком.";
export const OFFER_WARRANTY = "предоставляется.";
export const OFFER_LAMPS_TEXT = [
  "Заказчиком были выбраны определённые модели светильников.",
  "По просьбе заказчика S&M Electric дополнительно подобрал альтернативные варианты с сопоставимыми техническими характеристиками и более низкой стоимостью.",
  "Предлагаемые варианты позволяют снизить стоимость комплектации объекта без изменения согласованного объёма работ.",
].join(" ");
export const OFFER_LAMPS_NOTE =
  "Окончательный вариант светильников согласовывается с заказчиком.";

/* ── Классификация «работа / материал» ─────────────────────── */

export type PriceRef = { name: string; unit: string; category: string };

const MATERIAL_CATEGORY = /материал|оборудован|комплект|товар|кабел|щит[ыа]?\b/i;

const MATERIAL_WORDS =
  /(кабель|провод|гофр|труб|лоток|автомат|дифавтомат|узо|реле|контактор|рубильник|щит|бокс|корпус|розетк[аи]\s|выключател[ья]\s|светильник|лампа|клемм|наконечник|дюбел|саморез|стяжк|короб|шина|счётчик|счетчик|ограничител)/i;
const WORK_WORDS =
  /(монтаж|установк|прокладк|сборк|подключ|штроб|сверлен|демонтаж|наладк|пусконаладоч|измерен|проверк|диагностик|обслуживан|работ|услуг|выезд|проект)/i;

function norm(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Приоритет: категория прайса → признак в данных позиции → словарь слов.
 * Структура сметы не меняется — категория берётся сопоставлением с прайсом.
 */
export function isMaterialItem(item: EstimateItem, price: PriceRef[]): boolean {
  const key = norm(item.name);
  const byNameUnit = price.find(
    (p) => norm(p.name) === key && norm(p.unit) === norm(item.unit),
  );
  const byName = byNameUnit ?? price.find((p) => norm(p.name) === key);
  if (byName) return MATERIAL_CATEGORY.test(byName.category);

  // Признаки, уже имеющиеся в данных позиции
  const text = `${item.name} ${item.comment ?? ""}`;
  if (/материал|оборудование/i.test(item.comment ?? "")) return true;
  if (["усл", "точка", "линия", "ч", "изм"].includes(norm(item.unit))) return false;

  // Fallback — словарь ключевых слов
  if (WORK_WORDS.test(text)) return false;
  return MATERIAL_WORDS.test(text);
}

export async function fetchPriceRefs(): Promise<PriceRef[]> {
  const { data } = await supabase
    .from("price_items")
    .select("name, unit, category");
  return (data ?? []) as PriceRef[];
}

/* ── Укрупнённый перечень работ ────────────────────────────── */

const WORK_GROUPS: Array<{ label: string; re: RegExp }> = [
  { label: "Замена и монтаж электрощита.", re: /(замен|демонтаж).*щит|щит.*замен/i },
  { label: "Сборка и подключение нового электрощита.", re: /(сборк|монтаж|установк).*(щит|бокс|шкаф)/i },
  {
    label: "Установка и подключение автоматических выключателей и защитных устройств.",
    re: /(автомат|дифавтомат|узо|реле|рубильник|ограничител|защитн)/i,
  },
  { label: "Прокладка и монтаж кабельных линий.", re: /(кабель|провод|прокладк|штроб|гофр|лоток|линия)/i },
  { label: "Монтаж и подключение распределительных коробок.", re: /(распред\w*\s*короб|расключ)/i },
  { label: "Установка и подключение светильников.", re: /(светильник|люстр|светодиодн|подсветк|лампа)/i },
  { label: "Установка розеток 380 В.", re: /розетк.*380|380.*розетк|силов\w+\s+розетк/i },
  { label: "Установка розеток 220 В.", re: /розетк/i },
  { label: "Установка выключателей.", re: /выключател[ья]\s*(одно|двух|трёх|трех|клав|проходн)|клавишн/i },
  { label: "Монтаж заземления.", re: /заземлен|зазем|контур/i },
  { label: "Подключение электрооборудования.", re: /(подключен|электрооборудован|плита|бойлер|котел|котёл|станци|двигател)/i },
  {
    label: "Проверка работоспособности электроустановки и выполнение пусконаладочных работ.",
    re: /(пусконаладк|пусконаладоч|наладк|измерен|проверк|испытан)/i,
  },
];

/** Формирует укрупнённый перечень строго из фактических позиций сметы. */
export function buildWorkList(items: EstimateItem[]): string[] {
  const out: string[] = [];
  for (const g of WORK_GROUPS) {
    const hit = items.some((i) => g.re.test(`${i.name} ${i.comment ?? ""}`));
    if (hit && !out.includes(g.label)) out.push(g.label);
  }
  if (out.length === 0 && items.length > 0) {
    out.push("Комплекс электромонтажных работ на объекте.");
  }
  return out;
}

export function hasLampAlternatives(items: EstimateItem[]): boolean {
  const lamps = items.filter((i) => /светильник|люстр|лампа/i.test(i.name));
  if (lamps.length === 0) return false;
  return lamps.some((i) =>
    /альтернатив|аналог|вариант|замена модели|подбор/i.test(i.comment ?? ""),
  );
}

/* ── Суммы КП ──────────────────────────────────────────────── */

export type OfferAmounts = { works: number; materials: number; total: number };

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/**
 * Делит итог сметы (после скидки и начислений) между работами и материалами
 * пропорционально их доле в подытоге. Сумма частей всегда равна итогу.
 */
export function computeOfferAmounts(
  estimate: Estimate,
  price: PriceRef[],
): OfferAmounts {
  const totals = computeEstimateTotals(
    estimate.items,
    estimate.discount_type,
    estimate.discount_value,
    estimate.surcharges,
  );
  const sub = totals.subtotal;
  const total = totals.total;
  if (sub <= 0) return { works: 0, materials: 0, total: round2(total) };

  const matSub = estimate.items.reduce(
    (s, i) => s + (isMaterialItem(i, price) ? i.qty * i.price : 0),
    0,
  );
  const materials = round2((total * matSub) / sub);
  const works = round2(total - materials);
  return { works, materials, total: round2(total) };
}

/* ── Модель документа ──────────────────────────────────────── */

export type OfferDoc = {
  number: string;
  estimate_number: string;
  date: string;
  customer_name: string;
  object_name: string;
  intro: string;
  works: string[];
  lamps_text: string;
  show_lamps: boolean;
  term: string;
  warranty: string;
  amounts: OfferAmounts;
};

export function buildOfferDoc(estimate: Estimate, price: PriceRef[]): OfferDoc {
  return {
    number: `КП-${(estimate.number || "").replace(/^EST-/i, "") || todayISO()}`,
    estimate_number: estimate.number || "",
    date: todayISO(),
    customer_name: estimate.customer_name || "",
    object_name: estimate.object_name || estimate.address || "",
    intro: OFFER_INTRO,
    works: buildWorkList(estimate.items),
    lamps_text: OFFER_LAMPS_TEXT,
    show_lamps: hasLampAlternatives(estimate.items),
    term: estimate.work_period || OFFER_TERM,
    warranty: OFFER_WARRANTY,
    amounts: computeOfferAmounts(estimate, price),
  };
}

export function offerFileName(doc: OfferDoc, ext: string) {
  const num = (doc.number || "KP").replace(/[^\d\w-]+/g, "-");
  return `KP-${num}.${ext}`;
}

export function offerDateLabel(doc: OfferDoc) {
  return formatDate(doc.date);
}

/* ── Версии КП ─────────────────────────────────────────────── */

export type OfferRow = {
  id: string;
  estimate_id: string | null;
  number: string;
  version: number;
  snapshot: OfferDoc;
  created_at: string;
};

export async function fetchOffers(estimateId: string): Promise<OfferRow[]> {
  const { data } = await supabase
    .from("commercial_offers")
    .select("*")
    .eq("estimate_id", estimateId)
    .order("version", { ascending: false });
  return (data ?? []).map((r) => ({
    ...r,
    snapshot: r.snapshot as unknown as OfferDoc,
  })) as OfferRow[];
}

/** Фиксирует снимок КП отдельной версией — исходная смета не меняется. */
export async function releaseOffer(
  estimateId: string,
  doc: OfferDoc,
  existing: OfferRow[],
): Promise<OfferRow> {
  const version = (existing[0]?.version ?? 0) + 1;
  const snapshot = { ...doc, number: `${doc.number}-v${version}` };
  const { data, error } = await supabase
    .from("commercial_offers")
    .insert({
      estimate_id: estimateId,
      number: snapshot.number,
      version,
      snapshot: snapshot as never,
    })
    .select("*")
    .single();
  if (error) throw error;
  return { ...(data as unknown as OfferRow), snapshot };
}
