export type EstimateItem = {
  id: string;
  name: string;
  unit: string;
  qty: number;
  price: number;
  comment?: string;
  /** Работа выполняется на высоте от 3 м */
  at_height?: boolean;
  /** Позиция требует пусконаладочных работ */
  commissioning?: boolean;
};

export type DiscountType = "percent" | "fixed";

export type EstimateStatus = "draft" | "sent" | "approved" | "done";

/** Дополнительные начисления в процентах. */
export type SurchargeKey = "transport" | "height" | "commissioning";

export type SurchargeState = { enabled: boolean; percent: number };

export type Surcharges = Record<SurchargeKey, SurchargeState>;

export const SURCHARGE_KEYS: SurchargeKey[] = [
  "transport",
  "height",
  "commissioning",
];

export const SURCHARGE_META: Record<
  SurchargeKey,
  { label: string; hint: string; settingKey: string; defaultPercent: number }
> = {
  transport: {
    label: "Транспортные расходы",
    hint: "Процент от общей стоимости работ",
    settingKey: "surcharge_transport_percent",
    defaultPercent: 5,
  },
  height: {
    label: "Работы на высоте от 3 м",
    hint: "Процент от позиций, отмеченных как высотные",
    settingKey: "surcharge_height_percent",
    defaultPercent: 20,
  },
  commissioning: {
    label: "Пусконаладочные работы",
    hint: "Процент от позиций, требующих пусконаладки",
    settingKey: "surcharge_commissioning_percent",
    defaultPercent: 10,
  },
};

export function defaultSurcharges(
  percents?: Partial<Record<SurchargeKey, number>>,
): Surcharges {
  return {
    transport: {
      enabled: false,
      percent: percents?.transport ?? SURCHARGE_META.transport.defaultPercent,
    },
    height: {
      enabled: false,
      percent: percents?.height ?? SURCHARGE_META.height.defaultPercent,
    },
    commissioning: {
      enabled: false,
      percent:
        percents?.commissioning ?? SURCHARGE_META.commissioning.defaultPercent,
    },
  };
}

export type Estimate = {
  id?: string;
  number: string;
  doc_date: string;
  customer_name: string;
  address: string;
  object_name: string;
  phone: string;
  email: string;
  work_period: string;
  valid_until: string;
  note: string;
  discount_type: DiscountType;
  discount_value: number;
  status: EstimateStatus;
  total: number;
  items: EstimateItem[];
  /** Фактические проценты и флаги, зафиксированные в момент создания сметы. */
  surcharges?: Surcharges;
  /** Внутреннее увеличение — только для администратора. */
  markup?: Markup;
  version?: number;
  public_token?: string;
  approved_at?: string | null;
  approved_by_name?: string;
};

export const STATUS_LABEL: Record<EstimateStatus, string> = {
  draft: "Черновик",
  sent: "Отправлена",
  approved: "Согласована",
  done: "Выполнена",
};


export const UNITS = ["шт", "м", "м²", "компл", "точка", "линия", "изм", "усл", "ч"];


export function lineTotal(item: EstimateItem) {
  return Math.round(item.qty * item.price * 100) / 100;
}

export function subtotal(items: EstimateItem[]) {
  return Math.round(items.reduce((s, i) => s + lineTotal(i), 0) * 100) / 100;
}

export function discountAmount(
  items: EstimateItem[],
  type: DiscountType,
  value: number,
) {
  const sub = subtotal(items);
  const raw = type === "percent" ? (sub * (value || 0)) / 100 : value || 0;
  return Math.round(Math.min(Math.max(raw, 0), sub) * 100) / 100;
}

export function grandTotal(
  items: EstimateItem[],
  type: DiscountType,
  value: number,
) {
  return Math.round((subtotal(items) - discountAmount(items, type, value)) * 100) / 100;
}

export function money(n: number) {
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n || 0);
}

