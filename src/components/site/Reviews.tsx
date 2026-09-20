import { ArrowRight, PenLine } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "./Reveal";
import { ReviewStars } from "./ReviewStars";
import { Eyebrow } from "./SectionHeading";
import type { PublicReview } from "@/lib/client-reviews.functions";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function Reviews({ reviews }: { reviews: PublicReview[] }) {
  const latest = reviews.slice(0, 3);

  return (
    <section
      id="reviews"
      className="relative scroll-mt-24 overflow-hidden bg-ink py-20 text-ink-foreground lg:py-28"
    >
      <div className="pointer-events-none absolute inset-0 tech-grid opacity-30" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <Eyebrow tone="dark">Отзывы</Eyebrow>
          <h2 className="mt-5 max-w-3xl text-[clamp(2rem,4.2vw,3.4rem)] font-extrabold uppercase leading-[1.02]">
            Отзывы клиентов
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-muted">
            Посмотрите отзывы наших клиентов или оставьте свой отзыв о выполненной работе.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 bg-brand px-6 font-bold text-brand-foreground hover:bg-brand/90">
              <a href="/otzyvy">Все отзывы <ArrowRight /></a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 border-ink-border bg-transparent px-6 font-bold text-ink-foreground hover:border-brand hover:bg-ink-elevated hover:text-brand">
              <a href="/otzyvy?form=1"><PenLine /> Оставить отзыв</a>
            </Button>
          </div>
        </Reveal>

        {latest.length > 0 && (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((review, index) => (
              <Reveal as="article" key={review.id} delay={index * 60}>
                <div className="card-ink flex h-full flex-col p-6">
                  <ReviewStars value={review.rating} />
                  <p className="mt-4 line-clamp-6 whitespace-pre-line text-sm leading-relaxed text-ink-muted">
                    {review.text}
                  </p>
                  <div className="mt-auto border-t border-ink-border pt-5 text-sm">
                    <p className="font-bold">{review.name}</p>
                    <p className="mt-1 text-xs text-ink-muted">
                      {review.location} · {formatDate(review.published_at)}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        <Reveal delay={180}>
          <div className="mt-10 flex flex-col gap-5 border-t border-ink-border pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-lg font-bold">
              Работали с S&amp;M Electric? Поделитесь впечатлением о нашей работе.
            </p>
            <Button asChild size="lg" className="h-12 shrink-0 bg-brand px-6 font-bold text-brand-foreground hover:bg-brand/90">
              <a href="/otzyvy?form=1"><PenLine /> Оставить отзыв</a>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
