/** Реальные отзывы заказчиков, привязанные к странице работы (по slug). Текст — дословно. */
export type WorkReview = {
  author: string;
  rating: number;
  text: string;
  source: string;
  sourceUrl: string;
  screenshotUrl: string;
};

export const WORK_REVIEWS: Record<string, WorkReview> = {
  "montazh-zaryadnoj-stancii-elektromobilya-7-kvt": {
    author: "Михаил",
    rating: 5,
    text: "Спасибо за отлично проделанную работу! Установили зарядку 1 фазную на 7квт. Все сделано красиво, пафосные видео из нельзяграмма отдыхают 👌🏻",
    source: "Профи.ру",
    sourceUrl: "https://profi.ru/",
    screenshotUrl:
      "/api/public/photo/6415eed6-2be1-4060-8611-f2541e8e9026/ev7-review-profi.jpg",
  },
};

export const WORK_CTA: Record<string, string> = {
  "montazh-zaryadnoj-stancii-elektromobilya-7-kvt":
    "Нужна зарядная станция для электромобиля? Свяжитесь с SM Electric",
};
