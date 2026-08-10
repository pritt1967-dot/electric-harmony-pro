import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import logoAsset from "@/assets/logo.png.asset.json";
import fontRegular from "@/assets/DejaVuSans.ttf.asset.json";
import fontBold from "@/assets/DejaVuSans-Bold.ttf.asset.json";
import { qrDataUrl } from "./estimate-qr";
import {
  FOOTER_LINES,
  type Estimate,
  discountAmount,
  formatDate,
  grandTotal,
  lineTotal,
  money,
  subtotal,
} from "./estimates";

const BLUE: [number, number, number] = [29, 78, 216];
const LIGHT: [number, number, number] = [239, 244, 255];
const LINE: [number, number, number] = [216, 222, 232];

async function fetchBase64(url: string) {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i += 8192) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  }
  return btoa(binary);
}

let fontCache: { regular: string; bold: string } | null = null;
let logoCache: string | null = null;

async function loadAssets() {
  if (!fontCache) {
    const [regular, bold] = await Promise.all([
      fetchBase64(fontRegular.url),
      fetchBase64(fontBold.url),
    ]);
    fontCache = { regular, bold };
  }
  if (!logoCache) {
    logoCache = `data:image/png;base64,${await fetchBase64(logoAsset.url)}`;
  }
  return { fonts: fontCache, logo: logoCache };
}

