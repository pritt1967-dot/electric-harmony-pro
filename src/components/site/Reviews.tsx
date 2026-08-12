import { Star, Quote } from "lucide-react";

import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import type { ReviewRow } from "@/lib/content.functions";

function Stars({ className = "" }: { className?: string }) {
  return (
    <div className={`flex gap-0.5 text-brand ${className}`}>
      {Array.from({ length: 5 }).map((_, s) => (
        <Star key={s} className="size-4 fill-current" />
      ))}
    </div>
  );
}

export function Reviews({
  reviews,
  title,
}: {
  reviews: ReviewRow[];
  title: string;
}) {
  const [featured, ...rest] = reviews;

  return (
    <section
      id="reviews"
      className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 lg:py-24"
    >
      <Reveal>
        <SectionHeading eyebrow="Отзывы" title={title} />
      </Reveal>

      {featured && (
        <Reveal delay={60}>
          <figure className="mt-10 rounded-sm border border-border bg-card p-6 sm:p-10">
            <Quote className="size-8 text-brand" />
            <blockquote className="mt-5 max-w-3xl text-lg font-semibold leading-relaxed sm:text-2xl">
              {featured.text}
            </blockquote>
            <figcaption className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-5">
              <span className="font-extrabold uppercase tracking-tight">{featured.name}</span>
              <span className="text-xs text-muted-foreground">{featured.role}</span>
              <Stars className="ml-auto" />
            </figcaption>
          </figure>
        </Reveal>
      )}

      {rest.length > 0 && (
        <div className="mt-5 grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((review, i) => (
            <Reveal as="article" key={review.id} delay={Math.min(i, 5) * 60}>
              <figure className="flex h-full flex-col bg-card p-6">
                <Stars />
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {review.text}
                </blockquote>
                <figcaption className="mt-5 border-t border-border pt-4">
                  <div className="text-sm font-extrabold uppercase tracking-tight">
                    {review.name}
                  </div>
                  <div className="text-xs text-muted-foreground">{review.role}</div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
