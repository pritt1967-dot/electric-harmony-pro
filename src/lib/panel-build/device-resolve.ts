/**
 * Подбор реального аппарата библиотеки `public/device-library/` по строке спецификации.
 * Заглушки/случайные фигуры не создаются: если совпадения нет — возвращается null
 * и позиция помечается «Фигура отсутствует в библиотеке».
 */

import { PHYSICAL_DEVICES } from "@/lib/shape-library/device-library-generated";
import type { PhysicalDevice } from "@/lib/shape-library/device-library-types";
import { MODULE_MM, type Resolution, type SpecItem } from "./types";

const norm = (s: string) =>
  s.toLowerCase().replace(/ё/g, "е").replace(/[^a-zа-я0-9]+/g, " ").trim();

/** Аппараты с реальным SVG — только они допускаются к раскладке. */
export const DRAWABLE_DEVICES: PhysicalDevice[] = PHYSICAL_DEVICES.filter(
  (d) => d.hasSvg && Boolean(d.svgAsset),
);

/** Реальное число модулей аппарата: из источника либо по ширине мастера. */
export function deviceModules(d: PhysicalDevice): number {
  if (d.modules && d.modules > 0) return d.modules;
  const w = d.moduleWidthMm ?? d.width ?? 0;
  return Math.max(1, Math.round(w / MODULE_MM));
}

export function deviceWidthMm(d: PhysicalDevice): number {
  const w = d.moduleWidthMm ?? d.width ?? 0;
  return w > 0 ? w : deviceModules(d) * MODULE_MM;
}

export function deviceHeightMm(d: PhysicalDevice): number {
  return d.height && d.height > 0 ? d.height : 85;
}

export function resolveDevice(item: SpecItem): Resolution {
  let pool = DRAWABLE_DEVICES;
  const steps: string[] = [];

  if (item.deviceType) {
    const next = pool.filter((d) => d.deviceType === item.deviceType);
    if (!next.length)
      return { item, device: null, reason: `нет аппаратов типа «${item.deviceType}» с фигурой`, candidates: 0 };
    pool = next;
    steps.push("тип");
  }

  if (item.manufacturer?.trim()) {
    const m = norm(item.manufacturer);
    const next = pool.filter((d) => norm(d.manufacturer).includes(m));
    if (!next.length)
      return {
        item,
        device: null,
        reason: `производитель «${item.manufacturer}» не найден для этого типа`,
        candidates: 0,
      };
    pool = next;
    steps.push("производитель");
  }

  if (item.poles != null) {
    const next = pool.filter((d) => d.poles === item.poles);
    if (next.length) {
      pool = next;
      steps.push("полюса");
    }
  }

  const tokens = norm(`${item.series ?? ""} ${item.model ?? ""}`).split(" ").filter(Boolean);
  if (tokens.length) {
    const scored = pool
      .map((d) => {
        const hay = norm(`${d.series} ${d.model} ${d.article ?? ""}`);
        return { d, hit: tokens.filter((t) => hay.includes(t)).length };
      })
      .sort((a, b) => b.hit - a.hit);
    const best = scored[0];
    if (best && best.hit > 0) {
      pool = scored.filter((s) => s.hit === best.hit).map((s) => s.d);
      steps.push("модель");
    }
  }

  if (item.ratedCurrent != null) {
    const exact = pool.filter((d) => d.ratedCurrent === item.ratedCurrent);
    if (exact.length) {
      pool = exact;
      steps.push("номинал");
    }
  }

  if (item.modules != null) {
    const byMod = pool.filter((d) => deviceModules(d) === item.modules);
    if (byMod.length) {
      pool = byMod;
      steps.push("модули");
    }
  }

  if (!pool.length)
    return { item, device: null, reason: "совпадений в библиотеке нет", candidates: 0 };

  const device = pool[0]!;
  return {
    item,
    device,
    reason: `подобрано по ${steps.join(" → ") || "единственному совпадению"}`,
    candidates: pool.length,
  };
}
