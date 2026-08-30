/**
 * Фирменные иконки разделов КП.
 * Один векторный источник — рисуется и в PDF (jsPDF), и в PNG для Word.
 * Координаты нормированы в квадрат 0..1.
 */

type Prim =
  | { t: "line"; a: [number, number]; b: [number, number] }
  | { t: "circle"; c: [number, number]; r: number }
  | { t: "rect"; x: number; y: number; w: number; h: number }
  | { t: "poly"; p: Array<[number, number]>; close?: boolean };

export type OfferIcon = "works" | "lamps" | "cost" | "term" | "warranty";

const ICONS: Record<OfferIcon, Prim[]> = {
  // Лист со списком работ
  works: [
    { t: "rect", x: 0.14, y: 0.08, w: 0.62, h: 0.84 },
    { t: "line", a: [0.26, 0.3], b: [0.64, 0.3] },
    { t: "line", a: [0.26, 0.5], b: [0.64, 0.5] },
    { t: "line", a: [0.26, 0.7], b: [0.52, 0.7] },
    { t: "poly", p: [[0.6, 0.74], [0.72, 0.88], [0.96, 0.5]] },
  ],
  // Лампа
  lamps: [
    { t: "circle", c: [0.5, 0.4], r: 0.28 },
    { t: "line", a: [0.36, 0.72], b: [0.64, 0.72] },
    { t: "line", a: [0.4, 0.86], b: [0.6, 0.86] },
    { t: "line", a: [0.5, 0.04], b: [0.5, 0.12] },
    { t: "line", a: [0.12, 0.4], b: [0.2, 0.4] },
    { t: "line", a: [0.8, 0.4], b: [0.88, 0.4] },
  ],
  // Монета со знаком рубля
  cost: [
    { t: "circle", c: [0.5, 0.5], r: 0.42 },
    { t: "poly", p: [[0.42, 0.76], [0.42, 0.26], [0.6, 0.26]] },
    { t: "poly", p: [[0.6, 0.26], [0.68, 0.34], [0.6, 0.46], [0.42, 0.46]] },
    { t: "line", a: [0.32, 0.58], b: [0.6, 0.58] },
  ],
  // Часы — срок выполнения
  term: [
    { t: "circle", c: [0.5, 0.5], r: 0.42 },
    { t: "poly", p: [[0.5, 0.26], [0.5, 0.52], [0.7, 0.62]] },
  ],
  // Щит — гарантия
  warranty: [
    {
      t: "poly",
      p: [[0.5, 0.06], [0.9, 0.22], [0.9, 0.52], [0.5, 0.94], [0.1, 0.52], [0.1, 0.22]],
      close: true,
    },
    { t: "poly", p: [[0.3, 0.48], [0.45, 0.64], [0.72, 0.34]] },
  ],
};

/** Рисует иконку в PDF в квадрате size×size с левым верхним углом (x, y). */
export function drawPdfIcon(
  doc: {
    setDrawColor: (r: number, g: number, b: number) => void;
    setLineWidth: (w: number) => void;
    line: (x1: number, y1: number, x2: number, y2: number) => void;
    circle: (x: number, y: number, r: number, style?: string) => void;
    rect: (x: number, y: number, w: number, h: number, style?: string) => void;
  },
  icon: OfferIcon,
  x: number,
  y: number,
  size: number,
  color: [number, number, number],
) {
  doc.setDrawColor(...color);
  doc.setLineWidth(Math.max(0.25, size * 0.055));
  const X = (u: number) => x + u * size;
  const Y = (v: number) => y + v * size;
  for (const p of ICONS[icon]) {
    if (p.t === "line") doc.line(X(p.a[0]), Y(p.a[1]), X(p.b[0]), Y(p.b[1]));
    else if (p.t === "circle") doc.circle(X(p.c[0]), Y(p.c[1]), p.r * size, "S");
    else if (p.t === "rect") doc.rect(X(p.x), Y(p.y), p.w * size, p.h * size, "S");
    else {
      const pts = p.close ? [...p.p, p.p[0]] : p.p;
      for (let i = 1; i < pts.length; i++) {
        doc.line(X(pts[i - 1][0]), Y(pts[i - 1][1]), X(pts[i][0]), Y(pts[i][1]));
      }
    }
  }
}

/** Возвращает PNG-иконку (для отдельной картинки в Word). */
export async function iconPng(
  icon: OfferIcon,
  px: number,
  hex: string,
): Promise<Uint8Array | null> {
  if (typeof document === "undefined") return null;
  const scale = 4;
  const canvas = document.createElement("canvas");
  canvas.width = px * scale;
  canvas.height = px * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const s = px * scale;
  ctx.clearRect(0, 0, s, s);
  ctx.strokeStyle = `#${hex}`;
  ctx.lineWidth = Math.max(1, s * 0.075);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  const X = (u: number) => 0.06 * s + u * s * 0.88;
  const Y = (v: number) => 0.06 * s + v * s * 0.88;
  for (const p of ICONS[icon]) {
    ctx.beginPath();
    if (p.t === "line") {
      ctx.moveTo(X(p.a[0]), Y(p.a[1]));
      ctx.lineTo(X(p.b[0]), Y(p.b[1]));
    } else if (p.t === "circle") {
      ctx.arc(X(p.c[0]), Y(p.c[1]), p.r * s * 0.88, 0, Math.PI * 2);
    } else if (p.t === "rect") {
      ctx.rect(X(p.x), Y(p.y), p.w * s * 0.88, p.h * s * 0.88);
    } else {
      p.p.forEach(([u, v], i) => (i ? ctx.lineTo(X(u), Y(v)) : ctx.moveTo(X(u), Y(v))));
      if (p.close) ctx.closePath();
    }
    ctx.stroke();
  }
  const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/png"));
  if (!blob) return null;
  return new Uint8Array(await blob.arrayBuffer());
}
