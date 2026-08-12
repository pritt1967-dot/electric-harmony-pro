import workGrounding from "@/assets/work-grounding.jpg.asset.json";
import { Reveal } from "./Reveal";
import { Eyebrow } from "./SectionHeading";
import { CONTACTS } from "./contacts";

export function About({ title, text }: { title: string; text: string }) {
  return (
    <section id="about" className="scroll-mt-20 bg-background py-16 lg:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14">
        <Reveal>
          <img
            src={workGrounding.url}
            alt="Электромонтажные работы S&M Electric на объекте"
            loading="lazy"
            className="aspect-[4/3] w-full rounded-sm border border-border object-cover"
          />
        </Reveal>
        <Reveal delay={100}>
          <Eyebrow>О компании</Eyebrow>
          <h2 className="mt-4 text-[clamp(1.9rem,4vw,3.2rem)] font-extrabold uppercase leading-[1.02] tracking-[-0.03em]">
            {title}
          </h2>
          <p className="mt-4 max-w-xl whitespace-pre-line leading-relaxed text-muted-foreground">
            {text}
          </p>
          <dl className="mt-7 grid gap-px border border-border bg-border sm:grid-cols-3">
            <div className="bg-background p-4">
              <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                География
              </dt>
              <dd className="mt-1.5 text-sm font-bold">СПб и Ленобласть</dd>
            </div>
            <div className="bg-background p-4">
              <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Специализация
              </dt>
              <dd className="mt-1.5 text-sm font-bold">Сборка электрощитов</dd>
            </div>
            <div className="bg-background p-4">
              <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Режим работы
              </dt>
              <dd className="mt-1.5 text-sm font-bold">{CONTACTS.hours}</dd>
            </div>
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
