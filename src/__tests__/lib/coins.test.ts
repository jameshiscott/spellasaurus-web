import { describe, it, expect } from "vitest";
import { calculateCoinsEarned } from "@/lib/utils";

describe("calculateCoinsEarned", () => {
  it("awards 10 coins per correct answer (8 correct → 80)", () => {
    expect(calculateCoinsEarned(8)).toBe(80);
  });

  it("returns 0 coins when no answers are correct", () => {
    expect(calculateCoinsEarned(0)).toBe(0);
  });

  it("returns 100 coins for a perfect score (10 correct)", () => {
    expect(calculateCoinsEarned(10)).toBe(100);
  });

  it("never returns a negative number", () => {
    expect(calculateCoinsEarned(0)).toBeGreaterThanOrEqual(0);
  });

  it("awards 10 coins per correct answer for any valid input (5 → 50)", () => {
    expect(calculateCoinsEarned(5)).toBe(50);
  });

  it("awards 10 coins for a single correct answer", () => {
    expect(calculateCoinsEarned(1)).toBe(10);
  });
});
