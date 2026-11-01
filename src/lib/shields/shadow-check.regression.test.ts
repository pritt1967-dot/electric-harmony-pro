/** Regression tests from real findings on saved panel 6b51688d / f81845c3 (data reproduced inline, DB untouched). */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shadowCheckDesign, itemKind, railWidthFor } from './shadow-check';
import type { PanelDesign } from '../panel';

const spec = (name: string, qty: number, modules: number) =>
  ({ pos: 1, name, manufacturer: '', model: '', rating: '', modules, qty, unit: 'шт' });
const it = (mark: string, label: string, modules: number) => ({ mark, label, modules });

const C16 = ['QF5_KITCHEN1', 'QF6_KITCHEN2', 'QF8_DISHWASHER', 'QF9_OVEN', 'QF11_BATH1', 'QF17_BATH2', 'QF18_WASHING',
  'QF19_DRYER', 'QF2_LIVING', 'QF3_OFFICE', 'QF4_HALL', 'QF13_BED1', 'QF14_BED2', 'QF15_BED3', 'QF16_CORRIDOR2',
  'QF23_PUMP', 'QF27_OUTDOOR_SOCKETS', 'QF29_GARAGE', 'QF21_BOILER', 'QF30_AC1', 'QF31_AC2'];
const C10 = ['QF7_FRIDGE', 'QF10_HOOD', 'QF24_SEPTIC', 'QF25_HEAT_CABLE', 'QF1_LIGHT1', 'QF12_LIGHT2',
  'QF28_OUTDOOR_LIGHT', 'QF22_GAS_BOILER', 'QF26_WATER_FILT'];

/** 6b51688d breakers: rails 22×C16 (incl. QF32 «Резервная линия C16») + 9×C10; spec 18×C16 + 12×C10. */
function panel6b(over: { specC16?: number; specC10?: number; withQF32?: boolean } = {}) {
  const items = [
    ...C16.map(m => it(m, m === 'QF9_OVEN' ? 'Духовой шкаф C16' : `${m} C16`, 1)),
    ...(over.withQF32 === false ? [] : [it('QF32_RESERVE', 'Резервная линия C16', 1)]),
    ...C10.map(m => it(m, `${m} C10`, 1)),
  ];
  return {
    summary: { enclosure_modules: 72, enclosure: 'Навесной пластиковый щит IP40 с прозрачной дверцей' },
    rails: [{ index: 1, title: '', items }],
    lines: items.map(i => ({ mark: i.mark, breaker: i.label.slice(-3), poles: 1, modules: 1 })),
    spec: [
      spec('Автоматический выключатель 1P 16A (C) 6kA', over.specC16 ?? 18, 1),
      spec('Автоматический выключатель 1P 10A (C) 6kA', over.specC10 ?? 12, 1),
    ],
    materials: [],
  } as unknown as PanelDesign;
}
const row = (d: PanelDesign, key: string) => shadowCheckDesign(d).deviceRows.find(r => r.key === key);

test('6b51688d: equal total count does not mean equal composition by rating', () => {
  const r = shadowCheckDesign(panel6b({ withQF32: false })); // 30 on rails vs 30 in spec
  assert.equal(r.railDevices, 30);
  assert.equal(r.specDevices, 30);
  assert.ok(!r.mismatches.some(m => m.startsWith('qty:')));
  assert.ok(r.mismatches.some(m => m.startsWith('device breaker 1P C16')));
  assert.ok(r.mismatches.some(m => m.startsWith('device breaker 1P C10')));
});

test('6b51688d: C16 and C10 differences are computed separately (+4 / −3)', () => {
  const d = panel6b();
  assert.deepEqual([row(d, 'breaker 1P C16 1m')?.spec, row(d, 'breaker 1P C16 1m')?.rails, row(d, 'breaker 1P C16 1m')?.diff], [18, 22, 4]);
  assert.deepEqual([row(d, 'breaker 1P C10 1m')?.spec, row(d, 'breaker 1P C10 1m')?.rails, row(d, 'breaker 1P C10 1m')?.diff], [12, 9, -3]);
  const r = shadowCheckDesign(d);
  assert.equal(r.railDevices - r.specDevices, 1); // net +1 = QF32 only
});

test('6b51688d: QF32 C16 on rail and absent from spec gives a separate warning', () => {
  const r = shadowCheckDesign(panel6b());
  assert.deepEqual(r.reserveNotInSpec.map(x => [x.mark, x.key]), [['QF32_RESERVE', 'breaker 1P C16 1m']]);
  assert.ok(r.mismatches.includes('reserve device not in spec: QF32_RESERVE (breaker 1P C16 1m)'));
  const covered = shadowCheckDesign(panel6b({ specC16: 22, specC10: 9 }));
  assert.deepEqual(covered.reserveNotInSpec, []);
  assert.deepEqual(covered.mismatches.filter(m => !m.startsWith('rail width unknown')), []);
});

