import { PHYSICAL_DEVICES, DEVICE_LIBRARY_STATS } from "../src/lib/shape-library/device-library-generated";
console.log(JSON.stringify(DEVICE_LIBRARY_STATS));
const noSvg = PHYSICAL_DEVICES.filter((d:any)=>!d.svgPath);
console.log("count", PHYSICAL_DEVICES.length, "noSvg", noSvg.length);
console.log(JSON.stringify(PHYSICAL_DEVICES[0], null, 1).slice(0,1200));
for (const d of noSvg.slice(0,25)) console.log("-", d.manufacturer, d.series, d.model, d.deviceType);
const cp = PHYSICAL_DEVICES.filter((d:any)=>(d.connectionPoints?.length??0)>0);
console.log("withCP", cp.length);
