import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { COINS_PER_CORRECT_WORD, COINS_FASTER_THAN_AVG } from "./constants";

export interface WordCoinBreakdown {
  wordId: string;
  correct: number;
  speedBonus: number;
  total: number;
  isFasterThanAvg: boolean;
}

/** Tailwind class composition utility. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Case-insensitive spelling check with whitespace trimming. Returns false for empty attempts. */
export function checkSpelling(attempt: string, correct: string): boolean {
  const trimmed = attempt.trim();
  if (trimmed.length === 0) return false;
  return trimmed.toLowerCase() === correct.trim().toLowerCase();
}

/** Coins earned for a session based on correct word count (legacy fallback). */
export function calculateCoinsEarned(correctCount: number): number {
  return correctCount * COINS_PER_CORRECT_WORD;
}

/**
 * Calculate per-word coin breakdown with speed bonuses.
 * - 1 coin per correct word
 * - 2 bonus coins if faster than child's average speed
 * (Fastest-ever bonus is awarded at the set/session level, not per word.)
 */
export function calculateWordCoins(
  wordResults: Array<{ wordId: string; wasCorrect: boolean; timeTakenMs: number }>,
  avgTimeMs: number,
): { breakdown: WordCoinBreakdown[]; totalCoins: number } {
  const breakdown: WordCoinBreakdown[] = wordResults.map((wr) => {
    if (!wr.wasCorrect) {
      return {
        wordId: wr.wordId,
        correct: 0,
        speedBonus: 0,
        total: 0,
        isFasterThanAvg: false,
      };
    }

    const correct = COINS_PER_CORRECT_WORD;
    const isFasterThanAvg = avgTimeMs > 0 && wr.timeTakenMs < avgTimeMs;
    const speedBonus = isFasterThanAvg ? COINS_FASTER_THAN_AVG : 0;

    return {
      wordId: wr.wordId,
      correct,
      speedBonus,
      total: correct + speedBonus,
      isFasterThanAvg,
    };
  });

  const totalCoins = breakdown.reduce((sum, b) => sum + b.total, 0);
  return { breakdown, totalCoins };
}

/** Star rating: 3 = 100%, 2 = 70–99%, 1 = <70%. */
export function getStarRating(correctCount: number, totalWords: number): 1 | 2 | 3 {
  if (totalWords === 0) return 1;
  const pct = (correctCount / totalWords) * 100;
  if (pct === 100) return 3;
  if (pct >= 70) return 2;
  return 1;
}

/** Score percentage rounded to nearest integer. */
export function getScorePercent(correctCount: number, totalWords: number): number {
  if (totalWords === 0) return 0;
  return Math.round((correctCount / totalWords) * 100);
}
