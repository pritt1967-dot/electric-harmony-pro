/** Stage 1 adapter: PanelDesign (active designer) -> Shield core input. Pure, read-only.
 * Does not change the design, the saved JSON or legacy calculations; used for side-by-side reconciliation.
 * Rails: legacy 1-based `index` / array order -> core zero-based `rail`; startModule is cumulative, 1-based.
 * Prices: legacy price_items are rubles; converted to integer kopecks, missing price stays null (not 0).
 */
import type { DeviceType } from '../shape-library/device-model';
import type { PanelDesign, PanelSpecRow } from '../panel';
import { calculateShield, type ShieldDevice, type ShieldProject } from './core';

/** Same filter as the server packer in panel.functions.ts: reserve placeholders are not devices. */
export const isReserveItem = (i: { mark: string; label: string }) =>
  /резерв|reserve|свободн/i.test(`${i.mark} ${i.label}`);

/** Fixed rail width of the server packer. */
export const LEGACY_RAIL_MODULES = 18;

export function categoryFromMark(mark: string): DeviceType {
  const m = mark.trim().toUpperCase();
  if (/^(QS|SA|ВН)/.test(m)) return 'input-switch';
  if (/^(QFD|AD|АД|ДИФ)/.test(m)) return 'rcbo';
  if (/^(QD|УЗО|RCD)/.test(m)) return 'rcd';
  if (/^(QF|АВ)/.test(m)) return 'breaker';
  if (/^(KM|КМ)/.test(m)) return 'contactor';
  if (/^(KV|KL|КV|РН|РЕЛ)/.test(m)) return 'relay';
  if (/^(FV|ОПН|УЗИП|SPD)/.test(m)) return 'spd';
  if (/^(PI|PU|WH|СЧ)/.test(m)) return 'meter';
  if (/^(XT|ХТ|КЛ)/.test(m)) return 'terminal';
  return 'other';
}

/** Rubles -> integer kopecks; null for missing/invalid/negative so unknown never becomes 0. */
export function rublesToKopecks(price: unknown): number | null {
  const n = typeof price === 'string' ? Number(price.replace(',', '.')) : price;
  if (typeof n !== 'number' || !Number.isFinite(n) || n < 0) return null;
  const k = Math.round(n * 100);
  return Number.isSafeInteger(k) ? k : null;
}

/** Price map keyed like legacy calcCost: trimmed lowercase name. */
export function buildPriceMap(rows: readonly { name: string; price: unknown }[]) {
  return new Map(rows.map(r => [r.name.trim().toLowerCase(), rublesToKopecks(r.price)] as const));
}

export function shieldProjectFromDesign(
  design: PanelDesign, opts: { id?: string; title?: string } = {},
): ShieldProject {
  const rails = design.rails ?? [];
  const devices: ShieldDevice[] = [];
  rails.forEach((rail, railIdx) => {
    let start = 1;
    (rail.items ?? []).forEach((item, pos) => {
      const modules = item.modules;
      if (!isReserveItem(item)) {
        devices.push({
          key: `${railIdx}:${pos}:${item.mark}`,
          deviceId: item.mark || `item-${railIdx}-${pos}`,
          rail: railIdx,
          startModule: start,
          modules,
          manufacturer: '',
          model: '',
          name: item.label || item.mark,
          category: categoryFromMark(item.mark),
          unitPriceKopecks: null, // rail items carry no price link; cost comes from spec rows
        });
      }
      start += Number.isFinite(modules) && modules > 0 ? modules : 0;
    });
  });
  return {
    id: opts.id ?? 'unsaved',
    title: opts.title ?? '',
    rails: Math.max(1, rails.length),
    railModules: LEGACY_RAIL_MODULES,
    devices,
  };
}

export type SpecCostKopecks = {
  totalKopecks: number | null;
  knownKopecks: number;
  /** Rows without a price match (unknown). */
  unknownRows: number;
  /** Rows priced exactly 0 — legacy calcCost counts these as missing too. */
  zeroRows: number;
  rows: { name: string; qty: number; unitKopecks: number | null; lineKopecks: number | null }[];
};

