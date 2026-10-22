import { QueryClient, dehydrate, hydrate } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // Transfer the public homepage review snapshot before React hydrates.
    // Other queries retain their existing loading behavior.
    dehydrate: () => ({
      homeReviews: dehydrate(queryClient, {
        shouldDehydrateQuery: (query) =>
          query.queryKey[0] === "home-published-reviews" &&
          query.state.status === "success",
      }),
    }),
    hydrate: (state) => {
      hydrate(queryClient, state.homeReviews);
    },
  });

  return router;
};
