import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { Header, MobileCtaBar } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Services } from "@/components/site/Services";
import { PanelBuild } from "@/components/site/PanelBuild";
import { Works } from "@/components/site/Works";
import { Process } from "@/components/site/Process";
import { Advantages } from "@/components/site/Advantages";
import { Prices } from "@/components/site/Prices";

import { Reviews } from "@/components/site/Reviews";
import { About } from "@/components/site/About";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { FloatingActions } from "@/components/site/FloatingActions";
import { siteDataQuery } from "@/lib/site-data";
import { canonical } from "@/lib/seo";
import { SERVICE_PAGES } from "@/lib/services-seo";

const TITLE =
  "S&M Electric — электромонтажные работы в Санкт-Петербурге и Ленинградской области";
const DESCRIPTION =
  "Электромонтажные работы в Санкт-Петербурге и Ленинградской области. Электрощиты, проводка, освещение, заземление, диагностика и другие электромонтажные работы. S&M Electric.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical("/") },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: canonical("/") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Услуги S&M Electric",
          itemListElement: SERVICE_PAGES.map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: s.nav,
            url: canonical(`/${s.slug}`),
          })),
        }),
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(siteDataQuery),
  component: Index,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-8 text-center text-muted-foreground">
      Не удалось загрузить контент. {error.message}
    </div>
  ),
});

function Index() {
  const { data } = useSuspenseQuery(siteDataQuery);
  const c = data.content;

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Header />
      <main>
        <Hero
          title={
            c.hero_title ??
            "Электромонтаж под ключ в Санкт-Петербурге и Ленинградской области"
          }
          subtitle={
            c.hero_subtitle ??
            "Проектирование, монтаж и модернизация электрики для квартир, домов и коммерческих объектов."
          }
        />
        <Services
          services={data.services}
          title={c.services_title ?? "Услуги"}
          subtitle={c.services_subtitle ?? ""}
        />
        <PanelBuild />
        <Works
          projects={data.projects}
          title={c.works_title ?? "Наши работы"}
          subtitle={c.works_subtitle ?? ""}
        />
        <Process />
        <Advantages />
        <Prices items={data.priceHighlights ?? []} />
        <Reviews reviews={data.reviews} title={c.reviews_title ?? "Отзывы"} />

        <About title={c.about_title ?? "О компании"} text={c.about_text ?? ""} />
        <Contact />
      </main>
      <Footer />
      <FloatingActions />
      <MobileCtaBar />
    </div>
  );
}
