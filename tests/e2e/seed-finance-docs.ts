/** Выдаёт документы реальным серверным кодом (номер, отпечаток данных, подпись, QR-метка). */
import { writeFileSync, mkdirSync } from "node:fs";
import { issueReportDocument } from "../../src/lib/finance-documents.server";
const out = process.env.E2E_OUT ?? "/tmp/finance-e2e";
mkdirSync(out, { recursive: true });
const docs = [];
for (const label of ["A", "B"]) docs.push({ label, ...(await issueReportDocument("p-e2e")) });
writeFileSync(`${out}/docs.json`, JSON.stringify(docs));
console.log("issued", docs.map((d) => d.id).join(", "));
