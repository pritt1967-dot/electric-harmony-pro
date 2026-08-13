import { Link } from "@tanstack/react-router";

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
      className="scroll-mt-24 border-y border-border bg-secondary/40 py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <Eyebrow>Цены</Eyebrow>
          <h2 className="mt-5 max-w-3xl text-[clamp(2rem,4.2vw,3.4rem)] font-extrabold uppercase leading-[1.02] tracking-[-0.035em]">
            Стоимость работ
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Цены из действующего прайс-листа. Итоговая стоимость зависит от
            объекта и объёма работ — считаем по позициям.
          </p>
        </Reveal>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {items.map((item, i) => (
            <Reveal as="li" key={item.key} delay={Math.min(i, 8) * 50}>
              <div className="card-premium flex h-full flex-col p-6 sm:p-7">
                <h3 className="text-lg font-bold tracking-tight">{item.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {item.note}
                </p>
                <p className="mt-6 flex items-baseline gap-1.5 border-t border-border pt-4 text-2xl font-extrabold tracking-tight">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    от
                  </span>
                  {money(item.price)} ₽
                  <span className="text-sm font-semibold text-muted-foreground">
                    /{item.unit}
                  </span>
                </p>
              </div>
            </Reveal>
          ))}
        </ul>

        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Link
            to="/prices"
            className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-ink px-8 text-sm font-bold uppercase tracking-[0.08em] text-ink-foreground transition-all hover:bg-ink-elevated hover:shadow-lg"
          >
            Все цены и калькулятор →
          </Link>
          <a
            href="#contacts"
            className="brand-underline text-sm font-semibold"
          >
            Получить точную смету →
          </a>
        </div>

      </div>
    </section>
  );
}
