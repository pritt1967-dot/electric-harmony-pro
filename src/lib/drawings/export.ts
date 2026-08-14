/** Экспорт технических чертежей: PNG, PDF (векторное качество линий), печать. */

import jsPDF from "jspdf";

function svgSize(svg: string) {
  const vb = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  return { w: Number(vb?.[1] ?? 420), h: Number(vb?.[2] ?? 297) };
}

export function downloadSvg(svg: string, filename: string) {
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.svg`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Рендер SVG в PNG высокого разрешения (по умолчанию ~300 dpi). */
export async function svgToPng(svg: string, dpi = 300): Promise<string> {
  const { w, h } = svgSize(svg);
  const scale = dpi / 25.4; // координаты в мм
  const px = Math.round(w * scale);
  const py = Math.round(h * scale);
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  const img = new Image();
  img.decoding = "sync";
  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = () => rej(new Error("Не удалось отрисовать чертёж"));
    img.src = url;
  });
  const canvas = document.createElement("canvas");
  canvas.width = px;
  canvas.height = py;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, px, py);
  ctx.drawImage(img, 0, 0, px, py);
  return canvas.toDataURL("image/png");
}

export async function downloadPng(svg: string, filename: string, dpi = 300) {
  const data = await svgToPng(svg, dpi);
  const a = document.createElement("a");
  a.href = data;
  a.download = `${filename}.png`;
  a.click();
}

/** PDF 1:1 по размеру листа — чертёж не обрезается. */
export async function downloadPdf(sheets: string[], filename: string, dpi = 300) {
  if (!sheets.length) return;
  let doc: jsPDF | null = null;
  for (const svg of sheets) {
    const { w, h } = svgSize(svg);
    const orientation = w >= h ? "landscape" : "portrait";
    if (!doc) doc = new jsPDF({ orientation, unit: "mm", format: [w, h], compress: true });
    else doc.addPage([w, h], orientation);
    const png = await svgToPng(svg, dpi);
    doc.addImage(png, "PNG", 0, 0, w, h, undefined, "FAST");
  }
  doc!.save(`${filename}.pdf`);
}

export function printSheets(sheets: string[], title: string) {
  const win = window.open("", "_blank");
  if (!win) return;
  const body = sheets
    .map((s) => `<div class="sheet">${s}</div>`)
    .join("");
  win.document.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
     <style>
       @page { margin: 0; }
       body { margin: 0; background: #fff; }
       .sheet { page-break-after: always; }
       .sheet:last-child { page-break-after: auto; }
       svg { display: block; }
     </style></head><body>${body}
     <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 300); }<\/script>
     </body></html>`,
  );
  win.document.close();
}
