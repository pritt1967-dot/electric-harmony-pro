import { assemblePanel, compareWithOriginal } from "../lib/shape-library/assemble";
const a = assemblePanel();
const c = compareWithOriginal(a);
console.log(c.rows.map(r=>`${r.label}: ${r.original} / ${r.assembled} ${r.match?"OK":"DIFF"}`).join("\n"));
console.log("posDiff:", c.posDiff);
console.log(a.placed.map(p=>`${p.item.model} x=${p.x.toFixed(1)} y=${p.y.toFixed(1)}`).join("\n"));
console.log("wires resolved", a.wires.filter(w=>w.resolved).length);
