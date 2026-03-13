"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  wordId: string;
}

export function DeleteWordButton({ wordId }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    try {
      await fetch("/api/parent/delete-list-word", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordId }),
      });
      router.refresh();
    } catch {
      // silently fail — page will not refresh, user can retry
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleDelete()}
      disabled={loading}
      className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold text-[#D63031] hover:bg-red-50 disabled:opacity-50 transition-colors"
      aria-label="Delete word"
    >
      {loading ? "…" : "Delete"}
    </button>
  );
}
