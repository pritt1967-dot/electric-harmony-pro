import { Reveal } from "./Reveal";
import { Eyebrow } from "./SectionHeading";
import type { PriceHighlight } from "@/lib/content.functions";

function money(v: number) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(v);
}

export function Prices({ items }: { items: PriceHighlight[] }) {
  if (items.length === 0) return null;

  return (
    <section
      id="prices"
      className="scroll-mt-20 border-y border-border bg-secondary/40 py-16 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <Eyebrow>Цены</Eyebrow>
          <h2 className="mt-4 max-w-3xl text-[clamp(1.9rem,4vw,3.2rem)] font-extrabold uppercase leading-[1.02] tracking-[-0.03em]">
            Стоимость работ
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Цены из действующего прайс-листа. Итоговая стоимость зависит от
            объекта и объёма работ — считаем по позициям.
          </p>
        </Reveal>

        <ul className="mt-10 border-t border-border">
          {items.map((item, i) => (
            <Reveal as="li" key={item.key} delay={Math.min(i, 6) * 40}>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 gap-y-1 border-b border-border py-5 sm:py-6">
                <h3 className="text-lg font-bold tracking-tight sm:text-xl">
                  {item.title}
                </h3>
                <p className="text-right text-lg font-extrabold tracking-tight sm:text-2xl">
                  от {money(item.price)} ₽
                  <span className="text-sm font-semibold text-muted-foreground">
                    /{item.unit}
                  </span>
                </p>
                <p className="col-span-2 max-w-2xl text-sm text-muted-foreground sm:col-span-1">
                  {item.note}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Link
            to="/prices"
            className="inline-flex h-14 items-center justify-center gap-2 rounded-sm bg-ink px-8 text-sm font-bold uppercase tracking-[0.08em] text-ink-foreground transition-colors hover:bg-ink-elevated"
          >
            Все цены и калькулятор →
          </Link>
          <a
            href="#contacts"
            className="text-sm font-semibold underline-offset-8 hover:underline"
          >
            Получить точную смету →
          </a>
        </div>

      </div>
    </section>
  );
}
