"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

const schema = z.object({
  name: z.string().min(2, "Class name must be at least 2 characters"),
  schoolYear: z.string().min(1, "School year is required"),
});

type CreateClassForm = z.infer<typeof schema>;

interface CreateClassButtonProps {
  schoolId: string;
}

export function CreateClassButton({ schoolId }: CreateClassButtonProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateClassForm>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: CreateClassForm) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/create-class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolId, name: data.name, schoolYear: data.schoolYear }),
      });
      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? "Failed to create class");
        return;
      }
      setOpen(false);
      reset();
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    reset();
    setError(null);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-2xl bg-brand-500 text-white font-bold px-4 py-2 text-sm hover:bg-brand-600 transition-colors"
      >
        + New Class
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-black mb-4">Create a Class</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Class name */}
              <div className="space-y-1">
                <label htmlFor="name" className="block text-sm font-semibold">
                  Class Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="e.g. 3A, Blue Whales"
                  className="w-full rounded-xl border-2 border-border px-4 py-2 font-semibold focus:border-brand-500 focus:outline-none"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-danger">{errors.name.message}</p>
                )}
              </div>

              {/* School year */}
              <div className="space-y-1">
                <label htmlFor="schoolYear" className="block text-sm font-semibold">
                  School Year
                </label>
                <input
                  id="schoolYear"
                  type="text"
                  placeholder="e.g. 3, 4, Year 3"
                  className="w-full rounded-xl border-2 border-border px-4 py-2 font-semibold focus:border-brand-500 focus:outline-none"
                  {...register("schoolYear")}
                />
                {errors.schoolYear && (
                  <p className="text-xs text-danger">{errors.schoolYear.message}</p>
                )}
              </div>

              {error && (
                <p className="text-sm text-danger bg-red-50 rounded-xl px-4 py-2">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 rounded-2xl border-2 border-border font-bold py-2 text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-2xl bg-brand-500 text-white font-bold py-2 text-sm hover:bg-brand-600 disabled:opacity-60"
                >
                  {loading ? "Creating…" : "Create Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
