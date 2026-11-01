/** Stage 2 shadow check: runs beside the legacy designer, never shown in UI, never changes the design.
 * Verifies equipment composition, quantity, width and DIN placement only.
 * The SM Electric price list contains installation WORKS only, so equipment is never matched to it:
 * equipment cost is explicitly "not calculated" (not zero); works cost stays in the existing mechanism.
 */
import type { PanelDesign } from '../panel';
import { calculateShield } from './core';
import { isReserveItem, shieldProjectFromDesign } from './from-panel-design';

export type ShadowEquipmentRow = { name: string; qty: number; modulesEach: number; modulesTotal: number };

export type ShadowCheck = {
  equipment: ShadowEquipmentRow[];
  railDevices: number;
  railModules: number;
  specDevices: number;
  specModules: number;
  enclosureModules: number;
  freeModules: number;
  placementIssues: { code: string; deviceKeys: string[] }[];
  mismatches: string[];
  equipmentCost: { status: 'not-calculated' };
};

export function shadowCheckDesign(design: PanelDesign): ShadowCheck {
  const core = calculateShield(shieldProjectFromDesign(design));
  const railItems = (design.rails ?? []).flatMap(r => (r.items ?? []).filter(i => !isReserveItem(i)));
  const railModules = railItems.reduce((s, i) => s + (Number.isFinite(i.modules) && i.modules > 0 ? i.modules : 0), 0);
  const map = new Map<string, ShadowEquipmentRow>();
  for (const r of design.spec ?? []) {
    const name = r.name.trim();
    const qty = Number.isFinite(r.qty) && r.qty > 0 ? r.qty : 0;
    const each = Number.isFinite(r.modules) && r.modules > 0 ? r.modules : 0;
    const row = map.get(name.toLowerCase()) ?? { name, qty: 0, modulesEach: each, modulesTotal: 0 };
    row.qty += qty;
    row.modulesTotal += qty * each;
    map.set(name.toLowerCase(), row);
  }
  const equipment = [...map.values()];
  const din = equipment.filter(e => e.modulesEach > 0);
  const specDevices = din.reduce((s, e) => s + e.qty, 0);
  const specModules = din.reduce((s, e) => s + e.modulesTotal, 0);
  const enclosureModules = design.summary?.enclosure_modules ?? 0;
  const mismatches: string[] = [];
  if (specDevices !== railItems.length) mismatches.push(`qty: spec ${specDevices}, rails ${railItems.length}`);
  if (specModules !== railModules) mismatches.push(`width: spec ${specModules}, rails ${railModules}`);
  if (enclosureModules > 0 && railModules > enclosureModules)
    mismatches.push(`enclosure: ${railModules} > ${enclosureModules}`);
  for (const i of railItems) if (!(Number.isFinite(i.modules) && i.modules > 0)) mismatches.push(`bad width: ${i.mark}`);
  const placementIssues = core.issues.filter(i => i.code !== 'price').map(i => ({ code: i.code, deviceKeys: [...i.deviceKeys] }));
  return {
    equipment, railDevices: railItems.length, railModules, specDevices, specModules, enclosureModules,
    freeModules: Math.max(0, enclosureModules - railModules),
    placementIssues, mismatches, equipmentCost: { status: 'not-calculated' },
  };
}
