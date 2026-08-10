import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, CalendarDays, X } from "lucide-react";

import { Reveal } from "./Reveal";
import type { ProjectRow } from "@/lib/content.functions";

function formatWorkDate(value: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
}

type Lightbox = { project: ProjectRow; index: number };

export function Works({
  projects,
  title,
  subtitle,
}: {
  projects: ProjectRow[];
  title: string;
  subtitle: string;
}) {
  const [visible, setVisible] = useState(3);
  const [box, setBox] = useState<Lightbox | null>(null);

  const shown = projects.slice(0, visible);

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

        <div className="mt-10 space-y-10 lg:space-y-14">
          {shown.map((project, i) => (
            <ProjectBlock
              key={project.id}
              project={project}
              index={i}
              onOpen={(index) => setBox({ project, index })}
            />
          ))}
          {projects.length === 0 && (
            <p className="rounded-2xl border border-dashed border-border bg-background p-10 text-center text-muted-foreground">
              Объекты скоро появятся — сейчас мы готовим фотоотчёты.
            </p>
          )}
        </div>

        {visible < projects.length && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => setVisible((v) => v + 3)}
              className="rounded-full border border-brand/30 bg-background px-6 py-3 text-sm font-semibold text-brand transition hover:bg-brand hover:text-brand-foreground"
            >
              Показать ещё объекты ({projects.length - visible})
            </button>
          </div>
        )}
      </div>

      {box && (
        <Lightbox
          project={box.project}
          index={box.index}
          onIndex={(index) => setBox({ project: box.project, index })}
          onClose={() => setBox(null)}
        />
      )}
    </section>
  );
}

function ProjectBlock({
  project,
  index,
  onOpen,
}: {
  project: ProjectRow;
  index: number;
  onOpen: (index: number) => void;
}) {
  const images = project.images;
  const coverIdx = Math.max(
    images.findIndex((im) => im.image_url === project.cover_image),
    0,
  );
  const cover = images[coverIdx];
  const rest = images.filter((_, i) => i !== coverIdx);
  const date = formatWorkDate(project.work_date);

  return (
    <Reveal as="article" delay={index * 60}>
      <div className="overflow-hidden rounded-3xl border border-border bg-card">
        {cover && (
          <button
            type="button"
            onClick={() => onOpen(coverIdx)}
            className="group block w-full overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            aria-label={`Открыть фото: ${project.title}`}
          >
            <img
              src={cover.image_url}
              alt={`${project.title} — электромонтажные работы`}
              loading={index === 0 ? "eager" : "lazy"}
              className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] sm:aspect-[16/9]"
            />
          </button>
        )}

        <div className="p-5 sm:p-7">
          <h3 className="text-xl font-extrabold tracking-tight sm:text-2xl">
            {project.title}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {project.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4 shrink-0 text-brand" />
                {project.location}
              </span>
            )}
            {date && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4 shrink-0 text-brand" />
                {date}
              </span>
            )}
          </div>
          {project.description && (
            <p className="mt-3 max-w-3xl text-muted-foreground">{project.description}</p>
          )}

          {rest.length > 0 && (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {rest.map((img) => {
                const realIndex = images.findIndex((x) => x.id === img.id);
                return (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => onOpen(realIndex)}
                    className="group overflow-hidden rounded-xl border border-border focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    aria-label={`Открыть фото ${realIndex + 1} объекта ${project.title}`}
                  >
                    <img
                      src={img.image_url}
                      alt={img.caption || `${project.title} — фото ${realIndex + 1}`}
                      loading="lazy"
                      className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Reveal>
  );
}

function Lightbox({
  project,
  index,
  onIndex,
  onClose,
}: {
  project: ProjectRow;
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const images = project.images;
  const total = images.length;
  const touchX = useRef<number | null>(null);

  const go = useCallback(
    (delta: number) => onIndex((index + delta + total) % total),
    [index, total, onIndex],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [go, onClose]);

  const current = images[index];
  if (!current) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Галерея: ${project.title}`}
      className="fixed inset-0 z-50 flex flex-col bg-foreground/95 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex items-start justify-between gap-3 p-4 text-background">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{project.title}</p>
          <p className="text-xs opacity-70">
            Фото {index + 1} из {total}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть галерею"
          className="grid size-11 shrink-0 place-items-center rounded-full bg-background/15 transition hover:bg-background/25"
        >
          <X className="size-6" />
        </button>
      </div>

      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden px-2 pb-4"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => {
          touchX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          const start = touchX.current;
          const end = e.changedTouches[0]?.clientX ?? null;
          if (start !== null && end !== null && Math.abs(end - start) > 50) {
            go(end < start ? 1 : -1);
          }
          touchX.current = null;
        }}
      >
        <img
          src={current.image_url}
          alt={current.caption || `${project.title} — фото ${index + 1}`}
          className="max-h-full max-w-full select-none object-contain"
        />

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Предыдущее фото"
              className="absolute left-2 grid size-12 place-items-center rounded-full bg-background/20 text-background transition hover:bg-background/35"
            >
              <ChevronLeft className="size-7" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Следующее фото"
              className="absolute right-2 grid size-12 place-items-center rounded-full bg-background/20 text-background transition hover:bg-background/35"
            >
              <ChevronRight className="size-7" />
            </button>
          </>
        )}
      </div>

      {total > 1 && (
        <div
          className="flex gap-2 overflow-x-auto px-4 pb-5 scrollbar-hide"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => onIndex(i)}
              aria-label={`Перейти к фото ${i + 1}`}
              className={`size-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === index ? "border-brand" : "border-transparent opacity-60"
              }`}
            >
              <img
                src={img.image_url}
                alt=""
                loading="lazy"
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
