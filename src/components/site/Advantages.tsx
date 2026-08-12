import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const ITEMS = [
  { title: "Аккуратное расключение", text: "Чистая раскладка проводников и продуманные трассы." },
  { title: "Маркировка линий", text: "Каждая линия подписана — обслуживание без догадок." },
  { title: "Понятная смета", text: "Расчёт по позициям с итоговой суммой, без скрытых доплат." },
  { title: "Реальные фотографии", text: "В разделе «Наши работы» — только наши объекты." },
  { title: "Профессиональная сборка щитов", text: "Щиты для квартир, домов и коммерческих объектов." },
  { title: "Соблюдение требований ПУЭ", text: "Работаем по действующим нормам и правилам." },
];

export function Advantages() {
  return (
    <section className="relative overflow-hidden border-y border-border bg-secondary/50 py-16 lg:py-24">
      <div className="pointer-events-none absolute inset-0 tech-grid-light opacity-70" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Почему S&M Electric"
            title="Детали, по которым видно уровень работы"
          />
        </Reveal>

        <div className="mt-10 grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((item, i) => (
            <Reveal as="article" key={item.title} delay={Math.min(i, 5) * 60}>
              <div className="group h-full bg-card p-6 transition-colors hover:bg-background sm:p-7">
                <span className="font-mono text-xs font-bold text-brand">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-base font-extrabold uppercase leading-tight tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.text}
                </p>
                <span className="mt-5 block h-px w-8 bg-brand transition-all group-hover:w-16" aria-hidden />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
