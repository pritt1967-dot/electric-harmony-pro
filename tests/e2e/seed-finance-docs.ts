/** Выдаёт два документа реальным серверным кодом и фиксирует отпечатки их PDF. */
import { createHash } from "node:crypto";
import { writeFileSync, mkdirSync } from "node:fs";
import { jsPDF } from "jspdf";
import { issueReportDocument, registerDocumentPdf } from "../../src/lib/finance-documents.server";

const out = process.env.E2E_OUT ?? "/tmp/finance-e2e";
mkdirSync(out, { recursive: true });
const pdf = (text: string) => { const d = new jsPDF(); d.text(text, 20, 20); d.setCreationDate(new Date("2026-10-15T00:00:00Z")); d.setFileId("00000000000000000000000000000000"); return Buffer.from(d.output("arraybuffer")); };
const sha = (b: Buffer) => createHash("sha256").update(b).digest("hex");

const docs = [];
for (const label of ["A", "B"]) {
  const issued = await issueReportDocument("p-e2e");
  const original = pdf(`Report ${issued.id} total 1000.00`);
  await registerDocumentPdf(issued.id, sha(original));
  writeFileSync(`${out}/${label}-original.pdf`, original);
  writeFileSync(`${out}/${label}-modified.pdf`, pdf(`Report ${issued.id} total 9000.00`));
  let rewriteBlocked = false;
  try { await registerDocumentPdf(issued.id, sha(pdf("forged"))); } catch { rewriteBlocked = true; }
  docs.push({ label, id: issued.id, verifyPath: new URL(issued.verifyUrl).pathname + new URL(issued.verifyUrl).search, rewriteBlocked });
}
writeFileSync(`${out}/docs.json`, JSON.stringify(docs));
console.log("seeded", docs.map((d) => d.id).join(", "));
