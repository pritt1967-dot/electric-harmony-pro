import { elementSvg, PAGE_MM, PX_PER_MM, pageSize } from "./library";
import { pointsToPath, wirePoints } from "./routing";
import type { SchDoc } from "./types";

function esc(s: string) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

function frameSvg(doc: SchDoc) {
  const { w, h } = pageSize(doc);
  const m = 5 * PX_PER_MM;
  const left = 20 * PX_PER_MM;
  const tbW = 185 * PX_PER_MM > w - left - m ? w - left - m : 185 * PX_PER_MM;
  const tbH = 55 * PX_PER_MM;
  const x0 = w - m - tbW;
  const y0 = h - m - tbH;
  const t = doc.title;
  const row = (i: number, label: string, value: string) =>
    `<text x="${x0 + 10}" y="${y0 + 22 + i * 26}" font-size="11" font-family="Arial" fill="#6b7280">${esc(label)}</text>` +
    `<text x="${x0 + 130}" y="${y0 + 22 + i * 26}" font-size="13" font-family="Arial" fill="#111827">${esc(value)}</text>`;
  return `
  <rect x="0" y="0" width="${w}" height="${h}" fill="#ffffff"/>
  <rect x="${left}" y="${m}" width="${w - left - m}" height="${h - 2 * m}" fill="none" stroke="#111827" stroke-width="2"/>
  <rect x="${x0}" y="${y0}" width="${tbW}" height="${tbH}" fill="none" stroke="#111827" stroke-width="2"/>
  <text x="${x0 + 10}" y="${y0 - 8}" font-size="16" font-family="Arial" font-weight="bold" fill="#1d4ed8">S&amp;M ELECTRIC</text>
  ${row(0, "Проект:", t.object || "—")}
  ${row(1, "Схема:", t.name || "—")}
  ${row(2, "Дата:", t.date)}
  ${row(3, "Разработал:", t.author)}
  ${row(4, "Лист:", t.sheet)}`;
}

function contentSvg(doc: SchDoc) {
  const wires = doc.wires
    .map((wr) => {
      const pts = wirePoints(doc, wr);
      if (!pts) return "";
      return `<path d="${pointsToPath(pts)}" fill="none" stroke="${wr.color || doc.colors[wr.kind]}" stroke-width="1.8" stroke-linejoin="miter"/>`;
    })
    .join("");
  const els = doc.elements.map((e) => elementSvg(e, doc)).join("");
  return wires + els;
}

/** Bounding box of the drawing content. */
export function contentBounds(doc: SchDoc) {
  if (!doc.elements.length) return { x: 0, y: 0, w: 800, h: 600 };
  const xs = doc.elements.flatMap((e) => [e.x, e.x + e.w]);
  const ys = doc.elements.flatMap((e) => [e.y, e.y + e.h + 30]);
  const x = Math.min(...xs) - 40;
  const y = Math.min(...ys) - 40;
  return { x, y, w: Math.max(...xs) - x + 40, h: Math.max(...ys) - y + 40 };
}

/** Full standalone SVG document, scaled to fit the selected page. */
export function buildSvgDocument(doc: SchDoc) {
  const { w, h } = pageSize(doc);
  const b = contentBounds(doc);
  const inner = { x: 24 * PX_PER_MM, y: 8 * PX_PER_MM, w: w - 30 * PX_PER_MM, h: h - 70 * PX_PER_MM };
  const k = Math.min(inner.w / b.w, inner.h / b.h, 1.6);
  const tx = inner.x + (inner.w - b.w * k) / 2 - b.x * k;
  const ty = inner.y + (inner.h - b.h * k) / 2 - b.y * k;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
${frameSvg(doc)}
<g transform="translate(${tx.toFixed(2)},${ty.toFixed(2)}) scale(${k.toFixed(4)})">${contentSvg(doc)}</g>
</svg>`;
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportSvg(doc: SchDoc, name: string) {
  download(new Blob([buildSvgDocument(doc)], { type: "image/svg+xml;charset=utf-8" }), `${name}.svg`);
}

export async function renderPng(doc: SchDoc, scale = 2): Promise<string> {
  const svg = buildSvgDocument(doc);
  const { w, h } = pageSize(doc);
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error("Не удалось отрисовать схему"));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function exportPng(doc: SchDoc, name: string) {
  const data = await renderPng(doc);
  const a = document.createElement("a");
  a.href = data;
  a.download = `${name}.png`;
  a.click();
}

export async function exportPdf(doc: SchDoc, name: string) {
  const { jsPDF } = await import("jspdf");
  const [a, b] = PAGE_MM[doc.page.format];
  const wmm = doc.page.landscape ? b : a;
  const hmm = doc.page.landscape ? a : b;
  const png = await renderPng(doc, 3);
  const pdf = new jsPDF({
    orientation: doc.page.landscape ? "landscape" : "portrait",
    unit: "mm",
    format: [wmm, hmm],
  });
  pdf.addImage(png, "PNG", 0, 0, wmm, hmm, undefined, "FAST");
  pdf.save(`${name}.pdf`);
}

/** Minimal DXF (R12) export: rectangles, wires and texts. */
export function exportDxf(doc: SchDoc, name: string) {
  const out: string[] = ["0", "SECTION", "2", "ENTITIES"];
  const flipY = (y: number) => -y;
  const line = (x1: number, y1: number, x2: number, y2: number, layer: string) =>
    out.push("0", "LINE", "8", layer, "10", String(x1), "20", String(flipY(y1)), "11", String(x2), "21", String(flipY(y2)));
  const text = (x: number, y: number, h: number, s: string) =>
    out.push("0", "TEXT", "8", "TEXT", "10", String(x), "20", String(flipY(y)), "40", String(h), "1", s.replace(/\n/g, " "));

  doc.elements.forEach((e) => {
    line(e.x, e.y, e.x + e.w, e.y, "ELEMENTS");
    line(e.x + e.w, e.y, e.x + e.w, e.y + e.h, "ELEMENTS");
    line(e.x + e.w, e.y + e.h, e.x, e.y + e.h, "ELEMENTS");
    line(e.x, e.y + e.h, e.x, e.y, "ELEMENTS");
    text(e.x + 4, e.y + 14, 9, `${e.ref} ${e.rating}`.trim());
    if (e.name) text(e.x + 4, e.y + e.h + 12, 8, e.name);
  });
  doc.wires.forEach((w) => {
    const pts = wirePoints(doc, w);
    if (!pts) return;
    for (let i = 1; i < pts.length; i++)
      line(pts[i - 1]![0], pts[i - 1]![1], pts[i]![0], pts[i]![1], `WIRE_${w.kind}`);
  });
  out.push("0", "ENDSEC", "0", "EOF");
  download(new Blob([out.join("\n")], { type: "application/dxf" }), `${name}.dxf`);
}

export function printSchematic(doc: SchDoc) {
  const svg = buildSvgDocument(doc);
  const win = window.open("", "_blank", "width=1200,height=900");
  if (!win) return;
  const landscape = doc.page.landscape ? "landscape" : "portrait";
  win.document.write(`<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>${esc(doc.title.name)}</title>
<style>@page{size:${doc.page.format} ${landscape};margin:0}
html,body{margin:0;padding:0}svg{width:100%;height:auto;display:block}</style></head>
<body>${svg}<script>window.onload=()=>{window.focus();window.print();}<\/script></body></html>`);
  win.document.close();
}
