import type { PublicReview } from "./client-reviews.functions";

export type HomeReviewsResult = {
  reviews: PublicReview[];
  error: string | null;
};

/** A serializable outcome keeps a review outage local, including during SSR. */
export async function loadHomeReviews(
  fetchReviews: () => Promise<PublicReview[]>,
): Promise<HomeReviewsResult> {
  try {
    return { reviews: await fetchReviews(), error: null };
  } catch (error) {
    return {
      reviews: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}