import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, MapPin } from "lucide-react";

import { Header, MobileCtaBar } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { FloatingActions } from "@/components/site/FloatingActions";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { canonical, breadcrumbSchema } from "@/lib/seo";
import { worksQuery } from "@/lib/public-queries";

const TITLE = "Наши работы — примеры электромонтажа в СПб и Ленобласти | S&M Electric";
const DESCRIPTION =
  "Выполненные объекты S&M Electric: сборка и монтаж электрощитов, электрика в квартирах и частных домах, заземление, освещение. Фотоотчёты по объектам в СПб и Ленобласти.";

export const Route = createFileRoute("/raboty/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(worksQuery),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical("/raboty") },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: canonical("/raboty") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(
          breadcrumbSchema([
            { label: "Главная", href: "/" },
            { label: "Наши работы", href: "/raboty" },
          ]),
        ),
      },
    ],
  }),
  component: WorksIndex,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-8 text-center text-muted-foreground">
      Не удалось загрузить объекты. {error.message}
    </div>
  ),
});


function WorksIndex() {
  const { data: works } = useSuspenseQuery(worksQuery);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Header />
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Наши работы", href: "/raboty" },
        ]}
      />
      <main>
        <section className="border-b border-border bg-secondary/40 py-10 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h1 className="max-w-4xl text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Наши работы — электромонтаж в Санкт-Петербурге и Ленинградской области
            </h1>
            <p className="mt-4 max-w-3xl text-base text-muted-foreground sm:text-lg">
              Реальные объекты: квартиры, частные дома и коммерческие помещения. По каждому
              объекту — задача заказчика, перечень работ и фотографии.
            </p>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            {works.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
                Объекты скоро появятся — сейчас мы готовим фотоотчёты.
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {works.map((w) => (
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
                        className="h-52 w-full object-cover transition-transform group-hover:scale-[1.03]"
                      />
                    )}
                    <div className="p-5">
                      <p className="font-bold text-foreground">{w.title}</p>
                      {(w.city || w.location) && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="size-3.5 text-brand" />
                          {w.city || w.location}
                        </p>
                      )}
                      <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-brand">
                        Подробнее <ArrowRight className="size-4" />
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <FloatingActions />
      <MobileCtaBar />
    </div>
  );
}
