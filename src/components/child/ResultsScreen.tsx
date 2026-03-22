"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getStarRating, getScorePercent } from "@/lib/utils";
import { COINS_PERFECT_BONUS, COINS_FASTEST_EVER } from "@/lib/constants";
import { useCoinBalance } from "@/contexts/CoinBalanceContext";

interface WordResult {
  wordId: string;
  word: string;
  userAnswer?: string;
  firstAttempt?: string;
  wasCorrect: boolean;
  timeTakenMs: number;
  coinsEarned?: number;
  isFasterThanAvg?: boolean;
}

interface ResultsScreenProps {
  session: {
    id: string;
    set_id: string;
    correct_count: number;
    total_words: number;
    coins_awarded: number;
    completed_at: string;
    word_results: WordResult[];
  };
  displayName: string;
  currentWordStreak?: number;
  bestWordStreak?: number;
  isFastestEverSet?: boolean;
  roundingQuip?: string | null;
}

function StarRating({ stars }: { stars: 1 | 2 | 3 }) {
  return (
    <div className="flex justify-center gap-2 my-4" data-testid="star-rating">
      {[1, 2, 3].map((n) => (
        <motion.span
          key={n}
          initial={{ opacity: 0, scale: 0, rotate: -20 }}
          animate={
            n <= stars
              ? { opacity: 1, scale: 1, rotate: 0 }
              : { opacity: 0.2, scale: 0.8, rotate: 0 }
          }
          transition={{ delay: n * 0.2, duration: 0.35, type: "spring", stiffness: 260, damping: 20 }}
          className="text-5xl"
        >
          ⭐
        </motion.span>
      ))}
    </div>
  );
}

function CoinCounter({ target }: { target: number }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (target === 0) return;
    const duration = 1500;
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };

    const handle = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(handle);
  }, [target]);

  return <span>{displayed}</span>;
}

