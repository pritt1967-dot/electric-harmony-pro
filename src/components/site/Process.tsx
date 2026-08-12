import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const STEPS = [
  { n: "01", title: "Заявка", text: "Принимаем обращение, уточняем задачу и объект." },
  { n: "02", title: "Выезд", text: "Приезжаем на объект в согласованное время." },
  { n: "03", title: "Осмотр", text: "Смотрим условия монтажа, замеряем, фиксируем детали." },
  { n: "04", title: "Смета", text: "Готовим прозрачный расчёт по позициям и материалам." },
  { n: "05", title: "Монтаж", text: "Выполняем работы по требованиям ПУЭ с маркировкой линий." },
  { n: "06", title: "Проверка", text: "Тестируем линии и защиты, устраняем замечания." },
  { n: "07", title: "Сдача объекта", text: "Передаём объект, схемы и документацию по работам." },
];

export function Process() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
      <Reveal>
        <SectionHeading
          eyebrow="Как мы работаем"
          title="Процесс работы — семь этапов"
          subtitle="От первого звонка до сдачи объекта вы всегда знаете, что происходит и сколько это стоит."
        />
      </Reveal>

      <ol className="relative mt-10 max-w-3xl border-l border-border pl-6 sm:pl-10">
        {STEPS.map((s, i) => (
          <Reveal as="li" key={s.n} delay={Math.min(i, 6) * 50} className="relative pb-8 last:pb-0">
            <span
              className="absolute -left-[calc(1.5rem+1px)] top-1.5 grid size-3 place-items-center rounded-full border-2 border-brand bg-background sm:-left-[calc(2.5rem+1px)]"
              aria-hidden
            />
            <div className="group flex flex-col gap-1 border-b border-border/70 pb-6 transition-colors last:border-0 sm:flex-row sm:items-baseline sm:gap-6">
              <span className="font-mono text-xs font-bold text-brand">{s.n}</span>
              <div className="min-w-0">
                <h3 className="text-lg font-extrabold uppercase tracking-tight">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
