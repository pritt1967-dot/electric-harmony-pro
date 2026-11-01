import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shadowCheckDesign, railWidthFor, itemKind } from './shadow-check';
import type { PanelDesign } from '../panel';

const spec = (name: string, qty: number, modules: number) =>
  ({ pos: 1, name, manufacturer: '', model: '', rating: '', modules, qty, unit: 'шт' });
const it = (mark: string, label: string, modules: number) => ({ mark, label, modules });

const design = (over: Partial<PanelDesign> = {}) => ({
  summary: { enclosure_modules: 24, enclosure: 'Щит (1 рейка по 24 мод.)' },
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
  assert.equal(r.railWidth.source, 'enclosure-text');
});

test('rail width without explicit configuration is unknown, no overflow verdict', () => {
  const d = design({ summary: { enclosure_modules: 72, enclosure: 'Корпус 72' } as PanelDesign['summary'],
    rails: [1, 2, 3, 4].map(i => ({ index: i, title: '', items: [] })) });
  assert.deepEqual(railWidthFor(d), { modules: null, source: 'unknown' });
  assert.equal(shadowCheckDesign(d).rails[0].overflow, null);
});

test('reserve-only rail 29 modules on 24-wide rail is +5 overflow', () => {
  const d = design({
    summary: { enclosure_modules: 96, enclosure: '96 модулей (4 рейки по 24 мод.)' } as PanelDesign['summary'],
    rails: [{ index: 1, title: '', items: [it('RESERVE', 'Свободный резерв на DIN-рейке (29 модулей)', 29)] }],
    spec: [],
  });
  assert.equal(shadowCheckDesign(d).rails[0].overflow, 5);
});

test('rated breaker labelled reserve counts as a device', () => {
  const d = design({ rails: [{ index: 1, title: '', items: [it('QF1', 'Ввод 3P C25', 3), it('QF2', 'Свет C16', 1), it('QF3', 'Розетки C16', 1), it('QF32', 'Резерв C16', 1)] }],
    spec: [spec('Автомат 3P 25A (C)', 1, 3), spec('Автомат 1P 16A (C)', 3, 1)] });
  const r = shadowCheckDesign(d);
  assert.equal(r.railDevices, 4);
  assert.deepEqual(r.mismatches, []);
});

test('rail item "Духовой шкаф" is a device, not an enclosure', () => {
  assert.equal(itemKind('QF9 Духовой шкаф C16', true), 'device');
  assert.equal(itemKind('Корпус настенный'), 'enclosure');
});

test('breaker rating mismatch is reported per row', () => {
  const d = design({ rails: [{ index: 1, title: '', items: [it('QF1', 'Ввод 3P C25', 3), it('QF2', 'Свет B10', 1), it('QF3', 'Розетки C16', 1)] }],
    spec: [spec('Автомат 3P 25A (C)', 1, 3), spec('Автомат 1P 16A (C)', 2, 1)] });
  const r = shadowCheckDesign(d);
  assert.equal(r.deviceRows.find(x => x.key === 'breaker 1P C16 1m')?.diff, -1);
  assert.equal(r.deviceRows.find(x => x.key === 'breaker 1P B10 1m')?.diff, 1);
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
