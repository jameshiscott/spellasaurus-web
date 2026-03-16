"use client";

import { useState, useRef } from "react";

interface WordAudioButtonProps {
  wordId: string;
  audioUrl: string | null;
}

export function WordAudioButton({ wordId, audioUrl }: WordAudioButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentUrl, setCurrentUrl] = useState(audioUrl);
  const [regenerating, setRegenerating] = useState(false);
  const [status, setStatus] = useState<"idle" | "done">("idle");

  if (!currentUrl) return null;

  function handlePlay() {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      const res = await fetch("/api/words/regenerate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordId }),
      });
      if (res.ok) {
        const data = (await res.json()) as { audioUrl: string };
        setCurrentUrl(data.audioUrl);
        if (audioRef.current) {
          audioRef.current.src = data.audioUrl;
          audioRef.current.load();
          audioRef.current.play().catch(() => {});
        }
        setStatus("done");
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch {
      // silently ignore
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <audio ref={audioRef} src={currentUrl} preload="none" className="hidden" />
      <button
        type="button"
        onClick={handlePlay}
        className="text-xs font-semibold text-success hover:text-success/80 transition-colors"
        title="Play audio"
      >
        🔊
      </button>
      <button
        type="button"
        onClick={() => void handleRegenerate()}
        disabled={regenerating}
        className="text-xs font-semibold text-yellow-600 hover:text-yellow-700 transition-colors disabled:opacity-50"
        title="Regenerate audio"
      >
        {regenerating ? "..." : status === "done" ? "✓" : "🔄"}
      </button>
    </div>
  );
}
