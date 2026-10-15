import type { jsPDF } from "jspdf";

export async function sha256Hex(buf: ArrayBuffer): Promise<string> {
  const d = await crypto.subtle.digest("SHA-256", buf);
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Фиксирует отпечаток именно тех байтов, которые скачиваются, затем сохраняет файл. */
export async function saveSealedPdf(doc: jsPDF, id: string, register: (id: string, sha256: string) => Promise<unknown>): Promise<void> {
  const bytes = doc.output("arraybuffer");
  await register(id, await sha256Hex(bytes));
  const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${id}.pdf`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
