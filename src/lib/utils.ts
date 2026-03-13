import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { COINS_PER_CORRECT_WORD } from "./constants";

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

/** Coins earned for a session based on correct word count. */
export function calculateCoinsEarned(correctCount: number): number {
  return correctCount * COINS_PER_CORRECT_WORD;
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