export default function ResultsScreen({
  session,
  displayName,
  currentWordStreak = 0,
  bestWordStreak = 0,
  isFastestEverSet = false,
  roundingQuip = null,
}: ResultsScreenProps) {
  const { coinBalance, refreshBalance } = useCoinBalance();

  // Refresh balance when results screen mounts (coins just earned)
  useEffect(() => {
    void refreshBalance();
  }, [refreshBalance]);
  const { correct_count, total_words, coins_awarded, word_results } = session;
  const percent = getScorePercent(correct_count, total_words);
  const stars = getStarRating(correct_count, total_words);
  const isPerfect = correct_count === total_words;

  const headline =
    percent === 100
      ? `🌟 Perfect Score! Amazing ${displayName}!`
      : percent >= 70
      ? `⭐ Great work, ${displayName}!`
      : `👍 Good try, ${displayName}! Keep practising!`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-surface"
    >
      <div className="max-w-lg mx-auto px-4 pt-8 pb-12 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 text-center shadow-sm">
          <h1 className="text-2xl font-black text-foreground leading-tight">
            {headline}
          </h1>

          <StarRating stars={stars} />

          {/* Score */}
          <p className="text-4xl font-black text-brand-500 mt-2">
            {correct_count} / {total_words}
          </p>
          <p className="text-muted-foreground font-semibold text-sm mt-1">
            {percent}% correct
          </p>
        </div>

        {/* Coins earned */}
        <div
          data-testid="coins-earned"
          className="bg-warning/20 rounded-2xl px-5 py-4 relative overflow-hidden"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">🪙</span>
            <div>
              <p className="font-black text-yellow-800 text-lg">
                You earned <CoinCounter target={coins_awarded} /> coins!
              </p>
              <p className="text-sm text-yellow-700 font-semibold">
                Total: {coinBalance} coins
              </p>
            </div>
          </div>
          {/* Rounding quip */}
          {roundingQuip && (
            <p className="text-xs text-yellow-600 font-semibold italic mt-2">
              +0.5: {roundingQuip}
            </p>
          )}
          {/* Flying coins animation */}
          {coins_awarded > 0 && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(Math.min(Math.floor(coins_awarded), 5))].map((_, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 1, y: 40, x: 40 + i * 24, scale: 1 }}
                  animate={{ opacity: 0, y: -60, x: 40 + i * 24 + (i % 2 === 0 ? 10 : -10), scale: 0.5 }}
                  transition={{ delay: 0.3 + i * 0.15, duration: 0.8, ease: "easeOut" }}
                  className="absolute bottom-2 text-2xl"
                >
                  🪙
                </motion.span>
              ))}
            </div>
          )}
        </div>

        {/* Perfect bonus */}
        {isPerfect && (
          <div className="bg-purple-50 rounded-2xl px-5 py-4 flex items-center gap-3">
            <span className="text-3xl">🌟</span>
            <div>
              <p className="font-black text-purple-800 text-lg">
                Perfect Score Bonus!
              </p>
              <p className="text-sm text-purple-700 font-semibold">
                +{COINS_PERFECT_BONUS} bonus coins for getting them all right!
              </p>
            </div>
          </div>
        )}

        {/* Fastest ever set bonus */}
        {isFastestEverSet && (
          <div className="bg-amber-50 rounded-2xl px-5 py-4 flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <div>
              <p className="font-black text-amber-800 text-lg">
                Fastest Ever!
              </p>
              <p className="text-sm text-amber-700 font-semibold">
                +{COINS_FASTEST_EVER} bonus coins — your quickest time on this set!
              </p>
            </div>
          </div>
        )}

        {/* Word streak */}
        {currentWordStreak > 0 && (
          <div className="bg-orange-50 rounded-2xl px-5 py-4 flex items-center gap-3">
            <span className="text-3xl">🔥</span>
            <div>
              <p className="font-black text-orange-800 text-lg">
                {currentWordStreak} words correct in a row!
              </p>
              <p className="text-sm text-orange-700 font-semibold">
                Best: {bestWordStreak} word{bestWordStreak !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}

        {/* Word breakdown */}
        {word_results.length > 0 && (
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-black text-foreground text-lg">Word Breakdown</h2>
            </div>
            <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
              {word_results.map((result, i) => (
                <div
                  key={`${result.wordId}-${i}`}
                  className="flex items-center gap-3 px-5 py-3"
                >
                  <span className="text-xl flex-shrink-0">
                    {result.wasCorrect ? "✅" : "❌"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-foreground">{result.word}</span>
                      <span className="text-xs text-muted-foreground font-semibold">
                        ({(result.timeTakenMs / 1000).toFixed(1)}s)
                      </span>
                      {result.wasCorrect && result.isFasterThanAvg && (
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-blue-700 bg-blue-100 rounded-full px-2 py-0.5">
                          ⚡ Faster than normal +0.5
                        </span>
                      )}
                    </div>
                    {!result.wasCorrect && (
                      <div className="mt-0.5 space-y-0.5">
                        {result.firstAttempt && (
                          <p className="text-xs text-danger font-semibold">
                            1st try: <span className="line-through">{result.firstAttempt}</span>
                          </p>
                        )}
                        {result.userAnswer && (
                          <p className="text-xs text-danger font-semibold">
                            {result.firstAttempt ? "2nd try" : "You typed"}: <span className="line-through">{result.userAnswer}</span>
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground font-semibold">
                          Correct: {result.word}
                        </p>
                      </div>
                    )}
                    {result.wasCorrect && result.firstAttempt && (
                      <p className="text-xs text-green-600 font-semibold mt-0.5">
                        1st try: <span className="line-through">{result.firstAttempt}</span> → got it on 2nd try!
                      </p>
                    )}
                  </div>
                  {result.wasCorrect && result.coinsEarned != null && (
                    <span className="text-sm font-bold text-yellow-700 flex-shrink-0">
                      +{result.coinsEarned} 🪙
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="/child"
            className="flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-black text-lg py-4 rounded-2xl transition-all shadow-md"
          >
            <span>🏠</span>
            <span>Back to Home</span>
          </Link>
          <Link
            href={`/child/practice/${session.set_id}`}
            className="flex items-center justify-center gap-2 bg-white hover:bg-brand-50 active:scale-95 text-brand-500 font-black text-lg py-4 rounded-2xl border-2 border-brand-500 transition-all"
          >
            <span>🔄</span>
            <span>Try Again</span>
          </Link>
          <Link
            href="/child/profile"
            className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 active:scale-95 text-muted-foreground font-bold text-lg py-4 rounded-2xl border-2 border-gray-200 transition-all"
          >
            <span>📊</span>
            <span>My Profile</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
