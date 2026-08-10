import { jsPDF } from "jspdf";

import { fetchBase64, loadAssets } from "./estimate-pdf";
import { CONTACTS } from "@/components/site/contacts";

const BLUE: [number, number, number] = [29, 78, 216];
const LIGHT: [number, number, number] = [239, 244, 255];
const DARK: [number, number, number] = [17, 17, 17];
const GRAY: [number, number, number] = [90, 90, 90];

export async function buildContactCardPdf(baseUrl?: string) {
  const siteUrl = baseUrl ? `${baseUrl}/` : "https://electric-9117335567.lovable.app/";
  const { fonts, logo } = await loadAssets(baseUrl);

  // Use the existing site QR code from public/qr-site.png
  const qrBase64 = await fetchBase64("/qr-site.png", baseUrl);
  const qr = `data:image/png;base64,${qrBase64}`;

  const doc = new jsPDF({ unit: "mm", format: "a4" });

  doc.addFileToVFS("DejaVuSans.ttf", fonts.regular);
  doc.addFont("DejaVuSans.ttf", "DejaVu", "normal");
  doc.addFileToVFS("DejaVuSans-Bold.ttf", fonts.bold);
  doc.addFont("DejaVuSans-Bold.ttf", "DejaVu", "bold");
  doc.setFont("DejaVu", "normal");

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = 18;
  const contentW = pageW - M * 2;

  // Background top bar
  doc.setFillColor(...LIGHT);
  doc.rect(0, 0, pageW, 52, "F");

  // Logo
  try {
    doc.addImage(logo, "PNG", M, 15, 22, 22);
  } catch {
    /* logo optional */
  }

  // Company name
  doc.setFont("DejaVu", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...DARK);
  doc.text("S&M Electric", M + 28, 25);

  doc.setFont("DejaVu", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...GRAY);
  doc.text("Электромонтаж в Санкт-Петербурге и области", M + 28, 32);

  // Main contact card box
  const boxY = 62;
  const boxH = 130;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...BLUE);
  doc.setLineWidth(0.6);
  doc.roundedRect(M, boxY, contentW, boxH, 5, 5, "FD");

  // Left column — contacts
  let y = boxY + 14;
  const leftX = M + 12;
  const colW = contentW / 2 - 18;

  doc.setFont("DejaVu", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...BLUE);
  doc.text("Контакты", leftX, y);

  y += 10;

  const contactRows = [
    { label: "Телефон", value: CONTACTS.phoneDisplay, href: CONTACTS.phoneHref },
    { label: "Дополнительный", value: CONTACTS.secondaryPhoneDisplay, href: CONTACTS.secondaryPhoneHref },
    { label: "Email", value: CONTACTS.email, href: `mailto:${CONTACTS.email}` },
    { label: "Адрес", value: CONTACTS.address },
    { label: "Режим работы", value: CONTACTS.hours },
  ];

  for (const row of contactRows) {
    doc.setFont("DejaVu", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    doc.text(row.label, leftX, y);

    doc.setFont("DejaVu", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...DARK);
    doc.text(row.value, leftX, y + 5.5, { maxWidth: colW });

    y += 16;
  }

  // Right column — QR code + website
  const rightX = M + contentW / 2 + 6;
  const qrSize = 58;
  const qrX = rightX + (contentW / 2 - qrSize) / 2;
  const qrY = boxY + 18;

  try {
    doc.addImage(qr, "PNG", qrX, qrY, qrSize, qrSize);
  } catch {
    /* QR optional */
  }

  doc.setFont("DejaVu", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text("Отсканируйте QR-код", pageW / 2 + 6, qrY + qrSize + 9, { align: "center" });
  doc.setFont("DejaVu", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text("Переход на сайт с телефона", pageW / 2 + 6, qrY + qrSize + 14, { align: "center" });

  doc.setFont("DejaVu", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...BLUE);
  const displayUrl = siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  doc.text(displayUrl, pageW / 2 + 6, qrY + qrSize + 22, { align: "center" });

  // Bottom info strip
  const footerY = boxY + boxH + 14;
  doc.setFillColor(...BLUE);
  doc.rect(M, footerY, contentW, 24, "F");

  doc.setFont("DejaVu", "bold");
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text("Бесплатный выезд и расчёт", pageW / 2, footerY + 10, { align: "center" });

  doc.setFont("DejaVu", "normal");
  doc.setFontSize(9);
  doc.text("Договор • Гарантия • Смета за 15 минут", pageW / 2, footerY + 17, { align: "center" });

  // Page footer
  doc.setFont("DejaVu", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text("© S&M Electric — электромонтажная компания", pageW / 2, pageH - 12, { align: "center" });

  return doc.output("arraybuffer");
}
