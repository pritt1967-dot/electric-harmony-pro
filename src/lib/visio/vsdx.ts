/**
 * Минимальный генератор файлов Microsoft Visio (.vsdx).
 * Формируем OPC-пакет (ZIP) с реальными векторными фигурами:
 * прямоугольники, линии и текст остаются редактируемыми в Visio.
 */

import { zipSync, strToU8 } from "fflate";

/** Пиксели чертежа на дюйм. */
const PX_PER_IN = 96;

export type VsRect = {
  kind: "rect";
  x: number;
  y: number;
  w: number;
  h: number;
  text?: string;
  fill?: string;
  stroke?: string;
  lineWeight?: number;
  fontSize?: number;
  textColor?: string;
  bold?: boolean;
  name?: string;
};

export type VsLine = {
  kind: "line";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke?: string;
  lineWeight?: number;
  name?: string;
};

export type VsText = {
  kind: "text";
  x: number;
  y: number;
  w: number;
  h?: number;
  text: string;
  fontSize?: number;
  textColor?: string;
  bold?: boolean;
  align?: "left" | "center" | "right";
  name?: string;
};

export type VsShape = VsRect | VsLine | VsText;

export type VsPage = {
  title: string;
  shapes: VsShape[];
  /** Размер листа в пикселях чертежа (по умолчанию — по содержимому). */
  width?: number;
  height?: number;
};

function esc(s: string) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const n = (v: number) => (Math.round(v * 1e6) / 1e6).toString();

function charSection(size: number, color: string, bold: boolean) {
  return `<Section N='Character'><Row IX='0'><Cell N='Size' V='${n(size / PX_PER_IN)}'/><Cell N='Color' V='${color}'/><Cell N='Style' V='${bold ? 1 : 0}'/><Cell N='Font' V='Arial'/></Row></Section>`;
}

function paraSection(align: "left" | "center" | "right") {
  const v = align === "left" ? 0 : align === "center" ? 1 : 2;
  return `<Section N='Paragraph'><Row IX='0'><Cell N='HorzAlign' V='${v}'/></Row></Section>`;
}

/** Одна фигура Visio. Координаты входа — пиксели, ось Y вниз. */
function shapeXml(s: VsShape, id: number, pageH: number): string {
  const toX = (px: number) => px / PX_PER_IN;
  const toY = (px: number) => pageH / PX_PER_IN - px / PX_PER_IN;

  if (s.kind === "line") {
    const minX = Math.min(s.x1, s.x2);
    const minY = Math.min(s.y1, s.y2);
    const w = Math.max(Math.abs(s.x2 - s.x1), 0.0001);
    const h = Math.max(Math.abs(s.y2 - s.y1), 0.0001);
    const geom = [s.x1, s.x2].map((x) => toX(x - minX));
    const gy = [s.y1, s.y2].map((y) => h / PX_PER_IN - (y - minY) / PX_PER_IN);
    return `<Shape ID='${id}' Type='Shape' LineStyle='0' FillStyle='0' TextStyle='0' NameU='${esc(s.name ?? "Line")}'>
<Cell N='PinX' V='${n(toX(minX) + w / PX_PER_IN / 2)}'/><Cell N='PinY' V='${n(toY(minY) - h / PX_PER_IN / 2)}'/>
<Cell N='Width' V='${n(w / PX_PER_IN)}'/><Cell N='Height' V='${n(h / PX_PER_IN)}'/>
<Cell N='LocPinX' F='Width*0.5'/><Cell N='LocPinY' F='Height*0.5'/>
<Cell N='LineColor' V='${s.stroke ?? "#111827"}'/><Cell N='LineWeight' V='${n((s.lineWeight ?? 1.5) / PX_PER_IN)}'/>
<Section N='Geometry' IX='0'><Cell N='NoFill' V='1'/><Cell N='NoLine' V='0'/>
<Row T='MoveTo' IX='1'><Cell N='X' V='${n(geom[0]!)}'/><Cell N='Y' V='${n(gy[0]!)}'/></Row>
<Row T='LineTo' IX='2'><Cell N='X' V='${n(geom[1]!)}'/><Cell N='Y' V='${n(gy[1]!)}'/></Row>
</Section></Shape>`;
  }

  const isText = s.kind === "text";
  const w = isText ? s.w : s.w;
  const h = isText ? (s.h ?? 18) : s.h;
  const fontSize = s.fontSize ?? 11;
  const color = s.textColor ?? "#111827";
  const bold = s.bold ?? false;
  const align = isText ? (s.align ?? "left") : "center";
  const text = s.text ? `<Text>${esc(s.text)}</Text>` : "";
  const fill = isText ? "1" : "0";
  const noLine = isText ? "1" : "0";

  return `<Shape ID='${id}' Type='Shape' LineStyle='0' FillStyle='0' TextStyle='0' NameU='${esc(s.name ?? (isText ? "Text" : "Rect"))}'>
<Cell N='PinX' V='${n(toX(s.x) + w / PX_PER_IN / 2)}'/><Cell N='PinY' V='${n(toY(s.y) - h / PX_PER_IN / 2)}'/>
<Cell N='Width' V='${n(w / PX_PER_IN)}'/><Cell N='Height' V='${n(h / PX_PER_IN)}'/>
<Cell N='LocPinX' F='Width*0.5'/><Cell N='LocPinY' F='Height*0.5'/>
<Cell N='FillForegnd' V='${isText ? "#FFFFFF" : ((s as VsRect).fill ?? "#FFFFFF")}'/>
<Cell N='LineColor' V='${isText ? "#FFFFFF" : ((s as VsRect).stroke ?? "#111827")}'/>
<Cell N='LineWeight' V='${n(((s as VsRect).lineWeight ?? 1.5) / PX_PER_IN)}'/>
${charSection(fontSize, color, bold)}${paraSection(align)}
<Section N='Geometry' IX='0'><Cell N='NoFill' V='${fill}'/><Cell N='NoLine' V='${noLine}'/>
<Row T='RelMoveTo' IX='1'><Cell N='X' V='0'/><Cell N='Y' V='0'/></Row>
<Row T='RelLineTo' IX='2'><Cell N='X' V='1'/><Cell N='Y' V='0'/></Row>
<Row T='RelLineTo' IX='3'><Cell N='X' V='1'/><Cell N='Y' V='1'/></Row>
<Row T='RelLineTo' IX='4'><Cell N='X' V='0'/><Cell N='Y' V='1'/></Row>
<Row T='RelLineTo' IX='5'><Cell N='X' V='0'/><Cell N='Y' V='0'/></Row>
</Section>${text}</Shape>`;
}

