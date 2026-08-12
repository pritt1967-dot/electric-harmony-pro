import { ArrowRight } from "lucide-react";

import heroPanel from "@/assets/hero-panel.jpg";
import { Reveal } from "./Reveal";

export function Hero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <>
      <section
        id="top"
        className="relative overflow-hidden bg-ink text-ink-foreground"
      >
        {/* Full-bleed фото щита: на десктопе занимает правые ~62% и уходит под текст */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[62%] lg:block">
          <img
            src={heroPanel}
            alt="Собранный электрощит с автоматами и УЗО на DIN-рейке — электромонтаж в Санкт-Петербурге"
            width={1600}
            height={1200}
            fetchPriority="high"
            className="h-full w-full object-cover"
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(90deg,var(--ink)_0%,color-mix(in_oklab,var(--ink)_85%,transparent)_28%,transparent_70%)]"
            aria-hidden
          />
          <div
            className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent"
            aria-hidden
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 lg:min-h-[calc(100svh-5rem)] lg:pb-24 lg:pt-28">
          <div className="max-w-2xl lg:max-w-[46%]">
            <Reveal>
              <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.28em] text-ink-muted">
                <span className="h-px w-8 bg-brand" aria-hidden />
                S&amp;M Electric / Electrical Engineering
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-6 text-[clamp(2.6rem,9vw,6rem)] font-extrabold uppercase leading-[0.92] tracking-[-0.04em]">
                Электромонтаж
                <span className="block text-brand">без компромиссов</span>
              </h1>
            </Reveal>
            <Reveal delay={150}>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
                {subtitle}
              </p>
            </Reveal>
            <Reveal delay={220}>
              <div className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8">
                <a
                  href="#contacts"
                  className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-sm bg-brand px-8 text-sm font-bold uppercase tracking-[0.08em] text-brand-foreground transition-transform hover:scale-[1.02] sm:w-auto"
                >
                  Рассчитать стоимость <ArrowRight className="size-5" />
                </a>
                <a
                  href="#works"
                  className="group inline-flex items-center gap-2 text-sm font-semibold text-ink-foreground underline-offset-8 transition-colors hover:text-brand hover:underline"
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

          {/* Мобильное фото — под текстом и CTA */}
          <Reveal delay={120} className="mt-10 block lg:hidden">
            <div className="relative overflow-hidden rounded-sm border border-ink-border">
              <img
                src={heroPanel}
                alt="Собранный электрощит с автоматами и УЗО — сборка электрощитов в СПб"
                width={1600}
                height={1200}
                fetchPriority="high"
                className="aspect-[4/3] w-full object-cover"
              />
              <span className="absolute left-3 top-3 border border-brand/40 bg-ink/75 px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-brand backdrop-blur-sm">
                Pro panel
              </span>
            </div>
          </Reveal>
        </div>

        {/* Максимум 2 технические метки, привязанные к фото (desktop) */}
        <span className="absolute right-[8%] top-[22%] hidden border border-brand/40 bg-ink/70 px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-brand backdrop-blur-sm lg:inline-block">
          S&amp;M / 01
        </span>
        <span className="absolute bottom-[16%] right-[24%] hidden border border-brand/40 bg-ink/70 px-2 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-brand backdrop-blur-sm lg:inline-block">
          Pro panel
        </span>
      </section>

      {/* Блок доверия — 2 сильных факта */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto grid max-w-7xl gap-px bg-border sm:grid-cols-2">
          <div className="bg-background px-4 py-8 sm:px-8">
            <p className="text-[clamp(2rem,6vw,3rem)] font-extrabold leading-none tracking-[-0.04em]">
              СПб&nbsp;+&nbsp;ЛО
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Работаем по Санкт-Петербургу и Ленинградской области: квартиры,
              частные дома и коммерческие объекты.
            </p>
          </div>
          <div className="bg-background px-4 py-8 sm:px-8">
            <p className="text-[clamp(2rem,6vw,3rem)] font-extrabold leading-none tracking-[-0.04em]">
              Смета по позициям
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Расчёт формируется из действующего прайс-листа и отправляется
              отдельным PDF-документом.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
