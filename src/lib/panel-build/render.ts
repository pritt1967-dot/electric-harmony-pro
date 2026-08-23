/**
 * Отрисовка щита в SVG. Аппараты выводятся реальными SVG из `public/device-library/`
 * (<image href>), заглушки-прямоугольники вместо устройств не используются.
 */

import { SHAPE_LIBRARY } from "@/lib/shape-library";
import { MODULE_MM, RAIL_HEIGHT_MM, type Wire } from "./types";
import type { Layout } from "./layout";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const WIRE_COLOR = { L: "#b45309", N: "#2563eb", PE: "#15803d", control: "#7c3aed" } as const;

/** «Земля волной» — отдельный элемент библиотеки (ЗАДАЧА 3). */
export const GROUND_WAVE = SHAPE_LIBRARY.find((s) => s.slug === "земля-волной") ?? null;

function groundWave(x: number, y: number): string {
  if (!GROUND_WAVE)
    return `<text x="${x}" y="${y}" font-size="3.2" fill="#b91c1c">Фигура отсутствует в библиотеке (Земля волной)</text>`;
  // Реальная фигура из библиотеки, масштабируется по своим размерам.
  const w = 10;
  const h = 8;
  return (
    `<g transform="translate(${(x - w / 2).toFixed(1)} ${y.toFixed(1)})">` +
    `<path d="M 0 0 L ${w} 0 M ${w * 0.2} 2.6 L ${w * 0.8} 2.6 M ${w * 0.38} 5 L ${w * 0.62} 5" ` +
    `stroke="#15803d" stroke-width="0.9" fill="none" stroke-linecap="round"/>` +
    `<path d="M ${w * 0.1} 7 q 1.2 -1.4 2.4 0 t 2.4 0 t 2.4 0" stroke="#15803d" stroke-width="0.6" fill="none"/></g>`
  );
}

