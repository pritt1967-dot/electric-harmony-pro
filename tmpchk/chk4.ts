import { DRAWABLE_DEVICES } from "../src/lib/panel-build";
const D:any = DRAWABLE_DEVICES;
const f=(t:string,q:string)=>D.filter((d:any)=>d.deviceType===t && (d.manufacturer+" "+d.series+" "+d.model).toLowerCase().includes(q)).slice(0,8).map((d:any)=>`${d.manufacturer}|${d.series}|${d.model}|${d.modules}m|${d.poles}P`);
console.log("SPD IEK:", f("spd","iek"));
console.log("SPD all опс:", f("spd","опс"));
console.log("VR:", D.filter((d:any)=>d.deviceType==="voltage_relay").slice(0,12).map((d:any)=>`${d.manufacturer}|${d.model}|${d.modules}m`));
