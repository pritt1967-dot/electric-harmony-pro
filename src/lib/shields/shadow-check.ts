/** Shadow check (stages 2–4): runs beside the legacy designer, never shown in UI, never changes the design.
 * Verifies equipment composition, quantity, width and DIN placement only.
 * - Enclosure rows (spec names starting with корпус/бокс/шкаф/щит) are not devices; rail items are never enclosures.
 * - PE/N buses, terminals and similar are auxiliary, checked separately from devices.
 * - Rail width only from explicit enclosure configuration ("N рейки по M мод."); otherwise unknown (no guess, no verdict).
 * - Reserve placeholders are free space; a "reserve" line that carries a breaker rating or a design line is a real device.
 * - Devices are matched by type + poles + curve/rating, never by mark; duplicate marks are a separate marking warning.
 * - The price list holds installation WORKS only: equipment cost is "not-calculated" (never 0).
 */
import type { PanelDesign } from '../panel';
import { calculateShield } from './core';
import { isReserveItem, shieldProjectFromDesign } from './from-panel-design';

export type ItemKind = 'enclosure' | 'auxiliary' | 'device';
export type DeviceCategory =
  'breaker' | 'rcd' | 'rcbo' | 'ats' | 'relay' | 'contactor' | 'meter' | 'spd' | 'other';

const ENCLOSURE_RE = /^(корпус|бокс|шкаф|щит)/i;
const AUX_RE = /(^|[\s_(-])(шин[аыуе]?|n-шин[а-яё]*|pe-шин[а-яё]*)(?=$|[\s_,.)])|клемм|кросс-?модул|гребенк|гребёнк|din-?рейк|заглушк|маркиров|наконечник|^xt|^хт/i;

/** Classify a spec row (enclosure possible) or, with onRail, a rail item (never enclosure). */
export function itemKind(text: string, onRail = false): ItemKind {
  const t = text.trim();
  if (AUX_RE.test(t)) return 'auxiliary';
  if (!onRail && ENCLOSURE_RE.test(t)) return 'enclosure';
  return 'device';
}

function categoryFromText(text: string): DeviceCategory | null {
  const t = text.toLowerCase();
  if (/узо|защитного отключения|выключатель дифференц/.test(t)) return 'rcd';
  if (/дифавтомат|дифференциальный автомат|авдт|(^|\s)диф(\s|$)/.test(t)) return 'rcbo';
  if (/(^|\s)авр|(^|\s)ats/.test(t)) return 'ats';
  if (/реле/.test(t)) return 'relay';
  if (/контактор|пускател/.test(t)) return 'contactor';
  if (/счётчик|счетчик/.test(t)) return 'meter';
  if (/узип|опн/.test(t)) return 'spd';
  if (/автомат|выключатель|(^|\s)ввод/.test(t)) return 'breaker';
  return null;
}

function categoryFromMark(mark: string): DeviceCategory {
  const m = mark.trim().toUpperCase();
  if (/^(ATS|АВР)/.test(m)) return 'ats';
  if (/^(QFD|VD|AD|АД)/.test(m)) return 'rcbo';
  if (/^(QD|УЗО)/.test(m)) return 'rcd';
  if (/^(QF|QS|SA|АВ)/.test(m)) return 'breaker';
  if (/^(KM|КМ)/.test(m)) return 'contactor';
  if (/^(KV|KL|РН)/.test(m)) return 'relay';
  if (/^(FV|УЗИП|SPD)/.test(m)) return 'spd';
  if (/^(PI|PU|WH|СЧ)/.test(m)) return 'meter';
  return 'other';
}

/** Breaker identity "1P C16"; null parts stay unknown. */
function breakerKey(text: string, polesHint: number | null): string {
  const t = text.replace(/А/g, 'A').replace(/С(?=\d)/g, 'C').replace(/В(?=\d)/g, 'B');
  const poles = /(\d)\s*P/i.exec(t)?.[1] ?? (polesHint ? String(polesHint) : '?');
  const cr = /\b([BCD])\s?(\d{1,3})\b/.exec(t);
  const rating = cr ? cr[2] : /(\d{1,3})\s*A\b/.exec(t)?.[1] ?? '?';
  const curve = cr ? cr[1] : /\(([BCD])\)/.exec(t)?.[1] ?? '?';
  return `${poles}P ${curve}${rating}`;
}

export type RailWidth = { modules: number | null; source: 'enclosure-text' | 'unknown' };

export function railWidthFor(design: PanelDesign): RailWidth {
  const m = /(\d+)\s*рейк[а-яё]*\s*по\s*(\d+)/i.exec(design.summary?.enclosure ?? '');
  if (m && Number(m[2]) > 0) return { modules: Number(m[2]), source: 'enclosure-text' };
  return { modules: null, source: 'unknown' };
}

export type ShadowEquipmentRow = { name: string; qty: number; modulesEach: number; modulesTotal: number; kind: ItemKind };
export type DeviceRow = { key: string; category: DeviceCategory; modules: number; spec: number; rails: number; diff: number; railMarks: string[] };

