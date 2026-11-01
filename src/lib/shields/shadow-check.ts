/** Shadow check (stages 2–3): runs beside the legacy designer, never shown in UI, never changes the design.
 * Verifies equipment composition, quantity, width and DIN placement only.
 * - Enclosure rows are not devices and never occupy DIN width.
 * - PE/N buses, terminals and similar are auxiliary: counted and checked separately from devices.
 * - Rail width comes from the enclosure ("N рейки по M мод.") or enclosure_modules / rail count; 18 only as last resort.
 * - The SM Electric price list holds installation WORKS only: equipment is never matched to it,
 *   equipment cost is "not-calculated" (never 0); works cost stays in the existing mechanism.
 */
import type { PanelDesign } from '../panel';
import { calculateShield } from './core';
import { isReserveItem, LEGACY_RAIL_MODULES, shieldProjectFromDesign } from './from-panel-design';

export type ItemKind = 'enclosure' | 'auxiliary' | 'device';
export type DeviceCategory =
  'breaker' | 'rcd' | 'rcbo' | 'ats' | 'relay' | 'contactor' | 'meter' | 'spd' | 'other';

const ENCLOSURE_RE = /корпус|бокс|шкаф|щит\s+(навесн|встраив|настенн|пластик|металл)/i;
const AUX_RE = /(^|[\s_(-])(шин[аыуе]?|n-шин|pe-шин)(?=$|[\s_,.)])|(^|[\s_-])(pe|n)-шин|клемм|кросс-?модул|гребенк|гребёнк|din-?рейк|заглушк|маркиров|^xt|^хт/i;

