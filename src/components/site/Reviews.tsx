import { Quote } from "lucide-react";

import { Reveal } from "./Reveal";
import { Eyebrow } from "./SectionHeading";
import type { ReviewRow } from "@/lib/content.functions";

export function Reviews({
  reviews,
  title,
}: {
  reviews: ReviewRow[];
  title: string;
}) {
  const [featured, ...rest] = reviews;
  if (!featured) return null;

  return (
    <section
      id="reviews"
      className="relative scroll-mt-24 overflow-hidden bg-ink py-20 text-ink-foreground lg:py-28"
    >
      <div className="pointer-events-none absolute inset-0 tech-grid opacity-30" aria-hidden />
      <div
        className="pointer-events-none absolute bottom-[-20%] left-[-10%] size-[480px] rounded-full bg-brand/10 blur-[140px]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <Eyebrow tone="dark">Отзывы</Eyebrow>
          <h2 className="mt-5 max-w-3xl text-[clamp(2rem,4.2vw,3.4rem)] font-extrabold uppercase leading-[1.02] tracking-[-0.035em]">
            {title}
          </h2>
        </Reveal>

        <Reveal delay={60}>
          <figure className="card-ink mt-10 max-w-4xl p-7 sm:p-10">
            <Quote className="size-8 text-brand" aria-hidden />
            <blockquote className="mt-5 text-[clamp(1.15rem,2.4vw,1.75rem)] font-semibold leading-[1.35] tracking-tight">
              «{featured.text}»
            </blockquote>
            <figcaption className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-ink-border pt-5 text-sm">
              <span className="font-bold">{featured.name}</span>
              {featured.role && (
                <span className="text-ink-muted">{featured.role}</span>
              )}
            </figcaption>
          </figure>
        </Reveal>
      </div>

      {rest.length > 0 && (
        <div className="relative mt-6 overflow-x-auto scrollbar-hide">
          <ul className="mx-auto flex w-max max-w-none gap-4 px-4 py-2 sm:px-6">
            {rest.map((review) => (
              <li
                key={review.id}
                className="card-ink w-[80vw] max-w-sm shrink-0 p-6 sm:w-96"
              >
                <blockquote className="text-sm leading-relaxed text-ink-muted">
                  {review.text}
                </blockquote>
                <div className="mt-5 border-t border-ink-border pt-4 text-sm">
                  <span className="font-bold">{review.name}</span>
                  {review.role && (
                    <span className="ml-2 text-ink-muted">{review.role}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
