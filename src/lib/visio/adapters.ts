/**
 * Преобразование схем и визуализации щита в фигуры Visio (.vsdx).
 */

import type { PanelDesign } from "@/lib/panel";
import type { VisualRail } from "@/lib/panel-visual";
import { CATEGORY_LABEL } from "@/lib/panel-visual";
import { pointsToPath as _p, wirePoints } from "@/lib/schematic/routing";
import type { SchDoc } from "@/lib/schematic/types";
import { downloadVsdx, type VsPage, type VsShape } from "./vsdx";

void _p;

const MODULE_W = 30;
const RAIL_H = 96;

function titleBlock(
  shapes: VsShape[],
  x: number,
  y: number,
  rows: [string, string][],
) {
  shapes.push({
    kind: "rect",
    x,
    y,
    w: 460,
    h: 26 + rows.length * 22,
    fill: "#FFFFFF",
    stroke: "#111827",
    lineWeight: 2,
  });
  shapes.push({
    kind: "text",
    x: x + 10,
    y: y + 4,
    w: 300,
    h: 20,
    text: "S&M ELECTRIC",
    fontSize: 13,
    bold: true,
    textColor: "#1D4ED8",
  });
  rows.forEach((r, i) => {
    shapes.push({
      kind: "text",
      x: x + 10,
      y: y + 26 + i * 22,
      w: 130,
      h: 20,
      text: r[0],
      fontSize: 10,
      textColor: "#6B7280",
    });
    shapes.push({
      kind: "text",
      x: x + 140,
      y: y + 26 + i * 22,
      w: 310,
      h: 20,
      text: r[1],
      fontSize: 11,
    });
  });
}

/** Однолинейная схема из результата проектировщика. */
export function panelSingleLineVisioPage(design: PanelDesign): VsPage {
  const shapes: VsShape[] = [];
  const lines = design.lines ?? [];
  const chain = design.protection_chain ?? [];
  const busX = 200;
  const topY = 120 + chain.length * 36;

  shapes.push({
    kind: "text",
    x: 40,
    y: 24,
    w: 900,
    h: 26,
    text: `Однолинейная схема — ${design.summary?.enclosure ?? "щит"}`,
    fontSize: 18,
    bold: true,
  });
  shapes.push({
    kind: "text",
    x: 40,
    y: 52,
    w: 900,
    h: 20,
    text: `${design.summary?.supply ?? ""} · ${design.summary?.grounding ?? ""}`,
    fontSize: 11,
    textColor: "#475569",
  });

  const bottomY = topY + Math.max(1, lines.length) * 56;
  shapes.push({
    kind: "line",
    x1: busX,
    y1: 92,
    x2: busX,
    y2: bottomY,
    stroke: "#1D4ED8",
    lineWeight: 3,
    name: "Шина ввода",
  });
  shapes.push({
    kind: "text",
    x: 40,
    y: 88,
    w: 150,
    h: 18,
    text: "ВВОД L1 L2 L3 N PE",
    fontSize: 11,
    bold: true,
    textColor: "#1D4ED8",
  });

  chain.forEach((step, i) => {
    const y = 110 + i * 36;
    shapes.push({
      kind: "rect",
      x: busX - 60,
      y,
      w: 380,
      h: 28,
      text: step,
      fontSize: 11,
      fill: "#EFF6FF",
      stroke: "#1D4ED8",
      name: `Ввод ${i + 1}`,
    });
  });

  lines.forEach((l, i) => {
    const y = topY + i * 56;
    shapes.push({
      kind: "line",
      x1: busX,
      y1: y + 14,
      x2: busX + 90,
      y2: y + 14,
      stroke: "#111827",
    });
    shapes.push({
      kind: "rect",
      x: busX + 90,
      y,
      w: 76,
      h: 28,
      text: l.breaker,
      fontSize: 10,
      stroke: "#111827",
      lineWeight: 2,
      name: `${l.mark} ${l.breaker}`,
    });
    shapes.push({
      kind: "line",
      x1: busX + 166,
      y1: y + 14,
      x2: busX + 250,
      y2: y + 14,
      stroke: "#111827",
    });
    shapes.push({
      kind: "text",
      x: busX + 92,
      y: y - 18,
      w: 100,
      h: 16,
      text: l.mark,
      fontSize: 9,
      bold: true,
      textColor: "#1D4ED8",
    });
    shapes.push({
      kind: "text",
      x: busX + 258,
      y: y - 2,
      w: 460,
      h: 18,
      text: l.name,
      fontSize: 11,
    });
    shapes.push({
      kind: "text",
      x: busX + 258,
      y: y + 16,
      w: 460,
      h: 16,
      text: `${l.cable} · ${l.poles}P · ${l.phase}${l.rcd ? ` · УЗО ${l.rcd}` : ""} · ${l.current_a} А`,
      fontSize: 9,
      textColor: "#64748B",
    });
  });

  titleBlock(shapes, 40, bottomY + 40, [
    ["Схема:", "Однолинейная схема щита"],
    ["Щит:", design.summary?.enclosure ?? "—"],
    ["Питание:", design.summary?.supply ?? "—"],
    ["Дата:", new Date().toLocaleDateString("ru-RU")],
  ]);

  return { title: "Однолинейная схема", shapes };
}

