import { ArrowRight } from "lucide-react";

import workPanel from "@/assets/work-panel.jpg";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const CALLOUTS = [
  { n: "01", label: "Ввод" },
  { n: "02", label: "Защита" },
  { n: "03", label: "УЗО" },
  { n: "04", label: "Автоматы" },
  { n: "05", label: "Реле" },
  { n: "06", label: "Группы" },
];

export function PanelBuild() {
  return (
    <section className="relative overflow-hidden bg-ink text-ink-foreground">
      <div className="pointer-events-none absolute inset-0 tech-grid opacity-50" aria-hidden />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:py-24">
        <Reveal>
          <SectionHeading
            tone="dark"
            eyebrow="Электрощиты"
            title="Электрощит — центр системы"
            subtitle="Собираем и монтируем щиты с понятной структурой, маркировкой и аккуратным расключением."
          />
          <ul className="mt-8 grid gap-px overflow-hidden rounded-sm border border-ink-border bg-ink-border sm:grid-cols-2">
            {CALLOUTS.map((c) => (
              <li
                key={c.n}
                className="flex items-center gap-3 bg-ink px-4 py-4 text-sm font-semibold text-ink-foreground"
              >
                <span className="font-mono text-[11px] font-bold text-brand">{c.n}</span>
                <span className="h-px w-5 bg-ink-border" aria-hidden />
                {c.label}
              </li>
            ))}
          </ul>
          <a
            href="#contacts"
            className="mt-8 inline-flex h-14 items-center justify-center gap-2 rounded-sm bg-brand px-6 text-sm font-bold uppercase tracking-[0.08em] text-brand-foreground transition-transform hover:scale-[1.02]"
          >
            Заказать электрощит <ArrowRight className="size-5" />
          </a>
        </Reveal>

        <Reveal delay={120} className="relative">
          <div className="relative overflow-hidden rounded-sm border border-ink-border">
            <img
              src={workPanel}
              alt="Профессиональная сборка электрощита: автоматы, УЗО и маркировка линий на DIN-рейке"
              loading="lazy"
              className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
            />
            <span className="pointer-events-none absolute left-3 top-3 border border-brand/40 bg-ink/70 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-brand backdrop-blur-sm">
              QF / QD / PE / N
            </span>
          </div>
          <div className="absolute -right-2 -top-2 hidden h-14 w-14 border-r-2 border-t-2 border-brand lg:block" aria-hidden />
        </Reveal>
      </div>
    </section>
  );
}
