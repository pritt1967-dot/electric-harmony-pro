import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateShield, type ShieldDevice } from './core';
import { createTestShield48 } from './test-project';

const device = (patch: Partial<ShieldDevice> = {}): ShieldDevice => ({
  key: 'QF1', deviceId: 'breaker', rail: 0, startModule: 1, modules: 1,
  manufacturer: 'Тест', model: 'B1', name: 'Автомат', category: 'breaker', unitPriceKopecks: 12550,
  ...patch,
});
const run = (...devices: ShieldDevice[]) => calculateShield({ ...createTestShield48(), devices });
const has = (result: ReturnType<typeof run>, code: string) => result.issues.some(i => i.code === code);

describe('Shield Designer: первый этап', () => {
  it('щит 48 модулей содержит ровно три ряда по 16', () => {
    const result = calculateShield(createTestShield48());
    assert.equal(result.capacity, 48);
    assert.deepEqual(result.rails.map(r => r.capacity), [16, 16, 16]);
    assert.deepEqual(result.rails.map(r => r.usedModules), [10, 6, 6]);
    assert.deepEqual(result.rails.map(r => r.freeModules), [6, 10, 10]);
    assert.equal(result.usedModules, 22);
    assert.equal(result.freeModules, 26);
    assert.equal(result.placementValid, true);
    assert.deepEqual(result.issues, []);
  });
  it('пустой щит имеет 48 свободных модулей и нулевую стоимость', () => {
    const r = run();
    assert.equal(r.usedModules, 0);
    assert.equal(r.freeModules, 48);
    assert.equal(r.totalCostKopecks, 0);
    assert.equal(r.deviceCount, 0);
  });
  it('полностью занятый щит не имеет свободных модулей', () => {
    const r = run(...[0, 1, 2].map(rail => device({ key: `row${rail}`, rail, modules: 16 })));
    assert.equal(r.usedModules, 48);
    assert.equal(r.freeModules, 0);
    assert.equal(r.placementValid, true);
  });
  it('последний модуль рейки допустим', () => {
    assert.equal(run(device({ rail: 2, startModule: 16 })).placementValid, true);
  });
  it('выход за рейку обнаруживается, занята только область внутри щита', () => {
    const r = run(device({ startModule: 16, modules: 4 }));
    assert.equal(has(r, 'bounds'), true);
    assert.equal(r.requestedModules, 4);
    assert.equal(r.usedModules, 1);
    assert.equal(r.freeModules, 47);
  });
  it('несуществующая рейка не занимает модули', () => {
    for (const rail of [-1, 3]) {
      const r = run(device({ rail }));
      assert.equal(has(r, 'bounds'), true);
      assert.equal(r.usedModules, 0);
    }
  });
  it('нулевые, дробные и неконечные координаты и ширины запрещены', () => {
    for (const patch of [{ modules: 0 }, { modules: -1 }, { modules: 1.5 }, { modules: NaN },
      { startModule: 0 }, { startModule: -1 }, { startModule: 1.5 }, { startModule: Infinity }, { rail: 0.5 }]) {
      assert.equal(has(run(device(patch)), 'placement'), true);
    }
  });
  it('наложение не удваивает занятые модули', () => {
    const r = run(device({ modules: 4 }), device({ key: 'QF2', startModule: 3, modules: 4 }));
    assert.equal(has(r, 'overlap'), true);
    assert.equal(r.usedModules, 6);
    assert.equal(r.requestedModules, 8);
  });
  it('проверяются все пары вложенных аппаратов, не только соседние', () => {
    const r = run(device({ modules: 8 }), device({ key: 'b', startModule: 2 }), device({ key: 'c', startModule: 5 }));
    assert.equal(r.issues.filter(i => i.code === 'overlap').length, 2);
  });
  it('смежные аппараты и одинаковые позиции на разных рейках допустимы', () => {
    const r = run(device({ modules: 2 }), device({ key: 'b', startModule: 3 }), device({ key: 'c', rail: 1 }));
    assert.equal(r.placementValid, true);
  });
  it('два аппарата в одной позиции запрещены', () => {
    const r = run(device(), device({ key: 'b' }));
    assert.equal(has(r, 'duplicate-position'), true);
    assert.equal(has(r, 'overlap'), true);
  });
  it('повторная установка одного ID запрещена и не удваивает спецификацию/стоимость', () => {
    const r = run(device(), device({ rail: 1 }));
    assert.equal(has(r, 'duplicate-id'), true);
    assert.equal(r.deviceCount, 1);
    assert.equal(r.specification[0]?.qty, 1);
    assert.equal(r.knownCostKopecks, 12550);
    assert.equal(r.totalCostKopecks, null);
  });
  it('пустой ID не является корректным аппаратом', () => {
    assert.equal(has(run(device({ key: '' })), 'identity'), true);
    assert.equal(has(run(device({ deviceId: '' })), 'identity'), true);
  });
  it('количество аппаратов по категориям соответствует тестовому щиту', () => {
    const r = calculateShield(createTestShield48());
    assert.equal(r.deviceCount, 12);
    assert.deepEqual(r.categoryCounts, { 'input-switch': 1, breaker: 4, rcd: 2, rcbo: 1,
      contactor: 1, relay: 1, spd: 0, meter: 0, terminal: 2, other: 0 });
  });
  it('предварительная спецификация объединяет идентичные аппараты', () => {
    const r = calculateShield(createTestShield48());
    assert.equal(r.specification.length, 8);
    assert.equal(r.specification.find(s => s.deviceId === 'breaker-1m')?.qty, 4);
    assert.equal(r.specification.find(s => s.deviceId === 'breaker-1m')?.totalPriceKopecks, 200000);
  });
  it('разные цены одного артикула не теряются при группировке', () => {
    const r = run(device(), device({ key: 'b', rail: 1, unitPriceKopecks: 10000 }));
    assert.equal(r.specification.length, 2);
    assert.equal(r.totalCostKopecks, 22550);
  });
  it('стоимость тестового оборудования равна 20 000 рублей', () => {
    const r = calculateShield(createTestShield48());
    assert.equal(r.totalCostKopecks, 2000000);
    assert.equal(r.costComplete, true);
  });
  it('неизвестная цена не подменяется нулём', () => {
    const r = run(device(), device({ key: 'b', rail: 1, unitPriceKopecks: null }));
    assert.equal(r.totalCostKopecks, null);
    assert.equal(r.knownCostKopecks, 12550);
    assert.equal(r.specification.find(s => s.unitPriceKopecks === null)?.totalPriceKopecks, null);
  });
  it('нулевая цена разрешена, отрицательная и дробная запрещены', () => {
    assert.equal(run(device({ unitPriceKopecks: 0 })).totalCostKopecks, 0);
    for (const unitPriceKopecks of [-1, 1.5, Infinity, NaN]) {
      assert.equal(has(run(device({ unitPriceKopecks })), 'price'), true);
    }
  });
  it('ошибочная конфигурация не создаёт фиктивную вместимость', () => {
    for (const rails of [0, -1, 1.5, Infinity]) {
      const r = calculateShield({ ...createTestShield48(), rails });
      assert.equal(has(r, 'configuration'), true);
      assert.equal(r.capacity, 0);
      assert.equal(r.placementValid, false);
    }
  });
  it('расчёт не перемещает и не изменяет исходный щит', () => {
    const p = createTestShield48();
    const before = structuredClone(p);
    p.devices.forEach(Object.freeze);
    Object.freeze(p.devices);
    Object.freeze(p);
    calculateShield(p);
    assert.deepEqual(p, before);
  });
});