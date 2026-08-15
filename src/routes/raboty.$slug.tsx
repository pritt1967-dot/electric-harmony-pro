import { useState } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarDays, MapPin, Phone } from "lucide-react";

import { Header, MobileCtaBar } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { FloatingActions } from "@/components/site/FloatingActions";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CONTACTS } from "@/components/site/contacts";
import { canonical, breadcrumbSchema } from "@/lib/seo";
import { worksQuery } from "@/lib/public-queries";
import { getServicePage } from "@/lib/services-seo";
import type { WorkProject } from "@/lib/works.functions";

export const Route = createFileRoute("/raboty/$slug")({
  loader: async ({ params, context }) => {
    const works = await context.queryClient.ensureQueryData(worksQuery);
    const project = works.find((w) => w.slug === params.slug);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ params, loaderData }) => {
    const p = loaderData?.project as WorkProject | undefined;
    if (!p) {
      return {
        meta: [
          { title: "Объект не найден | S&M Electric" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const url = canonical(`/raboty/${params.slug}`);
    const title = p.seo_title || `${p.title} | S&M Electric`;
    const description =
      p.seo_description ||
      (p.description || p.task || "Выполненный объект S&M Electric в Санкт-Петербурге и Ленинградской области.").slice(
        0,
        300,
      );
    const image = p.cover_image?.startsWith("http") ? p.cover_image : undefined;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        ...(image
          ? [
              { property: "og:image", content: image },
              { name: "twitter:image", content: image },
            ]
          : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(
            breadcrumbSchema([
              { label: "Главная", href: "/" },
              { label: "Наши работы", href: "/raboty" },
              { label: p.title, href: `/raboty/${params.slug}` },
            ]),
          ),
        },
      ],
    };
  },
  component: WorkPage,
});

function lines(value: string) {
  return value
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function WorkPage() {
  const { project } = Route.useLoaderData();
  const { data: works } = useSuspenseQuery(worksQuery);
  const service = project.service_slug ? getServicePage(project.service_slug) : undefined;
  const others = works.filter((w) => w.slug !== project.slug).slice(0, 3);
  const place = project.city || project.location;
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Header />
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Наши работы", href: "/raboty" },
          { label: project.title, href: `/raboty/${project.slug}` },
        ]}
      />

      <main>
        <section className="border-b border-border bg-secondary/40 py-10 lg:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h1 className="max-w-4xl text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {project.title}
            </h1>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {place && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4 text-brand" /> {place}
                </span>
              )}
              {project.work_date && (
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="size-4 text-brand" />
                  {new Date(project.work_date).toLocaleDateString("ru-RU", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              )}
              {project.category && <span>{project.category}</span>}
            </div>
            {project.description && (
              <p className="mt-5 max-w-3xl text-base text-muted-foreground">
                {project.description}
              </p>
            )}
          </div>
        </section>

        <section className="py-10 lg:py-14">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2">
            {project.task && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-bold text-foreground">Задача заказчика</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {project.task}
                </p>
              </div>
            )}
            {project.works_done && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-bold text-foreground">Что было сделано</h2>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {lines(project.works_done).map((l) => (
                    <li key={l} className="flex gap-2">
                      <span className="text-brand">—</span>
                      <span>{l}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {project.equipment && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-bold text-foreground">Установленное оборудование</h2>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {lines(project.equipment).map((l) => (
                    <li key={l} className="flex gap-2">
                      <span className="text-brand">—</span>
                      <span>{l}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {project.result_text && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-bold text-foreground">Результат</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {project.result_text}
                </p>
              </div>
            )}
            {project.cost_text && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-bold text-foreground">Стоимость работ</h2>
                <p className="mt-3 text-sm text-muted-foreground">{project.cost_text}</p>
              </div>
            )}
          </div>
        </section>

        {project.images.length > 0 && (
          <section className="border-y border-border bg-secondary/40 py-10 lg:py-14">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <h2 className="text-2xl font-extrabold text-foreground">Фотографии объекта</h2>
              <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {project.images.map((img, i) => {
                  const ba = detectBeforeAfter(img.caption, img.alt);
                  return (
                  <figure key={img.id} className="overflow-hidden rounded-xl border border-border bg-background">
                    <button
                      type="button"
                      onClick={() => setLightbox(i)}
                      className="relative block w-full cursor-zoom-in"
                      aria-label="Открыть фото в увеличенном размере"
                    >
                      <img
                        src={img.image_url}
                        alt={
                          img.alt ||
                          img.caption ||
                          `${project.title} — фото выполненных работ${place ? `, ${place}` : ""}`
                        }
                        loading="lazy"
                        className="h-56 w-full object-cover transition-transform hover:scale-[1.03]"
                      />
                      {ba && (
                        <span
                          className={`absolute left-3 top-3 rounded-sm px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${
                            ba === "before"
                              ? "bg-foreground/85 text-background"
                              : "bg-brand text-brand-foreground"
                          }`}
                        >
                          {beforeAfterLabel(ba)}
                        </span>
                      )}
                    </button>
                    {img.caption && (
                      <figcaption className="p-3 text-sm text-muted-foreground">
                        {img.caption}
                      </figcaption>
                    )}
                  </figure>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        <Dialog open={lightbox !== null} onOpenChange={(o) => !o && setLightbox(null)}>
          <DialogContent className="max-w-[95vw] border-border bg-background p-2 sm:max-w-4xl">
            {lightbox !== null && project.images[lightbox] && (
              <figure>
                <img
                  src={project.images[lightbox].image_url}
                  alt={project.images[lightbox].alt || project.images[lightbox].caption || project.title}
                  className="max-h-[80vh] w-full rounded-lg object-contain"
                />
                {project.images[lightbox].caption && (
                  <figcaption className="p-3 text-center text-sm text-muted-foreground">
                    {project.images[lightbox].caption}
                  </figcaption>
                )}
              </figure>
            )}
          </DialogContent>
        </Dialog>


        <section className="py-10 lg:py-14">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 sm:px-6">
            <a
              href="/#contacts"
              className="inline-flex items-center gap-2 rounded-sm bg-brand px-6 py-3.5 text-sm font-bold uppercase tracking-[0.06em] text-brand-foreground"
            >
              Заказать аналогичную работу <ArrowRight className="size-4" />
            </a>
            <a
              href={CONTACTS.phoneHref}
              className="inline-flex items-center gap-2 rounded-sm border border-border px-6 py-3.5 text-sm font-bold text-foreground"
            >
              <Phone className="size-4 text-brand" /> {CONTACTS.phoneDisplay}
            </a>
            {service && (
              <a
                href={`/${service.slug}`}
                className="inline-flex items-center gap-2 rounded-sm border border-border px-6 py-3.5 text-sm font-bold text-foreground"
              >
                Услуга: {service.nav}
              </a>
            )}
          </div>
        </section>

        {others.length > 0 && (
          <section className="border-t border-border py-10 lg:py-14">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <h2 className="text-2xl font-extrabold text-foreground">Другие объекты</h2>
              <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {others.map((w) => (
                  <a
                    key={w.id}
                    href={`/raboty/${w.slug}`}
                    className="group overflow-hidden rounded-xl border border-border bg-card"
                  >
                    {w.cover_image && (
                      <img
                        src={w.cover_image}
                        alt={`${w.title} — фото объекта, ${w.city || w.location || "Санкт-Петербург"}`}
                        loading="lazy"
                        className="h-48 w-full object-cover transition-transform group-hover:scale-[1.03]"
                      />
                    )}
                    <div className="p-5">
                      <p className="font-bold text-foreground">{w.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{w.city || w.location}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
      <FloatingActions />
      <MobileCtaBar />
    </div>
  );
}
