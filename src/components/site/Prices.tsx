import { ArrowRight } from "lucide-react";

import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const CATEGORIES = [
  {
    n: "01",
    title: "Электромонтаж",
    items: ["Монтаж электропроводки", "Штробление и трассы", "Установка розеток и выключателей"],
  },
  {
    n: "02",
    title: "Электрощиты",
    items: ["Сборка щита", "Установка автоматов и УЗО", "Маркировка линий"],
  },
  {
    n: "03",
    title: "Заземление",
    items: ["Монтаж контура заземления", "Подключение PE", "Замеры сопротивления"],
  },
  {
    n: "04",
    title: "Освещение",
    items: ["Монтаж светильников", "Управление освещением", "Наружное освещение"],
  },
  {
    n: "05",
    title: "Диагностика",
    items: ["Поиск неисправностей", "Проверка линий", "Ревизия щита"],
  },
];

export function Prices() {
  return (
    <section
      id="prices"
      className="scroll-mt-20 border-y border-border bg-background py-16 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            eyebrow="Цены"
            title="Стоимость работ по направлениям"
            subtitle="Точная стоимость зависит от объекта и объёма работ. Мы готовим детальную смету по позициям — без скрытых доплат."
          />
        </Reveal>

        <div className="mt-10 grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c, i) => (
            <Reveal as="article" key={c.n} delay={Math.min(i, 5) * 60}>
              <div className="h-full bg-card p-6 sm:p-7">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-xs font-bold text-brand">{c.n}</span>
                  <h3 className="text-lg font-extrabold uppercase tracking-tight">
                    {c.title}
                  </h3>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {c.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 border-b border-border/70 pb-2 last:border-0">
                      <span className="mt-2 h-px w-3 shrink-0 bg-brand" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}

          <Reveal as="article" delay={360}>
            <div className="flex h-full flex-col justify-between gap-6 bg-ink p-6 text-ink-foreground sm:p-7">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-brand">
                  Смета
                </p>
                <h3 className="mt-3 text-lg font-extrabold uppercase leading-tight">
                  Нужна точная стоимость по вашему объекту?
                </h3>
                <p className="mt-2 text-sm text-ink-muted">
                  Подготовим смету по позициям с итоговой суммой и отправим PDF.
                </p>
              </div>
              <a
                href="#contacts"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-sm bg-brand px-5 text-sm font-bold uppercase tracking-[0.06em] text-brand-foreground transition-transform hover:scale-[1.02]"
              >
                Получить точную смету <ArrowRight className="size-4" />
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
