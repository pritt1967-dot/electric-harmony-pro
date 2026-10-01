import { validatePanel } from "./lib/panel-validator";
import { readFileSync } from "fs";
const raw=readFileSync("/tmp/vt/raw.txt","utf8");const j = JSON.parse(raw)[0].j;const before=JSON.stringify(j);
const r = validatePanel(j);
console.log("STATUS",r.status,r.summary);
for(const c of r.checks) if(c.status!=="OK"&&!c.title.includes("кабель")) console.log(c.status,"|",c.title,"|",c.detail);
for(const c of r.checks) if(/УЗО QD\d: номинал|модул|Вместим|резерв/i.test(c.title)) console.log("·",c.status,c.title,c.detail);
console.log("MISSING",JSON.stringify(r.missing_data));console.log("SUG",JSON.stringify(r.suggestions));
console.log("UNCHANGED",before===JSON.stringify(j), raw===readFileSync("/tmp/vt/raw.txt","utf8"));
