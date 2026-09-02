import { createFileRoute } from "@tanstack/react-router";
import { PanelDrawings } from "@/components/admin/PanelDrawings";
import { PanelSpecVisual } from "@/components/admin/PanelSpecVisual";
import { buildSchematicSvg } from "@/lib/panel-schematic";
import type { PanelDesign } from "@/lib/panel";

const design: PanelDesign = {
  summary: {
    object_type: "Частный дом",
    supply: "3 фазы, 400 В",
    grounding: "TN-C-S",
    total_power_kw: 24,
    calculated_power_kw: 15.6,
    main_breaker: "ВВОД 3P C25",
    used_modules: 34,
    reserve_modules: 14,
    enclosure: "Навесной 48 мод.",
    enclosure_modules: 48,
    ip: "IP40",
  },
  phase_load: [
    { phase: "L1", kw: 5.1, current_a: 23, lines: ["QF2", "QF3"] },
    { phase: "L2", kw: 5.5, current_a: 25, lines: ["QF4"] },
    { phase: "L3", kw: 5.0, current_a: 22, lines: ["QF5", "QF6"] },
  ],
  protection_chain: ["Ввод", "УЗИП", "Реле напряжения", "УЗО", "Автоматы"],
  lines: [
    { mark: "QF2", name: "Освещение 1 этаж", power_kw: 0.6, current_a: 2.7, breaker: "C10", curve: "C", poles: 1, phase: "L1", rcd: "QD1", cable: "ВВГнг 3х1.5", modules: 1, note: "" },
    { mark: "QF3", name: "Розетки гостиная", power_kw: 2, current_a: 9, breaker: "C16", curve: "C", poles: 1, phase: "L1", rcd: "QD1", cable: "ВВГнг 3х2.5", modules: 1, note: "" },
    { mark: "QF4", name: "Варочная панель", power_kw: 7, current_a: 32, breaker: "C32", curve: "C", poles: 2, phase: "L2", rcd: "QD2", cable: "ВВГнг 3х6", modules: 2, note: "" },
    { mark: "QF5", name: "Бойлер", power_kw: 2, current_a: 9, breaker: "C16", curve: "C", poles: 1, phase: "L3", rcd: "QD2", cable: "ВВГнг 3х2.5", modules: 1, note: "" },
  ],
  rcd_groups: [
    { mark: "QD1", rating: "40А", type: "A", leakage: "30 мА", lines: ["QF2", "QF3"], note: "" },
    { mark: "QD2", rating: "40А", type: "A", leakage: "30 мА", lines: ["QF4", "QF5"], note: "" },
  ],
  rails: [
    { index: 1, title: "Рейка 1 — ввод", items: [{ mark: "QF1", label: "ВВОД 3P C25", modules: 3 }] },
    { index: 2, title: "Рейка 2 — группы", items: [{ mark: "QF2", label: "C10", modules: 1 }] },
  ],
  spec: [
    { pos: 1, name: "Автоматический выключатель", manufacturer: "Schneider", model: "iC60N", rating: "3P C25", modules: 3, qty: 1, unit: "шт" },
    { pos: 2, name: "УЗО", manufacturer: "Schneider", model: "iID", rating: "4P 40A 30mA", modules: 4, qty: 2, unit: "шт" },
    { pos: 3, name: "Автоматический выключатель", manufacturer: "Schneider", model: "iC60N", rating: "1P C16", modules: 1, qty: 6, unit: "шт" },
    { pos: 4, name: "Реле напряжения", manufacturer: "Zubr", model: "D63", rating: "63A", modules: 2, qty: 1, unit: "шт" },
  ],
  materials: [
    { pos: 1, name: "Корпус навесной 48 мод.", manufacturer: "", model: "", rating: "", modules: 0, qty: 1, unit: "шт" },
  ],
  checks: [],
  issues: [],
  assumptions: [],
  image_prompt: "",
};

function Page() {
  let svgLen = -1;
  let svgErr = "";
  try {
    svgLen = buildSchematicSvg(design).length;
  } catch (e) {
    svgErr = e instanceof Error ? `${e.message}\n${e.stack}` : String(e);
  }
  return (
    <div className="space-y-6 p-6">
      <div data-testid="svg-status">svg: {svgLen} {svgErr}</div>
      <PanelDrawings design={design} title="Фикстура" />
      <PanelSpecVisual rows={[...design.spec, ...design.materials]} />
      <div data-testid="tail">END</div>
    </div>
  );
}

export const Route = createFileRoute("/panel-fixture-test")({ component: Page });
