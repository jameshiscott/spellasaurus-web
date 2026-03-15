import { describe, it, expect } from "vitest";
import { calculateCoinsEarned, calculateWordCoins } from "@/lib/utils";

describe("calculateCoinsEarned (legacy)", () => {
  it("awards 1 coin per correct answer (8 correct → 8)", () => {
    expect(calculateCoinsEarned(8)).toBe(8);
  });

  it("returns 0 coins when no answers are correct", () => {
    expect(calculateCoinsEarned(0)).toBe(0);
  });

  it("never returns a negative number", () => {
    expect(calculateCoinsEarned(0)).toBeGreaterThanOrEqual(0);
  });
});

describe("calculateWordCoins", () => {
  it("awards 1 coin per correct word with no speed bonuses", () => {
    const results = [
      { wordId: "w1", wasCorrect: true, timeTakenMs: 5000 },
      { wordId: "w2", wasCorrect: true, timeTakenMs: 6000 },
    ];
    const { breakdown, totalCoins } = calculateWordCoins(results, 3000);
    // Both slower than avg (3000ms)
    expect(totalCoins).toBe(2); // 1 + 1
    expect(breakdown[0].correct).toBe(1);
    expect(breakdown[0].speedBonus).toBe(0);
  });

  it("awards 0 coins for incorrect words", () => {
    const results = [
      { wordId: "w1", wasCorrect: false, timeTakenMs: 1000 },
    ];
    const { totalCoins } = calculateWordCoins(results, 5000);
    expect(totalCoins).toBe(0);
  });

  it("awards speed bonus (2 coins) when faster than average", () => {
    const results = [
      { wordId: "w1", wasCorrect: true, timeTakenMs: 2000 },
    ];
    const { breakdown, totalCoins } = calculateWordCoins(results, 5000);
    expect(breakdown[0].isFasterThanAvg).toBe(true);
    expect(breakdown[0].speedBonus).toBe(2);
    expect(totalCoins).toBe(3); // 1 + 2
  });

  it("does not award speed bonus when slower than average", () => {
    const results = [
      { wordId: "w1", wasCorrect: true, timeTakenMs: 5000 },
    ];
    const { breakdown, totalCoins } = calculateWordCoins(results, 3000);
    expect(breakdown[0].isFasterThanAvg).toBe(false);
    expect(breakdown[0].speedBonus).toBe(0);
    expect(totalCoins).toBe(1); // 1 only
  });

  it("awards speed bonus to multiple correct words independently", () => {
    const results = [
      { wordId: "w1", wasCorrect: true, timeTakenMs: 2000 }, // faster
      { wordId: "w2", wasCorrect: true, timeTakenMs: 6000 }, // slower
      { wordId: "w3", wasCorrect: false, timeTakenMs: 1000 }, // wrong
    ];
    const { breakdown, totalCoins } = calculateWordCoins(results, 5000);
    expect(breakdown[0].isFasterThanAvg).toBe(true);
    expect(breakdown[1].isFasterThanAvg).toBe(false);
    expect(breakdown[2].total).toBe(0);
    expect(totalCoins).toBe(4); // (1+2) + 1 + 0
  });

  it("handles zero average gracefully (no speed bonus)", () => {
    const results = [
      { wordId: "w1", wasCorrect: true, timeTakenMs: 1000 },
    ];
    const { breakdown } = calculateWordCoins(results, 0);
    expect(breakdown[0].isFasterThanAvg).toBe(false);
    expect(breakdown[0].speedBonus).toBe(0);
  });
});
