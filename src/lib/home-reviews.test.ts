import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { QueryClient, dehydrate, hydrate, queryOptions } from "@tanstack/react-query";
import { loadHomeReviews } from "./home-reviews";

const review = {
  id: "review-1", name: "Test", location: "СПб", rating: 5,
  text: "Test review", photo_url: "", published_at: "2026-10-22T17:00:00Z",
};
const options = (fetcher: () => Promise<typeof review[]>) => queryOptions({
  queryKey: ["home-published-reviews"],
  queryFn: () => loadHomeReviews(fetcher),
  staleTime: 60_000,
  retry: false,
});

async function transfer(fetcher: () => Promise<typeof review[]>) {
  const server = new QueryClient();
  const client = new QueryClient();
  const query = options(fetcher);
  await server.ensureQueryData(query);
  const snapshot = JSON.parse(JSON.stringify(dehydrate(server, {
    shouldDehydrateQuery: (q) =>
      q.queryKey[0] === "home-published-reviews" && q.state.status === "success",
  })));
  hydrate(client, snapshot);
  return { server, client, query };
}

describe("Homepage reviews SSR snapshot", () => {
  it("restores published reviews before the first browser read without refetching", async () => {
    let calls = 0;
    const { server, client, query } = await transfer(async () => { calls++; return [review]; });
    try {
      assert.deepEqual(client.getQueryData(query.queryKey), { reviews: [review], error: null });
      assert.deepEqual(await client.ensureQueryData(query), server.getQueryData(query.queryKey));
      assert.equal(calls, 1);
    } finally { server.clear(); client.clear(); }
  });

  it("restores a local failure and permits a successful retry without failing the page", async () => {
    const { server, client, query } = await transfer(async () => { throw new Error("fetch failed"); });
    try {
      assert.deepEqual(client.getQueryData(query.queryKey), { reviews: [], error: "fetch failed" });
      assert.equal(client.getQueryState(query.queryKey)?.status, "success");
      await client.fetchQuery({ ...options(async () => [review]), staleTime: 0 });
      assert.deepEqual(client.getQueryData(query.queryKey), { reviews: [review], error: null });
    } finally { server.clear(); client.clear(); }
  });

  it("preserves a genuinely empty list, without inventing reviews", async () => {
    assert.deepEqual(await loadHomeReviews(async () => []), { reviews: [], error: null });
  });
});