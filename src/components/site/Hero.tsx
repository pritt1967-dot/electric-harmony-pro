import { ArrowRight } from "lucide-react";

import heroPanel from "@/assets/hero-panel.jpg";
import { Reveal } from "./Reveal";

const FACTS = [
  {
    value: "СПб + ЛО",
    text: "Квартиры, частные дома и коммерческие объекты по городу и области.",
  },
  {
    value: "Смета по позициям",
    text: "Расчёт из действующего прайс-листа, отдельным PDF-документом.",
  },
  {
    value: "Гарантия",
    text: "Работаем по договору, проверяем линии и передаём объект по акту.",
  },
];

export function Hero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <>
      <section
        id="top"
        className="relative overflow-hidden bg-ink text-ink-foreground"
      >
        <div
          className="pointer-events-none absolute -top-32 right-[-8%] size-[560px] rounded-full bg-brand/10 blur-[150px]"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 tech-grid opacity-25" aria-hidden />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pb-14 pt-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-14 lg:pb-24 lg:pt-24">
          <div>
            <Reveal>
              <p className="inline-flex items-center gap-3 rounded-full border border-ink-border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-ink-muted">
                <span className="size-1.5 rounded-full bg-brand" aria-hidden />
                S&amp;M Electric / Electrical Engineering
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-7 text-balance text-[clamp(2.5rem,7.5vw,5.2rem)] font-extrabold uppercase leading-[0.94] tracking-[-0.045em]">
                Электромонтаж
                <span className="block text-brand">без компромиссов</span>
              </h1>
            </Reveal>
            <Reveal delay={150}>
              <p className="mt-7 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
                {subtitle}
              </p>
            </Reveal>
            <Reveal delay={220}>
              <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
                <a
                  href="#contacts"
                  className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-brand px-8 text-sm font-bold uppercase tracking-[0.08em] text-brand-foreground shadow-brand transition-transform duration-300 hover:scale-[1.03] sm:w-auto"
                >
                  Рассчитать стоимость <ArrowRight className="size-5" />
                </a>
                <a
                  href="#works"
                  className="group inline-flex h-14 items-center justify-center gap-2 rounded-full border border-ink-border px-7 text-sm font-semibold text-ink-foreground transition-colors hover:border-brand hover:text-brand"
                >
                  Смотреть наши работы
                  <span aria-hidden className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </a>
              </div>
            </Reveal>
            <p className="sr-only">{title}</p>
          </div>

          <Reveal delay={120}>
            <figure className="relative overflow-hidden rounded-3xl border border-ink-border">
              <img
                src={heroPanel}
                alt="Собранный электрощит с автоматами и УЗО на DIN-рейке — электромонтаж в Санкт-Петербурге"
                width={1600}
                height={1200}
                fetchPriority="high"
                className="aspect-[4/3] w-full object-cover lg:aspect-[4/4.4]"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent"
                aria-hidden
              />
              <span className="absolute left-4 top-4 rounded-full border border-brand/40 bg-ink/70 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-brand backdrop-blur-sm">
                Pro panel
              </span>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* Блок доверия */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:py-12">
          {FACTS.map((f, i) => (
            <Reveal key={f.value} delay={i * 70}>
              <div className="card-premium h-full p-6">
                <p className="text-[clamp(1.4rem,3vw,2rem)] font-extrabold leading-none tracking-[-0.035em]">
                  {f.value}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {f.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}
