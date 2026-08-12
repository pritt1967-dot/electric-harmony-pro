import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const STEPS = [
  { n: "01", title: "Заявка", text: "Принимаем обращение, уточняем задачу и объект." },
  { n: "02", title: "Выезд и осмотр", text: "Смотрим объект, замеряем и фиксируем условия монтажа." },
  { n: "03", title: "Расчёт стоимости", text: "Готовим прозрачную смету по объёму работ и материалам." },
  { n: "04", title: "Согласование", text: "Утверждаем смету, сроки и схему электроснабжения." },
  { n: "05", title: "Выполнение работ", text: "Монтаж по требованиям ПУЭ с маркировкой линий." },
  { n: "06", title: "Проверка и сдача", text: "Тестируем линии, передаём объект и документацию." },
];

export function Process() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
      <Reveal>
        <SectionHeading
          eyebrow="Как мы работаем"
          title="Процесс работы — шесть понятных этапов"
          subtitle="От первого звонка до сдачи объекта вы всегда знаете, что происходит и сколько это стоит."
        />
      </Reveal>

      <ol className="mt-10 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((s, i) => (
          <Reveal as="li" key={s.n} delay={Math.min(i, 5) * 60}>
            <div className="group h-full bg-card p-6 transition-colors hover:bg-secondary sm:p-7">
              <span className="text-3xl font-extrabold text-border transition-colors group-hover:text-brand">
                {s.n}
              </span>
              <h3 className="mt-3 text-lg font-extrabold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
