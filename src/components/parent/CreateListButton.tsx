"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

const schema = z.object({
  name: z.string().min(2, "List name must be at least 2 characters"),
});

type CreateListFormValues = z.infer<typeof schema>;

interface Props {
  parentId: string;
}

export function CreateListButton({ parentId: _parentId }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateListFormValues>({ resolver: zodResolver(schema) });

  const handleClose = () => {
    setOpen(false);
    reset();
    setApiError(null);
  };

  const onSubmit = async (data: CreateListFormValues) => {
    setApiError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/parent/create-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name }),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        setApiError(body.error ?? "Failed to create list");
        return;
      }
      const body = (await res.json()) as { setId: string };
      handleClose();
      router.push(`/parent/lists/${body.setId}/edit`);
    } catch {
      setApiError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-2xl bg-[#6C5CE7] text-white font-bold px-5 py-2.5 text-sm hover:bg-[#5a4bd1] transition-colors shrink-0"
      >
        Create New List
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-black mb-1">Create a Word List</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Give your list a name. You&apos;ll be taken straight to add words.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="listName" className="block text-sm font-semibold">
                  List Name
                </label>
                <input
                  id="listName"
                  type="text"
                  placeholder="e.g. Year 3 Tricky Words"
                  className="w-full rounded-xl border-2 border-border px-4 py-2 font-semibold focus:border-[#6C5CE7] focus:outline-none"
                  autoFocus
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-[#D63031]">{errors.name.message}</p>
                )}
              </div>

              {apiError && (
                <p className="text-sm text-[#D63031] bg-red-50 rounded-xl px-4 py-2">
                  {apiError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 rounded-2xl border-2 border-border font-bold py-2 text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-2xl bg-[#6C5CE7] text-white font-bold py-2 text-sm hover:bg-[#5a4bd1] disabled:opacity-60 transition-colors"
                >
                  {loading ? "Creating…" : "Create List"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
