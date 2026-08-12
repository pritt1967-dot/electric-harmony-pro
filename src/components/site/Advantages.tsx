import {
  Ruler,
  BookCheck,
  Tags,
  LayoutGrid,
  FileText,
  Receipt,
  Images,
  ShieldCheck,
} from "lucide-react";

import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const ITEMS = [
  { icon: Ruler, title: "Аккуратный монтаж", text: "Ровные трассы, чистые штробы, продуманная разводка." },
  { icon: BookCheck, title: "Соблюдение ПУЭ", text: "Работаем по действующим нормам и правилам." },
  { icon: Tags, title: "Маркировка линий", text: "Каждая линия подписана — обслуживание без догадок." },
  { icon: LayoutGrid, title: "Сборка щитов", text: "Профессиональная раскладка модулей и защит." },
  { icon: FileText, title: "Документирование работ", text: "Фиксируем схемы и выполненные работы." },
  { icon: Receipt, title: "Прозрачная смета", text: "Понятный расчёт по позициям, без скрытых доплат." },
  { icon: Images, title: "Реальные фото объектов", text: "В разделе «Наши работы» — только наши объекты." },
  { icon: ShieldCheck, title: "Гарантия", text: "Даём гарантию на выполненные работы." },
];

export function Advantages() {
  return (
    <section className="border-y border-border bg-secondary/60">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-24">
        <Reveal>
          <SectionHeading
            eyebrow="Почему S&M Electric"
            title="Конкретные преимущества, а не общие слова"
          />
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((item, i) => (
            <Reveal key={item.title} delay={Math.min(i, 7) * 50}>
              <div className="h-full rounded-lg border border-border bg-background p-5 transition-colors hover:border-brand">
                <item.icon className="size-6 text-brand" />
                <h3 className="mt-4 text-base font-extrabold leading-tight">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {item.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