/** Kopeck-exact cost of spec + materials using the same name match and qty||1 rule as legacy calcCost. */
export function specCostKopecks(
  rows: readonly PanelSpecRow[], prices: ReadonlyMap<string, number | null>,
): SpecCostKopecks {
  let known = 0;
  let unknown = 0;
  let zero = 0;
  let overflow = false;
  const out = rows.map(r => {
    const qty = r.qty || 1;
    const unit = prices.get(r.name.trim().toLowerCase()) ?? null;
    if (unit === null) unknown += 1;
    else if (unit === 0) zero += 1;
    const line = unit === null ? null : unit * qty;
    if (line !== null) {
      if (Number.isSafeInteger(line)) known += line; else overflow = true;
    }
    return { name: r.name, qty, unitKopecks: unit, lineKopecks: line !== null && Number.isSafeInteger(line) ? line : null };
  });
  if (!Number.isSafeInteger(known)) overflow = true;
  return {
    totalKopecks: unknown === 0 && !overflow ? known : null,
    knownKopecks: overflow ? 0 : known,
    unknownRows: unknown,
    zeroRows: zero,
    rows: out,
  };
}

export type Reconciliation = {
  core: ReturnType<typeof calculateShield>;
  legacy: { usedModules: number; railUsed: number[]; costRubles: number; missing: number };
  next: { usedModules: number; railUsed: number[]; costKopecks: SpecCostKopecks };
  mismatches: string[];
};

/** Side-by-side comparison with legacy numbers (railTotal without reserve, summary.used_modules, calcCost). */
export function reconcileDesign(
  design: PanelDesign, priceRows: readonly { name: string; price: unknown }[] = [],
): Reconciliation {
  const project = shieldProjectFromDesign(design);
  const core = calculateShield(project);
  const legacyRailUsed = (design.rails ?? []).map(r =>
    (r.items ?? []).filter(i => !isReserveItem(i)).reduce((s, i) => s + (i.modules || 0), 0));
  const specRows = [...(design.spec ?? []), ...(design.materials ?? [])];
  // Legacy calcCost semantics, reproduced verbatim for comparison.
  const legacyMap = new Map(priceRows.map(p => [p.name.trim().toLowerCase(), Number(p.price) || 0]));
  let legacyTotal = 0;
  let legacyMissing = 0;
  specRows.forEach(r => {
    const price = legacyMap.get(r.name.trim().toLowerCase());
    if (price === undefined || price === 0) legacyMissing += 1;
    legacyTotal += (price ?? 0) * (r.qty || 1);
  });
  const cost = specCostKopecks(specRows, buildPriceMap(priceRows));
  const nextRailUsed = core.rails.map(r => r.usedModules);
  const mismatches: string[] = [];
  const legacyUsed = design.summary?.used_modules ?? legacyRailUsed.reduce((a, b) => a + b, 0);
  if (core.usedModules !== legacyUsed) mismatches.push(`used: legacy ${legacyUsed}, core ${core.usedModules}`);
  if (JSON.stringify(nextRailUsed) !== JSON.stringify(legacyRailUsed))
    mismatches.push(`rails: legacy ${legacyRailUsed.join('/')}, core ${nextRailUsed.join('/')}`);
  if (Math.round(legacyTotal) * 100 !== Math.round(cost.knownKopecks / 100) * 100)
    mismatches.push(`cost: legacy ${Math.round(legacyTotal)} ₽, core ${(cost.knownKopecks / 100).toFixed(2)} ₽`);
  if (legacyMissing !== cost.unknownRows + cost.zeroRows)
    mismatches.push(`missing: legacy ${legacyMissing}, core ${cost.unknownRows}+${cost.zeroRows}`);
  for (const i of core.issues) if (i.code !== 'price') mismatches.push(`core issue ${i.code}: ${i.deviceKeys.join(',')}`);
  return {
    core,
    legacy: { usedModules: legacyUsed, railUsed: legacyRailUsed, costRubles: Math.round(legacyTotal), missing: legacyMissing },
    next: { usedModules: core.usedModules, railUsed: nextRailUsed, costKopecks: cost },
    mismatches,
  };
}