const XMLH = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;

function documentXml() {
  return `${XMLH}<VisioDocument xmlns="http://schemas.microsoft.com/office/visio/2012/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xml:space="preserve"><DocumentSettings TopPage="0" DefaultTextStyle="0" DefaultLineStyle="0" DefaultFillStyle="0" DefaultGuideStyle="0"><GlueSettings>9</GlueSettings><SnapSettings>65847</SnapSettings><DynamicGridEnabled>1</DynamicGridEnabled><ProtectStyles>0</ProtectStyles><ProtectShapes>0</ProtectShapes><ProtectMasters>0</ProtectMasters><ProtectBkgnds>0</ProtectBkgnds></DocumentSettings><Colors><ColorEntry IX="0" RGB="#000000"/><ColorEntry IX="1" RGB="#FFFFFF"/></Colors><FaceNames><FaceName NameU="Arial" UnicodeRanges="-536859905 -1073711037 9 0" CharSets="1073742335 -65536" Panose="2 11 6 4 2 2 2 2 2 4" Flags="325"/></FaceNames><StyleSheets><StyleSheet ID="0" NameU="No Style" Name="No Style"><Cell N="EnableLineProps" V="1"/><Cell N="EnableFillProps" V="1"/><Cell N="EnableTextProps" V="1"/><Cell N="LineWeight" V="0.01"/><Cell N="LineColor" V="#000000"/><Cell N="LinePattern" V="1"/><Cell N="FillForegnd" V="#FFFFFF"/><Cell N="FillPattern" V="1"/></StyleSheet></StyleSheets></VisioDocument>`;
}

function pagesXml(pages: VsPage[]) {
  const body = pages
    .map((p, i) => {
      const wIn = (p.width ?? 1000) / PX_PER_IN;
      const hIn = (p.height ?? 700) / PX_PER_IN;
      return `<Page ID="${i}" NameU="${esc(p.title || `Page-${i + 1}`)}" Name="${esc(p.title || `Page-${i + 1}`)}" ViewScale="-1" ViewCenterX="${n(wIn / 2)}" ViewCenterY="${n(hIn / 2)}"><PageSheet LineStyle="0" FillStyle="0" TextStyle="0"><Cell N="PageWidth" V="${n(wIn)}"/><Cell N="PageHeight" V="${n(hIn)}"/><Cell N="DrawingScale" V="1"/><Cell N="PageScale" V="1"/><Cell N="DrawingSizeType" V="3"/><Cell N="DrawingScaleType" V="0"/><Cell N="PrintPageOrientation" V="${wIn >= hIn ? 2 : 1}"/></PageSheet><Rel r:id="rId${i + 1}"/></Page>`;
    })
    .join("");
  return `${XMLH}<Pages xmlns="http://schemas.microsoft.com/office/visio/2012/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xml:space="preserve">${body}</Pages>`;
}

