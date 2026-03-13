"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface WordCardProps {
  word: {
    id: string;
    word: string;
    hint: string | null;
    ai_description: string | null;
    ai_example_sentence: string | null;
    ai_sentence_with_blank: string | null;
    audio_url: string | null;
    ai_generated_at: string | null;
    sort_order: number;
  };
}

export default function WordCard({ word }: WordCardProps) {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const hasAiContent = word.ai_generated_at !== null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerateError(null);
    try {
      const res = await fetch("/api/words/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordId: word.id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setGenerateError(data.error ?? "Failed to generate content.");
      } else {
        router.refresh();
      }
    } catch {
      setGenerateError("Network error. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete the word "${word.word}"? This cannot be undone.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch("/api/teacher/delete-word", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordId: word.id }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      // silently fail — page will remain unchanged
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePlayAudio = () => {
    audioRef.current?.play();
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border-l-4 border-brand-500 flex gap-4 relative">
      {/* Loading overlay */}
      {(isGenerating || isDeleting) && (
        <div className="absolute inset-0 bg-white/70 rounded-2xl flex items-center justify-center z-10">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Left section — word + hint */}
      <div className="shrink-0 min-w-[8rem]">
        <p className="text-2xl font-black text-brand-500 leading-tight">{word.word}</p>
        {word.hint && (
          <p className="text-xs text-muted-foreground mt-1">{word.hint}</p>
        )}
      </div>

      {/* Middle section — AI content */}
      <div className="flex-1 min-w-0 space-y-2">
        {hasAiContent ? (
          <>
            {word.ai_description && (
              <div className="bg-brand-50 rounded-xl p-3 text-sm text-foreground">
                {word.ai_description}
              </div>
            )}

            {word.ai_example_sentence && (
              <p className="text-sm italic text-muted-foreground">
                {word.ai_example_sentence}
              </p>
            )}

            {word.ai_sentence_with_blank && (
              <p className="text-sm text-muted-foreground">
                Fill in: <span className="font-semibold text-foreground">{word.ai_sentence_with_blank}</span>
              </p>
            )}

            {word.audio_url && (
              <>
                <audio ref={audioRef} src={word.audio_url} preload="none" className="hidden" />
                <button
                  type="button"
                  onClick={handlePlayAudio}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-success/10 text-success hover:bg-success/20 transition-colors"
                >
                  🔊 Play Audio
                </button>
              </>
            )}
          </>
        ) : (
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground animate-pulse">
              ⏳ Awaiting AI content
            </p>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-brand-500 text-white hover:bg-brand-600 transition-colors disabled:opacity-50"
            >
              Generate Content
            </button>
          </div>
        )}

        {generateError && (
          <p className="text-xs text-danger font-semibold">{generateError}</p>
        )}
      </div>

      {/* Right section — actions */}
      <div className="shrink-0 flex flex-col gap-2">
        {hasAiContent && (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            title="Regenerate AI content"
            className="p-2 rounded-lg text-muted-foreground hover:text-brand-500 hover:bg-brand-50 transition-colors disabled:opacity-50"
            aria-label="Regenerate content"
          >
            🔄
          </button>
        )}
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          title="Delete word"
          className="p-2 rounded-lg text-muted-foreground hover:text-danger hover:bg-red-50 transition-colors disabled:opacity-50"
          aria-label="Delete word"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
