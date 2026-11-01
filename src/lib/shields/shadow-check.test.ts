import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shadowCheckDesign } from './shadow-check';
import type { PanelDesign } from '../panel';

const spec = (name: string, qty: number, modules: number) =>
  ({ pos: 1, name, manufacturer: '', model: '', rating: '', modules, qty, unit: 'шт' });

const design = (over: Partial<PanelDesign> = {}) => ({
  summary: { enclosure_modules: 24 },
  rails: [{ index: 1, title: '', items: [
    { mark: 'QF1', label: 'Ввод', modules: 3 },
    { mark: 'QF2', label: 'Свет', modules: 1 },
    { mark: 'QF3', label: 'Розетки', modules: 1 },
    { mark: 'R', label: 'Резерв', modules: 2 },
  ] }],
  spec: [spec('Автомат C25 3P', 1, 3), spec('Автомат C16 1P', 2, 1), spec('Клеммы', 4, 0)],
  materials: [],
  ...over,
}) as unknown as PanelDesign;

test('matching composition, qty and width gives no mismatches', () => {
  const r = shadowCheckDesign(design());
  assert.deepEqual(r.mismatches, []);
  assert.equal(r.railDevices, 3);
  assert.equal(r.railModules, 5);
  assert.equal(r.freeModules, 19);
});

test('equipment cost is never computed and never zero', () => {
  const r = shadowCheckDesign(design());
  assert.deepEqual(r.equipmentCost, { status: 'not-calculated' });
  assert.ok(!('totalKopecks' in r));
});

test('quantity mismatch between spec and rails is reported', () => {
  const r = shadowCheckDesign(design({ spec: [spec('Автомат C25 3P', 1, 3), spec('Автомат C16 1P', 3, 1)] }));
  assert.ok(r.mismatches.some(m => m.startsWith('qty:')));
});

test('width over enclosure is reported', () => {
  const r = shadowCheckDesign(design({ summary: { enclosure_modules: 4 } as PanelDesign['summary'] }));
  assert.ok(r.mismatches.some(m => m.startsWith('enclosure:')));
  assert.equal(r.freeModules, 0);
});

test('same name rows are summed', () => {
  const r = shadowCheckDesign(design({ spec: [spec('Автомат C25 3P', 1, 3), spec('Автомат C16 1P', 1, 1), spec('автомат c16 1p', 1, 1)] }));
  assert.equal(r.equipment.find(e => e.name === 'Автомат C16 1P')?.qty, 2);
  assert.deepEqual(r.mismatches, []);
});
