/**
 * КАТАЛОГ БИБЛИОТЕКИ «Набор электрика для Visio».
 *
 * Четыре загруженных архива (полный + части 01–03) объединены логически
 * в одну библиотеку: части 01–03 оказались подмножеством полного архива,
 * дубликаты удалены по контрольной сумме файла. Исходные файлы не изменялись.
 *
 * Это ТОЛЬКО каталог (инвентаризация) — геометрия фигур пока не импортируется,
 * к рабочему визуализатору ничего не подключено.
 */

import { DEVICE_STENCILS, DEVICE_CATEGORY_LABELS, type DeviceStencil } from "./device-catalog-generated";

export type { DeviceStencil };
export { DEVICE_CATEGORY_LABELS };

export const DEVICE_CATALOG: DeviceStencil[] = DEVICE_STENCILS;

export const DEVICE_VENDORS: { vendor: string; stencils: number; masters: number; locked: number }[] =
  Object.values(
    DEVICE_CATALOG.reduce<Record<string, { vendor: string; stencils: number; masters: number; locked: number }>>(
      (acc, s) => {
        const v = (acc[s.vendor] ??= { vendor: s.vendor, stencils: 0, masters: 0, locked: 0 });
        v.stencils += 1;
        v.masters += s.masters;
        v.locked += s.locked ? 1 : 0;
        return acc;
      },
      {},
    ),
  ).sort((a, b) => b.masters - a.masters || a.vendor.localeCompare(b.vendor));

export const DEVICE_CATEGORIES: { key: string; label: string; stencils: number; masters: number }[] =
  Object.keys(DEVICE_CATEGORY_LABELS)
    .map((key) => {
      const items = DEVICE_CATALOG.filter((s) => s.category === key);
      return {
        key,
        label: DEVICE_CATEGORY_LABELS[key] ?? key,
        stencils: items.length,
        masters: items.reduce((a, s) => a + s.masters, 0),
      };
    })
    .filter((c) => c.stencils > 0);

export const DEVICE_CATALOG_STATS = {
  sources: [
    "Набор_электрика_для_visio.zip",
    "Набор_электрика_часть_01.zip",
    "Набор_электрика_часть_02.zip",
    "Набор_электрика_часть_03.zip",
  ],
  stencils: DEVICE_CATALOG.length,
  vendors: DEVICE_VENDORS.length,
  categories: DEVICE_CATEGORIES.length,
  masters: DEVICE_CATALOG.reduce((a, s) => a + s.masters, 0),
  readable: DEVICE_CATALOG.filter((s) => !s.locked).length,
  locked: DEVICE_CATALOG.filter((s) => s.locked).length,
  vssx: DEVICE_CATALOG.filter((s) => s.format === "vssx").length,
  vss: DEVICE_CATALOG.filter((s) => s.format === "vss").length,
  errors: DEVICE_CATALOG.filter((s) => s.error).length,
};

export function searchDeviceStencils(query: string, vendor = "all", category = "all"): DeviceStencil[] {
  const q = query.trim().toLowerCase();
  return DEVICE_CATALOG.filter((s) => {
    if (vendor !== "all" && s.vendor !== vendor) return false;
    if (category !== "all" && s.category !== category) return false;
    if (!q) return true;
    return [s.name, s.vendor, DEVICE_CATEGORY_LABELS[s.category] ?? s.category, s.texts.join(" ")]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });
}
