import { CheckCircle2, FileText, Users, Timer } from "lucide-react";

import { Reveal } from "./Reveal";

const POINTS = [
  "Официальный договор на все виды работ",
  "Гарантия до 5 лет на электромонтаж",
  "Аттестованные электрики с допуском",
  "Фиксированная смета без доплат",
];

const FEATURES = [
  { icon: FileText, title: "Работаем по договору", text: "Прозрачные условия и смета" },
  { icon: Users, title: "Опытная бригада", text: "Штат электриков с допуском" },
  { icon: Timer, title: "Точно в срок", text: "Соблюдаем сроки по договору" },
];

export function About() {
  return (
    <section id="about" className="scroll-mt-20 bg-secondary/50 py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
        <Reveal>
          <span className="text-sm font-semibold uppercase tracking-wide text-brand">
            О компании
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            ВольтПро — электромонтаж в Санкт-Петербурге с 2012 года
          </h2>
          <p className="mt-4 text-muted-foreground">
            Мы специализируемся на электромонтаже в СПб: монтаж электропроводки,
            сборка электрощитов, установка освещения и электрика под ключ. За
            12 лет выполнили более 3500 объектов — от квартир до коммерческих
            помещений.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={120}>
          <div className="grid gap-4 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-border bg-card p-5 text-center"
              >
                <span className="mx-auto grid size-12 place-items-center rounded-xl bg-brand-soft text-brand">
                  <f.icon className="size-6" />
                </span>
                <h3 className="mt-3 text-sm font-bold">{f.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
