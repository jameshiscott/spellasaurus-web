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
    const { breakdown, totalCoins } = calculateWordCoins(results, 3000, {
      w1: 2000,
      w2: 3000,
    });
    // Both slower than avg (3000ms) and slower than fastest
    expect(totalCoins).toBe(2); // 1 + 1
    expect(breakdown[0].correct).toBe(1);
    expect(breakdown[0].speedBonus).toBe(0);
    expect(breakdown[0].fastestBonus).toBe(0);
  });

  it("awards 0 coins for incorrect words", () => {
    const results = [
      { wordId: "w1", wasCorrect: false, timeTakenMs: 1000 },
    ];
    const { totalCoins } = calculateWordCoins(results, 5000, {});
    expect(totalCoins).toBe(0);
  });

  it("awards speed bonus (2 coins) when faster than average", () => {
    const results = [
      { wordId: "w1", wasCorrect: true, timeTakenMs: 2000 },
    ];
    const { breakdown, totalCoins } = calculateWordCoins(results, 5000, {
      w1: 1000, // not fastest ever
    });
    expect(breakdown[0].isFasterThanAvg).toBe(true);
    expect(breakdown[0].isFastestEver).toBe(false);
    expect(breakdown[0].speedBonus).toBe(2);
    expect(totalCoins).toBe(3); // 1 + 2
  });

  it("awards fastest ever bonus (5 coins) when fastest for that word", () => {
    const results = [
      { wordId: "w1", wasCorrect: true, timeTakenMs: 1000 },
    ];
    const { breakdown, totalCoins } = calculateWordCoins(results, 500, {
      w1: 2000, // previous fastest was 2000ms, now 1000ms
    });
    expect(breakdown[0].isFastestEver).toBe(true);
    expect(breakdown[0].isFasterThanAvg).toBe(false); // 1000 > 500 avg
    expect(breakdown[0].fastestBonus).toBe(5);
    expect(totalCoins).toBe(6); // 1 + 5
  });

  it("awards both speed and fastest bonuses together", () => {
    const results = [
      { wordId: "w1", wasCorrect: true, timeTakenMs: 1000 },
    ];
    const { breakdown, totalCoins } = calculateWordCoins(results, 5000, {
      w1: 2000,
    });
    expect(breakdown[0].isFasterThanAvg).toBe(true);
    expect(breakdown[0].isFastestEver).toBe(true);
    expect(totalCoins).toBe(8); // 1 + 2 + 5
  });

  it("treats first-ever answer as fastest ever", () => {
    const results = [
      { wordId: "w1", wasCorrect: true, timeTakenMs: 3000 },
    ];
    const { breakdown } = calculateWordCoins(results, 5000, {});
    expect(breakdown[0].isFastestEver).toBe(true);
    expect(breakdown[0].fastestBonus).toBe(5);
  });
});
