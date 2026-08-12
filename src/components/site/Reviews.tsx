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
      className="relative scroll-mt-20 overflow-hidden bg-ink py-16 text-ink-foreground lg:py-24"
    >
      <div className="pointer-events-none absolute inset-0 tech-grid opacity-40" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <Eyebrow tone="dark">Отзывы</Eyebrow>
          <h2 className="mt-4 max-w-3xl text-[clamp(1.9rem,4vw,3.2rem)] font-extrabold uppercase leading-[1.02] tracking-[-0.03em]">
            {title}
          </h2>
        </Reveal>

        <Reveal delay={60}>
          <figure className="mt-8 max-w-4xl border-l-2 border-brand pl-5 sm:pl-8">
            <blockquote className="text-[clamp(1.15rem,2.6vw,1.8rem)] font-semibold leading-[1.35] tracking-tight">
              «{featured.text}»
            </blockquote>
            <figcaption className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
              <span className="font-bold">{featured.name}</span>
              {featured.role && (
                <span className="text-ink-muted">{featured.role}</span>
              )}
            </figcaption>
          </figure>
        </Reveal>
      </div>

      {rest.length > 0 && (
        <div className="relative mt-8 overflow-x-auto scrollbar-hide">
          <ul className="mx-auto flex w-max max-w-none gap-4 px-4 sm:px-6">
            {rest.map((review) => (
              <li
                key={review.id}
                className="w-[80vw] max-w-sm shrink-0 border border-ink-border bg-ink-elevated p-5 sm:w-96"
              >
                <blockquote className="text-sm leading-relaxed text-ink-muted">
                  {review.text}
                </blockquote>
                <div className="mt-4 border-t border-ink-border pt-3 text-sm">
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
