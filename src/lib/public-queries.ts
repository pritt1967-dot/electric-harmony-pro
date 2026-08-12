import { queryOptions } from "@tanstack/react-query";

import { getWorks, getCategoryMinPrices } from "./works.functions";

export const worksQuery = queryOptions({
  queryKey: ["public-works"],
  queryFn: () => getWorks(),
  staleTime: 60_000,
});

export const minPricesQuery = queryOptions({
  queryKey: ["category-min-prices"],
  queryFn: () => getCategoryMinPrices(),
  staleTime: 60_000,
});