test('reserve breaker with a rating is a full device, rating-less reserve is free space', () => {
  const r = shadowCheckDesign(panel6b());
  assert.equal(r.railDevices, 31);
  assert.deepEqual(r.reserveDevices.map(x => x.mark), ['QF32_RESERVE']);
  assert.ok(row(panel6b(), 'breaker 1P C16 1m')?.railMarks.includes('QF32_RESERVE@R1'));
  const d = panel6b();
  d.rails[0].items.push(it('RESERVE', 'Резерв DIN', 3));
  const r2 = shadowCheckDesign(d);
  assert.equal(r2.railDevices, 31);
  assert.equal(r2.rails[0].reserveModules, 3);
});

test('f81845c3: duplicate QF1 keeps both devices, matched by rating, separate marking warning', () => {
  const d = {
    summary: { enclosure_modules: 96, enclosure: 'Щит 96 модулей (4 рейки по 24 мод.)' },
    rails: [
      { index: 1, title: '', items: [it('QF1', 'ВВОД 3P C25', 3)] },
      { index: 2, title: '', items: [it('QF1', 'Освещение 1 эт B10', 1)] },
    ],
    lines: [{ mark: 'QF1', breaker: 'B10', poles: 1, modules: 1 }],
    spec: [spec('Автоматический выключатель 3P 25A (C) 6kA', 1, 3), spec('Автоматический выключатель 1P 10A (B) 4.5/6kA', 1, 1)],
    materials: [],
  } as unknown as PanelDesign;
  const r = shadowCheckDesign(d);
  assert.equal(r.railDevices, 2);
  assert.equal(r.railModules, 4);
  assert.deepEqual(r.duplicateMarks.map(x => [x.mark, x.items.map(i => `${i.label}@R${i.rail}/${i.modules}`)]),
    [['QF1', ['ВВОД 3P C25@R1/3', 'Освещение 1 эт B10@R2/1']]]);
  assert.deepEqual(r.deviceRows.map(x => [x.key, x.diff]), [['breaker 1P B10 1m', 0], ['breaker 3P C25 3m', 0]]);
  assert.deepEqual(r.mismatches, ['duplicate mark QF1']);
});

test('«Духовой шкаф» is not the panel enclosure', () => {
  assert.equal(itemKind('QF9_OVEN Духовой шкаф C16', true), 'device');
  assert.equal(itemKind('Духовой шкаф C16', true), 'device');
  assert.equal(itemKind('Корпус настенный модульный'), 'enclosure');
  assert.ok(row(panel6b(), 'breaker 1P C16 1m')?.railMarks.includes('QF9_OVEN@R1'));
});

test('rail width is checked only with reliable enclosure data', () => {
  const d = panel6b();
  assert.deepEqual(railWidthFor(d), { modules: null, source: 'unknown' }); // 72 modules, no rail config
  const r = shadowCheckDesign(d);
  assert.equal(r.rails[0].capacity, null);
  assert.equal(r.rails[0].overflow, null);
  assert.ok(!r.placementIssues.some(i => i.code === 'bounds'));
  assert.ok(r.mismatches.includes('rail width unknown: enclosure has no rail configuration'));
});

test('f81845c3: rail overflow detected regardless of installed devices (reserve 29 on 24)', () => {
  const base = { summary: { enclosure_modules: 96, enclosure: '96 модулей (4 рейки по 24 мод.)' }, lines: [], spec: [], materials: [] };
  const empty = shadowCheckDesign({ ...base, rails: [{ index: 4, title: '', items: [it('RESERVE', 'Свободный резерв на DIN-рейке (29 модулей)', 29)] }] } as unknown as PanelDesign);
  assert.deepEqual([empty.rails[0].usedModules, empty.rails[0].reserveModules, empty.rails[0].overflow], [0, 29, 5]);
  assert.ok(empty.mismatches.includes('rail 1: 0+29 reserve > 24 (+5)'));
  const full = shadowCheckDesign({ ...base, rails: [{ index: 1, title: '', items: Array.from({ length: 26 }, (_, k) => it(`QF${k + 1}`, 'Линия C16', 1)) }] } as unknown as PanelDesign);
  assert.equal(full.rails[0].overflow, 2);
  const fits = shadowCheckDesign({ ...base, rails: [{ index: 1, title: '', items: [it('RESERVE', 'Резерв', 24)] }] } as unknown as PanelDesign);
  assert.equal(fits.rails[0].overflow, 0);
});
