import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import { loadAssets } from "./estimate-pdf";
import { formatDate, money } from "./estimates";

export type FinanceReportOperation = {
  operation_date: string;
  operation_type: "income" | "expense" | "transfer" | "refund";
  from_name: string | null;
  to_name: string | null;
  amount: number;
  categoryName: string;
  comment: string | null;
};

export type FinanceReportData = {
  customer: string;
  projectName: string;
  income: number;
  expenses: number;
  remaining: number;
  byCategory: { name: string; amount: number }[];
  balances: { name: string; received: number; spent: number; balance: number }[];
  transfers?: { operation_date: string; from_name: string | null; to_name: string | null; amount: number; comment: string | null }[];
  operations: FinanceReportOperation[];
  security?: { id: string; verifyUrl: string; checkCode: string; issuedAt: string };
};

async function codeImages(id: string, url: string): Promise<{ qr: string; barcode: string }> {
  const [{ default: QRCode }, { default: JsBarcode }] = await Promise.all([import("qrcode"), import("jsbarcode")]);
  const qr = await QRCode.toDataURL(url, { errorCorrectionLevel: "M", margin: 1, width: 360 });
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, id, { format: "CODE128", displayValue: false, margin: 0, height: 60, width: 2 });
  return { qr, barcode: canvas.toDataURL("image/png") };
}

export type FinanceOperationDocData = {
  customer: string;
  projectName: string;
  operation: FinanceReportOperation;
  security: NonNullable<FinanceReportData["security"]> & { docType: string };
};

/** PDF по одной операции с тем же блоком защиты, что и у отчёта. */
export async function buildFinanceOperationPdf(data: FinanceOperationDocData): Promise<jsPDF> {
  const { fonts } = await loadAssets();
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.addFileToVFS("DejaVuSans.ttf", fonts.regular);
  doc.addFont("DejaVuSans.ttf", "DejaVu", "normal");
  doc.addFileToVFS("DejaVuSans-Bold.ttf", fonts.bold);
  doc.addFont("DejaVuSans-Bold.ttf", "DejaVu", "bold");
  const M = 15;
  const pageW = doc.internal.pageSize.getWidth();
  doc.setFont("DejaVu", "bold");
  doc.setFontSize(16);
  doc.text("S&M Electric", M, 20);
  doc.setFontSize(12);
  doc.text(data.security.docType, M, 28);
  const o = data.operation;
  autoTable(doc, {
    startY: 36,
    body: [
      ["Заказчик", data.customer],
      ["Проект", data.projectName],
      ["Дата", formatDate(o.operation_date)],
      ["Тип", TYPE_LABEL[o.operation_type]],
      ["От кого", o.from_name || "—"],
      ["Кому", o.to_name || "—"],
      ["Статья", o.categoryName],
      ["Комментарий", o.comment || ""],
      ["Сумма", money(Number(o.amount))],
    ],
    styles: { font: "DejaVu", fontSize: 10, cellPadding: 2.5 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 40 } },
    margin: { left: M, right: M },
  });
  const sec = data.security;
  const { qr, barcode } = await codeImages(sec.id, sec.verifyUrl);
  const by = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  doc.setDrawColor(200, 204, 212);
  doc.roundedRect(M, by, pageW - M * 2, 38, 2, 2);
  doc.addImage(qr, "PNG", M + 3, by + 3, 32, 32);
  doc.setFont("DejaVu", "bold");
  doc.setFontSize(10);
  doc.text(`Документ № ${sec.id}`, M + 40, by + 8);
  doc.setFont("DejaVu", "normal");
  doc.setFontSize(8);
  doc.text(`Сформирован: ${new Date(sec.issuedAt).toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })} МСК · контрольный код ${sec.checkCode}`, M + 40, by + 13);
  doc.text("Проверка подлинности: отсканируйте QR-код. Любое изменение данных после формирования будет обнаружено.", M + 40, by + 17, { maxWidth: pageW - M * 2 - 44 });
  doc.addImage(barcode, "PNG", M + 40, by + 23, 90, 12);
  doc.setFontSize(8);
  doc.text(`S&M Electric · ${sec.id}`, pageW - M, doc.internal.pageSize.getHeight() - 8, { align: "right" });
  return doc;
}

