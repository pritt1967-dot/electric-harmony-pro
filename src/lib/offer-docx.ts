import {
  AlignmentType,
  BorderStyle,
  Document,
  ImageRun,
  LevelFormat,
  Packer,
  Paragraph,
  TabStopPosition,
  TabStopType,
  TextRun,
} from "docx";
import { saveAs } from "file-saver";

import { LOGO_URL } from "./logo";
import { money } from "./estimates";
import { OFFER_BRAND, type OfferDoc, offerDateLabel, offerFileName } from "./offer";

const RED = OFFER_BRAND.redHex;
const GREY = "5A6270";

async function logoBytes(): Promise<Uint8Array | null> {
  try {
    const res = await fetch(LOGO_URL);
    return new Uint8Array(await res.arrayBuffer());
  } catch {
    return null;
  }
}

function line(label: string, value: string) {
  return new Paragraph({
    spacing: { after: 60 },
    children: [
      new TextRun({ text: `${label}: `, color: GREY, size: 20 }),
      new TextRun({ text: value, bold: true, size: 20 }),
    ],
  });
}

function heading(text: string) {
  return new Paragraph({
    spacing: { before: 240, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "DEE2E8", space: 2 } },
    children: [new TextRun({ text, bold: true, color: RED, size: 24 })],
  });
}

/** Настоящий редактируемый DOCX: весь текст — текстовые элементы Word. */
export async function downloadOfferDocx(offer: OfferDoc) {
  const logo = await logoBytes();

  const doc = new Document({
    styles: { default: { document: { run: { font: "Arial", size: 20 } } } },
    numbering: {
      config: [
        {
          reference: "offer-bullets",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "•",
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 460, hanging: 260 } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 900, right: 900, bottom: 900, left: 900 },
          },
        },
        children: [
          ...(logo
            ? [
                new Paragraph({
                  children: [
                    new ImageRun({
                      type: "png",
                      data: logo,
                      transformation: { width: 70, height: 70 },
                      altText: {
                        title: "S&M Electric",
                        description: "Логотип S&M Electric",
                        name: "logo",
                      },
                    }),
                  ],
                }),
              ]
            : []),
          new Paragraph({
            children: [
              new TextRun({ text: OFFER_BRAND.name, bold: true, size: 34 }),
              new TextRun({
                text: `\t${OFFER_BRAND.phone1} · ${OFFER_BRAND.phone2}`,
                size: 18,
                color: GREY,
              }),
            ],
            tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          }),
          new Paragraph({
            spacing: { after: 200 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: RED, space: 4 } },
            children: [
              new TextRun({
                text: "Профессиональные электромонтажные работы",
                color: GREY,
                size: 18,
              }),
              new TextRun({
                text: `\t${OFFER_BRAND.email} · ${OFFER_BRAND.site}`,
                color: GREY,
                size: 18,
              }),
            ],
            tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: "КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ",
                bold: true,
                color: RED,
                size: 30,
              }),
            ],
          }),
          line("Заказчик", offer.customer_name || "—"),
          ...(offer.object_name ? [line("Объект", offer.object_name)] : []),
          line("Дата", offerDateLabel(offer)),
          line("Исполнитель", OFFER_BRAND.name),
          new Paragraph({
            spacing: { before: 200 },
            children: [new TextRun({ text: offer.intro, size: 21 })],
          }),

          heading("ПЕРЕЧЕНЬ РАБОТ"),
          ...offer.works.map(
            (w) =>
              new Paragraph({
                numbering: { reference: "offer-bullets", level: 0 },
                spacing: { after: 40 },
                children: [new TextRun({ text: w, size: 20 })],
              }),
          ),

          ...(offer.show_lamps && offer.lamps_text.trim()
            ? [
                heading("СВЕТИЛЬНИКИ"),
                new Paragraph({
                  children: [new TextRun({ text: offer.lamps_text, size: 19, color: GREY })],
                }),
              ]
            : []),

          heading("СТОИМОСТЬ"),
          ...(
            [
              ["Стоимость работ", offer.amounts.works, false],
              ["Стоимость материалов", offer.amounts.materials, false],
              ["Общая стоимость", offer.amounts.total, true],
            ] as Array<[string, number, boolean]>
          ).map(
            ([label, value, bold]) =>
              new Paragraph({
                spacing: { after: 60 },
                tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                children: [
                  new TextRun({
                    text: `${label}:`,
                    bold,
                    size: bold ? 24 : 20,
                    color: bold ? RED : GREY,
                  }),
                  new TextRun({
                    text: `\t${money(value)} руб.`,
                    bold,
                    size: bold ? 24 : 20,
                    color: bold ? RED : "111111",
                  }),
                ],
              }),
          ),

          new Paragraph({
            spacing: { before: 200 },
            children: [new TextRun({ text: `Срок выполнения: ${offer.term}`, size: 20 })],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Гарантия на выполненные работы: ${offer.warranty}`,
                size: 20,
              }),
            ],
          }),

          new Paragraph({
            spacing: { before: 500, after: 40 },
            border: { top: { style: BorderStyle.SINGLE, size: 10, color: RED, space: 6 } },
            children: [new TextRun({ text: OFFER_BRAND.name, bold: true, color: RED, size: 20 })],
          }),
          new Paragraph({
            children: [new TextRun({ text: OFFER_BRAND.slogan, color: GREY, size: 18 })],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, offerFileName(offer, "docx"));
}
