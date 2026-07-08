import {
  Cable,
  LayoutGrid,
  Lightbulb,
  PlugZap,
  Home,
  Wrench,
} from "lucide-react";

import { Reveal } from "./Reveal";

const SERVICES = [
  {
    icon: Cable,
    title: "Монтаж электропроводки",
    text: "Штробление, прокладка кабеля и монтаж электропроводки в квартирах, домах и офисах по СПб.",
  },
  {
    icon: LayoutGrid,
    title: "Сборка электрощитов",
    text: "Проектирование, сборка и подключение электрощитов любой сложности с УЗО и автоматами.",
  },
  {
    icon: Lightbulb,
    title: "Монтаж освещения",
    text: "Установка люстр, светильников, LED-подсветки и систем управления освещением.",
  },
  {
    icon: PlugZap,
    title: "Розетки и выключатели",
    text: "Установка и перенос розеток, выключателей, подключение бытовой техники.",
  },
  {
    icon: Home,
    title: "Электрика под ключ",
    text: "Полный электромонтаж новых объектов: от проекта до сдачи и подключения.",
  },
  {
    icon: Wrench,
    title: "Аварийный вызов электрика",
    text: "Срочный выезд электрика в Санкт-Петербурге, поиск и устранение неисправностей.",
  },
];

export function Services() {
  return (
    <section id="services" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 lg:py-24">
      <Reveal className="max-w-2xl">
        <span className="text-sm font-semibold uppercase tracking-wide text-brand">
          Услуги
        </span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Электромонтажные работы в СПб
        </h2>
        <p className="mt-3 text-muted-foreground">
          Выполняем весь спектр работ по электрике — от замены розетки до
          комплексного монтажа электропроводки и сборки электрощитов.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service, i) => (
          <Reveal as="article" key={service.title} delay={i * 70}>
            <div className="group h-full rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-brand">
              <span className="grid size-12 place-items-center rounded-xl bg-brand-soft text-brand transition-colors group-hover:gradient-brand group-hover:text-brand-foreground">
                <service.icon className="size-6" />
              </span>
              <h3 className="mt-5 text-lg font-bold">{service.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{service.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
