import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { saveAs } from "file-saver";

import {
  FOOTER_LINES,
  type Estimate,
  computeEstimateTotals,
  formatDate,
  lineTotal,
  money,
} from "./estimates";
import { estimateFileName } from "./estimate-pdf";

const BORDER = { style: BorderStyle.SINGLE, size: 1, color: "D8DEE8" };
const BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };
const WIDTHS = [600, 4200, 800, 900, 1300, 1560];
const TABLE_W = WIDTHS.reduce((a, b) => a + b, 0);

function cell(text: string, opts: { bold?: boolean; align?: (typeof AlignmentType)[keyof typeof AlignmentType]; fill?: string; width: number; color?: string }) {
  return new TableCell({
    borders: BORDERS,
    width: { size: opts.width, type: WidthType.DXA },
    ...(opts.fill ? { shading: { fill: opts.fill, type: ShadingType.CLEAR } } : {}),
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [
      new Paragraph({
        alignment: opts.align ?? AlignmentType.LEFT,
        children: [
          new TextRun({ text, bold: opts.bold, color: opts.color ?? "111111", size: 19 }),
        ],
      }),
    ],
  });
}

export async function downloadEstimateDocx(estimate: Estimate) {
  const sub0 = 0;
  void sub0;
  const totals = computeEstimateTotals(
    estimate.items,
    estimate.discount_type,
    estimate.discount_value,
    estimate.surcharges,
  );
  const sub = totals.subtotal;
  const disc = totals.discount;
  const total = totals.total;

  const info: Array<[string, string]> = [
    ["Смета №", estimate.number || "—"],
    ["Дата", formatDate(estimate.doc_date)],
    ["Версия", String(estimate.version ?? 1)],
    ["Заказчик", estimate.customer_name || "—"],
  ];
  if (estimate.object_name) info.push(["Объект", estimate.object_name]);
  info.push(["Адрес объекта", estimate.address || "—"]);
  info.push(["Телефон", estimate.phone || "—"]);
  if (estimate.email) info.push(["Email", estimate.email]);
  if (estimate.work_period) info.push(["Срок выполнения работ", estimate.work_period]);
  if (estimate.valid_until) info.push(["Предложение действует до", estimate.valid_until]);

  const doc = new Document({
    styles: { default: { document: { run: { font: "Arial", size: 20 } } } },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 },
          },
        },
        children: [
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [new TextRun({ text: "S&M Electric", bold: true, size: 34 })],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Профессиональные электромонтажные работы",
                color: "5A6270",
                size: 19,
              }),
            ],
            border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: "1D4ED8", space: 4 } },
            spacing: { after: 240 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: "СМЕТА НА ЭЛЕКТРОМОНТАЖНЫЕ РАБОТЫ",
                bold: true,
                color: "1D4ED8",
                size: 26,
              }),
            ],
          }),
          ...info.map(
            ([k, v]) =>
              new Paragraph({
                spacing: { after: 40 },
                children: [
                  new TextRun({ text: `${k}: `, color: "5A6270", size: 19 }),
                  new TextRun({ text: v, bold: true, size: 19 }),
                ],
              }),
          ),
          new Paragraph({ text: "", spacing: { after: 160 } }),
          new Table({
            width: { size: TABLE_W, type: WidthType.DXA },
            columnWidths: WIDTHS,
            rows: [
              new TableRow({
                children: ["№", "Наименование работ", "Ед.", "Кол-во", "Цена", "Стоимость"].map(
                  (t, i) =>
                    cell(t, {
                      bold: true,
                      fill: "1D4ED8",
                      color: "FFFFFF",
                      width: WIDTHS[i]!,
                      align: i === 1 ? AlignmentType.LEFT : AlignmentType.CENTER,
                    }),
                ),
              }),
              ...estimate.items.map(
                (it, idx) =>
                  new TableRow({
                    children: [
                      cell(String(idx + 1), { width: WIDTHS[0]!, align: AlignmentType.CENTER }),
                      cell(it.comment ? `${it.name} (${it.comment})` : it.name, { width: WIDTHS[1]! }),
                      cell(it.unit, { width: WIDTHS[2]!, align: AlignmentType.CENTER }),
                      cell(String(it.qty), { width: WIDTHS[3]!, align: AlignmentType.CENTER }),
                      cell(money(it.price), { width: WIDTHS[4]!, align: AlignmentType.RIGHT }),
                      cell(money(lineTotal(it)), { width: WIDTHS[5]!, align: AlignmentType.RIGHT }),
                    ],
                  }),
              ),
            ],
          }),
          new Paragraph({ text: "", spacing: { after: 200 } }),
          ...([
            ["Итого", `${money(sub)} ₽`, false],
            ["Скидка", `− ${money(disc)} ₽`, false],
            ...totals.surchargeLines.map(
              (line) =>
                [
                  `${line.label} (${line.percent}%)`,
                  `${money(line.amount)} ₽`,
                  false,
                ] as [string, string, boolean],
            ),
            ["Итого к оплате", `${money(total)} ₽`, true],
          ] as Array<[string, string, boolean]>).map(
            ([label, value, bold]) =>
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { after: 60 },
                children: [
                  new TextRun({
                    text: `${label}: ${value}`,
                    bold: Boolean(bold),
                    size: bold ? 24 : 20,
                    color: bold ? "1D4ED8" : "111111",
                  }),
                ],
              }),
          ),
          ...(estimate.note
            ? [
                new Paragraph({
                  spacing: { before: 200 },
                  children: [
                    new TextRun({ text: `Примечание: ${estimate.note}`, color: "5A6270", size: 19 }),
                  ],
                }),
              ]
            : []),
          new Paragraph({
            spacing: { before: 400, after: 60 },
            border: { top: { style: BorderStyle.SINGLE, size: 6, color: "D8DEE8", space: 6 } },
            children: [new TextRun({ text: FOOTER_LINES[0]!, bold: true, color: "1D4ED8", size: 18 })],
          }),
          ...FOOTER_LINES.slice(1).map(
            (line) =>
              new Paragraph({
                children: [new TextRun({ text: line, color: "6E7684", size: 16 })],
              }),
          ),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, estimateFileName(estimate, "docx"));
}
