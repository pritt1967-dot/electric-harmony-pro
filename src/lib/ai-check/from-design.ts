/**
 * Снимок текущего щита конструктора (PanelDesign) для «Проверки щита ИИ».
 * Только чтение: ничего не рассчитывает и не меняет в проекте.
 */
import type { PanelDesign } from "@/lib/panel";
import type { PanelSnapshot } from "./types";

const cut = (v: unknown, n: number) => String(v ?? "").slice(0, n);
const amps = (s: string) => {
  const m = String(s ?? "").match(/(\d+(?:[.,]\d+)?)/);
  return m ? Number(m[1]!.replace(",", ".")) : null;
};
const curveOf = (s: string) => {
  const m = String(s ?? "").trim().match(/^([BCDK])/i);
  return m ? m[1]!.toUpperCase() : null;
};

export function snapshotFromDesign(design: PanelDesign): PanelSnapshot {
  const s = design.summary ?? ({} as PanelDesign["summary"]);
  const three = String(s.supply ?? "").includes("400") || String(s.supply ?? "").includes("3");
  const pos = new Map<string, { rail: number; start: number; end: number }>();
  (design.rails ?? []).forEach((r, ri) => {
    let at = 1;
    for (const it of r.items ?? []) {
      const m = Math.max(0, it.modules || 0);
      if (it.mark && !pos.has(it.mark)) pos.set(it.mark, { rail: ri + 1, start: at, end: at + Math.max(m, 1) - 1 });
      at += m;
    }
  });
  const place = (mark: string) => pos.get(mark) ?? { rail: 0, start: 0, end: 0 };

  const devices: PanelSnapshot["devices"] = [];
  for (const g of design.rcd_groups ?? []) {
    const p = place(g.mark);
    devices.push({
      key: cut(g.mark || `rcd-${devices.length}`, 64), mark: cut(g.mark, 80), role: "rcd",
      manufacturer: "", series: "", model: cut([g.type, g.rating, g.leakage].filter(Boolean).join(" "), 120),
      rated_a: amps(g.rating), curve: null, poles: g.type?.includes("4") ? 4 : 2, modules: three ? 4 : 2,
      ...p, out_of_rail: p.rail === 0, substitute: false,
    });
  }
  for (const l of design.lines ?? []) {
    const p = place(l.mark);
    devices.push({
      key: cut(l.mark || `line-${devices.length}`, 64), mark: cut(l.name ? `${l.mark} ${l.name}` : l.mark, 80), role: "group",
      manufacturer: "", series: "", model: cut([l.breaker, l.cable && `кабель ${l.cable}`].filter(Boolean).join(", "), 120),
      rated_a: amps(l.breaker), curve: l.curve ? cut(l.curve, 10) : curveOf(l.breaker),
      poles: Number.isFinite(l.poles) ? Math.trunc(l.poles) : null,
      modules: Math.min(20, Math.max(0, Math.trunc(l.modules || 0))),
      ...p, out_of_rail: p.rail === 0, substitute: false,
    });
  }

  const groups = design.rcd_groups ?? [];
  const inGroup = new Set(groups.flatMap((g) => g.lines ?? []));
  const chain: PanelSnapshot["chain"] = groups.map((g, i) => ({
    rcd: cut([g.mark, g.rating, g.leakage].filter(Boolean).join(" "), 200),
    n_bus: `N${i + 1}`,
    lines: (g.lines ?? []).slice(0, 60).map((m) => cut(m, 200)),
  }));
  const free = (design.lines ?? []).filter((l) => !inGroup.has(l.mark)).map((l) => cut(l.mark, 200));
  if (free.length) chain.push({ rcd: null, n_bus: "N", lines: free.slice(0, 60) });

  return {
    network: { phases: three ? 3 : 1, voltage: three ? 400 : 230, grounding: cut(s.grounding || "не указана", 40), ip: cut(s.ip || "не указан", 20) },
    rails: {
      count: Math.min(20, (design.rails ?? []).length),
      modules: Math.min(100, Math.max(0, Math.trunc(s.enclosure_modules || 0))),
      reserve: Math.min(100, Math.max(0, Math.trunc(s.reserve_modules || 0))),
    },
    main: s.main_breaker ? cut(s.main_breaker, 200) : null,
    devices: devices.slice(0, 120),
    chain: chain.slice(0, 40),
    n_buses: chain.map((c) => c.n_bus).slice(0, 40),
    pe_bus: "PE",
    checks: (design.checks ?? []).slice(0, 60).map((c) => ({ title: cut(c.text, 200), ok: !!c.ok, detail: "" })),
  };
}
