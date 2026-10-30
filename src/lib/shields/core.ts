/** Pure placement audit: never moves devices or selects electrical ratings.
 * Rail indices are zero-based, startModule is one-based, as in PlacedItem.
 * Prices are integer kopecks; missing prices are not treated as free equipment.
 */
import type { LogicItem } from '../shape-library/panel-logic';
import type { DeviceType } from '../shape-library/device-model';
import type { PanelSpecRow } from '../panel';

export type ShieldDevice = Pick<LogicItem, 'key' | 'deviceId' | 'rail' | 'modules' | 'manufacturer' | 'model'> & {
  startModule: number;
  category: DeviceType;
  name: string;
  rating?: string;
  unitPriceKopecks: number | null;
};
export type ShieldProject = {
  id: string;
  title: string;
  rails: number;
  railModules: number;
  devices: readonly ShieldDevice[];
};
export type ShieldIssue = {
  code: 'configuration' | 'identity' | 'duplicate-id' | 'placement' | 'bounds' | 'duplicate-position' | 'overlap' | 'price';
  deviceKeys: string[];
};
export type ShieldSpecRow = PanelSpecRow & {
  deviceId: string;
  category: DeviceType;
  unitPriceKopecks: number | null;
  totalPriceKopecks: number | null;
};

const positiveInteger = (n: number) => Number.isSafeInteger(n) && n > 0;
const categories: readonly DeviceType[] = ['input-switch', 'breaker', 'rcd', 'rcbo', 'contactor', 'relay', 'spd', 'meter', 'terminal', 'other'];

export function calculateShield(project: ShieldProject) {
  const issues: ShieldIssue[] = [];
  const add = (code: ShieldIssue['code'], ...deviceKeys: string[]) => issues.push({ code, deviceKeys });
  const configured = positiveInteger(project.rails) && positiveInteger(project.railModules)
    && Number.isSafeInteger(project.rails * project.railModules);
  if (!configured) add('configuration');
  // Sparse occupancy avoids allocating memory proportional to an untrusted capacity.
  const occupied = new Map<number, Set<number>>();
  const ids = new Set<string>();
  const positions = new Set<string>();
  const placements: ShieldDevice[] = [];
  const categoryCounts = Object.fromEntries(categories.map(c => [c, 0])) as Record<DeviceType, number>;
  const spec = new Map<string, ShieldSpecRow>();
  let requestedModules = 0;
  let knownCostKopecks = 0;
  let costComplete = true;

  for (const device of project.devices) {
    if (!device.key.trim() || !device.deviceId.trim() || !categories.includes(device.category)) {
      add('identity', device.key);
      costComplete = false;
      continue;
    }
    if (ids.has(device.key)) {
      add('duplicate-id', device.key);
      costComplete = false;
      continue; // One physical instance cannot appear twice in the bill or occupancy.
    }
    ids.add(device.key);
    categoryCounts[device.category] += 1;
    if (positiveInteger(device.modules)) requestedModules += device.modules;
    const price = device.unitPriceKopecks;
    const priced = price !== null && Number.isSafeInteger(price) && price >= 0;
    if (!priced) {
      costComplete = false;
      if (price !== null) add('price', device.key);
    } else {
      knownCostKopecks += price;
    }
    const specKey = JSON.stringify([device.deviceId, device.name, device.manufacturer, device.model,
      device.rating ?? '', device.modules, device.category, priced ? price : null]);
    const row = spec.get(specKey);
    if (row) {
      row.qty += 1;
      row.totalPriceKopecks = row.unitPriceKopecks === null ? null : row.qty * row.unitPriceKopecks;
    } else {
      spec.set(specKey, { pos: spec.size + 1, deviceId: device.deviceId, category: device.category,
        name: device.name, manufacturer: device.manufacturer, model: device.model,
        rating: device.rating ?? '', modules: device.modules, qty: 1, unit: 'шт.',
        unitPriceKopecks: priced ? price : null, totalPriceKopecks: priced ? price : null });
    }
    const coordinates = Number.isSafeInteger(device.rail) && positiveInteger(device.startModule)
      && positiveInteger(device.modules) && Number.isSafeInteger(device.startModule + device.modules - 1);
    if (!coordinates) {
      add('placement', device.key);
      continue;
    }
    const end = device.startModule + device.modules - 1;
    if (!configured || device.rail < 0 || device.rail >= project.rails || end > project.railModules) {
      add('bounds', device.key);
    }
    const position = `${device.rail}:${device.startModule}`;
    if (positions.has(position)) add('duplicate-position', device.key);
    positions.add(position);
    for (const other of placements) {
      if (other.rail === device.rail && device.startModule <= other.startModule + other.modules - 1
        && other.startModule <= end) add('overlap', other.key, device.key);
    }
    placements.push(device);
    if (configured && device.rail >= 0 && device.rail < project.rails) {
      const cells = occupied.get(device.rail) ?? new Set<number>();
      for (let m = device.startModule; m <= Math.min(end, project.railModules); m++) cells.add(m);
      occupied.set(device.rail, cells);
    }
  }
  if (!Number.isSafeInteger(knownCostKopecks)) {
    add('price');
    costComplete = false;
  }
  const capacity = configured ? project.rails * project.railModules : 0;
  const usedModules = [...occupied.values()].reduce((sum, cells) => sum + cells.size, 0);
  return {
    placementValid: !issues.some(i => i.code !== 'price'),
    issues, capacity, requestedModules, usedModules, freeModules: capacity - usedModules,
    deviceCount: ids.size, categoryCounts, specification: [...spec.values()],
    knownCostKopecks: Number.isSafeInteger(knownCostKopecks) ? knownCostKopecks : null,
    costComplete, totalCostKopecks: costComplete ? knownCostKopecks : null,
    rails: configured ? Array.from({ length: project.rails }, (_, index) => ({
      index, capacity: project.railModules, usedModules: occupied.get(index)?.size ?? 0,
      freeModules: project.railModules - (occupied.get(index)?.size ?? 0),
    })) : [],
  };
}