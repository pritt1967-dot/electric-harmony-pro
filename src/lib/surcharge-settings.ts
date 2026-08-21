import { supabase } from "@/integrations/supabase/client";
import {
  SURCHARGE_KEYS,
  SURCHARGE_META,
  type SurchargeKey,
} from "@/lib/estimates";

/**
 * Единый источник процентов по умолчанию: существующая таблица настроек
 * site_content (key/value). Новые сметы берут значения отсюда, уже созданные
 * хранят собственные зафиксированные проценты.
 */
export async function fetchSurchargePercents(): Promise<
  Record<SurchargeKey, number>
> {
  const keys = SURCHARGE_KEYS.map((k) => SURCHARGE_META[k].settingKey);
  const { data } = await supabase
    .from("site_content")
    .select("key, value")
    .in("key", keys);

  const map = new Map((data ?? []).map((r) => [r.key, r.value]));
  const out = {} as Record<SurchargeKey, number>;
  for (const key of SURCHARGE_KEYS) {
    const raw = map.get(SURCHARGE_META[key].settingKey);
    const num = Number(String(raw ?? "").replace(",", "."));
    out[key] = Number.isFinite(num) && raw ? num : SURCHARGE_META[key].defaultPercent;
  }
  return out;
}
