import { ShieldCheck, MapPin, Clock, ArrowRight, FileText } from "lucide-react";

import heroPanel from "@/assets/hero-panel.jpg";
import { Reveal } from "./Reveal";

const TRUST = [
  { icon: Clock, text: "Более 10 лет опыта" },
  { icon: MapPin, text: "Санкт-Петербург и Ленинградская область" },
  { icon: ShieldCheck, text: "Гарантия на выполненные работы" },
];

export function Hero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section
      id="top"
      className="relative overflow-hidden gradient-hero text-ink-foreground"
    >
      <div className="pointer-events-none absolute inset-0 tech-grid opacity-60" aria-hidden />
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:py-24">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-brand">
              S&amp;M Electric · Электромонтаж под ключ
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-6 text-[clamp(2rem,7vw,4rem)] font-extrabold leading-[1.03] text-balance">
              {title}
            </h1>
          </Reveal>
          <Reveal delay={150}>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
              {subtitle}
            </p>
          </Reveal>
          <Reveal delay={220}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#contacts"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-md bg-brand px-7 text-base font-bold text-brand-foreground transition-transform hover:scale-[1.02]"
              >
                Рассчитать стоимость <ArrowRight className="size-5" />
              </a>
              <a
                href="#contacts"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-md border border-ink-border px-7 text-base font-bold text-ink-foreground transition-colors hover:border-brand hover:text-brand"
              >
                <FileText className="size-5" /> Получить смету
              </a>
            </div>
          </Reveal>
          <Reveal delay={300}>
            <ul className="mt-10 grid gap-3 border-t border-ink-border pt-6 sm:grid-cols-3">
              {TRUST.map((t) => (
                <li key={t.text} className="flex items-start gap-2.5 text-sm text-ink-muted">
                  <t.icon className="mt-0.5 size-4 shrink-0 text-brand" />
                  <span className="font-medium">{t.text}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={140} className="relative">
          <div className="relative overflow-hidden rounded-lg border border-ink-border">
            <img
              src={heroPanel}
              alt="Собранный электрощит с автоматами и УЗО на DIN-рейке — электромонтаж в Санкт-Петербурге"
              width={1600}
              height={1200}
              fetchPriority="high"
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent p-4 sm:p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
                Сборка щитов
              </p>
              <p className="mt-1 text-sm font-semibold text-ink-foreground">
                Маркировка линий, УЗО, реле напряжения, аккуратная раскладка
              </p>
            </div>
          </div>
          <div className="absolute -left-2 -top-2 hidden h-16 w-16 border-l-2 border-t-2 border-brand lg:block" aria-hidden />
        </Reveal>
      </div>
    </section>
  );
}
