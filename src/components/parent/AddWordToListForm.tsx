"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

const schema = z.object({
  word: z.string().min(1, "Word is required").trim(),
  hint: z.string().optional(),
});

type AddWordFormValues = z.infer<typeof schema>;

interface Props {
  setId: string;
}

export function AddWordToListForm({ setId }: Props) {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<AddWordFormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: AddWordFormValues) => {
    setApiError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/parent/add-list-word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setId,
          word: data.word.trim(),
          hint: data.hint?.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        setApiError(body.error ?? "Failed to add word");
        return;
      }
      reset();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
      router.refresh();
      setTimeout(() => setFocus("word"), 50);
    } catch {
      setApiError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="flex gap-3 items-start">
        <div className="flex-1 space-y-1">
          <input
            type="text"
            placeholder="Word (e.g. necessary)"
            className="w-full rounded-xl border-2 border-border px-4 py-2.5 font-semibold text-lg focus:border-[#6C5CE7] focus:outline-none"
            {...register("word")}
          />
          {errors.word && (
            <p className="text-xs text-[#D63031]">{errors.word.message}</p>
          )}
        </div>
        <div className="flex-1 space-y-1">
          <input
            type="text"
            placeholder="Hint (optional)"
            className="w-full rounded-xl border-2 border-border px-4 py-2.5 font-semibold focus:border-[#6C5CE7] focus:outline-none"
            {...register("hint")}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[#6C5CE7] text-white font-bold px-5 py-2.5 hover:bg-[#5a4bd1] disabled:opacity-60 transition-colors shrink-0"
        >
          {loading ? "Adding…" : "Add Word"}
        </button>
      </div>

      {apiError && (
        <p className="text-sm text-[#D63031] bg-red-50 rounded-xl px-4 py-2">
          {apiError}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-700 bg-green-50 rounded-xl px-4 py-2 font-semibold">
          Word added! Generating content…
        </p>
      )}
    </form>
  );
}