export function itemKind(text: string): ItemKind {
  const t = text.trim();
  if (AUX_RE.test(t)) return 'auxiliary';
  if (ENCLOSURE_RE.test(t)) return 'enclosure';
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

function categoryFromMarkLocal(mark: string): DeviceCategory {
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

export type RailWidth = { modules: number; source: 'enclosure-text' | 'enclosure-split' | 'legacy-18' };

export function railWidthFor(design: PanelDesign): RailWidth {
  const text = design.summary?.enclosure ?? '';
  const m = /(\d+)\s*рейк[а-яё]*\s*по\s*(\d+)/i.exec(text);
  if (m && Number(m[2]) > 0) return { modules: Number(m[2]), source: 'enclosure-text' };
  const em = design.summary?.enclosure_modules ?? 0;
  const n = (design.rails ?? []).length;
  if (em > 0 && n > 0 && em % n === 0) return { modules: em / n, source: 'enclosure-split' };
  return { modules: LEGACY_RAIL_MODULES, source: 'legacy-18' };
}

export type ShadowEquipmentRow = { name: string; qty: number; modulesEach: number; modulesTotal: number; kind: ItemKind };

export type ShadowCheck = {
  equipment: ShadowEquipmentRow[];
  railWidth: RailWidth;
  rails: { rail: number; usedModules: number; capacity: number; overflow: number }[];
  railDevices: number;
  railModules: number;
  specDevices: number;
  specModules: number;
  enclosureModules: number;
  freeModules: number;
  /** Per category: spec widths vs placed widths, as sorted lists (qty expanded). */
  widthMismatches: { category: DeviceCategory; spec: number[]; rails: number[] }[];
  duplicateMarks: { mark: string; items: { label: string; modules: number; rail: number }[] }[];
  auxiliary: { spec: { name: string; qty: number }[]; rails: { mark: string; label: string }[]; missingInSpec: string[] };
  placementIssues: { code: string; deviceKeys: string[] }[];
  mismatches: string[];
  equipmentCost: { status: 'not-calculated' };
};

const pos = (n: unknown) => (typeof n === 'number' && Number.isFinite(n) && n > 0 ? n : 0);

export function shadowCheckDesign(design: PanelDesign): ShadowCheck {
  const width = railWidthFor(design);
  const railsIn = design.rails ?? [];
  const placed = railsIn.flatMap((r, rail) =>
    (r.items ?? []).filter(i => !isReserveItem(i)).map(i => ({ ...i, rail, kind: itemKind(`${i.mark} ${i.label}`) })));
  const devicesPlaced = placed.filter(i => i.kind === 'device');
  const auxPlaced = placed.filter(i => i.kind === 'auxiliary');

  const rails = railsIn.map((r, rail) => {
    const used = (r.items ?? []).filter(i => !isReserveItem(i)).reduce((s, i) => s + pos(i.modules), 0);
    return { rail: rail + 1, usedModules: used, capacity: width.modules, overflow: Math.max(0, used - width.modules) };
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
  const specDevicesRows = equipment.filter(e => e.kind === 'device' && e.modulesEach > 0);
  const specDevices = specDevicesRows.reduce((s, e) => s + e.qty, 0);
  const specModules = specDevicesRows.reduce((s, e) => s + e.modulesTotal, 0);
  const railModules = devicesPlaced.reduce((s, i) => s + pos(i.modules), 0);

  const byCat = new Map<DeviceCategory, { spec: number[]; rails: number[] }>();
  const bucket = (c: DeviceCategory) => byCat.get(c) ?? (byCat.set(c, { spec: [], rails: [] }), byCat.get(c)!);
  for (const e of specDevicesRows) {
    const c = categoryFromText(e.name) ?? 'other';
    for (let k = 0; k < e.qty; k++) bucket(c).spec.push(e.modulesEach);
  }
  for (const i of devicesPlaced) {
    const c = categoryFromText(i.label) ?? categoryFromMarkLocal(i.mark);
    bucket(c).rails.push(pos(i.modules));
  }
  const widthMismatches = [...byCat].map(([category, v]) => ({
    category, spec: [...v.spec].sort((a, b) => b - a), rails: [...v.rails].sort((a, b) => b - a),
  })).filter(v => JSON.stringify(v.spec) !== JSON.stringify(v.rails));

  const marks = new Map<string, { label: string; modules: number; rail: number }[]>();
  for (const i of placed) {
    const list = marks.get(i.mark) ?? [];
    list.push({ label: i.label, modules: i.modules, rail: i.rail + 1 });
    marks.set(i.mark, list);
  }
  const duplicateMarks = [...marks].filter(([, l]) => l.length > 1).map(([mark, items]) => ({ mark, items }));

  const auxSpec = equipment.filter(e => e.kind === 'auxiliary').map(e => ({ name: e.name, qty: e.qty }));
  const auxSpecText = auxSpec.map(a => a.name.toLowerCase()).join(' | ');
  const busKey = (t: string) => (/(^|[^a-z])pe([^a-z]|$)|защитн|заземл/i.test(t) ? 'pe' : /(^|[^a-z])n([^a-z]|$)|нулев|нейтрал/i.test(t) ? 'n' : null);
  const missingInSpec = auxPlaced
    .filter(a => {
      const k = busKey(`${a.mark.replace(/_/g, ' ')} ${a.label}`);
      if (!k) return !auxSpecText;
      return !auxSpec.some(s => busKey(s.name) === k);
    })
    .map(a => a.mark || a.label);

  const project = { ...shieldProjectFromDesign(design), railModules: width.modules };
  const core = calculateShield(project);
  const placementIssues = core.issues.filter(i => i.code !== 'price').map(i => ({ code: i.code, deviceKeys: [...i.deviceKeys] }));

  const enclosureModules = design.summary?.enclosure_modules ?? 0;
  const mismatches: string[] = [];
  if (specDevices !== devicesPlaced.length) mismatches.push(`qty: spec ${specDevices}, rails ${devicesPlaced.length}`);
  if (specModules !== railModules) mismatches.push(`width: spec ${specModules}, rails ${railModules}`);
  for (const r of rails) if (r.overflow > 0) mismatches.push(`rail ${r.rail}: ${r.usedModules} > ${r.capacity} (+${r.overflow})`);
  for (const w of widthMismatches) mismatches.push(`width ${w.category}: spec [${w.spec.join(',')}], rails [${w.rails.join(',')}]`);
  for (const d of duplicateMarks) mismatches.push(`duplicate mark ${d.mark}`);
  for (const a of missingInSpec) mismatches.push(`auxiliary not in spec: ${a}`);
  for (const i of placed) if (!pos(i.modules)) mismatches.push(`bad width: ${i.mark}`);

  return {
    equipment, railWidth: width, rails,
    railDevices: devicesPlaced.length, railModules, specDevices, specModules, enclosureModules,
    freeModules: Math.max(0, enclosureModules - railModules - auxPlaced.reduce((s, a) => s + pos(a.modules), 0)),
    widthMismatches, duplicateMarks,
    auxiliary: { spec: auxSpec, rails: auxPlaced.map(a => ({ mark: a.mark, label: a.label })), missingInSpec },
    placementIssues, mismatches, equipmentCost: { status: 'not-calculated' },
  };
}
