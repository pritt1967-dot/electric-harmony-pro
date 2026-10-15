/** Фиксирует SHA-256 готового PDF тем же серверным кодом, что вызывает админка. argv: id file */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { registerDocumentPdf } from "../../src/lib/finance-documents.server";
const [id, file] = process.argv.slice(2);
try {
  await registerDocumentPdf(id!, createHash("sha256").update(readFileSync(file!)).digest("hex"));
  console.log("registered");
} catch (e) { console.log("rejected:", e instanceof Error ? e.message : e); process.exit(3); }
