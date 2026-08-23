import { SHAPE_LIBRARY } from "../src/lib/shape-library";
console.log("items", SHAPE_LIBRARY.length);
for (const s of SHAPE_LIBRARY) {
  console.log([s.slug, s.equipment_type, s.modules, s.width_mm?.toFixed?.(1), s.height_mm?.toFixed?.(1), "cp="+s.connection_points.length, "svg="+(s.svg?s.svg.length:0)].join(" | "));
}