/** Компоновка щита по DIN-рейкам (визуализация из спецификации). */
export function panelLayoutVisioPage(rails: VisualRail[], name: string): VsPage {
  const shapes: VsShape[] = [];
  const active = rails.filter((r) => r.items.length);
  const capacity = Math.max(...active.map((r) => r.capacity), 12);
  const originX = 90;
  const originY = 110;
  const innerW = capacity * MODULE_W;

  shapes.push({
    kind: "text",
    x: 40,
    y: 26,
    w: 900,
    h: 26,
    text: `Компоновка щита — ${name}`,
    fontSize: 18,
    bold: true,
  });
  shapes.push({
    kind: "text",
    x: 40,
    y: 56,
    w: 900,
    h: 20,
    text: `DIN-реек: ${active.length} · модулей в ряду: ${capacity}`,
    fontSize: 11,
    textColor: "#475569",
  });

  // Корпус щита
  shapes.push({
    kind: "rect",
    x: originX - 30,
    y: originY - 26,
    w: innerW + 60,
    h: active.length * RAIL_H + 52,
    fill: "#FFFFFF",
    stroke: "#111827",
    lineWeight: 2,
    name: "Корпус щита",
  });

  active.forEach((rail, ri) => {
    const y = originY + ri * RAIL_H;
    shapes.push({
      kind: "text",
      x: originX - 26,
      y: y - 20,
      w: 300,
      h: 16,
      text: `DIN-рейка ${rail.index} · ${rail.used}/${rail.capacity} мод.`,
      fontSize: 9,
      bold: true,
      textColor: "#1D4ED8",
    });
    shapes.push({
      kind: "rect",
      x: originX,
      y,
      w: innerW,
      h: 56,
      fill: "#F1F5F9",
      stroke: "#94A3B8",
      lineWeight: 1,
      name: `Рейка ${rail.index}`,
    });
    rail.items.forEach((d) => {
      const x = originX + d.offset * MODULE_W;
      const w = d.modules * MODULE_W;
      shapes.push({
        kind: "rect",
        x: x + 1,
        y: y + 3,
        w: w - 2,
        h: 50,
        fill: "#FFFFFF",
        stroke: "#111827",
        lineWeight: 1.5,
        name: `${d.model || d.name}`,
      });
      shapes.push({
        kind: "text",
        x: x + 2,
        y: y + 8,
        w: w - 4,
        h: 14,
        text: d.rating || String(d.poles) + "P",
        fontSize: 7,
        align: "center",
      });
      shapes.push({
        kind: "text",
        x: x + 2,
        y: y + 34,
        w: w - 4,
        h: 14,
        text: (d.model || d.name).slice(0, 14),
        fontSize: 6,
        align: "center",
        textColor: "#475569",
      });
    });
  });

  // Легенда по категориям
  const legendY = originY + active.length * RAIL_H + 60;
  const cats = Array.from(new Set(active.flatMap((r) => r.items.map((i) => i.category))));
  shapes.push({
    kind: "text",
    x: 40,
    y: legendY,
    w: 300,
    h: 18,
    text: "Состав по спецификации",
    fontSize: 12,
    bold: true,
  });
  cats.forEach((c, i) => {
    const count = active
      .flatMap((r) => r.items)
      .filter((d) => d.category === c).length;
    shapes.push({
      kind: "text",
      x: 40,
      y: legendY + 24 + i * 18,
      w: 460,
      h: 16,
      text: `${CATEGORY_LABEL[c]} — ${count} шт.`,
      fontSize: 10,
      textColor: "#475569",
    });
  });

  titleBlock(shapes, 40, legendY + 40 + cats.length * 18, [
    ["Схема:", "Компоновка оборудования в щите"],
    ["Проект:", name],
    ["Дата:", new Date().toLocaleDateString("ru-RU")],
  ]);

  return { title: "Компоновка щита", shapes };
}

