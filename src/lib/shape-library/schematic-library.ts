/**
 * БИБЛИОТЕКА №1 — УГО однолинейной схемы.
 *
 * Источник графики: electricaldiagramTimVisio.vss (все 90 мастеров).
 * Эталон построения/оформления схемы — «Документ1.vsdx» (из него взяты точные
 * connection points и пользовательские свойства для используемых там фигур).
 *
 * Эта библиотека НЕ содержит физических SVG модульных аппаратов — они живут
 * в отдельной библиотеке №2 (`@/lib/shape-library`).
 * К рабочему визуализатору не подключена: только тестовая система.
 */

import {
  SCHEMATIC_SYMBOLS,
  SCHEMATIC_CATEGORIES,
  type SchematicSymbol,
  type SchematicConnPoint,
  type SchematicProp,
} from "./schematic-generated";

export type { SchematicSymbol, SchematicConnPoint, SchematicProp };

export const SCHEMATIC_LIBRARY: SchematicSymbol[] = SCHEMATIC_SYMBOLS;

export const SCHEMATIC_CATEGORY_LIST = SCHEMATIC_CATEGORIES;

export const SCHEMATIC_CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  SCHEMATIC_CATEGORIES.map((c) => [c.key, c.label]),
);

const BY_ID = new Map(SCHEMATIC_LIBRARY.map((s) => [s.id, s]));

export function getSchematicSymbol(id: string): SchematicSymbol | undefined {
  return BY_ID.get(id);
}

/** Поиск по названию, ID, категории, текстам и свойствам фигуры. */
export function searchSchematicSymbols(query: string, category = "all"): SchematicSymbol[] {
  const q = query.trim().toLowerCase();
  return SCHEMATIC_LIBRARY.filter((s) => {
    if (category !== "all" && s.category !== category) return false;
    if (!q) return true;
    return [
      s.id,
      s.name,
      SCHEMATIC_CATEGORY_LABEL[s.category] ?? s.category,
      s.texts.join(" "),
      s.props.map((p) => `${p.label} ${p.value}`).join(" "),
      s.master_id ?? "",
    ]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });
}

export function symbolsByCategory(): { key: string; label: string; items: SchematicSymbol[] }[] {
  return SCHEMATIC_CATEGORIES.map((c) => ({
    ...c,
    items: SCHEMATIC_LIBRARY.filter((s) => s.category === c.key),
  })).filter((g) => g.items.length > 0);
}

/** Дубликаты по имени + габаритам (в библиотеке храним только уникальные фигуры). */
export function duplicateGroups(): { key: string; ids: string[] }[] {
  const map = new Map<string, string[]>();
  for (const s of SCHEMATIC_LIBRARY) {
    const key = `${s.name}|${s.width_mm}x${s.height_mm}`;
    map.set(key, [...(map.get(key) ?? []), s.id]);
  }
  return [...map.entries()].filter(([, ids]) => ids.length > 1).map(([key, ids]) => ({ key, ids }));
}

export const SCHEMATIC_LIBRARY_STATS = {
  sourceVss: "electricaldiagramTimVisio.vss",
  referenceDoc: "Документ1.vsdx",
  vssMasters: 90,
  imported: SCHEMATIC_LIBRARY.length,
  categories: SCHEMATIC_CATEGORIES.length,
  withVisioConns: SCHEMATIC_LIBRARY.filter((s) => s.conn_source === "visio-master").length,
  withGeometryConns: SCHEMATIC_LIBRARY.filter((s) => s.conn_source === "geometry").length,
  withoutConns: SCHEMATIC_LIBRARY.filter((s) => s.conn_source === "none").length,
  connectionPoints: SCHEMATIC_LIBRARY.reduce((a, s) => a + s.connection_points.length, 0),
  withTexts: SCHEMATIC_LIBRARY.filter((s) => s.texts.length > 0).length,
  withProps: SCHEMATIC_LIBRARY.filter((s) => s.props.length > 0).length,
  withGeometry: SCHEMATIC_LIBRARY.filter((s) => s.paths > 0).length,
  duplicates: duplicateGroups().length,
  hasPI: SCHEMATIC_LIBRARY.some((s) => s.name.trim().toUpperCase() === "PI"),
  piId: SCHEMATIC_LIBRARY.find((s) => s.name.trim().toUpperCase() === "PI")?.id ?? null,
};

export type LibraryIssue = { id: string; name: string; level: "error" | "warning"; message: string };

/** Список проблем импорта: пустая геометрия — ошибка, приблизительные точки — предупреждение. */
export function schematicLibraryIssues(): LibraryIssue[] {
  const out: LibraryIssue[] = [];
  for (const s of SCHEMATIC_LIBRARY) {
    for (const e of s.errors) {
      const level: LibraryIssue["level"] = e.startsWith("Пустая геометрия") ? "error" : "warning";
      out.push({ id: s.id, name: s.name, level, message: e });
    }
  }
  return out;
}

/** Готовность библиотеки к использованию в будущих проектах. */
export function schematicLibraryReadiness() {
  const errors = schematicLibraryIssues().filter((i) => i.level === "error").length;
  const s = SCHEMATIC_LIBRARY_STATS;
  return {
    geometry: s.withGeometry === s.imported,
    connections: s.withoutConns === 0,
    categories: s.categories > 0,
    noDuplicates: s.duplicates === 0,
    pi: s.hasPI,
    errors,
    ready: errors === 0 && s.withoutConns === 0 && s.hasPI && s.duplicates === 0,
  };
}
