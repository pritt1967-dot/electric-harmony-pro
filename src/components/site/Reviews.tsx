import { Star, Quote } from "lucide-react";

import { Reveal } from "./Reveal";

const REVIEWS = [
  {
    name: "Андрей М.",
    role: "Приморский район",
    text: "Собрали электрощит и заменили проводку в квартире. Всё аккуратно, по договору, объяснили каждый автомат. Рекомендую!",
  },
  {
    name: "Елена К.",
    role: "Купчино",
    text: "Вызывала электрика срочно — приехали в тот же день. Быстро нашли причину и всё починили. Спасибо за профессионализм.",
  },
  {
    name: "Игорь С.",
    role: "Василеостровский район",
    text: "Делали электрику под ключ в новостройке. Чётко по срокам, чисто, гарантию дали 5 лет. Очень доволен результатом.",
  },
];

export function Reviews() {
  return (
    <section id="reviews" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 lg:py-24">
      <Reveal className="max-w-2xl">
        <span className="text-sm font-semibold uppercase tracking-wide text-brand">
          Отзывы
        </span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Что говорят наши клиенты
        </h2>
      </Reveal>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {REVIEWS.map((review, i) => (
          <Reveal as="article" key={review.name} delay={i * 80}>
            <figure className="flex h-full flex-col rounded-2xl border border-border bg-card p-6">
              <Quote className="size-8 text-brand/30" />
              <div className="mt-3 flex gap-0.5 text-brand">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="size-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm text-muted-foreground">
                {review.text}
              </blockquote>
              <figcaption className="mt-5">
                <div className="font-bold">{review.name}</div>
                <div className="text-xs text-muted-foreground">{review.role}</div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
