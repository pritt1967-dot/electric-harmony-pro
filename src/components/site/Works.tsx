import workWiring from "@/assets/work-wiring.jpg";
import workPanel from "@/assets/work-panel.jpg";
import workLighting from "@/assets/work-lighting.jpg";
import workEvCharger from "@/assets/work-ev-charger.jpg";
import workEvRealAsset from "@/assets/work-ev-real.jpg.asset.json";
import workEvTesla from "@/assets/work-ev-tesla.jpg";
import { Reveal } from "./Reveal";
import type { WorkRow } from "@/lib/content.functions";

export const WORK_IMAGES: { key: string; label: string; src: string }[] = [
  { key: "panel", label: "Электрощит", src: workPanel },
  { key: "wiring", label: "Проводка", src: workWiring },
  { key: "lighting", label: "Освещение", src: workLighting },
  { key: "ev_charger", label: "Зарядные станции", src: workEvCharger },
  { key: "ev_real", label: "Зарядная станция (фото)", src: workEvRealAsset.url },
  { key: "ev_tesla", label: "Зарядка Tesla (фото)", src: workEvTesla },
];

const IMAGE_MAP = new Map(WORK_IMAGES.map((w) => [w.key, w.src]));

export function imageFor(key: string): string {
  return IMAGE_MAP.get(key) ?? workPanel;
}

export function Works({
  works,
  title,
  subtitle,
}: {
  works: WorkRow[];
  title: string;
  subtitle: string;
}) {
  return (
    <section id="works" className="scroll-mt-20 bg-secondary/50 py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="max-w-2xl">
          <span className="text-sm font-semibold uppercase tracking-wide text-brand">
            Наши работы
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {title}
          </h2>
          <p className="mt-3 text-muted-foreground">{subtitle}</p>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {works.map((work, i) => (
            <Reveal as="article" key={work.id} delay={i * 90}>
              <div className="group overflow-hidden rounded-2xl border border-border bg-card">
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={imageFor(work.image_key)}
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
