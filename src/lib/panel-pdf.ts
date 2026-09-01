import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import { loadAssets } from "./estimate-pdf";
import { formatDate, todayISO } from "./estimates";
import type { PanelDesign } from "./panel";

const BLUE: [number, number, number] = [29, 78, 216];
const LIGHT: [number, number, number] = [239, 244, 255];

export async function buildPanelPdf(design: PanelDesign, imageDataUrl?: string) {
  const { fonts, logo } = await loadAssets();
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  doc.addFileToVFS("DejaVuSans.ttf", fonts.regular);
  doc.addFont("DejaVuSans.ttf", "DejaVu", "normal");
  doc.addFileToVFS("DejaVuSans-Bold.ttf", fonts.bold);
  doc.addFont("DejaVuSans-Bold.ttf", "DejaVu", "bold");
  doc.setFont("DejaVu", "normal");

  const pageW = doc.internal.pageSize.getWidth();
  const M = 14;
  const s = design.summary ?? ({} as PanelDesign["summary"]);

  doc.setFillColor(...BLUE);
  doc.rect(0, 0, pageW, 26, "F");
  try {
    const props = doc.getImageProperties(logo);
    const h = 16;
    const w = (h * props.width) / props.height;
    doc.addImage(logo, "PNG", M, 5, w, h);
  } catch {
    /* логотип не критичен */
  }
  doc.setTextColor(255, 255, 255);
  doc.setFont("DejaVu", "bold");
  doc.setFontSize(14);
  doc.text("Проект распределительного щита", M + 20, 12);
  doc.setFont("DejaVu", "normal");
  doc.setFontSize(9);
  doc.text(`S&M Electric · ${formatDate(todayISO())}`, M + 20, 19);
  doc.setTextColor(15, 23, 42);

  let y = 34;
  const heading = (text: string) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.setFont("DejaVu", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...BLUE);
    doc.text(text, M, y);
    doc.setTextColor(15, 23, 42);
    doc.setFont("DejaVu", "normal");
    y += 5;
  };

  heading("1. Краткий итог");
  autoTable(doc, {
    startY: y,
    styles: { font: "DejaVu", fontSize: 9, cellPadding: 1.6 },
    theme: "grid",
    headStyles: { fillColor: LIGHT, textColor: [15, 23, 42] },
    head: [["Параметр", "Значение"]],
    body: [
      ["Объект", s.object_type ?? ""],
      ["Питание", s.supply ?? ""],
      ["Заземление", s.grounding ?? ""],
      ["Мощность заявленная / расчётная, кВт", `${s.total_power_kw ?? 0} / ${s.calculated_power_kw ?? 0}`],
      ["Вводной автомат", s.main_breaker ?? ""],
      ["Занято модулей / резерв", `${s.used_modules ?? 0} / ${s.reserve_modules ?? 0}`],
      ["Корпус", `${s.enclosure ?? ""} (${s.enclosure_modules ?? 0} мод., ${s.ip ?? ""})`],
    ],
    margin: { left: M, right: M },
  });
  y = (doc as never as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  heading("2. Распределение нагрузки по фазам");
  autoTable(doc, {
    startY: y,
    styles: { font: "DejaVu", fontSize: 9, cellPadding: 1.6 },
    theme: "grid",
    headStyles: { fillColor: LIGHT, textColor: [15, 23, 42] },
    head: [["Фаза", "кВт", "Ток, А", "Группы"]],
    body: (design.phase_load ?? []).map((p) => [
      p.phase,
      String(p.kw ?? 0),
      String(p.current_a ?? 0),
      (p.lines ?? []).join(", "),
    ]),
    margin: { left: M, right: M },
  });
  y = (doc as never as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  heading("3. Структура защиты");
  doc.setFontSize(9);
  (design.protection_chain ?? []).forEach((step, i) => {
    if (y > 275) {
      doc.addPage();
      y = 20;
    }
    doc.text(`${i + 1}. ${step}`, M, y);
    y += 5;
  });
  y += 4;

  heading("4. Групповые линии");
  autoTable(doc, {
    startY: y,
    styles: { font: "DejaVu", fontSize: 8, cellPadding: 1.4 },
    theme: "grid",
    headStyles: { fillColor: LIGHT, textColor: [15, 23, 42] },
    head: [["Марк.", "Линия", "кВт", "А", "Автомат", "P", "Фаза", "УЗО", "Кабель", "Мод."]],
    body: (design.lines ?? []).map((l) => [
      l.mark,
      l.name,
      String(l.power_kw ?? ""),
      String(l.current_a ?? ""),
      l.breaker,
      String(l.poles ?? ""),
      l.phase,
      l.rcd,
      l.cable,
      String(l.modules ?? ""),
    ]),
    margin: { left: M, right: M },
  });
  y = (doc as never as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  if ((design.rcd_groups ?? []).length) {
    heading("5. Группы УЗО");
    autoTable(doc, {
      startY: y,
      styles: { font: "DejaVu", fontSize: 8, cellPadding: 1.4 },
      theme: "grid",
      headStyles: { fillColor: LIGHT, textColor: [15, 23, 42] },
      head: [["Марк.", "Номинал", "Тип", "Утечка", "Автоматы", "Примечание"]],
      body: design.rcd_groups.map((g) => [
        g.mark,
        g.rating,
        g.type,
        g.leakage,
        (g.lines ?? []).join(", "),
        g.note ?? "",
      ]),
      margin: { left: M, right: M },
    });
    y = (doc as never as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  heading("6. Компоновка DIN-реек");
  (design.rails ?? []).forEach((rail) => {
    autoTable(doc, {
      startY: y,
      styles: { font: "DejaVu", fontSize: 8, cellPadding: 1.4 },
      theme: "grid",
      headStyles: { fillColor: LIGHT, textColor: [15, 23, 42] },
      head: [[rail.title, "Марк.", "Мод."]],
      body: (rail.items ?? []).map((i) => [i.label, i.mark, String(i.modules ?? "")]),
      margin: { left: M, right: M },
    });
    y = (doc as never as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5;
  });
  y += 3;

  const spec = [...(design.spec ?? []), ...(design.materials ?? [])];
  heading("7. Спецификация оборудования и материалов");
  autoTable(doc, {
    startY: y,
    styles: { font: "DejaVu", fontSize: 8, cellPadding: 1.4 },
    theme: "grid",
    headStyles: { fillColor: LIGHT, textColor: [15, 23, 42] },
    head: [["№", "Наименование", "Производитель", "Модель", "Номинал", "Мод.", "Кол-во", "Ед."]],
    body: spec.map((r, i) => [
      String(i + 1),
      r.name,
      r.manufacturer ?? "",
      r.model ?? "",
      r.rating ?? "",
      String(r.modules ?? ""),
      String(r.qty ?? 1),
      r.unit ?? "шт",
    ]),
    margin: { left: M, right: M },
  });
  y = (doc as never as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  if ((design.issues ?? []).length || (design.assumptions ?? []).length) {
    heading("8. Замечания и допущения");
    doc.setFontSize(9);
    (design.issues ?? []).forEach((issue) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const text = doc.splitTextToSize(
        `• ${issue.text}${issue.fix ? " → " + issue.fix : ""}`,
        pageW - 2 * M,
      );
      doc.text(text, M, y);
      y += text.length * 4.6;
    });
    (design.assumptions ?? []).forEach((a) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const text = doc.splitTextToSize(`• Допущение: ${a}`, pageW - 2 * M);
      doc.text(text, M, y);
      y += text.length * 4.6;
    });
  }

  if (imageDataUrl) {
    doc.addPage();
    doc.setFont("DejaVu", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...BLUE);
    doc.text("9. Визуализация собранного щита", M, 20);
    doc.setTextColor(15, 23, 42);
    doc.setFont("DejaVu", "normal");
    try {
      const w = pageW - 2 * M;
      doc.addImage(imageDataUrl, "PNG", M, 26, w, w, undefined, "FAST");
    } catch {
      doc.setFontSize(9);
      doc.text("Изображение не удалось встроить.", M, 32);
    }
  }

  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p += 1) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      "Все технические решения подлежат проверке специалистом перед монтажом. S&M Electric",
      M,
      doc.internal.pageSize.getHeight() - 8,
    );
    doc.text(`${p} / ${pages}`, pageW - M, doc.internal.pageSize.getHeight() - 8, {
      align: "right",
    });
    doc.setTextColor(15, 23, 42);
  }

  return doc;
}
