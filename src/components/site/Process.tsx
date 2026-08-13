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
    <section className="relative overflow-hidden bg-ink py-20 text-ink-foreground lg:py-28">
      <div className="pointer-events-none absolute inset-0 tech-grid opacity-30" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <Eyebrow tone="dark">Как мы работаем</Eyebrow>
          <h2 className="mt-5 max-w-3xl text-[clamp(2rem,4.2vw,3.4rem)] font-extrabold uppercase leading-[1.02] tracking-[-0.035em]">
            Четыре этапа
          </h2>
        </Reveal>

        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.n} delay={i * 70}>
              <div className="card-ink group h-full p-6 sm:p-7">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-full border border-brand/40 font-mono text-sm font-bold text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                    {s.n}
                  </span>
                  <span className="h-px flex-1 bg-ink-border" aria-hidden />
                </div>
                <h3 className="mt-6 text-lg font-bold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
