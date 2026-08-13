import workWiring from "@/assets/work-wiring.jpg";
import workPanel from "@/assets/work-panel.jpg";
import { Reveal } from "./Reveal";
import { Eyebrow } from "./SectionHeading";

export function Advantages() {
  return (
    <section className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <Eyebrow>Почему S&amp;M Electric</Eyebrow>
          <h2 className="mt-5 max-w-3xl text-[clamp(2rem,4.2vw,3.4rem)] font-extrabold uppercase leading-[1.02] tracking-[-0.035em]">
            Три вещи, по которым видно уровень
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-3 lg:gap-6">
          <Reveal as="article">
            <div className="card-premium h-full overflow-hidden">
              <img
                src={workWiring}
                alt="Аккуратный монтаж электропроводки с ровной раскладкой трасс"
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="p-6 sm:p-7">
                <h3 className="text-lg font-bold tracking-tight">Аккуратный монтаж</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  Ровные трассы, продуманная раскладка кабеля и чистая работа на
                  объекте — это видно на реальных фотографиях наших работ.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal as="article" delay={80}>
            <div className="card-premium h-full overflow-hidden">
              <div className="grid aspect-[4/3] w-full place-items-center bg-secondary/70 p-6">
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
              <div className="p-6 sm:p-7">
                <h3 className="text-lg font-bold tracking-tight">Понятная смета</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  Расчёт формируется из действующего прайс-листа по позициям, с
                  единицами измерения и итоговой суммой. Отправляем PDF.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal as="article" delay={160}>
            <div className="card-premium h-full overflow-hidden">
              <img
                src={workPanel}
                alt="Профессиональная сборка электрощита с маркировкой линий"
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="p-6 sm:p-7">
                <h3 className="text-lg font-bold tracking-tight">
                  Профессиональная сборка щитов
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  Щиты для квартир, домов и коммерческих объектов: понятная
                  структура, маркировка линий, аккуратное расключение.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
