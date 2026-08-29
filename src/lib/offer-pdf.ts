import { jsPDF } from "jspdf";

import { loadAssets } from "./estimate-pdf";
import { money } from "./estimates";
import { OFFER_BRAND, type OfferDoc, offerDateLabel, offerFileName } from "./offer";

const RED = OFFER_BRAND.red;
const GREY: [number, number, number] = [90, 98, 112];
const LINE: [number, number, number] = [222, 226, 232];

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
  const M = 16;

  /* ── Шапка бланка ─────────────────────────────────────── */
  try {
    doc.addImage(logo, "PNG", M, 12, 22, 22);
  } catch {
    /* logo optional */
  }
  doc.setFont("DejaVu", "bold");
  doc.setFontSize(18);
  doc.setTextColor(17, 17, 17);
  doc.text(OFFER_BRAND.name, M + 27, 21);
  doc.setFont("DejaVu", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GREY);
  doc.text("Профессиональные электромонтажные работы", M + 27, 27);

  doc.setFontSize(9);
  doc.setTextColor(17, 17, 17);
  const contacts = [
    OFFER_BRAND.phone1,
    OFFER_BRAND.phone2,
    OFFER_BRAND.email,
    OFFER_BRAND.site,
  ];
  contacts.forEach((c, i) => {
    doc.text(c, pageW - M, 14 + i * 5, { align: "right" });
  });

  doc.setDrawColor(...RED);
  doc.setLineWidth(1);
  doc.line(M, 37, pageW - M, 37);

  /* ── Заголовок ────────────────────────────────────────── */
  doc.setFont("DejaVu", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...RED);
  doc.text("КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ", pageW / 2, 47, { align: "center" });

  let y = 57;
  doc.setFont("DejaVu", "normal");
  doc.setFontSize(10);
  const rows: Array<[string, string]> = [
    ["Заказчик", doc0.customer_name || "—"],
  ];
  if (doc0.object_name) rows.push(["Объект", doc0.object_name]);
  rows.push(["Дата", offerDateLabel(doc0)]);
  rows.push(["Исполнитель", OFFER_BRAND.name]);
  rows.forEach(([k, v]) => {
    doc.setTextColor(...GREY);
    doc.text(`${k}:`, M, y);
    doc.setTextColor(17, 17, 17);
    doc.setFont("DejaVu", "bold");
    doc.text(String(v), M + 32, y);
    doc.setFont("DejaVu", "normal");
    y += 6;
  });

  y += 3;
  doc.setTextColor(17, 17, 17);
  doc.setFontSize(10.5);
  doc.splitTextToSize(doc0.intro, pageW - M * 2).forEach((l: string) => {
    doc.text(l, M, y);
    y += 5.5;
  });

  /* ── Перечень работ ───────────────────────────────────── */
  y += 5;
  const section = (title: string) => {
    doc.setFont("DejaVu", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...RED);
    doc.text(title, M, y);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.3);
    doc.line(M, y + 2, pageW - M, y + 2);
    doc.setFont("DejaVu", "normal");
    doc.setTextColor(17, 17, 17);
    y += 8;
  };

  section("ПЕРЕЧЕНЬ РАБОТ");
  doc.setFontSize(10);
  doc0.works.forEach((w) => {
    const lines = doc.splitTextToSize(w, pageW - M * 2 - 6) as string[];
    doc.setFillColor(...RED);
    doc.circle(M + 1.6, y - 1.4, 1, "F");
    lines.forEach((l, i) => {
      doc.text(l, M + 6, y + i * 5);
    });
    y += lines.length * 5 + 1.5;
  });

  /* ── Светильники ──────────────────────────────────────── */
  if (doc0.show_lamps && doc0.lamps_text.trim()) {
    y += 4;
    section("СВЕТИЛЬНИКИ");
    doc.setFontSize(9.5);
    doc.setTextColor(...GREY);
    doc.splitTextToSize(doc0.lamps_text, pageW - M * 2).forEach((l: string) => {
      doc.text(l, M, y);
      y += 5;
    });
    doc.setTextColor(17, 17, 17);
  }

  /* ── Стоимость ────────────────────────────────────────── */
  y += 6;
  section("СТОИМОСТЬ");
  const boxH = 26;
  doc.setFillColor(250, 245, 245);
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.3);
  doc.roundedRect(M, y - 4, pageW - M * 2, boxH, 2, 2, "FD");
  doc.setFontSize(10.5);
  const cost: Array<[string, number, boolean]> = [
    ["Стоимость работ", doc0.amounts.works, false],
    ["Стоимость материалов", doc0.amounts.materials, false],
    ["Общая стоимость", doc0.amounts.total, true],
  ];
  let cy = y + 2;
  cost.forEach(([label, value, bold]) => {
    doc.setFont("DejaVu", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 12 : 10.5);
    const labelColor: [number, number, number] = bold ? RED : GREY;
    doc.setTextColor(...labelColor);
    doc.text(`${label}:`, M + 5, cy);
    const valueColor: [number, number, number] = bold ? RED : [17, 17, 17];
    doc.setTextColor(...valueColor);
    doc.text(`${money(value)} руб.`, pageW - M - 5, cy, { align: "right" });
    cy += bold ? 8 : 7;
  });
  doc.setFont("DejaVu", "normal");
  y = y - 4 + boxH + 8;

  /* ── Срок и гарантия ──────────────────────────────────── */
  doc.setFontSize(10);
  doc.setTextColor(17, 17, 17);
  doc.text(`Срок выполнения: ${doc0.term}`, M, y);
  y += 6;
  doc.text(`Гарантия на выполненные работы: ${doc0.warranty}`, M, y);

  /* ── Подвал ───────────────────────────────────────────── */
  doc.setDrawColor(...RED);
  doc.setLineWidth(0.8);
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
