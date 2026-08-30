import { jsPDF } from "jspdf";

import { loadAssets } from "./estimate-pdf";
import { money } from "./estimates";
import { drawPdfIcon, type OfferIcon } from "./offer-icons";
import { OFFER_BRAND, type OfferDoc, offerDateLabel, offerFileName } from "./offer";

const RED = OFFER_BRAND.red;
const GREY: [number, number, number] = [90, 98, 112];
const LINE: [number, number, number] = [222, 226, 232];
const INK: [number, number, number] = [17, 17, 17];

export async function buildOfferPdf(doc0: OfferDoc) {
  const { fonts, logo } = await loadAssets();
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  doc.addFileToVFS("DejaVuSans.ttf", fonts.regular);
  doc.addFont("DejaVuSans.ttf", "DejaVu", "normal");
  doc.addFileToVFS("DejaVuSans-Bold.ttf", fonts.bold);
  doc.addFont("DejaVuSans-Bold.ttf", "DejaVu", "bold");
  doc.setFont("DejaVu", "normal");

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = 18;

  /* ── Шапка бланка ─────────────────────────────────────── */
  // Логотип — оригинальный файл, пропорции сохраняются, без фона и обрезки.
  try {
    const props = doc.getImageProperties(logo);
    const maxH = 20;
    const maxW = 52;
    const ratio = props.width / props.height;
    let h = maxH;
    let w = h * ratio;
    if (w > maxW) {
      w = maxW;
      h = w / ratio;
    }
    doc.addImage(logo, "PNG", M, 14 + (maxH - h) / 2, w, h);
  } catch {
    /* logo optional */
  }

  doc.setFontSize(9);
  doc.setTextColor(...INK);
  const contacts = [
    OFFER_BRAND.phone1,
    OFFER_BRAND.phone2,
    OFFER_BRAND.email,
    OFFER_BRAND.site,
  ];
  contacts.forEach((c, i) => {
    doc.text(c, pageW - M, 16 + i * 4.6, { align: "right" });
  });

  // Тонкая линия под шапкой
  doc.setDrawColor(...RED);
  doc.setLineWidth(0.4);
  doc.line(M, 39, pageW - M, 39);

  /* ── Заголовок ────────────────────────────────────────── */
  doc.setFont("DejaVu", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...RED);
  doc.text("КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ", pageW / 2, 49, { align: "center" });

  let y = 59;
  doc.setFont("DejaVu", "normal");
  doc.setFontSize(10);
  const rows: Array<[string, string]> = [["Заказчик", doc0.customer_name || "—"]];
  if (doc0.object_name) rows.push(["Объект", doc0.object_name]);
  rows.push(["Исполнитель", OFFER_BRAND.name]);
  rows.push(["Дата", offerDateLabel(doc0)]);
  rows.forEach(([k, v]) => {
    doc.setTextColor(...GREY);
    doc.text(`${k}:`, M, y);
    doc.setTextColor(...INK);
    doc.setFont("DejaVu", "bold");
    doc.text(String(v), M + 32, y);
    doc.setFont("DejaVu", "normal");
    y += 5.6;
  });

  y += 3;
  doc.setTextColor(...INK);
  doc.setFontSize(10.5);
  doc.splitTextToSize(doc0.intro, pageW - M * 2).forEach((l: string) => {
    doc.text(l, M, y);
    y += 5.5;
  });

  /* ── Разделы с фирменными иконками ────────────────────── */
  const section = (title: string, icon: OfferIcon) => {
    drawPdfIcon(doc, icon, M, y - 4.2, 5, RED);
    doc.setFont("DejaVu", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...RED);
    doc.text(title, M + 7.5, y);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.3);
    doc.line(M, y + 2.4, pageW - M, y + 2.4);
    doc.setFont("DejaVu", "normal");
    doc.setTextColor(...INK);
    y += 8.5;
  };

  y += 5;
  section("ПЕРЕЧЕНЬ РАБОТ", "works");
  doc.setFontSize(10);
  doc0.works.forEach((w) => {
    const lines = doc.splitTextToSize(w, pageW - M * 2 - 7) as string[];
    doc.setFillColor(...RED);
    doc.circle(M + 1.6, y - 1.4, 0.9, "F");
    lines.forEach((l, i) => doc.text(l, M + 6, y + i * 5));
    y += lines.length * 5 + 1.2;
  });

  /* ── Светильники ──────────────────────────────────────── */
  if (doc0.show_lamps && doc0.lamps_text.trim()) {
    y += 4;
    section("СВЕТИЛЬНИКИ", "lamps");
    doc.setFontSize(9.5);
    doc.setTextColor(...GREY);
    doc.splitTextToSize(doc0.lamps_text, pageW - M * 2).forEach((l: string) => {
      doc.text(l, M, y);
      y += 4.8;
    });
    doc.setTextColor(...INK);
  }

  /* ── Стоимость ────────────────────────────────────────── */
  y += 6;
  section("СТОИМОСТЬ", "cost");
  const boxH = 26;
  doc.setFillColor(250, 245, 245);
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.3);
  doc.roundedRect(M, y - 4, pageW - M * 2, boxH, 2, 2, "FD");
  const cost: Array<[string, number, boolean]> = [
    ["Стоимость работ", doc0.amounts.works, false],
    ["Стоимость материалов", doc0.amounts.materials, false],
    ["ОБЩАЯ СТОИМОСТЬ", doc0.amounts.total, true],
  ];
  let cy = y + 2;
  cost.forEach(([label, value, bold]) => {
    doc.setFont("DejaVu", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 12 : 10.5);
    doc.setTextColor(...(bold ? RED : GREY));
    doc.text(`${label}:`, M + 5, cy);
    doc.setTextColor(...(bold ? RED : INK));
    doc.text(`${money(value)} руб.`, pageW - M - 5, cy, { align: "right" });
    cy += bold ? 8 : 7;
  });
  doc.setFont("DejaVu", "normal");
  y = y - 4 + boxH + 9;

  /* ── Срок и гарантия ──────────────────────────────────── */
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  drawPdfIcon(doc, "term", M, y - 3.6, 4.4, RED);
  doc.text(`Срок выполнения: ${doc0.term}`, M + 7, y);
  y += 7;
  drawPdfIcon(doc, "warranty", M, y - 3.6, 4.4, RED);
  doc.text(`Гарантия на выполненные работы: ${doc0.warranty}`, M + 7, y);

  /* ── Подвал ───────────────────────────────────────────── */
  doc.setDrawColor(...RED);
  doc.setLineWidth(0.6);
  doc.line(M, pageH - 22, pageW - M, pageH - 22);
  doc.setFont("DejaVu", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...RED);
  doc.text(OFFER_BRAND.name, M, pageH - 16);
  doc.setFont("DejaVu", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GREY);
  doc.text(OFFER_BRAND.slogan, M, pageH - 11);
  doc.setFontSize(8);
  doc.text(
    `${OFFER_BRAND.phone1} · ${OFFER_BRAND.phone2} · ${OFFER_BRAND.email} · ${OFFER_BRAND.site}`,
    pageW - M,
    pageH - 11,
    { align: "right" },
  );

  return doc;
}

export async function downloadOfferPdf(offer: OfferDoc) {
  const doc = await buildOfferPdf(offer);
  doc.save(offerFileName(offer, "pdf"));
}
