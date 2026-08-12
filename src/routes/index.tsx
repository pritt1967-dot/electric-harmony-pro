import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { Header, MobileCtaBar } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Services } from "@/components/site/Services";
import { PanelBuild } from "@/components/site/PanelBuild";
import { Works } from "@/components/site/Works";
import { Process } from "@/components/site/Process";
import { Advantages } from "@/components/site/Advantages";
import { Reviews } from "@/components/site/Reviews";
import { About } from "@/components/site/About";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { FloatingActions } from "@/components/site/FloatingActions";
import { siteDataQuery } from "@/lib/site-data";

const TITLE =
  "Электромонтаж под ключ в СПб и Ленобласти | S&M Electric";
const DESCRIPTION =
  "S&M Electric — электромонтаж в Санкт-Петербурге и Ленинградской области: монтаж электропроводки, сборка электрощитов, заземление, освещение. Прозрачная смета и гарантия.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
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
