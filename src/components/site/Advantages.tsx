import workWiring from "@/assets/work-wiring.jpg";
import workPanel from "@/assets/work-panel.jpg";
import { Reveal } from "./Reveal";
import { Eyebrow } from "./SectionHeading";

export function Advantages() {
  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <Eyebrow>Почему S&amp;M Electric</Eyebrow>
          <h2 className="mt-4 max-w-3xl text-[clamp(1.9rem,4vw,3.2rem)] font-extrabold uppercase leading-[1.02] tracking-[-0.03em]">
            Три вещи, по которым видно уровень
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-8 lg:grid-cols-3 lg:gap-10">
          <Reveal as="article">
            <img
              src={workWiring}
              alt="Аккуратный монтаж электропроводки с ровной раскладкой трасс"
              loading="lazy"
              className="aspect-[4/3] w-full rounded-sm border border-border object-cover"
            />
            <h3 className="mt-5 text-lg font-bold tracking-tight">Аккуратный монтаж</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Ровные трассы, продуманная раскладка кабеля и чистая работа на
              объекте — это видно на реальных фотографиях наших работ.
            </p>
          </Reveal>

          <Reveal as="article" delay={80}>
            <div className="grid aspect-[4/3] w-full place-items-center rounded-sm border border-border bg-secondary/60 p-6">
              <div className="w-full max-w-xs space-y-2.5">
                {[
                  ["Прокладка кабеля", "от 30 ₽/м"],
                  ["Сборка щита", "от 3 000 ₽"],
                  ["Заземление", "от 1 500 ₽"],
                ].map(([a, b]) => (
                  <div
                    key={a}
                    className="flex items-baseline justify-between gap-3 border-b border-border pb-2 text-sm"
                  >
                    <span className="text-muted-foreground">{a}</span>
                    <span className="font-bold">{b}</span>
                  </div>
                ))}
                <p className="pt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Пример строк сметы
                </p>
              </div>
            </div>
            <h3 className="mt-5 text-lg font-bold tracking-tight">Понятная смета</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Расчёт формируется из действующего прайс-листа по позициям, с
              единицами измерения и итоговой суммой. Отправляем PDF.
            </p>
          </Reveal>

          <Reveal as="article" delay={160}>
            <img
              src={workPanel}
              alt="Профессиональная сборка электрощита с маркировкой линий"
              loading="lazy"
              className="aspect-[4/3] w-full rounded-sm border border-border object-cover"
            />
            <h3 className="mt-5 text-lg font-bold tracking-tight">
              Профессиональная сборка щитов
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Щиты для квартир, домов и коммерческих объектов: понятная
              структура, маркировка линий, аккуратное расключение.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