export type ShadowCheck = {
  equipment: ShadowEquipmentRow[];
  railWidth: RailWidth;
  rails: { rail: number; usedModules: number; reserveModules: number; capacity: number | null; overflow: number | null }[];
  railDevices: number;
  railModules: number;
  specDevices: number;
  specModules: number;
  enclosureModules: number;
  freeModules: number;
  /** Line-by-line device table: type+poles+rating+width, spec qty vs placed qty. */
  deviceRows: DeviceRow[];
  duplicateMarks: { mark: string; items: { label: string; modules: number; rail: number }[] }[];
  reserveDevices: { mark: string; label: string; rail: number }[];
  /** Rated reserve devices placed on rails whose type/rating row has more on rails than in the spec. */
  reserveNotInSpec: { mark: string; label: string; rail: number; key: string }[];
  auxiliary: { spec: { name: string; qty: number }[]; rails: { mark: string; label: string }[]; missingInSpec: string[] };
  placementIssues: { code: string; deviceKeys: string[] }[];
  mismatches: string[];
  equipmentCost: { status: 'not-calculated' };
};

const pos = (n: unknown) => (typeof n === 'number' && Number.isFinite(n) && n > 0 ? n : 0);

export function shadowCheckDesign(design: PanelDesign): ShadowCheck {
  const width = railWidthFor(design);
  const railsIn = design.rails ?? [];
  const lineMarks = new Map<string, number>();
  for (const l of design.lines ?? []) lineMarks.set(l.mark, (lineMarks.get(l.mark) ?? 0) + 1);
  const lineByMark = new Map((design.lines ?? []).map(l => [l.mark, l] as const));

  // A reserve-labelled item is a real device when it carries a rating or has its own design line.
  const isPlaceholder = (i: { mark: string; label: string }) =>
    isReserveItem(i) && !/\b[BCD]\s?\d{1,3}\b/.test(i.label) && !lineByMark.has(i.mark);

  const all = railsIn.flatMap((r, rail) => (r.items ?? []).map(i => ({ ...i, rail })));
  const placed = all.filter(i => !isPlaceholder(i)).map(i => ({ ...i, kind: itemKind(`${i.mark.replace(/_/g, ' ')} ${i.label}`, true) }));
  const reserveDevices = placed.filter(i => isReserveItem(i)).map(i => ({ mark: i.mark, label: i.label, rail: i.rail + 1 }));
  const devicesPlaced = placed.filter(i => i.kind === 'device');
  const auxPlaced = placed.filter(i => i.kind === 'auxiliary');

  const rails = railsIn.map((r, rail) => {
    const items = r.items ?? [];
    const used = items.filter(i => !isPlaceholder(i)).reduce((s, i) => s + pos(i.modules), 0);
    const reserve = items.filter(isPlaceholder).reduce((s, i) => s + pos(i.modules), 0);
    const cap = width.modules;
    return { rail: rail + 1, usedModules: used, reserveModules: reserve, capacity: cap,
      overflow: cap === null ? null : Math.max(0, used + reserve - cap) };
  });

  const map = new Map<string, ShadowEquipmentRow>();
  for (const r of design.spec ?? []) {
    const name = r.name.trim();
    const qty = pos(r.qty);
    const each = pos(r.modules);
    const key = name.toLowerCase();
    const row = map.get(key) ?? { name, qty: 0, modulesEach: each, modulesTotal: 0, kind: itemKind(name) };
    row.qty += qty;
    row.modulesTotal += qty * each;
    map.set(key, row);
  }
  const equipment = [...map.values()];
  const specDev = equipment.filter(e => e.kind === 'device' && e.modulesEach > 0);
  const specDevices = specDev.reduce((s, e) => s + e.qty, 0);
  const specModules = specDev.reduce((s, e) => s + e.modulesTotal, 0);
  const railModules = devicesPlaced.reduce((s, i) => s + pos(i.modules), 0);

  const rows = new Map<string, DeviceRow>();
  const row = (category: DeviceCategory, ident: string, modules: number) => {
    const key = `${category} ${ident} ${modules}m`;
    if (!rows.has(key)) rows.set(key, { key, category, modules, spec: 0, rails: 0, diff: 0, railMarks: [] });
    return rows.get(key)!;
  };
  for (const e of specDev) {
    const c = categoryFromText(e.name) ?? 'other';
    row(c, c === 'breaker' ? breakerKey(`${e.name}`, null) : '', e.modulesEach).spec += e.qty;
  }
  for (const i of devicesPlaced) {
    const c = categoryFromText(i.label) ?? categoryFromMark(i.mark);
    const unique = lineMarks.get(i.mark) === 1 && !/ввод/i.test(i.label);
    const line = unique ? lineByMark.get(i.mark) : undefined;
    const ident = c === 'breaker'
      ? breakerKey(`${i.label} ${line?.breaker ?? ''}`, line ? pos(Number(line.poles)) || null : pos(i.modules) || null)
      : '';
    const r = row(c, ident, pos(i.modules));
    r.rails += 1;
    r.railMarks.push(`${i.mark}@R${i.rail + 1}`);
  }
  // Insufficient data: when a breaker rating is unknown on either side for some poles+width,
  // compare that whole poles+width group by count only instead of reporting false rating mismatches.
  for (const r of [...rows.values()]) {
    const m = /^breaker (\d|\?)P \?\? (\d+)m$/.exec(r.key);
    if (!m) continue;
    const group = [...rows.values()].filter(x => x.category === 'breaker' && x.modules === r.modules && x.key.startsWith(`breaker ${m[1]}P `));
    const merged: DeviceRow = { key: `breaker ${m[1]}P (номинал не указан) ${r.modules}m`, category: 'breaker', modules: r.modules, spec: 0, rails: 0, diff: 0, railMarks: [] };
    for (const g of group) { merged.spec += g.spec; merged.rails += g.rails; merged.railMarks.push(...g.railMarks); rows.delete(g.key); }
    rows.set(merged.key, merged);
  }
  const deviceRows = [...rows.values()].map(r => ({ ...r, diff: r.rails - r.spec }))
    .sort((a, b) => a.key.localeCompare(b.key));

  const marks = new Map<string, { label: string; modules: number; rail: number }[]>();
  for (const i of placed) {
    const list = marks.get(i.mark) ?? [];
    list.push({ label: i.label, modules: i.modules, rail: i.rail + 1 });
    marks.set(i.mark, list);
  }
  const duplicateMarks = [...marks].filter(([, l]) => l.length > 1).map(([mark, items]) => ({ mark, items }));

  const auxSpec = equipment.filter(e => e.kind === 'auxiliary').map(e => ({ name: e.name, qty: e.qty }));
  const busKey = (t: string) => (/(^|[^a-z])pe([^a-z]|$)|защитн|заземл/i.test(t) ? 'pe' : /(^|[^a-z])n([^a-z]|$)|нулев|нейтрал/i.test(t) ? 'n' : null);
  const missingInSpec = auxPlaced
    .filter(a => {
      const k = busKey(`${a.mark.replace(/_/g, ' ')} ${a.label}`);
      return k ? !auxSpec.some(s => busKey(s.name) === k) : auxSpec.length === 0;
    })
    .map(a => a.mark || a.label);

  const coreWidth = width.modules ?? Math.max(1, ...rails.map(r => r.usedModules + r.reserveModules));
  const core = calculateShield({ ...shieldProjectFromDesign(design), railModules: coreWidth });
  const placementIssues = core.issues
    .filter(i => i.code !== 'price' && !(width.modules === null && i.code === 'bounds'))
    .map(i => ({ code: i.code, deviceKeys: [...i.deviceKeys] }));

  const enclosureModules = design.summary?.enclosure_modules ?? 0;
  const mismatches: string[] = [];
  if (specDevices !== devicesPlaced.length) mismatches.push(`qty: spec ${specDevices}, rails ${devicesPlaced.length}`);
  if (specModules !== railModules) mismatches.push(`width: spec ${specModules}, rails ${railModules}`);
  if (width.modules === null) mismatches.push('rail width unknown: enclosure has no rail configuration');
  for (const r of rails) if (r.overflow) mismatches.push(`rail ${r.rail}: ${r.usedModules}+${r.reserveModules} reserve > ${r.capacity} (+${r.overflow})`);
  for (const r of deviceRows) if (r.diff !== 0) mismatches.push(`device ${r.key}: spec ${r.spec}, rails ${r.rails}`);
  const reserveNotInSpec = reserveDevices.flatMap(rd => {
    const r = deviceRows.find(x => x.railMarks.includes(`${rd.mark}@R${rd.rail}`));
    return r && r.diff > 0 ? [{ ...rd, key: r.key }] : [];
  });
  for (const rd of reserveNotInSpec) mismatches.push(`reserve device not in spec: ${rd.mark} (${rd.key})`);
  for (const d of duplicateMarks) mismatches.push(`duplicate mark ${d.mark}`);
  for (const a of missingInSpec) mismatches.push(`auxiliary not in spec: ${a}`);
  for (const i of placed) if (!pos(i.modules)) mismatches.push(`bad width: ${i.mark}`);

  return {
    equipment, railWidth: width, rails,
    railDevices: devicesPlaced.length, railModules, specDevices, specModules, enclosureModules,
    freeModules: Math.max(0, enclosureModules - railModules - auxPlaced.reduce((s, a) => s + pos(a.modules), 0)),
    deviceRows, duplicateMarks, reserveDevices, reserveNotInSpec,
    auxiliary: { spec: auxSpec, rails: auxPlaced.map(a => ({ mark: a.mark, label: a.label })), missingInSpec },
    placementIssues, mismatches, equipmentCost: { status: 'not-calculated' },
  };
}
