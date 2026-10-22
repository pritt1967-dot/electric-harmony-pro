import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calendarReviewDay, reviewCalendarDate, reviewDateDay, savedReviewDate } from "./client-review-date";

describe("Review moderation date", () => {
  const row = { published_at: "2026-10-21T22:30:00Z", created_at: "2026-10-20T10:00:00Z" };
  it("preserves the existing timestamp when the day is unchanged", () => {
    assert.equal(savedReviewDate(row, "2026-10-22", "published"), row.published_at);
  });
  it("persists a changed calendar day at Moscow noon", () => {
    const saved = savedReviewDate(row, "2026-09-15", "published");
    assert.equal(saved, "2026-09-15T09:00:00.000Z");
    assert.equal(reviewDateDay(String(saved)), "2026-09-15");
  });
  it("uses the saved creation date for a first publication without a date change", () => {
    assert.equal(savedReviewDate({ ...row, published_at: null }, "2026-10-20", "published"), row.created_at);
  });
  it("retains an edited date on rejection or return to moderation", () => {
    assert.equal(savedReviewDate(row, "2026-10-22", "rejected"), row.published_at);
    assert.equal(savedReviewDate(row, "2026-09-15", "pending"), "2026-09-15T09:00:00.000Z");
  });
  it("does not assign a publication date to an unchanged pending review", () => {
    assert.equal(savedReviewDate({ ...row, published_at: null }, "2026-10-20", "pending"), null);
  });
  it("round trips the selected day through the local calendar", () => {
    assert.equal(calendarReviewDay(reviewCalendarDate("2026-09-15")), "2026-09-15");
  });
});