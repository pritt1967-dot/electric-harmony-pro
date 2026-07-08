import { ShieldCheck, Clock, BadgeCheck, ArrowRight } from "lucide-react";

import heroPanel from "@/assets/hero-panel.jpg";
import { Reveal } from "./Reveal";

const STATS = [
  { value: "12+", label: "лет опыта" },
  { value: "3500+", label: "объектов в СПб" },
  { value: "5 лет", label: "гарантии" },
];

export function Hero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section id="top" className="relative overflow-hidden gradient-hero">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-24">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-soft px-3 py-1 text-xs font-semibold text-brand">
              <BadgeCheck className="size-4" /> Электромонтаж в Санкт-Петербурге
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              {title}
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              {subtitle}
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#contacts"
                className="inline-flex items-center justify-center gap-2 rounded-full gradient-brand px-6 py-3.5 text-base font-semibold text-brand-foreground shadow-brand transition-transform hover:scale-[1.03]"
              >
                Получить расчёт <ArrowRight className="size-5" />
              </a>
              <a
                href="#works"
                className="inline-flex items-center justify-center rounded-full border border-border bg-background px-6 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-accent"
              >
                Наши работы
              </a>
            </div>
          </Reveal>
          <Reveal delay={320}>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4">
              {STATS.map((s) => (
                <div key={s.label}>
                  <dt className="text-2xl font-extrabold text-brand sm:text-3xl">
                    {s.value}
                  </dt>
                  <dd className="text-xs text-muted-foreground sm:text-sm">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal delay={160} className="relative">
          <div className="relative overflow-hidden rounded-3xl border border-border/70 shadow-brand">
            <img
              src={heroPanel}
              alt="Собранный электрощит с автоматами — электромонтаж в СПб"
              width={1600}
              height={1200}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-4 left-4 flex flex-wrap gap-2 sm:left-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background/95 px-3 py-2 text-xs font-semibold shadow-sm backdrop-blur">
              <ShieldCheck className="size-4 text-brand" /> Договор и гарантия
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background/95 px-3 py-2 text-xs font-semibold shadow-sm backdrop-blur">
              <Clock className="size-4 text-brand" /> Выезд в день заявки
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