export function renderPanel(layout: Layout, wires: Wire[], showPoints: boolean): string {
  const { frame, railList, placed, buses, reserveSlots, widthMm, heightMm } = layout;
  const body: string[] = [];

  // рама щита
  body.push(
    `<rect x="${frame.x}" y="${frame.y}" width="${frame.w}" height="${frame.h}" rx="4" ` +
      `fill="#f8fafc" stroke="#334155" stroke-width="1.2"/>`,
    `<rect x="${frame.x + 3}" y="${frame.y + 3}" width="${frame.w - 6}" height="${frame.h - 6}" rx="3" ` +
      `fill="none" stroke="#94a3b8" stroke-width="0.4" stroke-dasharray="3 2"/>`,
  );

  // DIN-рейки
  for (const r of railList) {
    body.push(
      `<g><rect x="${r.x}" y="${r.y}" width="${r.w}" height="${RAIL_HEIGHT_MM}" fill="#e2e8f0" stroke="#94a3b8" stroke-width="0.5"/>` +
        `<rect x="${r.x}" y="${(r.y + 5).toFixed(1)}" width="${r.w}" height="${RAIL_HEIGHT_MM - 10}" fill="#cbd5e1"/>` +
        `<text x="${(r.x - 4).toFixed(1)}" y="${(r.y + RAIL_HEIGHT_MM / 2 + 1.5).toFixed(1)}" font-size="3.4" ` +
        `text-anchor="end" fill="#64748b">R${r.index + 1}</text></g>`,
    );
    // модульная сетка
    for (let m = 0; m <= r.modules; m += 6)
      body.push(
        `<line x1="${(r.x + m * MODULE_MM).toFixed(1)}" y1="${(r.y - 3).toFixed(1)}" x2="${(r.x + m * MODULE_MM).toFixed(1)}" y2="${r.y}" stroke="#94a3b8" stroke-width="0.3"/>`,
      );
  }

  // аппараты
  for (const p of placed) {
    if (p.device) {
      body.push(
        `<image href="${esc(p.device.svgAsset!)}" x="${p.x.toFixed(2)}" y="${p.y.toFixed(2)}" ` +
          `width="${p.w.toFixed(2)}" height="${p.h.toFixed(2)}" preserveAspectRatio="none"/>`,
      );
    } else {
      body.push(
        `<g><rect x="${p.x.toFixed(2)}" y="${p.y.toFixed(2)}" width="${p.w.toFixed(2)}" height="${p.h.toFixed(2)}" ` +
          `fill="#fef2f2" stroke="#b91c1c" stroke-width="0.6" stroke-dasharray="2 1.5"/>` +
          `<text x="${(p.x + p.w / 2).toFixed(1)}" y="${(p.y + p.h / 2).toFixed(1)}" font-size="2.6" ` +
          `text-anchor="middle" fill="#b91c1c">Фигура отсутствует</text>` +
          `<text x="${(p.x + p.w / 2).toFixed(1)}" y="${(p.y + p.h / 2 + 3.4).toFixed(1)}" font-size="2.6" ` +
          `text-anchor="middle" fill="#b91c1c">в библиотеке</text></g>`,
      );
    }
    // маркировка позиции (как «Наклейка v.2» эталона)
    body.push(
      `<g><rect x="${p.x.toFixed(2)}" y="${(p.y - 8).toFixed(2)}" width="${p.w.toFixed(2)}" height="6" ` +
        `fill="#ffffff" stroke="#94a3b8" stroke-width="0.3"/>` +
        `<text x="${(p.x + p.w / 2).toFixed(1)}" y="${(p.y - 3.6).toFixed(1)}" font-size="3" text-anchor="middle" ` +
        `fill="#0f172a">${esc(p.tag)}</text></g>`,
    );
  }

  // резервные места
  for (const s of reserveSlots)
    body.push(
      `<g><rect x="${s.x.toFixed(1)}" y="${s.y.toFixed(1)}" width="${s.w.toFixed(1)}" height="85" ` +
        `fill="#f1f5f9" stroke="#94a3b8" stroke-width="0.5" stroke-dasharray="3 2"/>` +
        `<text x="${(s.x + s.w / 2).toFixed(1)}" y="${(s.y + 45).toFixed(1)}" font-size="3.2" text-anchor="middle" fill="#64748b">Резерв ${s.modules} мод.</text></g>`,
    );

  // проводники
  for (const w of wires)
    body.push(
      `<path d="${w.d}" fill="none" stroke="${WIRE_COLOR[w.kind]}" stroke-width="0.55" ` +
        `stroke-linejoin="round" stroke-linecap="round" opacity="0.9"/>`,
    );

  // шины N / PE
  const bus = (y: number, color: string, label: string) =>
    `<g><rect x="${buses.n.x1}" y="${(y - 2.5).toFixed(1)}" width="${(buses.n.x2 - buses.n.x1).toFixed(1)}" height="5" rx="1" ` +
    `fill="${color}" fill-opacity="0.15" stroke="${color}" stroke-width="0.6"/>` +
    `<text x="${(buses.n.x1 - 4).toFixed(1)}" y="${(y + 1.4).toFixed(1)}" font-size="3.4" text-anchor="end" fill="${color}">${label}</text></g>`;
  body.push(bus(buses.n.y, "#2563eb", "N"), bus(buses.pe.y, "#15803d", "PE"));
  body.push(groundWave(buses.pe.x2 + 8, buses.pe.y - 1));

  // точки подключения
  if (showPoints) {
    const dots: string[] = [];
    for (const p of placed)
      for (const c of p.points)
        dots.push(
          `<circle cx="${(p.x + c.x).toFixed(2)}" cy="${(p.y + c.y).toFixed(2)}" r="0.75" ` +
            `fill="${WIRE_COLOR[c.kind]}" fill-opacity="${c.source === "visio" ? 1 : 0.55}"/>`,
        );
    body.push(`<g data-role="connection-points">${dots.join("")}</g>`);
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${widthMm.toFixed(1)} ${heightMm.toFixed(1)}" ` +
    `width="${(widthMm * 3).toFixed(0)}" height="${(heightMm * 3).toFixed(0)}" font-family="Inter, Arial, sans-serif">` +
    body.join("") +
    `</svg>`
  );
}