export async function buildEstimatePdf(
  estimate: Estimate,
  logoDataUrl?: string,
  publicUrl?: string,
) {
  const { fonts, logo } = await loadAssets();
  const qr = publicUrl ? await qrDataUrl(publicUrl, 640) : null;
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  doc.addFileToVFS("DejaVuSans.ttf", fonts.regular);
  doc.addFont("DejaVuSans.ttf", "DejaVu", "normal");
  doc.addFileToVFS("DejaVuSans-Bold.ttf", fonts.bold);
  doc.addFont("DejaVuSans-Bold.ttf", "DejaVu", "bold");
  doc.setFont("DejaVu", "normal");

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = 15;

  // ── Header ────────────────────────────────────────────────
  try {
    doc.addImage(logoDataUrl || logo, "PNG", M, 12, 22, 22);
  } catch {
    /* logo optional */
  }
  doc.setFont("DejaVu", "bold");
  doc.setFontSize(18);
  doc.setTextColor(17, 17, 17);
  doc.text("S&M Electric", M + 27, 21);
  doc.setFont("DejaVu", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(90, 98, 112);
  doc.text("Профессиональные электромонтажные работы", M + 27, 27);

  doc.setDrawColor(...BLUE);
  doc.setLineWidth(0.8);
  doc.line(M, 38, pageW - M, 38);

  doc.setFont("DejaVu", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...BLUE);
  doc.text("СМЕТА НА ЭЛЕКТРОМОНТАЖНЫЕ РАБОТЫ", pageW / 2, 47, { align: "center" });
  doc.setFont("DejaVu", "normal");
  doc.setFontSize(9);
  doc.setTextColor(90, 98, 112);
  doc.text("(коммерческое предложение)", pageW / 2, 52.5, { align: "center" });

  // ── Customer block ────────────────────────────────────────
  const blockY = 58;
  const rows: Array<[string, string]> = [
    [`Смета №`, estimate.number || "—"],
    ["Дата", formatDate(estimate.doc_date)],
    ["Заказчик", estimate.customer_name || "—"],
    ["Адрес объекта", estimate.address || "—"],
    ["Телефон", estimate.phone || "—"],
  ];
  if (estimate.email) rows.push(["Email", estimate.email]);
  if (estimate.work_period) rows.push(["Срок выполнения", estimate.work_period]);
  if (estimate.valid_until) rows.push(["Действует до", estimate.valid_until]);

  const blockH = rows.length * 5.6 + 8;
  doc.setFillColor(...LIGHT);
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.2);
  doc.roundedRect(M, blockY, pageW - M * 2, blockH, 2.5, 2.5, "FD");
  doc.setFontSize(9.5);
  rows.forEach(([label, value], i) => {
    const y = blockY + 8 + i * 5.6;
    doc.setTextColor(90, 98, 112);
    doc.text(`${label}:`, M + 5, y);
    doc.setTextColor(17, 17, 17);
    doc.setFont("DejaVu", "bold");
    doc.text(String(value), M + 48, y);
    doc.setFont("DejaVu", "normal");
  });

  // ── Works table ───────────────────────────────────────────
  const body = estimate.items.map((it, i) => [
    String(i + 1),
    it.comment ? `${it.name}\n${it.comment}` : it.name,
    it.unit,
    String(it.qty),
    money(it.price),
    money(lineTotal(it)),
  ]);

  autoTable(doc, {
    startY: blockY + blockH + 8,
    head: [["№", "Наименование работ", "Ед.", "Кол-во", "Цена", "Стоимость"]],
    body,
    margin: { left: M, right: M, bottom: qr ? 62 : 32 },
    styles: {
      font: "DejaVu",
      fontSize: 9,
      cellPadding: 2.4,
      lineColor: LINE,
      lineWidth: 0.2,
      textColor: [17, 17, 17],
    },
    headStyles: {
      font: "DejaVu",
      fontStyle: "bold",
      fillColor: BLUE,
      textColor: [255, 255, 255],
      halign: "center",
    },
    alternateRowStyles: { fillColor: [248, 250, 253] },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 16, halign: "center" },
      3: { cellWidth: 18, halign: "center" },
      4: { cellWidth: 26, halign: "right" },
      5: { cellWidth: 30, halign: "right" },
    },
    didDrawPage: () => {
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.2);
      doc.line(M, pageH - 26, pageW - M, pageH - 26);
      doc.setFont("DejaVu", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...BLUE);
      doc.text(FOOTER_LINES[0]!, M, pageH - 21);
      doc.setFont("DejaVu", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(110, 118, 132);
      doc.text(FOOTER_LINES.slice(1, 4).join("  •  "), M, pageH - 16.5);
      doc.text(FOOTER_LINES.slice(4).join("  •  "), M, pageH - 12.5);
      const page = doc.getNumberOfPages();
      doc.text(`стр. ${page}`, pageW - M, pageH - 12.5, { align: "right" });
      if (qr && page === 1) {
        const qrSize = 30;
        const qrY = pageH - 60;
        doc.addImage(qr, "PNG", M, qrY, qrSize, qrSize);
        doc.setFont("DejaVu", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(...BLUE);
        doc.text(`Смета № ${estimate.number || "—"}`, M + qrSize + 6, qrY + 8);
        doc.setFont("DejaVu", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(90, 98, 112);
        const cap = doc.splitTextToSize(
          "Отсканируйте QR-код для просмотра сметы и подтверждения заказа",
          pageW - M * 2 - qrSize - 6,
        );
        doc.text(cap, M + qrSize + 6, qrY + 14);
        doc.setFontSize(7.5);
        doc.setTextColor(120, 128, 140);
        doc.text(String(publicUrl), M + qrSize + 6, qrY + 26);
      }
    },
  });

  // ── Totals ────────────────────────────────────────────────
  const lastY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
    .finalY;
  let y = lastY + 8;
  const sub = subtotal(estimate.items);
  const disc = discountAmount(
    estimate.items,
    estimate.discount_type,
    estimate.discount_value,
  );
  const total = grandTotal(
    estimate.items,
    estimate.discount_type,
    estimate.discount_value,
  );

  const boxW = 86;
  const boxX = pageW - M - boxW;
  const boxH = 26;
  if (y + boxH > pageH - (qr ? 62 : 32)) {
    doc.addPage();
    y = 20;
  }
  doc.setFillColor(...LIGHT);
  doc.setDrawColor(...LINE);
  doc.roundedRect(boxX, y, boxW, boxH, 2.5, 2.5, "FD");
  doc.setFontSize(9.5);
  doc.setTextColor(90, 98, 112);
  doc.text("Итого:", boxX + 5, y + 7);
  doc.text(
    estimate.discount_type === "percent"
      ? `Скидка (${estimate.discount_value || 0}%):`
      : "Скидка:",
    boxX + 5,
    y + 13.5,
  );
  doc.setTextColor(17, 17, 17);
  doc.text(`${money(sub)} ₽`, boxX + boxW - 5, y + 7, { align: "right" });
  doc.text(`− ${money(disc)} ₽`, boxX + boxW - 5, y + 13.5, { align: "right" });
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(0.4);
  doc.line(boxX + 5, y + 16.5, boxX + boxW - 5, y + 16.5);
  doc.setFont("DejaVu", "bold");
  doc.setFontSize(11.5);
  doc.setTextColor(...BLUE);
  doc.text("Итого к оплате:", boxX + 5, y + 23);
  doc.text(`${money(total)} ₽`, boxX + boxW - 5, y + 23, { align: "right" });
  doc.setFont("DejaVu", "normal");

  if (estimate.note) {
    doc.setFontSize(9);
    doc.setTextColor(90, 98, 112);
    const lines = doc.splitTextToSize(`Примечание: ${estimate.note}`, boxX - M - 6);
    doc.text(lines, M, y + 6);
  }

  return doc;
}

export function estimateFileName(estimate: Estimate, ext: string) {
  const num = (estimate.number || "smeta").replace(/[^\d\w-]+/g, "-");
  return `Smeta-${num}.${ext}`;
}

export async function downloadEstimatePdf(
  estimate: Estimate,
  logoDataUrl?: string,
  publicUrl?: string,
) {
  const doc = await buildEstimatePdf(estimate, logoDataUrl, publicUrl);
  doc.save(estimateFileName(estimate, "pdf"));
}

export async function printEstimatePdf(
  estimate: Estimate,
  logoDataUrl?: string,
  publicUrl?: string,
) {
  const doc = await buildEstimatePdf(estimate, logoDataUrl, publicUrl);
  const url = doc.output("bloburl");
  const win = window.open(url as unknown as string, "_blank");
  win?.addEventListener("load", () => win.print());
}
