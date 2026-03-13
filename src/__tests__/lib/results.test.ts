import { describe, it, expect } from "vitest";
import { getStarRating } from "@/lib/utils";

describe("getStarRating", () => {
  it("returns 3 stars for a perfect score (10/10 = 100%)", () => {
    expect(getStarRating(10, 10)).toBe(3);
  });

  it("returns 2 stars for a good score (8/10 = 80%)", () => {
    expect(getStarRating(8, 10)).toBe(2);
  });

  it("returns 1 star for a passing score (6/10 = 60%)", () => {
    expect(getStarRating(6, 10)).toBe(1);
  });

  it("returns at least 1 star even for 0 correct (0/10)", () => {
    expect(getStarRating(0, 10)).toBe(1);
  });

  it("returns 3 stars for any 100% result regardless of set size", () => {
    expect(getStarRating(5, 5)).toBe(3);
    expect(getStarRating(1, 1)).toBe(3);
  });

  it("returns 2 stars for scores in the 70–99% range", () => {
    expect(getStarRating(7, 10)).toBe(2);
    expect(getStarRating(9, 10)).toBe(2);
  });
});
