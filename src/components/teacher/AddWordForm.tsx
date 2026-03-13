"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";

interface AddWordFormProps {
  setId: string;
}

const AddWordSchema = z.object({
  word: z.string().min(1, "Word is required"),
  hint: z.string().optional(),
});

type AddWordFormValues = z.infer<typeof AddWordSchema>;

export default function AddWordForm({ setId }: AddWordFormProps) {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddWordFormValues>({
    resolver: zodResolver(AddWordSchema),
  });

  const onSubmit = async (values: AddWordFormValues) => {
    setServerError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/teacher/add-word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setId,
          word: values.word,
          hint: values.hint ?? "",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setServerError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      reset();
      setSuccessMessage("Word added! Generating content…");
      router.refresh();

      setTimeout(() => {
        setSuccessMessage(null);
      }, 2000);
    } catch {
      setServerError("Network error. Please try again.");
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3">
        Add a Word
      </h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Word input */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Word…"
              autoComplete="off"
              {...register("word")}
              className={cn(
                "w-full px-4 py-2.5 rounded-xl border text-lg font-bold focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors",
                errors.word ? "border-danger" : "border-border"
              )}
            />
            {errors.word && (
              <p className="mt-1 text-xs text-danger">{errors.word.message}</p>
            )}
          </div>

          {/* Hint input */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Optional hint or clue…"
              autoComplete="off"
              {...register("hint")}
              className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-500 text-white hover:bg-brand-600 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Adding…" : "Add Word"}
          </button>
        </div>

        {serverError && (
          <p className="mt-2 text-sm text-danger font-semibold">{serverError}</p>
        )}

        {successMessage && (
          <p className="mt-2 text-sm text-success font-semibold">{successMessage}</p>
        )}
      </form>
    </div>
  );
}
