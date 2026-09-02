import type { PanelDesign } from "@/lib/panel";

/**
 * Однолинейная схема щита в виде SVG.
 * Возвращает готовую строку SVG — её же используем для экспорта в CAD.
 * Любые некорректные данные проекта не должны ломать отображение страницы.
 */
export function buildSchematicSvg(design: PanelDesign): string {
  try {
    const lines = Array.isArray(design.lines) ? design.lines : [];
    const chain = Array.isArray(design.protection_chain) ? design.protection_chain : [];
    const rowH = 46;
    const topH = 90 + chain.length * 34;
    const width = 1000;
    const height = topH + lines.length * rowH + 90;

    const esc = (value: unknown) =>
      String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    const parts: string[] = [];
    parts.push(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="Arial, Helvetica, sans-serif">`,
      `<rect width="${width}" height="${height}" fill="#ffffff"/>`,
      `<text x="24" y="34" font-size="20" font-weight="bold" fill="#0f172a">Однолинейная схема — ${esc(design.summary?.enclosure ?? "щит")}</text>`,
      `<text x="24" y="56" font-size="13" fill="#475569">${esc(design.summary?.supply ?? "")} · ${esc(design.summary?.grounding ?? "")} · S&amp;M ELECTRIC</text>`,
    );

    const busX = 150;
    parts.push(
      `<line x1="${busX}" y1="70" x2="${busX}" y2="${height - 40}" stroke="#1d4ed8" stroke-width="3"/>`,
      `<text x="${busX - 130}" y="86" font-size="13" font-weight="bold" fill="#1d4ed8">ВВОД</text>`,
      `<text x="${busX - 130}" y="104" font-size="12" fill="#475569">L1 L2 L3 N PE</text>`,
    );

    chain.forEach((step, i) => {
      const y = 96 + i * 34;
      parts.push(
        `<rect x="${busX - 60}" y="${y - 16}" width="360" height="26" rx="5" fill="#eff6ff" stroke="#1d4ed8"/>`,
        `<text x="${busX - 50}" y="${y + 2}" font-size="13" fill="#0f172a">${esc(step)}</text>`,
      );
    });

    lines.forEach((l, i) => {
      const y = topH + i * rowH;
      const rcd = l.rcd ? ` · УЗО ${esc(l.rcd)}` : "";
      parts.push(
        `<line x1="${busX}" y1="${y}" x2="${busX + 90}" y2="${y}" stroke="#0f172a" stroke-width="2"/>`,
        `<rect x="${busX + 90}" y="${y - 14}" width="70" height="28" rx="3" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>`,
        `<text x="${busX + 125}" y="${y + 5}" font-size="12" text-anchor="middle" fill="#0f172a">${esc(l.breaker)}</text>`,
        `<line x1="${busX + 160}" y1="${y}" x2="${busX + 250}" y2="${y}" stroke="#0f172a" stroke-width="2"/>`,
        `<text x="${busX + 92}" y="${y - 20}" font-size="11" font-weight="bold" fill="#1d4ed8">${esc(l.mark)}</text>`,
        `<text x="${busX + 258}" y="${y - 2}" font-size="13" fill="#0f172a">${esc(l.name)}</text>`,
        `<text x="${busX + 258}" y="${y + 14}" font-size="11" fill="#64748b">${esc(l.cable)} · ${esc(String(l.poles))}P · ${esc(l.phase)}${rcd} · ${esc(String(l.current_a))} А</text>`,
      );
    });

    parts.push(
      `<text x="24" y="${height - 16}" font-size="11" fill="#94a3b8">Схема сформирована автоматически и подлежит проверке специалистом перед монтажом.</text>`,
      `</svg>`,
    );

    return parts.join("\n");
  } catch (error) {
    console.error("buildSchematicSvg failed", error);
    return "";
  }
}
