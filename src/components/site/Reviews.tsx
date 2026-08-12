import { Star, Quote } from "lucide-react";

import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import type { ReviewRow } from "@/lib/content.functions";

export function Reviews({
  reviews,
  title,
}: {
  reviews: ReviewRow[];
  title: string;
}) {
  return (
    <section
      id="reviews"
      className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:py-24"
    >
      <Reveal>
        <SectionHeading eyebrow="Отзывы" title={title} />
      </Reveal>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {reviews.map((review, i) => (
          <Reveal as="article" key={review.id} delay={i * 70}>
            <figure className="flex h-full flex-col rounded-lg border border-border bg-card p-6 transition-colors hover:border-brand">
              <Quote className="size-7 text-brand" />
              <div className="mt-3 flex gap-0.5 text-brand">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="size-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                {review.text}
              </blockquote>
              <figcaption className="mt-5 border-t border-border pt-4">
                <div className="font-extrabold">{review.name}</div>
                <div className="text-xs text-muted-foreground">{review.role}</div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
