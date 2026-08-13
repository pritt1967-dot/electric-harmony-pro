import workGrounding from "@/assets/work-grounding.jpg.asset.json";
import { Reveal } from "./Reveal";
import { Eyebrow } from "./SectionHeading";
import { CONTACTS } from "./contacts";

export function About({ title, text }: { title: string; text: string }) {
  return (
    <section id="about" className="scroll-mt-24 bg-background py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <div className="overflow-hidden rounded-3xl border border-border soft-shadow">
            <img
              src={workGrounding.url}
              alt="Электромонтажные работы S&M Electric на объекте"
              loading="lazy"
              className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
            />
          </div>
        </Reveal>
        <Reveal delay={100}>
          <Eyebrow>О компании</Eyebrow>
          <h2 className="mt-5 text-[clamp(2rem,4.2vw,3.4rem)] font-extrabold uppercase leading-[1.02] tracking-[-0.035em]">
            {title}
          </h2>
          <p className="mt-5 max-w-xl whitespace-pre-line leading-relaxed text-muted-foreground">
            {text}
          </p>
          <dl className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["География", "СПб и Ленобласть"],
              ["Специализация", "Сборка электрощитов"],
              ["Режим работы", CONTACTS.hours],
            ].map(([k, v]) => (
              <div key={k} className="card-premium p-5">
                <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  {k}
                </dt>
                <dd className="mt-2 text-sm font-bold">{v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
