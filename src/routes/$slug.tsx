import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Check, Phone } from "lucide-react";

import { Header, MobileCtaBar } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { FloatingActions } from "@/components/site/FloatingActions";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { CONTACTS } from "@/components/site/contacts";
import { SERVICE_PAGES, getServicePage } from "@/lib/services-seo";
import { canonical, breadcrumbSchema, SITE_URL } from "@/lib/seo";
import { minPricesQuery, worksQuery } from "@/lib/public-queries";

export const Route = createFileRoute("/$slug")({
  loader: async ({ params, context }) => {
    const page = getServicePage(params.slug);
    if (!page) throw notFound();
    await Promise.all([
      context.queryClient.ensureQueryData(minPricesQuery),
      context.queryClient.ensureQueryData(worksQuery),
    ]);
    return { page };
  },
  head: ({ params, loaderData }) => {
    const page = loaderData?.page;
    if (!page) {
      return {
        meta: [{ title: "Страница не найдена | S&M Electric" }, { name: "robots", content: "noindex" }],
      };
    }
    const url = canonical(`/${params.slug}`);
    return {
      meta: [
        { title: page.title },
        { name: "description", content: page.description },
        { property: "og:title", content: page.title },
        { property: "og:description", content: page.description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: page.title },
        { name: "twitter:description", content: page.description },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: page.h1,
            serviceType: page.nav,
            description: page.description,
            areaServed: ["Санкт-Петербург", "Ленинградская область"],
            url,
            provider: {
              "@type": "Electrician",
              name: "S&M Electric",
              telephone: CONTACTS.phoneHref.replace("tel:", ""),
              url: SITE_URL,
            },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(
            breadcrumbSchema([
              { label: "Главная", href: "/" },
              { label: "Услуги", href: "/#services" },
              { label: page.nav, href: `/${page.slug}` },
            ]),
          ),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: page.faq.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        },
      ],
    };
  },
  component: ServicePageView,
});

function ServicePageView() {
  const { page } = Route.useLoaderData();
  const { data: minPrices } = useSuspenseQuery(minPricesQuery);
  const { data: works } = useSuspenseQuery(worksQuery);

  const prices = page.priceCategories
    .map((c) => ({ category: c, ...minPrices[c] }))
    .filter((p) => p.price);

  const related = SERVICE_PAGES.filter((s) => page.related.includes(s.slug));
  const examples = (() => {
    const matched = works.filter((w) => w.service_slug === page.slug);
    return (matched.length ? matched : works).slice(0, 3);
  })();

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Header />
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Услуги", href: "/#services" },
          { label: page.nav, href: `/${page.slug}` },
        ]}
      />

      <main>
        <section className="border-b border-border bg-secondary/40 py-10 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h1 className="max-w-4xl text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {page.h1}
            </h1>
            <p className="mt-4 max-w-3xl text-base text-muted-foreground sm:text-lg">
              {page.intro}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="/#contacts"
                className="inline-flex items-center gap-2 rounded-sm bg-brand px-6 py-3.5 text-sm font-bold uppercase tracking-[0.06em] text-brand-foreground"
              >
                Получить расчёт <ArrowRight className="size-4" />
              </a>
              <a
                href={CONTACTS.phoneHref}
                className="inline-flex items-center gap-2 rounded-sm border border-border px-6 py-3.5 text-sm font-bold text-foreground"
              >
                <Phone className="size-4 text-brand" /> {CONTACTS.phoneDisplay}
              </a>
            </div>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div className="space-y-4">
              {page.body.map((p) => (
                <p key={p} className="text-base leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-bold text-foreground">Что входит в работы</h2>
              <ul className="mt-4 space-y-2.5">
                {page.works.map((w) => (
                  <li key={w} className="flex gap-2.5 text-sm text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-secondary/40 py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">Преимущества</h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {page.benefits.map((b) => (
                <div key={b.title} className="rounded-xl border border-border bg-background p-5">
                  <p className="font-bold text-foreground">{b.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{b.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">
              Как выполняем работу
            </h2>
            <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {page.steps.map((s, i) => (
                <li key={s.title} className="rounded-xl border border-border bg-card p-5">
                  <span className="font-mono text-xs text-brand">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-2 font-bold text-foreground">{s.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {prices.length > 0 && (
          <section className="border-y border-border bg-secondary/40 py-12 lg:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">
                Ориентировочная стоимость
              </h2>
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {prices.map((p) => (
                  <div key={p.category} className="rounded-xl border border-border bg-background p-5">
                    <p className="text-sm text-muted-foreground">{p.name}</p>
                    <p className="mt-2 text-2xl font-extrabold text-foreground">
                      от {p.price.toLocaleString("ru-RU")} ₽
                      <span className="ml-1 text-sm font-medium text-muted-foreground">
                        / {p.unit}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="/prices"
                  className="inline-flex items-center gap-2 rounded-sm border border-border bg-background px-6 py-3.5 text-sm font-bold text-foreground"
                >
                  Полный прайс и калькулятор <ArrowRight className="size-4" />
                </a>
                <a
                  href="/#contacts"
                  className="inline-flex items-center gap-2 rounded-sm bg-brand px-6 py-3.5 text-sm font-bold uppercase tracking-[0.06em] text-brand-foreground"
                >
                  Получить точный расчёт
                </a>
              </div>
            </div>
          </section>
        )}

        {examples.length > 0 && (
          <section className="py-12 lg:py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">
                Примеры выполненных работ
              </h2>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {examples.map((w) => (
                  <a
                    key={w.id}
                    href={`/raboty/${w.slug}`}
                    className="group overflow-hidden rounded-xl border border-border bg-card"
                  >
                    {w.cover_image && (
                      <img
                        src={w.cover_image}
                        alt={`${w.title} — фото выполненных работ, ${w.city || w.location || "Санкт-Петербург"}`}
                        loading="lazy"
                        className="h-48 w-full object-cover transition-transform group-hover:scale-[1.03]"
                      />
                    )}
                    <div className="p-5">
                      <p className="font-bold text-foreground">{w.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {w.city || w.location}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
              <a
                href="/raboty"
                className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-brand"
              >
                Все наши работы <ArrowRight className="size-4" />
              </a>
            </div>
          </section>
        )}

        <section className="border-y border-border bg-secondary/40 py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">
              Частые вопросы
            </h2>
            <div className="mt-8 space-y-4">
              {page.faq.map((f) => (
                <div key={f.q} className="rounded-xl border border-border bg-background p-5">
                  <p className="font-bold text-foreground">{f.q}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">Другие услуги</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {related.map((s) => (
                <a
                  key={s.slug}
                  href={`/${s.slug}`}
                  className="rounded-sm border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-brand hover:text-brand"
                >
                  {s.nav}
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <FloatingActions />
      <MobileCtaBar />
    </div>
  );
}
