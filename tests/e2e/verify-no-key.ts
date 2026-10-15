/** Проверка серверным кодом без ключей подписи: argv id token. */
import { verifyDocument } from "../../src/lib/finance-documents.server";
delete process.env.FIN_DOC_SIGNING_KEY; delete process.env.FIN_DOC_SIGNING_KEY_V2;
console.log((await verifyDocument(process.argv[2]!, process.argv[3]!)).status);
