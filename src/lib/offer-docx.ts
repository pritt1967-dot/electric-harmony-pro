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
import { iconPng, type OfferIcon } from "./offer-icons";
import {
  OFFER_BRAND,
  type OfferDoc,
  lampsSummaryText,
  offerDateLabel,
  offerFileName,
} from "./offer";

const RED = OFFER_BRAND.redHex;
const GREY = "5A6270";

async function logoAsset(): Promise<{ data: Uint8Array; w: number; h: number } | null> {
  try {
    const res = await fetch(LOGO_URL);
    const buf = await res.arrayBuffer();
    const data = new Uint8Array(buf);
    // Оригинальные пропорции логотипа — без обрезки и растягивания.
    let ratio = 1;
    try {
      const bmp = await createImageBitmap(new Blob([buf], { type: "image/png" }));
      ratio = bmp.width / bmp.height;
      bmp.close?.();
    } catch {
      /* ignore */
    }
    const maxH = 83;
    const maxW = 240;
    let h = maxH;
    let w = Math.round(h * ratio);
    if (w > maxW) {
      w = maxW;
      h = Math.round(w / ratio);
    }
    return { data, w, h };
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

function iconRun(png: Uint8Array | null, size = 14) {
  if (!png) return [] as ImageRun[];
  return [
    new ImageRun({
      type: "png",
      data: png,
      transformation: { width: size, height: size },
      altText: { title: "S&M Electric", description: "Иконка раздела", name: "icon" },
    }),
  ];
}

function heading(text: string, icon: Uint8Array | null) {
  return new Paragraph({
    spacing: { before: 240, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "DEE2E8", space: 2 } },
    children: [
      ...iconRun(icon, 14),
      new TextRun({ text: text ? `  ${text}` : "", bold: true, color: RED, size: 24 }),
    ],
  });
}

/** Настоящий редактируемый DOCX: весь текст — текстовые элементы Word. */
export async function downloadOfferDocx(offer: OfferDoc) {
  const [logo, ...icons] = await Promise.all([
    logoAsset(),
    ...(["works", "lamps", "cost", "term", "warranty"] as OfferIcon[]).map((k) =>
      iconPng(k, 18, RED),
    ),
  ]);
  const [icWorks, icLamps, icCost, icTerm, icWarranty] = icons as Array<Uint8Array | null>;

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
          new Paragraph({
            tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
            children: [
              ...(logo
                ? [
                    new ImageRun({
                      type: "png",
                      data: logo.data,
                      transformation: { width: logo.w, height: logo.h },
                      altText: {
                        title: "S&M Electric",
                        description: "Логотип S&M Electric",
                        name: "logo",
                      },
                    }),
                  ]
                : []),
              new TextRun({ text: `\t${OFFER_BRAND.phone1}`, size: 18 }),
            ],
          }),
          ...[OFFER_BRAND.phone2, OFFER_BRAND.email, OFFER_BRAND.site].map(
            (t) =>
              new Paragraph({
                spacing: { after: 20 },
                tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                children: [new TextRun({ text: `\t${t}`, size: 18 })],
              }),
          ),
          new Paragraph({
            spacing: { after: 200 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: RED, space: 4 } },
            children: [new TextRun({ text: "", size: 2 })],
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
          line("Исполнитель", OFFER_BRAND.name),
          line("Дата", offerDateLabel(offer)),
          new Paragraph({
            spacing: { before: 200 },
            children: [new TextRun({ text: offer.intro, size: 21 })],
          }),

          heading("ПЕРЕЧЕНЬ РАБОТ", icWorks),
          ...offer.works.map(
            (w) =>
              new Paragraph({
                numbering: { reference: "offer-bullets", level: 0 },
                spacing: { after: 40 },
                children: [new TextRun({ text: w, size: 20 })],
              }),
          ),

          ...(offer.show_lamps
            ? [
                heading("СВЕТИЛЬНИКИ", icLamps),
                ...(offer.lamps_text.trim()
                  ? [
                      new Paragraph({
                        spacing: { after: 80 },
                        children: [
                          new TextRun({ text: offer.lamps_text, size: 19, color: GREY }),
                        ],
                      }),
                    ]
                  : []),
                new Paragraph({
                  spacing: { after: 80 },
                  children: [new TextRun({ text: lampsSummaryText(offer), size: 20 })],
                }),
                ...(offer.lamps_note?.trim()
                  ? [
                      new Paragraph({
                        children: [
                          new TextRun({ text: offer.lamps_note, size: 19, color: GREY }),
                        ],
                      }),
                    ]
                  : []),
              ]
            : []),

          heading("СТОИМОСТЬ", icCost),
          ...(
            [
              ["Стоимость работ", offer.amounts.works, false],
              ["Стоимость материалов", offer.amounts.materials, false],
              ["ОБЩАЯ СТОИМОСТЬ", offer.amounts.total, true],
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
            spacing: { before: 220, after: 60 },
            children: [
              ...iconRun(icTerm, 12),
              new TextRun({ text: `  Срок выполнения: ${offer.term}`, size: 20 }),
            ],
          }),
          new Paragraph({
            children: [
              ...iconRun(icWarranty, 12),
              new TextRun({
                text: `  Гарантия на выполненные работы: ${offer.warranty}`,
                size: 20,
              }),
            ],
          }),

          new Paragraph({
            spacing: { before: 500, after: 40 },
            border: { top: { style: BorderStyle.SINGLE, size: 8, color: RED, space: 6 } },
            tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
            children: [
              new TextRun({ text: OFFER_BRAND.name, bold: true, color: RED, size: 20 }),
              new TextRun({
                text: `\t${OFFER_BRAND.phone1} · ${OFFER_BRAND.phone2} · ${OFFER_BRAND.email} · ${OFFER_BRAND.site}`,
                color: GREY,
                size: 16,
              }),
            ],
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