const TYPE_LABEL: Record<FinanceReportOperation["operation_type"], string> = {
  income: "Приход",
  expense: "Расход",
  transfer: "Передача",
  refund: "Возврат",
};

/** Builds the finance report PDF entirely from the live operations passed in. */
export async function buildFinancePdf(data: FinanceReportData): Promise<jsPDF> {
  const { fonts, logo } = await loadAssets();
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  doc.addFileToVFS("DejaVuSans.ttf", fonts.regular);
  doc.addFont("DejaVuSans.ttf", "DejaVu", "normal");
  doc.addFileToVFS("DejaVuSans-Bold.ttf", fonts.bold);
  doc.addFont("DejaVuSans-Bold.ttf", "DejaVu", "bold");
  doc.setFont("DejaVu", "normal");

  const pageW = doc.internal.pageSize.getWidth();
  const M = 15;

  let textX = M + 25;
  try {
    const props = doc.getImageProperties(logo);
    let h = 19;
    let w = (h * props.width) / props.height;
    if (w > 60) {
      w = 60;
      h = (w * props.height) / props.width;
    }
    doc.addImage(logo, "PNG", M, 12, w, h);
    textX = M + w + 10;
  } catch {
    /* logo optional */
  }

  doc.setFont("DejaVu", "bold");
  doc.setFontSize(17);
  doc.setTextColor(17, 17, 17);
  doc.text("S&M Electric", textX, 20);
  doc.setFont("DejaVu", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90, 98, 112);
  doc.text("Финансовый отчёт", textX, 27);

  const dates = data.operations
    .map((o) => o.operation_date)
    .filter(Boolean)
    .sort();
  const period = dates.length
    ? `${formatDate(dates[0]!)} — ${formatDate(dates[dates.length - 1]!)}`
    : "—";

  let y = 42;
  doc.setFontSize(9.5);
  doc.setTextColor(60, 66, 80);
  doc.text(`Заказчик: ${data.customer}`, M, y);
  doc.text(`Проект: ${data.projectName}`, M, y + 5);
  doc.text(`Период: ${period}`, M, y + 10);
  y += 18;

  autoTable(doc, {
    startY: y,
    head: [["Показатель", "Сумма"]],
    body: [
      ["Получено от заказчика", money(data.income)],
      ["Расходы проекта", money(data.expenses)],
      ["Остаток проекта", money(data.remaining)],
    ],
    styles: { font: "DejaVu", fontSize: 10, cellPadding: 2.5 },
    headStyles: { font: "DejaVu", fontStyle: "bold", fillColor: [29, 78, 216] },
    columnStyles: { 1: { halign: "right", cellWidth: 45 } },
    margin: { left: M, right: M },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  if (data.byCategory.length) {
    doc.setFont("DejaVu", "bold");
    doc.setFontSize(11);
    doc.setTextColor(17, 17, 17);
    doc.text("Расходы по категориям", M, y);
    autoTable(doc, {
      startY: y + 3,
      head: [["Статья", "Сумма"]],
      body: data.byCategory.map((c) => [c.name, money(c.amount)]),
      styles: { font: "DejaVu", fontSize: 9.5, cellPadding: 2.2 },
      headStyles: { font: "DejaVu", fontStyle: "bold", fillColor: [29, 78, 216] },
      columnStyles: { 1: { halign: "right", cellWidth: 45 } },
      margin: { left: M, right: M },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  if (data.balances.length) {
    doc.setFont("DejaVu", "bold");
    doc.setFontSize(11);
    doc.setTextColor(17, 17, 17);
    doc.text("Баланс участников", M, y);
    autoTable(doc, {
      startY: y + 3,
      head: [["Участник", "Получено", "Передано", "Баланс"]],
      body: data.balances.map((b) => [
        b.name,
        money(b.received),
        money(b.spent),
        money(b.balance),
      ]),
      styles: { font: "DejaVu", fontSize: 9.5, cellPadding: 2.2 },
      headStyles: { font: "DejaVu", fontStyle: "bold", fillColor: [29, 78, 216] },
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
      },
      margin: { left: M, right: M },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  if (data.transfers?.length) {
    doc.setFont("DejaVu", "bold");
    doc.setFontSize(11);
    doc.setTextColor(17, 17, 17);
    doc.text("Внутренние переводы между участниками", M, y);
    autoTable(doc, {
      startY: y + 3,
      head: [["Дата", "От кого", "Кому", "Комментарий", "Сумма"]],
      body: data.transfers.map((t) => [
        formatDate(t.operation_date),
        t.from_name || "—",
        t.to_name || "—",
        t.comment || "",
        money(Number(t.amount)),
      ]),
      styles: { font: "DejaVu", fontSize: 9, cellPadding: 2, overflow: "linebreak" },
      headStyles: { font: "DejaVu", fontStyle: "bold", fillColor: [29, 78, 216] },
      columnStyles: { 0: { cellWidth: 22 }, 4: { halign: "right", cellWidth: 30 } },
      margin: { left: M, right: M },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;
    doc.setFont("DejaVu", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(90, 98, 112);
    doc.text("Внутренние переводы не влияют на доходы, расходы и остаток проекта.", M, y);
    y += 8;
  }

  doc.setFont("DejaVu", "bold");
  doc.setFontSize(11);
  doc.setTextColor(17, 17, 17);
  doc.text("Все операции", M, y);
  autoTable(doc, {
    startY: y + 3,
    head: [["Дата", "От кого", "Кому", "Тип", "Статья", "Комментарий", "Сумма"]],
    body: data.operations.map((o) => [
      formatDate(o.operation_date),
      o.from_name || "—",
      o.to_name || "—",
      TYPE_LABEL[o.operation_type],
      o.categoryName,
      o.comment || "",
      money(Number(o.amount)),
    ]),
    styles: { font: "DejaVu", fontSize: 8, cellPadding: 1.8, overflow: "linebreak" },
    headStyles: { font: "DejaVu", fontStyle: "bold", fillColor: [29, 78, 216] },
    columnStyles: {
      0: { cellWidth: 20 },
      3: { cellWidth: 18 },
      6: { halign: "right", cellWidth: 26 },
    },
    margin: { left: M, right: M },
  });

  if (data.security) {
    const sec = data.security;
    const { qr, barcode } = await codeImages(sec.id, sec.verifyUrl);
    const pageH = doc.internal.pageSize.getHeight();
    let by = ((doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 40) + 8;
    if (by + 42 > pageH - 14) { doc.addPage(); by = 20; }
    doc.setDrawColor(200, 204, 212);
    doc.roundedRect(M, by, pageW - M * 2, 38, 2, 2);
    doc.addImage(qr, "PNG", M + 3, by + 3, 32, 32);
    doc.setFont("DejaVu", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 34, 44);
    doc.text(`Документ № ${sec.id}`, M + 40, by + 8);
    doc.setFont("DejaVu", "normal");
    doc.setFontSize(8);
    doc.text(`Сформирован: ${new Date(sec.issuedAt).toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })} МСК · контрольный код ${sec.checkCode}`, M + 40, by + 13);
    doc.text("Проверка подлинности: отсканируйте QR-код. Любое изменение данных после формирования будет обнаружено.", M + 40, by + 17, { maxWidth: pageW - M * 2 - 44 });
    doc.addImage(barcode, "PNG", M + 40, by + 23, 90, 12);
  }

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i += 1) {
    doc.setPage(i);
    doc.setFont("DejaVu", "normal");
    doc.setFontSize(8);
    doc.setTextColor(130, 136, 148);
    doc.text(
      `S&M Electric${data.security ? ` · ${data.security.id}` : ""} · стр. ${i} из ${pages}`,
      pageW - M,
      doc.internal.pageSize.getHeight() - 8,
      { align: "right" },
    );
  }

  return doc;
}
