import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Services } from "@/components/site/Services";
import { Works } from "@/components/site/Works";
import { Reviews } from "@/components/site/Reviews";
import { About } from "@/components/site/About";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { FloatingActions } from "@/components/site/FloatingActions";
import { siteDataQuery } from "@/lib/site-data";

export const Route = createFileRoute("/")({
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
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero
          title={c.hero_title ?? "Электрик в СПб"}
          subtitle={c.hero_subtitle ?? ""}
        />
        <Services
          services={data.services}
          title={c.services_title ?? "Услуги"}
          subtitle={c.services_subtitle ?? ""}
        />
        <Works
          works={data.works}
          title={c.works_title ?? "Наши работы"}
          subtitle={c.works_subtitle ?? ""}
        />
        <Reviews reviews={data.reviews} title={c.reviews_title ?? "Отзывы"} />
        <About
          title={c.about_title ?? "О компании"}
          text={c.about_text ?? ""}
        />
        <Contact />
      </main>
      <Footer />
      <FloatingActions />
    </div>
  );
}
