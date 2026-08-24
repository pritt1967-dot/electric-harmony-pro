import { buildPanel, TEST_SPEC_48 } from "../src/lib/panel-build";
const b = buildPanel(TEST_SPEC_48, { railModules: 12, rails: 4, reserveModules: 6, showPoints: true });
console.log(JSON.stringify(b.totals, null, 1));
console.log("missing:", b.missing.map(m=>m.item.tag+" — "+m.reason));
console.log(b.placed.map(p=>`${p.tag} r${p.rail} m${p.startModule}+${p.modules} ${p.device?p.device.id:"NONE"} cp=${p.points.length}`).join("\n"));
require("fs").writeFileSync("/tmp/panel.svg", b.svg);