function pageXml(p: VsPage) {
  const h = p.height ?? 700;
  const shapes = p.shapes.map((s, i) => shapeXml(s, i + 1, h)).join("");
  return `${XMLH}<PageContents xmlns="http://schemas.microsoft.com/office/visio/2012/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xml:space="preserve"><Shapes>${shapes}</Shapes></PageContents>`;
}

/** Собирает .vsdx как Blob. */
export function buildVsdx(pages: VsPage[], meta: { title: string }): Blob {
  const prepared = pages.map((p) => {
    const xs = p.shapes.flatMap((s) =>
      s.kind === "line" ? [s.x1, s.x2] : [s.x, s.x + s.w],
    );
    const ys = p.shapes.flatMap((s) =>
      s.kind === "line" ? [s.y1, s.y2] : [s.y, s.y + (s.kind === "text" ? (s.h ?? 18) : s.h)],
    );
    const width = p.width ?? Math.max(600, Math.ceil(Math.max(0, ...xs)) + 60);
    const height = p.height ?? Math.max(400, Math.ceil(Math.max(0, ...ys)) + 60);
    return { ...p, width, height };
  });

  const overrides = prepared
    .map(
      (_, i) =>
        `<Override PartName="/visio/pages/page${i + 1}.xml" ContentType="application/vnd.ms-visio.page+xml"/>`,
    )
    .join("");

  const contentTypes = `${XMLH}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/visio/document.xml" ContentType="application/vnd.ms-visio.drawing.main+xml"/><Override PartName="/visio/pages/pages.xml" ContentType="application/vnd.ms-visio.pages+xml"/>${overrides}<Override PartName="/visio/windows.xml" ContentType="application/vnd.ms-visio.windows+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`;

  const rootRels = `${XMLH}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.microsoft.com/visio/2010/relationships/document" Target="visio/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`;

  const docRels = `${XMLH}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.microsoft.com/visio/2010/relationships/pages" Target="pages/pages.xml"/><Relationship Id="rId2" Type="http://schemas.microsoft.com/visio/2010/relationships/windows" Target="windows.xml"/></Relationships>`;

  const pagesRels = `${XMLH}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${prepared
    .map(
      (_, i) =>
        `<Relationship Id="rId${i + 1}" Type="http://schemas.microsoft.com/visio/2010/relationships/page" Target="page${i + 1}.xml"/>`,
    )
    .join("")}</Relationships>`;

  const windows = `${XMLH}<Windows xmlns="http://schemas.microsoft.com/office/visio/2012/main" ClientWidth="1400" ClientHeight="900"><Window ID="0" WindowType="Drawing" WindowState="1073741824" Document="\\visio\\document.xml" Page="0" ViewScale="-1" ViewCenterX="5" ViewCenterY="4"/></Windows>`;

  const core = `${XMLH}<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${esc(meta.title)}</dc:title><dc:creator>S&amp;M ELECTRIC</dc:creator><cp:lastModifiedBy>S&amp;M ELECTRIC</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created></cp:coreProperties>`;

  const app = `${XMLH}<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>Microsoft Visio</Application><Company>S&amp;M ELECTRIC</Company></Properties>`;

  const files: Record<string, Uint8Array> = {
    "[Content_Types].xml": strToU8(contentTypes),
    "_rels/.rels": strToU8(rootRels),
    "visio/document.xml": strToU8(documentXml()),
    "visio/_rels/document.xml.rels": strToU8(docRels),
    "visio/pages/pages.xml": strToU8(pagesXml(prepared)),
    "visio/pages/_rels/pages.xml.rels": strToU8(pagesRels),
    "visio/windows.xml": strToU8(windows),
    "docProps/core.xml": strToU8(core),
    "docProps/app.xml": strToU8(app),
  };
  prepared.forEach((p, i) => {
    files[`visio/pages/page${i + 1}.xml`] = strToU8(pageXml(p));
  });

  const zipped = zipSync(files, { level: 6 });
  return new Blob([zipped as unknown as BlobPart], {
    type: "application/vnd.ms-visio.drawing",
  });
}

export function downloadVsdx(pages: VsPage[], name: string) {
  const blob = buildVsdx(pages, { title: name });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.vsdx`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
