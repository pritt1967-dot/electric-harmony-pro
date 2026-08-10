import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import { loadAssets } from "./estimate-pdf";
import { FOOTER_LINES, formatDate, money, todayISO } from "./estimates";

const BLUE: [number, number, number] = [29, 78, 216];

export type PricePdfRow = {
  category: string;
  name: string;
  unit: string;
  price: number;
  comment: string;
};

export async function buildPricePdf(rows: PricePdfRow[]) {
  const { fonts, logo } = await loadAssets();
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  doc.addFileToVFS("DejaVuSans.ttf", fonts.regular);
  doc.addFont("DejaVuSans.ttf", "DejaVu", "normal");
  doc.addFileToVFS("DejaVuSans-Bold.ttf", fonts.bold);
  doc.addFont("DejaVuSans-Bold.ttf", "DejaVu", "bold");
  doc.setFont("DejaVu", "normal");

  const pageW = doc.internal.pageSize.getWidth();
  const M = 15;

  try {
    doc.addImage(logo, "PNG", M, 12, 20, 20);
  } catch {
    /* logo optional */
  }
  doc.setFont("DejaVu", "bold");
  doc.setFontSize(17);
  doc.setTextColor(17, 17, 17);
  doc.text("S&M Electric", M + 25, 20);
  doc.setFont("DejaVu", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90, 98, 112);
  doc.text("Прайс-лист на электромонтажные работы", M + 25, 27);
  doc.setFontSize(9);
  doc.text(`от ${formatDate(todayISO())}`, pageW - M, 20, { align: "right" });

  // Group by category
  const byCategory = new Map<string, PricePdfRow[]>();
  for (const r of rows) {
    const list = byCategory.get(r.category) ?? [];
    list.push(r);
    byCategory.set(r.category, list);
  }

  const body: (string | { content: string; colSpan?: number; styles?: object })[][] = [];
  Array.from(byCategory.keys())
    .sort((a, b) => a.localeCompare(b, "ru"))
    .forEach((cat) => {
      body.push([
        {
          content: cat,
          colSpan: 5,
          styles: {
            fontStyle: "bold",
            fillColor: [239, 244, 255],
            textColor: BLUE,
          },
        },
      ]);
      byCategory
        .get(cat)!
        .sort((a, b) => a.name.localeCompare(b.name, "ru"))
        .forEach((r, i) => {
          body.push([
            String(i + 1),
            r.name + (r.comment ? `\n${r.comment}` : ""),
            r.unit,
            `${money(r.price)} ₽`,
            "",
          ]);
        });
    });

  autoTable(doc, {
    startY: 38,
    head: [["№", "Наименование работы", "Ед.", "Цена", ""]],
    body: body as never,
    theme: "grid",
    styles: {
      font: "DejaVu",
      fontSize: 9,
      cellPadding: 2,
      lineColor: [216, 222, 232],
      textColor: [17, 17, 17],
    },
    headStyles: {
      font: "DejaVu",
      fontStyle: "bold",
      fillColor: BLUE,
      textColor: [255, 255, 255],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 18, halign: "center" },
      3: { cellWidth: 28, halign: "right" },
      4: { cellWidth: 0.1 },
    },
    margin: { left: M, right: M, bottom: 22 },
    didDrawPage: () => {
      const pageH = doc.internal.pageSize.getHeight();
      doc.setFont("DejaVu", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(120, 128, 140);
      doc.text(FOOTER_LINES.join(" · "), M, pageH - 12);
      doc.text(
        "Цены являются ориентировочными и не являются публичной офертой.",
        M,
        pageH - 8,
      );
    },
  });

  return doc;
}

export async function downloadPricePdf(rows: PricePdfRow[]) {
  const doc = await buildPricePdf(rows);
  doc.save(`Price-SM-Electric-${todayISO()}.pdf`);
}
