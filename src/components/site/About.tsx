import { CheckCircle2, FileText, Users, Timer } from "lucide-react";

import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const POINTS = [
  "Официальный договор на все виды работ",
  "Гарантия на выполненный электромонтаж",
  "Аттестованные электрики с допуском",
  "Фиксированная смета без доплат",
];

const FEATURES = [
  { icon: FileText, title: "Работаем по договору", text: "Прозрачные условия и смета" },
  { icon: Users, title: "Опытная бригада", text: "Штат электриков с допуском" },
  { icon: Timer, title: "Точно в срок", text: "Соблюдаем сроки по договору" },
];

export function About({ title, text }: { title: string; text: string }) {
  return (
    <section id="about" className="scroll-mt-20 border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
        <Reveal>
          <SectionHeading eyebrow="О компании" title={title} />
          <p className="mt-4 whitespace-pre-line leading-relaxed text-muted-foreground">
            {text}
          </p>
          <ul className="mt-7 grid gap-3 sm:grid-cols-2">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={120}>
          <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-card p-5 text-center">
                <span className="mx-auto grid size-12 place-items-center rounded-md border border-border text-brand">
                  <f.icon className="size-6" />
                </span>
                <h3 className="mt-3 text-sm font-extrabold">{f.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
