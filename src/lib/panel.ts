/** Types and helpers for the AI switchboard designer (client-safe). */

export type PanelInput = {
  object_type: string;
  phases: "1" | "3";
  input_type: string;
  power_kw: number;
  main_breaker_a: number;
  grounding: string;
  ip: string;
  lines_text: string;
  notes: string;
};

export type PanelLine = {
  mark: string;
  name: string;
  power_kw: number;
  current_a: number;
  breaker: string;
  curve: string;
  poles: number;
  phase: string;
  rcd: string;
  cable: string;
  modules: number;
  note: string;
};

export type PanelRcdGroup = {
  mark: string;
  rating: string;
  type: string;
  leakage: string;
  lines: string[];
  note: string;
};

export type PanelRail = {
  index: number;
  title: string;
  items: { mark: string; label: string; modules: number }[];
};

export type PanelSpecRow = {
  pos: number;
  name: string;
  manufacturer: string;
  model: string;
  rating: string;
  modules: number;
  qty: number;
  unit: string;
};

export type PanelIssue = { severity: string; text: string; fix: string };

export type PanelDesign = {
  summary: {
    object_type: string;
    supply: string;
    grounding: string;
    total_power_kw: number;
    calculated_power_kw: number;
    main_breaker: string;
    used_modules: number;
    reserve_modules: number;
    enclosure: string;
    enclosure_modules: number;
    ip: string;
  };
  phase_load: { phase: string; kw: number; current_a: number; lines: string[] }[];
  protection_chain: string[];
  lines: PanelLine[];
  rcd_groups: PanelRcdGroup[];
  rails: PanelRail[];
  spec: PanelSpecRow[];
  materials: PanelSpecRow[];
  checks: { text: string; ok: boolean }[];
  issues: PanelIssue[];
  assumptions: string[];
  image_prompt: string;
};

export const DEFAULT_PANEL_INPUT: PanelInput = {
  object_type: "Частный дом",
  phases: "3",
  input_type: "3P+N",
  power_kw: 15,
  main_breaker_a: 25,
  grounding: "TN-C-S",
  ip: "IP40",
  lines_text: "",
  notes: "",
};

export const ENCLOSURE_SIZES = [12, 18, 24, 36, 48, 54, 72, 96];

export function nextEnclosure(modules: number) {
  return ENCLOSURE_SIZES.find((s) => s >= modules) ?? 96;
}

export function railTotal(rail: PanelRail) {
  return rail.items.reduce((s, i) => s + (i.modules || 0), 0);
}
