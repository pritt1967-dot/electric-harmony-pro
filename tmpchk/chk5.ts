import { DRAWABLE_DEVICES, resolveDevice } from "../src/lib/panel-build";
const d:any = DRAWABLE_DEVICES.find((x:any)=>x.id.includes("ва47-29-iek-1p"));
console.log(JSON.stringify(d,null,1).slice(0,900));
