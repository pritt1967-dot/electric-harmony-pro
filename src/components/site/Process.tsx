import { Reveal } from "./Reveal";
import { Eyebrow } from "./SectionHeading";

const STEPS = [
  { n: "01", title: "Заявка", text: "Уточняем задачу, объект и сроки." },
  { n: "02", title: "Осмотр", text: "Смотрим условия монтажа и замеряем." },
  { n: "03", title: "Смета", text: "Готовим расчёт по позициям в PDF." },
  {
    n: "04",
    title: "Монтаж и сдача",
    text: "Выполняем работы, проверяем линии и передаём объект.",
  },
];

export function Process() {
  return (
    <section className="relative overflow-hidden bg-ink py-14 text-ink-foreground lg:py-20">
      <div className="pointer-events-none absolute inset-0 tech-grid opacity-40" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <Eyebrow tone="dark">Как мы работаем</Eyebrow>
          <h2 className="mt-4 max-w-3xl text-[clamp(1.9rem,4vw,3.2rem)] font-extrabold uppercase leading-[1.02] tracking-[-0.03em]">
            Четыре этапа
          </h2>
        </Reveal>

        <ol className="mt-8 grid gap-px bg-ink-border sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.n} delay={i * 60} className="bg-ink p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-ink-muted">{s.n}</span>
                <span className="h-px flex-1 bg-ink-border" aria-hidden />
              </div>
              <h3 className="mt-4 text-lg font-bold tracking-tight">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{s.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
