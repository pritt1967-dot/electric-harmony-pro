import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shadowCheckDesign, railWidthFor, itemKind } from './shadow-check';
import type { PanelDesign } from '../panel';

const spec = (name: string, qty: number, modules: number) =>
  ({ pos: 1, name, manufacturer: '', model: '', rating: '', modules, qty, unit: 'шт' });
const it = (mark: string, label: string, modules: number) => ({ mark, label, modules });

const design = (over: Partial<PanelDesign> = {}) => ({
  summary: { enclosure_modules: 24, enclosure: 'Щит' },
  rails: [{ index: 1, title: '', items: [
    it('QF1', 'Ввод', 3), it('QF2', 'Свет', 1), it('QF3', 'Розетки', 1), it('R', 'Резерв', 2),
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
});

test('quantity mismatch between spec and rails is reported', () => {
  const r = shadowCheckDesign(design({ spec: [spec('Автомат C25 3P', 1, 3), spec('Автомат C16 1P', 3, 1)] }));
  assert.ok(r.mismatches.some(m => m.startsWith('qty:')));
});

test('same name rows are summed', () => {
  const r = shadowCheckDesign(design({ spec: [spec('Автомат C25 3P', 1, 3), spec('Автомат C16 1P', 1, 1), spec('автомат c16 1p', 1, 1)] }));
  assert.equal(r.equipment.find(e => e.name === 'Автомат C16 1P')?.qty, 2);
  assert.deepEqual(r.mismatches, []);
});

test('enclosure row is not a device and adds no width', () => {
  const r = shadowCheckDesign(design({ spec: [spec('Автомат C25 3P', 1, 3), spec('Автомат C16 1P', 2, 1), spec('Корпус настенный', 1, 24)] }));
  assert.equal(r.specDevices, 3);
  assert.equal(r.specModules, 5);
  assert.deepEqual(r.mismatches, []);
});

test('rail width from "4 рейки по 24 мод." and 29 modules gives +5 overflow', () => {
  const d = design({
    summary: { enclosure_modules: 96, enclosure: 'Щит 96 модулей (4 рейки по 24 мод.)' } as PanelDesign['summary'],
    rails: [{ index: 1, title: '', items: Array.from({ length: 29 }, (_, k) => it(`QF${k + 1}`, 'Линия', 1)) }],
    spec: [spec('Автоматический выключатель 1P', 29, 1)],
  });
  assert.equal(railWidthFor(d).modules, 24);
  const r = shadowCheckDesign(d);
  assert.equal(r.rails[0].overflow, 5);
});

test('rail width falls back to enclosure modules / rail count', () => {
  const d = design({ summary: { enclosure_modules: 72, enclosure: 'Корпус 72' } as PanelDesign['summary'],
    rails: [1, 2, 3, 4].map(i => ({ index: i, title: '', items: [] })) });
  assert.deepEqual(railWidthFor(d), { modules: 18, source: 'enclosure-split' });
});

test('device width mismatch per category is reported without fixing data', () => {
  const d = design({ rails: [{ index: 1, title: '', items: [it('QF1', 'Ввод', 1), it('QF2', 'Свет', 1), it('QF3', 'Розетки', 1)] }] });
  const r = shadowCheckDesign(d);
  assert.ok(r.widthMismatches.some(w => w.category === 'breaker'));
  assert.equal(d.rails[0].items[0].modules, 1);
});

test('PE/N buses are auxiliary, not devices; missing in spec reported separately', () => {
  const d = design({ rails: [{ index: 1, title: '', items: [it('QF1', 'Ввод', 3), it('QF2', 'Свет', 1), it('QF3', 'Розетки', 1), it('Шина_PE', 'Шина PE', 1), it('Шина_N', 'Шина N', 1)] }] });
  const r = shadowCheckDesign(d);
  assert.equal(r.railDevices, 3);
  assert.ok(!r.mismatches.some(m => m.startsWith('qty:')));
  assert.deepEqual(r.auxiliary.missingInSpec, ['Шина_PE', 'Шина_N']);
  assert.equal(itemKind('Шина PE'), 'auxiliary');
});

test('duplicate marks on rails are reported', () => {
  const d = design({ rails: [{ index: 1, title: '', items: [it('QF1', 'Ввод 3P', 3), it('QF1', 'Свет', 1), it('QF3', 'Розетки', 1)] }] });
  assert.equal(shadowCheckDesign(d).duplicateMarks[0]?.mark, 'QF1');
});
