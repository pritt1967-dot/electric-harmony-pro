import { ArrowRight, ArrowUpRight } from "lucide-react";

import heroPanel from "@/assets/hero-panel.jpg";
import { Reveal } from "./Reveal";

const MARKS = ["S&M / 01", "PRO PANEL", "220/380V", "QC PASSED"];

const TRUST = [
  "10+ лет опыта",
  "Реальные объекты",
  "Профессиональная сборка щитов",
  "Работаем по СПб и ЛО",
];

export function Hero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <>
      <section
        id="top"
        className="relative overflow-hidden gradient-hero text-ink-foreground"
      >
        <div className="pointer-events-none absolute inset-0 tech-grid opacity-50" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:py-24">
          <div>
            <Reveal>
              <p className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.28em] text-brand">
                <span className="h-px w-8 bg-brand" aria-hidden />
                S&amp;M Electric / Electrical Engineering
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-6 text-[clamp(2.2rem,8.5vw,4.6rem)] font-extrabold uppercase leading-[0.98] tracking-[-0.03em] text-balance">
                Электромонтаж
                <span className="block text-brand">без компромиссов</span>
              </h1>
            </Reveal>
            <Reveal delay={150}>
              <p className="mt-6 max-w-xl border-l-2 border-ink-border pl-4 text-base leading-relaxed text-ink-muted sm:text-lg">
                {subtitle}
              </p>
            </Reveal>
            <Reveal delay={220}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#contacts"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-sm bg-brand px-7 text-sm font-bold uppercase tracking-[0.08em] text-brand-foreground transition-transform hover:scale-[1.02]"
                >
                  Рассчитать стоимость <ArrowRight className="size-5" />
                </a>
                <a
                  href="#works"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-sm border border-ink-border px-7 text-sm font-bold uppercase tracking-[0.08em] text-ink-foreground transition-colors hover:border-brand hover:text-brand"
                >
                  Смотреть наши работы <ArrowUpRight className="size-5" />
                </a>
              </div>
            </Reveal>
            <Reveal delay={300}>
              <p className="sr-only">{title}</p>
            </Reveal>
          </div>

          <Reveal delay={140} className="relative">
            <div className="relative overflow-hidden rounded-sm border border-ink-border">
              <img
                src={heroPanel}
                alt="Собранный электрощит с автоматами и УЗО на DIN-рейке — электромонтаж в Санкт-Петербурге"
                width={1600}
                height={1200}
                fetchPriority="high"
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-ink/25" aria-hidden />
              <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5 sm:left-4 sm:top-4">
                {MARKS.map((m) => (
                  <span
                    key={m}
                    className="w-fit border border-brand/40 bg-ink/70 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-brand backdrop-blur-sm sm:text-[10px]"
                  >
                    {m}
                  </span>
                ))}
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-brand">
                  QF · QD · PE · N
                </p>
                <p className="mt-1 text-sm font-semibold text-ink-foreground">
                  Маркировка линий, аккуратная раскладка, понятная структура щита
                </p>
              </div>
            </div>
            <div className="absolute -left-2 -top-2 hidden h-16 w-16 border-l-2 border-t-2 border-brand lg:block" aria-hidden />
            <div className="absolute -bottom-2 -right-2 hidden h-16 w-16 border-b-2 border-r-2 border-brand lg:block" aria-hidden />
          </Reveal>
        </div>
      </section>

      <div className="border-y border-ink-border bg-ink text-ink-foreground">
        <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-ink-border/60 sm:grid-cols-4">
          {TRUST.map((t, i) => (
            <li
              key={t}
              className="flex items-center gap-2.5 bg-ink px-4 py-4 text-xs font-semibold text-ink-muted sm:px-6 sm:text-sm"
            >
              <span className="font-mono text-[10px] text-brand">
                {String(i + 1).padStart(2, "0")}
              </span>
              {t}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
