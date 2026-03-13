"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

const schema = z.object({
  name: z.string().min(2, "School name must be at least 2 characters"),
  address: z.string().optional(),
});

type CreateSchoolForm = z.infer<typeof schema>;

export function CreateSchoolButton() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSchoolForm>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: CreateSchoolForm) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/create-school", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, address: data.address ?? "" }),
      });
      if (!res.ok) {
        const body = await res.json();
        setError(body.error ?? "Failed to create school");
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
        Create School 🏫
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-black mb-4">Create a School</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* School name */}
              <div className="space-y-1">
                <label htmlFor="name" className="block text-sm font-semibold">
                  School Name <span className="text-danger">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="e.g. Greenfield Primary School"
                  className="w-full rounded-xl border-2 border-border px-4 py-2 font-semibold focus:border-brand-500 focus:outline-none"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-danger">{errors.name.message}</p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label htmlFor="address" className="block text-sm font-semibold">
                  Address <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <textarea
                  id="address"
                  rows={2}
                  placeholder="e.g. 12 School Lane, Springfield"
                  className="w-full rounded-xl border-2 border-border px-4 py-2 font-semibold focus:border-brand-500 focus:outline-none resize-none"
                  {...register("address")}
                />
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
                  {loading ? "Creating…" : "Create School"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
