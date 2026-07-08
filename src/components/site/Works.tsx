import workWiring from "@/assets/work-wiring.jpg";
import workPanel from "@/assets/work-panel.jpg";
import workLighting from "@/assets/work-lighting.jpg";
import { Reveal } from "./Reveal";

const WORKS = [
  {
    img: workPanel,
    title: "Сборка электрощита",
    text: "Квартира 3-комнатная, ЖК «Приморский», СПб",
  },
  {
    img: workWiring,
    title: "Монтаж электропроводки",
    text: "Полная замена проводки, Петроградский район",
  },
  {
    img: workLighting,
    title: "Монтаж освещения",
    text: "Гостиная с LED-подсветкой и умным светом",
  },
];

export function Works() {
  return (
    <section id="works" className="scroll-mt-20 bg-secondary/50 py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="max-w-2xl">
          <span className="text-sm font-semibold uppercase tracking-wide text-brand">
            Наши работы
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Реализованные объекты в Санкт-Петербурге
          </h2>
          <p className="mt-3 text-muted-foreground">
            Каждый проект — аккуратный монтаж, подписанный акт и гарантия на
            выполненные работы.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {WORKS.map((work, i) => (
            <Reveal as="article" key={work.title} delay={i * 90}>
              <div className="group overflow-hidden rounded-2xl border border-border bg-card">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={work.img}
                    alt={work.title + " — пример работ электрика в СПб"}
                    loading="lazy"
                    width={1200}
                    height={900}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold">{work.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{work.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
