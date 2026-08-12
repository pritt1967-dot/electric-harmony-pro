import workPanel from "@/assets/work-panel.jpg";
import { Reveal } from "./Reveal";
import { Eyebrow } from "./SectionHeading";

/**
 * Нейтральные подписи: не привязываем номера к конкретным аппаратам на фото,
 * а обозначаем зоны щита, которые видны на снимке.
 */
const CALLOUTS = [
  { n: "01", label: "Ввод и защита", pos: "left-[6%] top-[12%]" },
  { n: "02", label: "Аппараты на DIN-рейке", pos: "left-[6%] top-[46%]" },
  { n: "03", label: "Шины N и PE", pos: "right-[6%] top-[28%]" },
  { n: "04", label: "Маркировка линий", pos: "right-[6%] bottom-[12%]" },
];

export function PanelBuild() {
  return (
    <section className="relative overflow-hidden bg-ink py-16 text-ink-foreground lg:py-24">
      <div className="pointer-events-none absolute inset-0 tech-grid opacity-40" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <Eyebrow tone="dark">Специализация</Eyebrow>
          <h2 className="mt-4 max-w-3xl text-[clamp(1.9rem,4vw,3.2rem)] font-extrabold uppercase leading-[1.02] tracking-[-0.03em]">
            Электрощит — центр системы
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted">
            Собираем щиты с понятной структурой, маркировкой и аккуратным
            расключением.
          </p>
        </Reveal>

        <Reveal delay={100}>
          <figure className="relative mt-10 overflow-hidden rounded-sm border border-ink-border">
            <img
              src={workPanel}
              alt="Сборка электрощита: аппараты на DIN-рейке, шины N и PE, маркировка линий"
              loading="lazy"
              className="aspect-[4/3] w-full object-cover sm:aspect-[16/9]"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-ink/40"
              aria-hidden
            />
            {CALLOUTS.map((c) => (
              <span
                key={c.n}
                className={`pointer-events-none absolute hidden items-center gap-2 sm:flex ${c.pos}`}
              >
                <span className="grid size-7 place-items-center rounded-full border border-brand bg-ink/85 font-mono text-[11px] font-bold text-brand">
                  {c.n}
                </span>
                <span className="h-px w-8 bg-brand/70" aria-hidden />
                <span className="bg-ink/80 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-foreground backdrop-blur-sm">
                  {c.label}
                </span>
              </span>
            ))}
          </figure>
        </Reveal>

        <ol className="mt-6 grid gap-x-6 gap-y-3 sm:hidden">
          {CALLOUTS.map((c) => (
            <li key={c.n} className="flex items-center gap-3 text-sm">
              <span className="font-mono text-[11px] font-bold text-brand">{c.n}</span>
              <span className="text-ink-muted">{c.label}</span>
            </li>
          ))}
        </ol>

        <Reveal delay={140}>
          <a
            href="#contacts"
            className="mt-9 inline-flex h-14 items-center justify-center gap-2 rounded-sm bg-brand px-8 text-sm font-bold uppercase tracking-[0.08em] text-brand-foreground transition-transform hover:scale-[1.02]"
          >
            Собрать щит под объект →
          </a>
        </Reveal>
      </div>
    </section>
  );
}
