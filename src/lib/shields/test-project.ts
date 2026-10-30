import type { ShieldDevice, ShieldProject } from './core';

/** Synthetic equipment and prices, not customer data or real catalog quotations. */
export function createTestShield48(): ShieldProject {
  const make = (key: string, deviceId: string, category: ShieldDevice['category'], rail: number,
    startModule: number, modules: number, price: number): ShieldDevice => ({
      key, deviceId, category, rail, startModule, modules,
      name: `Тестовый ${deviceId}`, manufacturer: 'Тест', model: deviceId,
      unitPriceKopecks: price,
    });
  return { id: 'test-shield-48', title: 'Тестовый щит 48 модулей', rails: 3, railModules: 16,
    devices: [
      make('QS1', 'switch-4m', 'input-switch', 0, 1, 4, 300000),
      make('QD1', 'rcd-4m', 'rcd', 0, 5, 4, 500000),
      make('QF1', 'breaker-1m', 'breaker', 0, 9, 1, 50000),
      make('QF2', 'breaker-1m', 'breaker', 0, 10, 1, 50000),
      make('QD2', 'rcd-2m', 'rcd', 1, 1, 2, 250000),
      make('QFD1', 'rcbo-2m', 'rcbo', 1, 3, 2, 350000),
      make('QF3', 'breaker-1m', 'breaker', 1, 5, 1, 50000),
      make('QF4', 'breaker-1m', 'breaker', 1, 6, 1, 50000),
      make('KM1', 'contactor-2m', 'contactor', 2, 1, 2, 200000),
      make('KV1', 'relay-2m', 'relay', 2, 3, 2, 150000),
      make('XT1', 'terminal-1m', 'terminal', 2, 5, 1, 25000),
      make('XT2', 'terminal-1m', 'terminal', 2, 6, 1, 25000),
    ],
  };
}