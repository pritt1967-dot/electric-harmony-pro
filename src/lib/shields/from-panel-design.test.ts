import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { PanelDesign, PanelSpecRow } from '../panel';
import {
  buildPriceMap, categoryFromMark, reconcileDesign, rublesToKopecks, shieldProjectFromDesign, specCostKopecks,
} from './from-panel-design';

const row = (name: string, qty: number): PanelSpecRow =>
  ({ pos: 1, name, manufacturer: '', model: '', rating: '', modules: 1, qty, unit: 'шт.' });

const design = (rails: PanelDesign['rails'], spec: PanelSpecRow[] = [], used?: number): PanelDesign => ({
  summary: { object_type: '', supply: '', grounding: '', total_power_kw: 0, calculated_power_kw: 0, main_breaker: '',
    used_modules: used ?? 0, reserve_modules: 0, enclosure: '', enclosure_modules: rails.length * 18, ip: '' },
  phase_load: [], protection_chain: [], lines: [], rcd_groups: [], rails, spec, materials: [],
  checks: [], issues: [], assumptions: [], image_prompt: '',
});

const packed = design([
  { index: 1, title: 'Рейка 1', items: [
    { mark: 'QS1', label: 'Вводной', modules: 4 }, { mark: 'FV1', label: 'УЗИП', modules: 4 },
    { mark: 'QD1', label: 'УЗО', modules: 4 }, { mark: 'QF1', label: 'Свет', modules: 1 },
    { mark: 'RESERVE', label: 'Свободно (5 мод.)', modules: 5 }] },
  { index: 2, title: 'Рейка 2', items: [
    { mark: 'QF2', label: 'Розетки', modules: 1 }, { mark: 'QF3', label: 'Розетки', modules: 1 },
    { mark: 'RESERVE', label: 'Свободно (16 мод.)', modules: 16 }] },
], [row('Автомат C16', 3), row('УЗО 40А', 1)], 15);

describe('Shield Designer: переводчик PanelDesign → ядро', () => {
  it('ряды с 1 → с 0, начало накопленной шириной, резерв пропущен', () => {
    const p = shieldProjectFromDesign(packed);
    assert.equal(p.rails, 2);
    assert.equal(p.railModules, 18);
    assert.deepEqual(p.devices.map(d => [d.deviceId, d.rail, d.startModule, d.modules]),
      [['QS1', 0, 1, 4], ['FV1', 0, 5, 4], ['QD1', 0, 9, 4], ['QF1', 0, 13, 1], ['QF2', 1, 1, 1], ['QF3', 1, 2, 1]]);
  });
  it('занятость совпадает со старым расчётом: 13/2, всего 15, свободно 21', () => {
    const r = reconcileDesign(packed);
    assert.deepEqual(r.next.railUsed, [13, 2]);
    assert.equal(r.core.usedModules, 15);
    assert.equal(r.core.freeModules, 21);
    assert.equal(r.core.placementValid, true);
    assert.deepEqual(r.mismatches.filter(m => !m.startsWith('missing')), []);
  });
  it('стоимость в копейках совпадает со старой в рублях: 3×150,50 + 2400 = 2851,50', () => {
    const r = reconcileDesign(packed, [{ name: ' автомат c16 ', price: 150.5 }, { name: 'УЗО 40А', price: '2400' }]);
    assert.equal(r.next.costKopecks.totalKopecks, 285150);
    assert.equal(r.legacy.costRubles, 2852); // legacy rounds rubles
    assert.deepEqual(r.mismatches, []);
  });
  it('неизвестная цена не превращается в 0, итог недоступен', () => {
    const c = specCostKopecks([row('А', 2), row('Б', 1)], buildPriceMap([{ name: 'А', price: 10 }]));
    assert.equal(c.totalKopecks, null);
    assert.equal(c.knownKopecks, 2000);
    assert.equal(c.unknownRows, 1);
  });
  it('пересчёт рублей: 0,1+0,2 даёт ровно 30 копеек; отрицательная и нечисловая → null', () => {
    const c = specCostKopecks([row('a', 1), row('b', 1)], buildPriceMap([{ name: 'a', price: 0.1 }, { name: 'b', price: 0.2 }]));
    assert.equal(c.totalKopecks, 30);
    assert.equal(rublesToKopecks(-1), null);
    assert.equal(rublesToKopecks('abc'), null);
    assert.equal(rublesToKopecks('12,34'), 1234);
  });
  it('переполненная рейка выявляется как ошибка, свободное место не отрицательное', () => {
    const r = reconcileDesign(design([{ index: 1, title: '', items: [{ mark: 'QF1', label: '', modules: 20 }] }]));
    assert.equal(r.core.placementValid, false);
    assert.ok(r.core.issues.some(i => i.code === 'bounds'));
    assert.ok(r.core.freeModules >= 0);
  });
  it('категории по обозначению', () => {
    assert.deepEqual(['QS1', 'QF2', 'QD1', 'QFD3', 'KM1', 'FV1', 'PI1', 'XT1', 'HL1'].map(categoryFromMark),
      ['input-switch', 'breaker', 'rcd', 'rcbo', 'contactor', 'spd', 'meter', 'terminal', 'other']);
  });
  it('переводчик не изменяет исходный проект', () => {
    const before = JSON.stringify(packed);
    reconcileDesign(packed, [{ name: 'УЗО 40А', price: 1 }]);
    assert.equal(JSON.stringify(packed), before);
  });
});
