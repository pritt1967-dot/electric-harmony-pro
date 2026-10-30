import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateShield, type ShieldDevice, type ShieldProject } from './core';
import { createTestShield48 } from './test-project';

const d = (key: string, patch: Partial<ShieldDevice> = {}): ShieldDevice => ({
  key, deviceId: 'test-article', name: 'Тест', manufacturer: 'Тест', model: 'Тест',
  category: 'breaker', rail: 0, startModule: 1, modules: 1, unitPriceKopecks: 101, ...patch,
});
const run = (devices: ShieldDevice[], patch: Partial<ShieldProject> = {}) =>
  calculateShield({ ...createTestShield48(), devices, ...patch });
const issue = (r: ReturnType<typeof run>, code: string) => r.issues.some(i => i.code === code);

describe('Shield Designer: дополнительные граничные проверки', () => {
  it('01 Пустой щит: 0 занято, 48 свободно, пустая спецификация', () => {
    const r = run([]);
    assert.deepEqual([r.usedModules, r.freeModules, r.specification.length, r.totalCostKopecks], [0, 48, 0, 0]);
  });
  it('02 Полностью заполненная DIN-рейка: 16 занято, 0 свободно на ней', () => {
    const r = run([d('a', { modules: 16 })]);
    assert.deepEqual(r.rails[0], { index: 0, capacity: 16, usedModules: 16, freeModules: 0 });
    assert.equal(r.placementValid, true);
  });
  it('03 Аппарат ровно на остаток: 12+4 модуля без наложения', () => {
    const r = run([d('a', { modules: 12 }), d('b', { startModule: 13, modules: 4 })]);
    assert.equal(r.placementValid, true);
    assert.equal(r.rails[0]?.freeModules, 0);
  });
  it('04 Полностью за пределами рейки: нулевая занятость и ошибка', () => {
    const r = run([d('a', { startModule: 17, modules: 2 })]);
    assert.equal(issue(r, 'bounds'), true);
    assert.deepEqual([r.usedModules, r.freeModules], [0, 48]);
  });
  it('05 Одинаковая позиция: оба ID в спецификации, место считается один раз', () => {
    const r = run([d('a'), d('b')]);
    assert.equal(issue(r, 'duplicate-position'), true);
    assert.deepEqual([r.usedModules, r.specification[0]?.qty], [1, 2]);
    assert.equal(r.placementValid, false);
  });
  it('06 Частичное наложение: пересечение двух модулей не удваивается', () => {
    const r = run([d('a', { modules: 6 }), d('b', { startModule: 5, modules: 4 })]);
    assert.equal(issue(r, 'overlap'), true);
    assert.deepEqual([r.usedModules, r.freeModules], [8, 40]);
  });
  it('07 Аппарат шире рейки: ошибка, свободные модули не отрицательны', () => {
    const r = run([d('a', { modules: 20 })]);
    assert.equal(issue(r, 'bounds'), true);
    assert.deepEqual([r.usedModules, r.freeModules, r.rails[0]?.freeModules], [16, 32, 0]);
  });
  it('08 Разное заполнение рядов: 3, 7, 11 занятых модулей', () => {
    const r = run([3, 7, 11].map((modules, rail) => d(`d${rail}`, { modules, rail })));
    assert.deepEqual(r.rails.map(row => row.usedModules), [3, 7, 11]);
    assert.deepEqual(r.rails.map(row => row.freeModules), [13, 9, 5]);
    assert.equal(r.freeModules, 27);
  });
  it('09 Разная вместимость рядов не поддержана: массив не принимается как 16', () => {
    const r = run([], { railModules: [12, 16, 18] as unknown as number });
    assert.equal(issue(r, 'configuration'), true);
    assert.deepEqual([r.capacity, r.placementValid], [0, false]);
  });
  it('10 Перемещение между рядами меняет только занятость рядов', () => {
    const devices = [d('a', { modules: 4 }), d('b', { rail: 1, startModule: 5 })];
    const before = run(devices);
    const after = run(devices.map(item => item.key === 'a' ? { ...item, rail: 2 } : item));
    assert.deepEqual(before.rails.map(row => row.usedModules), [4, 1, 0]);
    assert.deepEqual(after.rails.map(row => row.usedModules), [0, 1, 4]);
    assert.equal(after.freeModules, before.freeModules);
    assert.deepEqual(after.specification, before.specification);
  });
  it('11 Удаление аппарата освобождает модули и уменьшает цену/количество', () => {
    const devices = [d('a', { modules: 4 }), d('b', { rail: 1, modules: 4 })];
    const after = run(devices.filter(item => item.key !== 'a'));
    assert.deepEqual([after.freeModules, after.deviceCount, after.totalCostKopecks], [44, 1, 101]);
    assert.equal(after.specification[0]?.qty, 1);
  });
  it('12 Некорректная ширина не попадает в спецификацию и итоговую стоимость', () => {
    for (const modules of [0, -1, 1.5, NaN, Infinity]) {
      const r = run([d('a', { modules })]);
      assert.equal(issue(r, 'placement'), true);
      assert.equal(r.specification.length, 0);
      assert.equal(r.totalCostKopecks, null);
      assert.equal(r.freeModules, 48);
    }
  });
  it('13 Отрицательная цена не вычитается из известной стоимости', () => {
    const r = run([d('a'), d('b', { rail: 1, unitPriceKopecks: -100 })]);
    assert.equal(issue(r, 'price'), true);
    assert.deepEqual([r.knownCostKopecks, r.totalCostKopecks], [101, null]);
    assert.equal(r.specification.find(row => row.unitPriceKopecks === null)?.totalPriceKopecks, null);
  });
  it('14 Нулевая цена разрешена и не означает неизвестную', () => {
    const r = run([d('a', { unitPriceKopecks: 0 })]);
    assert.deepEqual([r.costComplete, r.totalCostKopecks, r.specification[0]?.totalPriceKopecks], [true, 0, 0]);
  });
  it('15 Пять уникальных аппаратов одного артикула дают количество 5', () => {
    const r = run(Array.from({ length: 5 }, (_, i) => d(`a${i}`, { startModule: i + 1 })));
    assert.deepEqual([r.specification.length, r.specification[0]?.qty, r.deviceCount], [1, 5, 5]);
  });
  it('16 Общая стоимость равна сумме строк спецификации', () => {
    const r = run([d('a', { unitPriceKopecks: 125 }), d('b', { startModule: 2, unitPriceKopecks: 125 }),
      d('c', { startModule: 3, deviceId: 'another', unitPriceKopecks: 230 })]);
    assert.equal(r.totalCostKopecks, 480);
    assert.equal(r.specification.reduce((sum, row) => sum + (row.totalPriceKopecks ?? 0), 0), 480);
  });
  it('17 Денежная точность: 10+20 копеек точно равны 30', () => {
    assert.equal(run([d('a', { unitPriceKopecks: 10 }), d('b', { rail: 1, unitPriceKopecks: 20 })]).totalCostKopecks, 30);
  });
  it('18 Доли копейки отклоняются, не округляются молча', () => {
    for (const unitPriceKopecks of [0.1, 0.5, 100.005, 100.999]) {
      const r = run([d('a', { unitPriceKopecks })]);
      assert.equal(issue(r, 'price'), true);
      assert.equal(r.totalCostKopecks, null);
    }
  });
  it('19 Переполнение стоимости строки не выдаёт неточное число', () => {
    const r = run([d('a', { unitPriceKopecks: Number.MAX_SAFE_INTEGER }),
      d('b', { startModule: 2, unitPriceKopecks: Number.MAX_SAFE_INTEGER })]);
    assert.equal(r.specification[0]?.totalPriceKopecks, null);
    assert.equal(r.totalCostKopecks, null);
    assert.equal(issue(r, 'price'), true);
  });
  it('20 Переполнение суммы разных строк блокирует общую стоимость', () => {
    const r = run([d('a', { unitPriceKopecks: Number.MAX_SAFE_INTEGER }),
      d('b', { rail: 1, deviceId: 'second', unitPriceKopecks: 1 })]);
    assert.deepEqual([r.knownCostKopecks, r.totalCostKopecks, r.costComplete], [null, null, false]);
  });
  it('21 Проект 3×16 сохраняет 22 занятых, 26 свободных и 20 000 рублей', () => {
    const r = calculateShield(createTestShield48());
    assert.deepEqual([r.capacity, r.usedModules, r.freeModules, r.totalCostKopecks], [48, 22, 26, 2000000]);
  });
  for (const [rails, railModules] of [[1, 12], [2, 12], [2, 18], [3, 18], [4, 18], [4, 24]]) {
    it(`Корпус ${rails}×${railModules}: полный ряд и общий резерв`, () => {
      const r = run([d('a', { modules: railModules })], { rails, railModules });
      assert.equal(r.capacity, rails * railModules);
      assert.equal(r.usedModules, railModules);
      assert.equal(r.freeModules, (rails - 1) * railModules);
      assert.equal(r.placementValid, true);
    });
  }
  it('28 Сто повторных расчётов идентичны и не меняют проект', () => {
    const p = createTestShield48();
    const original = structuredClone(p);
    const expected = calculateShield(p);
    for (let i = 0; i < 100; i++) assert.deepEqual(calculateShield(p), expected);
    assert.deepEqual(p, original);
  });
  it('29 Массовые наложения и выходы за границы не дают отрицательного резерва', () => {
    const r = run(Array.from({ length: 100 }, (_, i) => d(`a${i}`, { rail: i % 3, modules: 25, startModule: i % 16 + 1 })));
    assert.equal(r.freeModules, 0);
    assert.equal(r.usedModules, 48);
    assert.ok(r.rails.every(row => row.freeModules === 0));
  });
  it('30 Дубликаты ID не создают лишние строки спецификации', () => {
    const r = run([d('a'), d('a', { rail: 1 }), d('b', { rail: 2 })]);
    assert.equal(issue(r, 'duplicate-id'), true);
    assert.deepEqual([r.deviceCount, r.specification[0]?.qty, r.usedModules], [2, 2, 2]);
  });
});