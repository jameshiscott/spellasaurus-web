"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { checkSpelling } from "@/lib/utils";

interface Word {
  id: string;
  word: string;
  hint: string | null;
  ai_description: string | null;
  ai_example_sentence: string | null;
  ai_sentence_with_blank: string | null;
  audio_url: string | null;
}

interface PracticeSettings {
  play_tts_audio: boolean;
  show_description: boolean;
  show_example_sentence: boolean;
}

interface WordResult {
  wordId: string;
  word: string;
  userAnswer: string;
  wasCorrect: boolean;
  timeTakenMs: number;
}

type SessionPhase = "intro" | "playing" | "feedback" | "submitting" | "done";

interface PracticeSessionProps {
  setId: string;
  setName: string;
  childId: string;
  words: Word[];
  settings: PracticeSettings;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function SentenceWithBlank({ sentence }: { sentence: string }) {
  const parts = sentence.split("___");
  return (
    <span>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <span className="inline-block border-b-2 border-brand-500 min-w-[4rem] mx-1 align-bottom" />
          )}
        </span>
      ))}
    </span>
  );
}

export default function PracticeSession({
  setId,
  setName,
  words,
  settings,
}: PracticeSessionProps) {
  const router = useRouter();

  const [phase, setPhase] = useState<SessionPhase>("intro");
  const [sessionWords, setSessionWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [wordResults, setWordResults] = useState<WordResult[]>([]);
  const [lastResult, setLastResult] = useState<boolean | null>(null);
  const [submitError, setSubmitError] = useState(false);

  const sessionStartTimeRef = useRef<number>(0);
  const wordStartTimeRef = useRef<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentWord = sessionWords[currentIndex] ?? null;
  const totalWords = sessionWords.length;

  // Auto-focus input when phase is "playing" and currentIndex changes
  useEffect(() => {
    if (phase === "playing") {
      inputRef.current?.focus();
      wordStartTimeRef.current = Date.now();
    }
  }, [phase, currentIndex]);

  // Audio auto-play when word changes during "playing" phase
  useEffect(() => {
    if (phase !== "playing" || !currentWord?.audio_url || !settings.play_tts_audio) return;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(currentWord.audio_url);
    audioRef.current = audio;
    audio.play().catch(() => {});
  }, [phase, currentIndex, currentWord?.audio_url, settings.play_tts_audio]);

  // Cleanup feedback timer on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  function startSession() {
    const picked = shuffle(words).slice(0, 10);
    setSessionWords(picked);
    setCurrentIndex(0);
    setWordResults([]);
    setAnswer("");
    sessionStartTimeRef.current = Date.now();
    wordStartTimeRef.current = Date.now();
    setPhase("playing");
  }

  function handleSubmit() {
    if (!currentWord || phase !== "playing") return;

    const timeTakenMs = Date.now() - wordStartTimeRef.current;
    const wasCorrect = checkSpelling(answer, currentWord.word);

    const result: WordResult = {
      wordId: currentWord.id,
      word: currentWord.word,
      userAnswer: answer.trim(),
      wasCorrect,
      timeTakenMs,
    };

    setWordResults((prev) => [...prev, result]);
    setLastResult(wasCorrect);
    setPhase("feedback");

    feedbackTimerRef.current = setTimeout(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex < totalWords) {
        setCurrentIndex(nextIndex);
        setAnswer("");
        setLastResult(null);
        setPhase("playing");
      } else {
        setPhase("submitting");
      }
    }, 1500);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSubmit();
  }

  function replayAudio() {
    if (!currentWord?.audio_url) return;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(currentWord.audio_url);
    audioRef.current = audio;
    audio.play().catch(() => {});
  }

  const submitSession = useCallback(
    async (results: WordResult[]) => {
      const totalMs = Date.now() - sessionStartTimeRef.current;
      const correctCount = results.filter((r) => r.wasCorrect).length;

      try {
        const res = await fetch("/api/sessions/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            setId,
            correctCount,
            totalWords: results.length,
            timeTakenMs: totalMs,
            wordResults: results,
          }),
        });

        if (!res.ok) {
          setSubmitError(true);
          setPhase("submitting");
          return;
        }

        const data = (await res.json()) as { sessionId: string; coinsEarned: number; newBalance: number };
        setPhase("done");
        router.push(`/child/results/${data.sessionId}`);
      } catch {
        setSubmitError(true);
        setPhase("submitting");
      }
    },
    [setId, router]
  );

  // Trigger submit when phase changes to "submitting"
  useEffect(() => {
    if (phase === "submitting" && wordResults.length > 0 && !submitError) {
      submitSession(wordResults);
    }
  }, [phase, wordResults, submitError, submitSession]);

  // ── PHASE: intro ────────────────────────────────────────────────────────────
  if (phase === "intro") {
    const count = Math.min(words.length, 10);
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm bg-white rounded-3xl shadow-sm p-8 text-center"
        >
          <div className="text-5xl mb-4">🦕</div>
          <h1 className="text-2xl font-black text-foreground mb-2">{setName}</h1>
          <p className="text-muted-foreground font-semibold mb-1">
            {count} word{count !== 1 ? "s" : ""} to practise
          </p>
          <p className="text-xs text-muted-foreground mb-8">
            Type each word as you hear or see it — take your time!
          </p>
          <button
            onClick={startSession}
            className="w-full bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-black text-xl py-4 rounded-2xl transition-all shadow-md"
          >
            Ready? Let&apos;s go! 🚀
          </button>
        </motion.div>
      </div>
    );
  }

  // ── PHASE: submitting / done ─────────────────────────────────────────────────
  if (phase === "submitting" || phase === "done") {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4 text-center">
        {submitError ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 shadow-sm max-w-sm w-full"
          >
            <div className="text-4xl mb-4">😬</div>
            <p className="font-black text-lg text-foreground mb-2">Oops! Something went wrong</p>
            <p className="text-muted-foreground font-semibold mb-6 text-sm">
              Your results couldn&apos;t be saved. Please try again.
            </p>
            <button
              onClick={() => {
                setSubmitError(false);
                submitSession(wordResults);
              }}
              className="bg-brand-500 text-white font-bold px-6 py-3 rounded-2xl hover:bg-brand-600 transition-colors"
            >
              Retry
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="font-black text-xl text-foreground">
              {phase === "done" ? "All done! Loading your results..." : "Saving your results..."}
            </p>
          </motion.div>
        )}
      </div>
    );
  }

  // ── PHASE: playing / feedback ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-2 bg-brand-100">
        <motion.div
          className="h-full bg-brand-500"
          initial={{ width: 0 }}
          animate={{
            width: `${totalWords > 0 ? ((currentIndex + (phase === "feedback" ? 1 : 0)) / totalWords) * 100 : 0}%`,
          }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1 max-w-lg mx-auto w-full">
        <span className="text-sm font-bold text-muted-foreground">
          Word {currentIndex + 1} of {totalWords}
        </span>
        <span className="text-sm font-bold text-brand-500">
          {setName}
        </span>
      </div>

      {/* Main card area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 max-w-lg mx-auto w-full">
        <div className="w-full relative">
          {/* Word card */}
          <div className="bg-white rounded-3xl shadow-sm p-6 w-full">
            {/* Audio button */}
            {currentWord?.audio_url && (
              <div className="flex justify-center mb-4">
                <button
                  onClick={replayAudio}
                  aria-label="Replay audio"
                  className="flex items-center gap-2 bg-brand-50 hover:bg-brand-100 text-brand-500 font-bold px-5 py-2 rounded-2xl transition-colors active:scale-95"
                >
                  <span className="text-xl">🔊</span>
                  <span className="text-sm">Play word</span>
                </button>
              </div>
            )}

            {/* Description */}
            {settings.show_description && currentWord?.ai_description && (
              <div className="bg-surface rounded-2xl px-4 py-3 mb-4">
                <p className="text-sm text-muted-foreground font-semibold leading-relaxed">
                  {currentWord.ai_description}
                </p>
              </div>
            )}

            {/* Sentence with blank */}
            {settings.show_example_sentence && currentWord?.ai_sentence_with_blank && (
              <div className="bg-brand-50 rounded-2xl px-4 py-3 mb-4">
                <p className="text-sm text-brand-700 font-semibold leading-relaxed italic">
                  &ldquo;<SentenceWithBlank sentence={currentWord.ai_sentence_with_blank} />&rdquo;
                </p>
              </div>
            )}

            {/* Hint */}
            {currentWord?.hint && (
              <p className="text-xs text-center text-muted-foreground font-semibold mb-4">
                Hint: {currentWord.hint}
              </p>
            )}

            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type the spelling..."
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              inputMode="text"
              data-testid="spelling-input"
              className="text-2xl text-center w-full border-2 border-gray-200 rounded-2xl p-4 focus:outline-none focus:border-brand-500 transition-colors font-bold text-foreground placeholder:text-gray-300"
            />

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={answer.trim().length === 0}
              data-testid="submit-btn"
              className="mt-4 w-full bg-brand-500 hover:bg-brand-600 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-lg py-4 rounded-2xl transition-all shadow-md"
            >
              Check it! ✓
            </button>
          </div>

          {/* Feedback overlay */}
          <AnimatePresence>
            {phase === "feedback" && lastResult !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`absolute inset-0 rounded-3xl flex flex-col items-center justify-center ${
                  lastResult
                    ? "bg-success/95"
                    : "bg-danger/90"
                }`}
              >
                <span className="text-7xl mb-3">{lastResult ? "✅" : "❌"}</span>
                {lastResult ? (
                  <p className="text-white font-black text-2xl text-center">
                    Correct! Well done!
                  </p>
                ) : (
                  <div className="text-center px-6">
                    <p className="text-white font-black text-xl mb-2">The correct spelling is:</p>
                    <p className="text-white font-black text-3xl">{currentWord?.word}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
