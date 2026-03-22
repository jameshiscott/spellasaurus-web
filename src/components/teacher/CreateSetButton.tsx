"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";

interface CreateSetButtonProps {
  onCreated?: () => void;
}

const CreateSetSchema = z.object({
  year: z.string().min(1, "Year is required"),
  term: z.string().min(1, "Term is required"),
  week: z.string().min(1, "Week is required"),
  level: z.string().optional(),
  weekStart: z.string().min(1, "Week start date is required"),
});

type CreateSetFormValues = z.infer<typeof CreateSetSchema>;

function buildSetName(values: { year: string; term: string; week: string; level?: string }): string {
  const parts = [values.year.trim(), values.term.trim(), values.week.trim()];
  if (values.level?.trim()) parts.push(values.level.trim());
  return parts.join(" - ");
}

export default function CreateSetButton({ onCreated }: CreateSetButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateSetFormValues>({
    resolver: zodResolver(CreateSetSchema),
    defaultValues: {
      year: "Year ",
      term: "Term ",
      week: "Week ",
      level: "",
    },
  });

  const watchedYear = watch("year");
  const watchedTerm = watch("term");
  const watchedWeek = watch("week");
  const watchedLevel = watch("level");
  const previewName = buildSetName({ year: watchedYear, term: watchedTerm, week: watchedWeek, level: watchedLevel });

  const onSubmit = async (values: CreateSetFormValues) => {
    setServerError(null);
    try {
      const name = buildSetName(values);
      const res = await fetch("/api/teacher/create-set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          weekStart: values.weekStart,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setServerError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      const data = await res.json();
      reset();
      setIsOpen(false);
      onCreated?.();
      // Navigate to the edit page so teacher can add words
      router.push(`/teacher/set/${data.setId}/edit`);
    } catch {
      setServerError("Network error. Please try again.");
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIsOpen(false);
      setServerError(null);
      reset();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-brand-500 text-white hover:bg-brand-600 transition-colors"
      >
        <span>+</span> Create Spelling List
      </button>

      {/* Modal backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={handleClose}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-foreground">
                Create Spelling List
              </h2>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-muted-foreground hover:text-foreground transition-colors text-xl leading-none"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Segmented name fields */}
              <div>
                <p className="block text-sm font-semibold text-foreground mb-2">
                  List name
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="set-year" className="block text-xs font-medium text-muted-foreground mb-1">Year</label>
                    <input
                      id="set-year"
                      type="text"
                      placeholder="Year "
                      {...register("year")}
                      className={cn(
                        "w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors",
                        errors.year ? "border-danger" : "border-border"
                      )}
                    />
                    {errors.year && <p className="mt-1 text-xs text-danger">{errors.year.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="set-term" className="block text-xs font-medium text-muted-foreground mb-1">Term</label>
                    <input
                      id="set-term"
                      type="text"
                      placeholder="Term "
                      {...register("term")}
                      className={cn(
                        "w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors",
                        errors.term ? "border-danger" : "border-border"
                      )}
                    />
                    {errors.term && <p className="mt-1 text-xs text-danger">{errors.term.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="set-week" className="block text-xs font-medium text-muted-foreground mb-1">Week</label>
                    <input
                      id="set-week"
                      type="text"
                      placeholder="Week "
                      {...register("week")}
                      className={cn(
                        "w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors",
                        errors.week ? "border-danger" : "border-border"
                      )}
                    />
                    {errors.week && <p className="mt-1 text-xs text-danger">{errors.week.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="set-level" className="block text-xs font-medium text-muted-foreground mb-1">Level <span className="text-muted-foreground">(optional)</span></label>
                    <input
                      id="set-level"
                      type="text"
                      placeholder="e.g. LA, MA, HA"
                      {...register("level")}
                      className="w-full px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                    />
                  </div>
                </div>
                {/* Live preview */}
                <div className="mt-2 rounded-xl bg-gray-50 border border-border px-3 py-2">
                  <p className="text-xs text-muted-foreground mb-0.5">Preview:</p>
                  <p className="text-sm font-bold text-foreground">{previewName || "—"}</p>
                </div>
              </div>

              {/* Active from date */}
              <div>
                <label
                  htmlFor="week-start"
                  className="block text-sm font-semibold text-foreground mb-1"
                >
                  Active from
                </label>
                <input
                  id="week-start"
                  type="date"
                  {...register("weekStart")}
                  className={cn(
                    "w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors",
                    errors.weekStart ? "border-danger" : "border-border"
                  )}
                />
                {errors.weekStart && (
                  <p className="mt-1 text-xs text-danger">
                    {errors.weekStart.message}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  Lists with a future date will be set to inactive by default.
                </p>
              </div>

              {serverError && (
                <p className="text-sm text-danger font-semibold">{serverError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold bg-brand-500 text-white hover:bg-brand-600 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Creating…" : "Create List"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