/** Векторная схема из редактора (Visio-подобный редактор → настоящий Visio). */
export function schematicVisioPage(doc: SchDoc): VsPage {
  const shapes: VsShape[] = [];

  doc.wires.forEach((w) => {
    const pts = wirePoints(doc, w);
    if (!pts) return;
    for (let i = 1; i < pts.length; i++) {
      shapes.push({
        kind: "line",
        x1: pts[i - 1]![0],
        y1: pts[i - 1]![1],
        x2: pts[i]![0],
        y2: pts[i]![1],
        stroke: (w.color || doc.colors[w.kind] || "#111827").toUpperCase(),
        lineWeight: 1.8,
        name: w.kind,
      });
    }
  });

  doc.elements.forEach((e) => {
    shapes.push({
      kind: "rect",
      x: e.x,
      y: e.y,
      w: e.w,
      h: e.h,
      stroke: "#111827",
      lineWeight: 1.8,
      name: `${e.ref} ${e.type}`,
    });
    shapes.push({
      kind: "text",
      x: e.x,
      y: e.y + 6,
      w: e.w,
      h: 16,
      text: `${e.ref}${doc.show.rating && e.rating ? " " + e.rating : ""}`,
      fontSize: 10,
      bold: true,
      align: "center",
    });
    if (doc.show.name && e.name)
      shapes.push({
        kind: "text",
        x: e.x - 10,
        y: e.y + e.h + 2,
        w: e.w + 20,
        h: 14,
        text: e.name,
        fontSize: 8,
        align: "center",
        textColor: "#475569",
      });
    if (doc.show.cable && e.cable)
      shapes.push({
        kind: "text",
        x: e.x - 10,
        y: e.y + e.h + 16,
        w: e.w + 20,
        h: 14,
        text: e.cable,
        fontSize: 7,
        align: "center",
        textColor: "#64748B",
      });
  });

  const maxY = Math.max(0, ...doc.elements.map((e) => e.y + e.h)) + 60;
  titleBlock(shapes, 40, maxY, [
    ["Проект:", doc.title.object || "—"],
    ["Схема:", doc.title.name || "—"],
    ["Дата:", doc.title.date],
    ["Разработал:", doc.title.author],
  ]);

  return { title: doc.title.name || "Схема", shapes };
}

export function exportPanelSingleLineVsdx(design: PanelDesign, name: string) {
  downloadVsdx([panelSingleLineVisioPage(design)], name);
}

export function exportPanelLayoutVsdx(rails: VisualRail[], name: string) {
  downloadVsdx([panelLayoutVisioPage(rails, name)], name);
}

export function exportSchematicVsdx(doc: SchDoc, name: string) {
  downloadVsdx([schematicVisioPage(doc)], name);
}

/** Обе схемы одним файлом: лист 1 — однолинейная, лист 2 — компоновка. */
export function exportPanelVsdx(
  design: PanelDesign,
  rails: VisualRail[] | null,
  name: string,
) {
  const pages: VsPage[] = [panelSingleLineVisioPage(design)];
  if (rails && rails.some((r) => r.items.length))
    pages.push(panelLayoutVisioPage(rails, name));
  downloadVsdx(pages, name);
}