export function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ru-RU");
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** EST-2026-00125 — tolerant of the legacy "001/2026" numbering. */
export function nextNumber(existing: string[]) {
  const year = new Date().getFullYear();
  const nums = existing
    .map((n) => {
      const t = n.trim();
      const modern = /^EST-\d{4}-(\d+)$/i.exec(t);
      if (modern) return Number(modern[1]);
      const legacy = /^(\d+)\//.exec(t);
      return legacy ? Number(legacy[1]) : 0;
    })
    .filter((n) => Number.isFinite(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `EST-${year}-${String(next).padStart(5, "0")}`;
}

export function emptyEstimate(number: string): Estimate {
  return {
    number,
    doc_date: todayISO(),
    customer_name: "",
    address: "",
    object_name: "",
    phone: "",
    email: "",
    work_period: "",
    valid_until: "",
    note: "",
    discount_type: "percent",
    discount_value: 0,
    status: "draft",
    total: 0,
    items: [],
    version: 1,
  };
}

export const FOOTER_LINES = [
  "S&M Electric",
  "Электромонтаж любой сложности",
  "Монтаж электрических щитов",
  "Монтаж заземления",
  "Электроизмерения",
  "Гарантия на выполненные работы",
];

/* ── Дополнительные начисления ─────────────────────────────── */

const SURCHARGE_META_MARK = "__sm_surcharges__";

/** Внутреннее увеличение цен (видит только администратор). */
export type Markup = { percent: number; fixed: number };

export function emptyMarkup(): Markup {
  return { percent: 0, fixed: 0 };
}

type SurchargeMetaRecord = {
  id: string;
  __meta: string;
  surcharges?: Surcharges;
  markup?: Markup;
  base?: { id: string; price: number }[];
  /** Height/commissioning are already included in saved item prices. */
  itemSurchargesApplied?: boolean;
};

function isSurchargeMeta(row: unknown): row is SurchargeMetaRecord {
  return (
    !!row &&
    typeof row === "object" &&
    (row as { __meta?: string }).__meta === SURCHARGE_META_MARK
  );
}

/**
 * Сметы хранятся в существующей колонке `items` (jsonb) — новых таблиц и
 * колонок не создаём. Настройки начислений кладём отдельной служебной
 * записью в конец массива.
 */
export function packItems(
  items: EstimateItem[],
  surcharges?: Surcharges,
  markup?: Markup,
  baseItems?: EstimateItem[],
): unknown[] {
  const clean = items.filter((i) => !isSurchargeMeta(i));
  const hasMarkup = Boolean(markup && (markup.percent || markup.fixed));
  if (!surcharges && !hasMarkup) return clean;
  return [
    ...clean,
    {
      id: SURCHARGE_META_MARK,
      __meta: SURCHARGE_META_MARK,
      ...(surcharges ? { surcharges } : {}),
      ...(hasMarkup ? { markup } : {}),
      ...(hasMarkup && baseItems
        ? { base: baseItems.map((i) => ({ id: i.id, price: i.price })) }
        : {}),
      itemSurchargesApplied: true,
    },
  ];
}

export function unpackItems(raw: unknown): {
  /** Итоговые цены — именно их видит заказчик. */
  items: EstimateItem[];
  surcharges?: Surcharges;
  markup: Markup;
  /** Цены до внутреннего увеличения (для редактора). */
  baseItems: EstimateItem[];
} {
  const arr = Array.isArray(raw) ? raw : [];
  const meta = arr.find(isSurchargeMeta);
  const storedItems = arr.filter((r) => !isSurchargeMeta(r)) as EstimateItem[];

  const markup: Markup = {
    percent: Number(meta?.markup?.percent) || 0,
    fixed: Number(meta?.markup?.fixed) || 0,
  };
  const baseMap = new Map(
    (meta?.base ?? []).map((b) => [b.id, Number(b.price) || 0] as const),
  );
  const baseItems = storedItems.map((i) =>
    baseMap.has(i.id) ? { ...i, price: baseMap.get(i.id)! } : { ...i },
  );

  const s = meta?.surcharges;
  if (!s) return { items: storedItems, markup, baseItems };
  const merged = defaultSurcharges();
  for (const key of SURCHARGE_KEYS) {
    if (s[key]) {
      merged[key] = {
        enabled: Boolean(s[key].enabled),
        percent: Number(s[key].percent) || 0,
      };
    }
  }
  // Compatibility for estimates saved before selective charges were folded
  // into item prices: expose corrected final prices to customer-facing readers.
  const items = meta?.itemSurchargesApplied
    ? storedItems
    : applyItemSurcharges(storedItems, merged);
  return { items, surcharges: merged, markup, baseItems };
}

/**
 * Применяет внутреннее увеличение к позициям: сначала процент к цене каждой
 * позиции, затем фиксированная сумма — пропорционально уже увеличенным
 * стоимостям. Остаток округления добавляется к самой крупной позиции, чтобы
 * сумма позиций точно совпадала с итогом.
 */
export function applyMarkup(items: EstimateItem[], markup?: Markup): EstimateItem[] {
  const percent = Number(markup?.percent) || 0;
  const fixed = Number(markup?.fixed) || 0;
  if (!percent && !fixed) return items;

  const stage1 = items.map((i) => ({
    ...i,
    price: Math.round(i.price * (1 + percent / 100) * 100) / 100,
  }));
  if (!fixed) return stage1;

  const sum1 = subtotal(stage1);
  if (sum1 <= 0) return stage1;

  const k = (sum1 + fixed) / sum1;
  const scaled = stage1.map((i) => ({
    ...i,
    price: Math.round(i.price * k * 100) / 100,
  }));

  const target = round2(sum1 + fixed);
  const delta = round2(target - subtotal(scaled));
  if (delta) {
    let idx = -1;
    let max = 0;
    scaled.forEach((i, n) => {
      const t = lineTotal(i);
      if (t > max && i.qty) {
        max = t;
        idx = n;
      }
    });
    if (idx >= 0) {
      const item = scaled[idx]!;
      const lineTarget = round2(lineTotal(item) + delta);
      scaled[idx] = {
        ...item,
        price: Math.round((lineTarget / item.qty) * 1e6) / 1e6,
      };
    }
  }
  return scaled;
}

/**
 * Folds selective height and commissioning charges into the marked items.
 * Stages are deliberately sequential, so an item with both flags receives
 * height first and commissioning second. No customer-visible charge row is
 * produced; the returned unit prices are the final prices.
 */
export function applyItemSurcharges(
  items: EstimateItem[],
  surcharges?: Surcharges,
): EstimateItem[] {
  let result = items.map((item) => ({ ...item }));

  const stages: Array<{
    key: "height" | "commissioning";
    selected: (item: EstimateItem) => boolean;
  }> = [
    { key: "height", selected: (item) => Boolean(item.at_height) },
    { key: "commissioning", selected: (item) => Boolean(item.commissioning) },
  ];

  for (const stage of stages) {
    const setting = surcharges?.[stage.key];
    const percent = Number(setting?.percent) || 0;
    if (!setting?.enabled || percent === 0) continue;

    const selectedIndexes = result
      .map((item, index) => (stage.selected(item) && item.qty ? index : -1))
      .filter((index) => index >= 0);
    if (selectedIndexes.length === 0) continue;

    const base = round2(
      selectedIndexes.reduce((sum, index) => sum + lineTotal(result[index]), 0),
    );
    const target = round2(base * (1 + percent / 100));

    result = result.map((item, index) =>
      selectedIndexes.includes(index)
        ? { ...item, price: round2(item.price * (1 + percent / 100)) }
        : item,
    );

    const actual = round2(
      selectedIndexes.reduce((sum, index) => sum + lineTotal(result[index]), 0),
    );
    const delta = round2(target - actual);
    if (delta) {
      const largestIndex = selectedIndexes.reduce((largest, index) =>
        lineTotal(result[index]) > lineTotal(result[largest]) ? index : largest,
      );
      const item = result[largestIndex];
      if (item?.qty) {
        const correctedLine = round2(lineTotal(item) + delta);
        result[largestIndex] = {
          ...item,
          price: Math.round((correctedLine / item.qty) * 1e6) / 1e6,
        };
      }
    }
  }

  return result;
}

export type SurchargeLine = {
  key: SurchargeKey;
  label: string;
  percent: number;
  base: number;
  amount: number;
};

export type EstimateTotals = {
  subtotal: number;
  discount: number;
  surchargeLines: SurchargeLine[];
  surchargeTotal: number;
  total: number;
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function surchargeBase(items: EstimateItem[], key: SurchargeKey) {
  if (key === "transport") return subtotal(items);
  const flag: keyof EstimateItem = key === "height" ? "at_height" : "commissioning";
  return round2(
    items.filter((i) => i[flag]).reduce((s, i) => s + lineTotal(i), 0),
  );
}

export function computeEstimateTotals(
  items: EstimateItem[],
  discountType: DiscountType,
  discountValue: number,
  surcharges?: Surcharges,
): EstimateTotals {
  const sub = subtotal(items);
  const disc = discountAmount(items, discountType, discountValue);
  const lines: SurchargeLine[] = [];
  for (const key of SURCHARGE_KEYS) {
    // Selective charges are already folded into the affected item prices.
    // Transport remains a separate, customer-visible charge as before.
    if (key === "height" || key === "commissioning") continue;
    const s = surcharges?.[key];
    if (!s?.enabled) continue;
    const percent = Number(s.percent) || 0;
    const base = surchargeBase(items, key);
    const amount = round2((base * percent) / 100);
    if (!amount) continue;
    lines.push({ key, label: SURCHARGE_META[key].label, percent, base, amount });
  }
  const surchargeTotal = round2(lines.reduce((s, l) => s + l.amount, 0));
  return {
    subtotal: sub,
    discount: disc,
    surchargeLines: lines,
    surchargeTotal,
    total: round2(sub - disc + surchargeTotal),
  };
}
