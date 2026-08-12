import { CheckCircle2, ArrowRight } from "lucide-react";

import workPanel from "@/assets/work-panel.jpg";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const MODULES = [
  "Автоматические выключатели",
  "УЗО и дифавтоматы",
  "Реле напряжения",
  "УЗИП",
  "Контакторы",
  "DIN-рейки и раскладка модулей",
  "Кабельные наконечники",
  "Маркировка линий",
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
            title="Профессиональная сборка электрощитов"
            subtitle="Собираем щиты для квартир, частных домов и коммерческих объектов: продуманная схема, аккуратная раскладка модулей и понятная маркировка каждой линии."
          />
          <ul className="mt-8 grid gap-2.5 sm:grid-cols-2">
            {MODULES.map((m) => (
              <li key={m} className="flex items-start gap-2.5 text-sm text-ink-muted">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand" />
                <span>{m}</span>
              </li>
            ))}
          </ul>
          <a
            href="#contacts"
            className="mt-8 inline-flex h-13 items-center justify-center gap-2 rounded-md bg-brand px-6 py-3.5 text-base font-bold text-brand-foreground transition-transform hover:scale-[1.02]"
          >
            Заказать сборку щита <ArrowRight className="size-5" />
          </a>
        </Reveal>

        <Reveal delay={120}>
          <div className="overflow-hidden rounded-lg border border-ink-border">
            <img
              src={workPanel}
              alt="Профессиональная сборка электрощита: автоматы, УЗО и маркировка линий на DIN-рейке"
              loading="lazy"
              className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
