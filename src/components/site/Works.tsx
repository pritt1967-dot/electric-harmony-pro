import { useState } from "react";
import workWiring from "@/assets/work-wiring.jpg";
import workPanel from "@/assets/work-panel.jpg";
import workLighting from "@/assets/work-lighting.jpg";
import workEvCharger from "@/assets/work-ev-charger.jpg";
import workEvRealAsset from "@/assets/work-ev-real.jpg.asset.json";
import workEvTesla from "@/assets/work-ev-tesla.jpg";
import workGroundingAsset from "@/assets/work-grounding.jpg.asset.json";
import workGroundingTestAsset from "@/assets/work-grounding-test.jpg.asset.json";
import workGroundingFlukeAsset from "@/assets/work-grounding-fluke.jpg.asset.json";
import workGroundingRodAsset from "@/assets/work-grounding-rod.jpg.asset.json";
import workGroundingPasteAsset from "@/assets/work-grounding-paste.jpg.asset.json";
import { Reveal } from "./Reveal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { WorkRow } from "@/lib/content.functions";

export const WORK_IMAGES: { key: string; label: string; src: string }[] = [
  { key: "panel", label: "Электрощит", src: workPanel },
  { key: "wiring", label: "Проводка", src: workWiring },
  { key: "lighting", label: "Освещение", src: workLighting },
  { key: "ev_charger", label: "Зарядные станции", src: workEvCharger },
  { key: "ev_real", label: "Зарядная станция (фото)", src: workEvRealAsset.url },
  { key: "ev_tesla", label: "Зарядка Tesla (фото)", src: workEvTesla },
  { key: "grounding", label: "Заземление (фото)", src: workGroundingAsset.url },
  { key: "grounding_test", label: "Замер заземления (фото)", src: workGroundingTestAsset.url },
  { key: "grounding_fluke", label: "Замер Fluke (фото)", src: workGroundingFlukeAsset.url },
  { key: "grounding_rod", label: "Штырь заземления (фото)", src: workGroundingRodAsset.url },
  { key: "grounding_paste", label: "Паста для заземления (фото)", src: workGroundingPasteAsset.url },
];

const IMAGE_MAP = new Map(WORK_IMAGES.map((w) => [w.key, w.src]));

export function imageFor(key: string): string {
  return IMAGE_MAP.get(key) ?? workPanel;
}

// Дополнительные фото для галереи по ключу основного изображения работы
const GALLERY_MAP: Record<string, string[]> = {
  ev_real: ["ev_real", "ev_tesla", "ev_charger"],
  ev_tesla: ["ev_tesla", "ev_real"],
  grounding: ["grounding", "grounding_rod", "grounding_paste", "grounding_fluke", "grounding_test"],
  grounding_rod: ["grounding_rod", "grounding_paste"],
  grounding_paste: ["grounding_paste", "grounding_rod"],
  grounding_fluke: ["grounding_fluke", "grounding_test"],
};

function galleryFor(key: string): string[] {
  return GALLERY_MAP[key] ?? [key];
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
  const [selected, setSelected] = useState<WorkRow | null>(null);
  const [expanded, setExpanded] = useState(false);

  const preview = expanded ? works : works.slice(0, 3);
  const gallery = selected ? galleryFor(selected.image_key) : [];

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
          {preview.map((work, i) => (
            <Reveal as="article" key={work.id} delay={i * 90}>
              <button
                type="button"
                onClick={() => setSelected(work)}
                className="group block w-full overflow-hidden rounded-2xl border border-border bg-card text-left transition-shadow hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                aria-label={`Открыть подробности: ${work.title}`}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={imageFor(work.image_key)}
                    alt={work.title + " — пример работ электрика в СПб"}
                    loading="lazy"
                    width={1200}
                    height={900}
                    className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                      work.image_key === "grounding" ? "object-top" : ""
                    }`}
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold">{work.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{work.text}</p>
                  <span className="mt-3 inline-block text-sm font-semibold text-brand">
                    Смотреть фото →
                  </span>
                </div>
              </button>
            </Reveal>
          ))}
        </div>

        {works.length > 3 && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="rounded-full border border-brand/30 bg-background px-6 py-2 text-sm font-semibold text-brand transition hover:bg-brand hover:text-brand-foreground"
              aria-expanded={expanded}
            >
              {expanded ? "Свернуть список" : `Показать все работы (${works.length})`}
            </button>
          </div>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selected.title}</DialogTitle>
                <DialogDescription className="text-base text-muted-foreground">
                  {selected.text}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {gallery.map((key, idx) => (
                  <div key={key + idx} className="overflow-hidden rounded-xl border border-border">
                    <img
                      src={imageFor(key)}
                      alt={`${selected.title} — фото ${idx + 1}`}
                      loading="lazy"
                      className={`h-full w-full object-cover ${key === "grounding" ? "object-top" : ""}`}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
