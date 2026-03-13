"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";

interface CreateSetButtonProps {
  classId: string;
}

const CreateSetSchema = z.object({
  name: z.string().min(2, "Set name must be at least 2 characters"),
  weekStart: z.string().min(1, "Week start date is required"),
});

type CreateSetFormValues = z.infer<typeof CreateSetSchema>;

export default function CreateSetButton({ classId }: CreateSetButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateSetFormValues>({
    resolver: zodResolver(CreateSetSchema),
  });

  const onSubmit = async (values: CreateSetFormValues) => {
    setServerError(null);
    try {
      const res = await fetch("/api/teacher/create-set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId,
          name: values.name,
          weekStart: values.weekStart,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setServerError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      reset();
      setIsOpen(false);
      router.refresh();
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
        <span>+</span> Create Spelling Set
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
                Create Spelling Set
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
              {/* Set name */}
              <div>
                <label
                  htmlFor="set-name"
                  className="block text-sm font-semibold text-foreground mb-1"
                >
                  Set name
                </label>
                <input
                  id="set-name"
                  type="text"
                  placeholder="e.g. Week 3 Words"
                  {...register("name")}
                  className={cn(
                    "w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors",
                    errors.name ? "border-danger" : "border-border"
                  )}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-danger">{errors.name.message}</p>
                )}
              </div>

              {/* Week start date */}
              <div>
                <label
                  htmlFor="week-start"
                  className="block text-sm font-semibold text-foreground mb-1"
                >
                  Week start date
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
                  {isSubmitting ? "Creating…" : "Create Set"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
