import { queryOptions } from "@tanstack/react-query";

import { getSiteData } from "./content.functions";
import { listPublishedReviews } from "./client-reviews.functions";
import { loadHomeReviews } from "./home-reviews";

export const siteDataQuery = queryOptions({
  queryKey: ["site-data"],
  queryFn: () => getSiteData(),
  staleTime: 60_000,
});

/**
 * Отзывы загружаются отдельно: их недоступность не должна блокировать
 * главную страницу. Ошибка показывается внутри блока отзывов.
 */
export const homeReviewsQuery = queryOptions({
  queryKey: ["home-published-reviews"],
  queryFn: () => loadHomeReviews(() => listPublishedReviews()),
  staleTime: 60_000,
  retry: false,
});
