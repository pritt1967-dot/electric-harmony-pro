import { queryOptions } from "@tanstack/react-query";

import { getSiteData } from "./content.functions";
import { listPublishedReviews } from "./client-reviews.functions";

export const siteDataQuery = queryOptions({
  queryKey: ["site-data"],
  queryFn: async () => {
    const [siteData, clientReviews] = await Promise.all([
      getSiteData(),
      listPublishedReviews(),
    ]);
    return { ...siteData, clientReviews };
  },
  staleTime: 60_000,
});
