"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type AddTeacherForm = z.infer<typeof schema>;

interface AddTeacherButtonProps {
  schoolId: string;
}

export function AddTeacherButton({ schoolId }: AddTeacherButtonProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddTeacherForm>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: AddTeacherForm) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/add-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolId, email: data.email }),
      });
      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? "Failed to add teacher");
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
        + Add Teacher
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-black mb-1">Add a Teacher</h2>
            <p className="text-sm text-muted-foreground font-semibold mb-4">
              Enter the email address of an existing teacher account to link them to this school.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-semibold">
                  Teacher Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="teacher@example.com"
                  className="w-full rounded-xl border-2 border-border px-4 py-2 font-semibold focus:border-brand-500 focus:outline-none"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-danger">{errors.email.message}</p>
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
                  {loading ? "Adding…" : "Add Teacher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
