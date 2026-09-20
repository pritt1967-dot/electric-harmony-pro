import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { PenLine } from "lucide-react";

import { Header, MobileCtaBar } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { FloatingActions } from "@/components/site/FloatingActions";
import { ReviewStars } from "@/components/site/ReviewStars";
import { ReviewForm } from "@/components/site/ReviewForm";
import { canonical } from "@/lib/seo";
import { listPublishedReviews } from "@/lib/client-reviews.functions";

const TITLE = "Отзывы клиентов о работе S&M Electric — электромонтаж в СПб и Ленобласти";
const DESCRIPTION =
  "Реальные отзывы клиентов S&M Electric об электромонтажных работах в Санкт-Петербурге и Ленинградской области. Оставьте свой отзыв о выполненных работах.";

const reviewsQuery = queryOptions({
  queryKey: ["public-client-reviews"],
  queryFn: () => listPublishedReviews(),
  staleTime: 60_000,
});

export const Route = createFileRoute("/otzyvy")({
  validateSearch: (search: Record<string, unknown>) => ({
    form: search.form === "1" || search.form === 1 || search.form === true,
  }),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonical("/otzyvy") },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: canonical("/otzyvy") }],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(reviewsQuery),
  component: ReviewsPage,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-8 text-center text-muted-foreground">
      Не удалось загрузить отзывы. {error.message}
    </div>
  ),
});

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function ReviewsPage() {
  const { data: reviews } = useSuspenseQuery(reviewsQuery);
  const { form } = Route.useSearch();
  const [formOpen, setFormOpen] = useState(form);

  const average =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  const schema =
    reviews.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "S&M Electric",
          url: canonical("/otzyvy"),
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: average.toFixed(1),
            reviewCount: reviews.length,
            bestRating: 5,
            worstRating: 1,
          },
          review: reviews.slice(0, 20).map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.name },
            datePublished: r.published_at.slice(0, 10),
            reviewRating: {
              "@type": "Rating",
              ratingValue: r.rating,
              bestRating: 5,
              worstRating: 1,
            },
            reviewBody: r.text,
          })),
        }
      : null;

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
      <Header />
      <main>
        <section className="border-b border-border bg-ink text-ink-foreground">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-brand">
              Отзывы клиентов
            </p>
            <h1 className="mt-4 max-w-4xl text-[clamp(2rem,6vw,4rem)] font-extrabold uppercase leading-[0.98] tracking-[-0.03em]">
              Что говорят о нашей работе
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-muted">
              Отзывы оставляют клиенты после выполненных работ. Каждый отзыв
              проходит проверку перед публикацией.
            </p>

            {reviews.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <ReviewStars value={Math.round(average)} size={20} />
                <span className="text-lg font-extrabold">
                  {average.toFixed(1)}
                </span>
                <span className="text-sm text-ink-muted">
                  по {reviews.length} отзывам
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="mt-8 inline-flex h-14 items-center gap-2 rounded-sm bg-brand px-7 text-sm font-bold uppercase tracking-[0.08em] text-brand-foreground transition-transform hover:scale-[1.02]"
            >
              <PenLine className="size-4" /> Оставить отзыв
            </button>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-16">
          {reviews.length === 0 ? (
            <p className="py-10 text-center text-muted-foreground">
              Опубликованных отзывов пока нет. Вы можете стать первым — нажмите
              «Оставить отзыв».
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.map((r) => (
                <article
                  key={r.id}
                  className="flex flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:border-brand"
                >
                  <ReviewStars value={r.rating} />
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground">
                    {r.text}
                  </p>
                  {r.photo_url && (
                    <img
                      src={r.photo_url}
                      alt={`Фото работы — отзыв, ${r.location}`}
                      loading="lazy"
                      className="mt-4 h-48 w-full rounded-md border border-border object-cover"
                    />
                  )}
                  <div className="mt-auto pt-5 text-sm">
                    <p className="font-bold">{r.name}</p>
                    <p className="text-muted-foreground">
                      {r.location} · {formatDate(r.published_at)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <ReviewForm open={formOpen} onOpenChange={setFormOpen} />
      <Footer />
      <FloatingActions />
      <MobileCtaBar />
    </div>
  );
}
