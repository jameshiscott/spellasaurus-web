"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

const schema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^\S+$/, "Username must not contain spaces"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
});

type AddChildFormValues = z.infer<typeof schema>;

export function AddChildButton() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddChildFormValues>({ resolver: zodResolver(schema) });

  const handleClose = () => {
    setOpen(false);
    reset();
    setError(null);
    setSuccess(false);
    setShowPassword(false);
  };

  const onSubmit = async (data: AddChildFormValues) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/create-child", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        if (res.status === 409) {
          setError("Username already taken — please choose another");
        } else {
          setError(body.error ?? "Failed to create child account");
        }
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        handleClose();
        router.refresh();
      }, 1500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-2xl bg-[#6C5CE7] text-white font-bold px-5 py-2.5 text-sm hover:bg-[#5a4bd1] transition-colors shrink-0"
      >
        Add Child +
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-black mb-1">Add a Child</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Create a new account your child can log in with.
            </p>

            {success ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-3">🎉</p>
                <p className="font-bold text-[#00B894] text-lg">
                  Child account created!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Full name */}
                <div className="space-y-1">
                  <label htmlFor="fullName" className="block text-sm font-semibold">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="Alex Smith"
                    className="w-full rounded-xl border-2 border-border px-4 py-2 font-semibold focus:border-[#6C5CE7] focus:outline-none"
                    {...register("fullName")}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-[#D63031]">{errors.fullName.message}</p>
                  )}
                </div>

                {/* Username */}
                <div className="space-y-1">
                  <label htmlFor="username" className="block text-sm font-semibold">
                    Username
                  </label>
                  <div className="flex items-center rounded-xl border-2 border-border focus-within:border-[#6C5CE7] overflow-hidden">
                    <input
                      id="username"
                      type="text"
                      placeholder="alexsmith"
                      className="flex-1 px-4 py-2 font-semibold focus:outline-none"
                      {...register("username")}
                    />
                    <span className="pr-4 text-sm text-muted-foreground font-semibold">
                      @spellasaurus.internal
                    </span>
                  </div>
                  {errors.username && (
                    <p className="text-xs text-[#D63031]">{errors.username.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label htmlFor="password" className="block text-sm font-semibold">
                    Password
                  </label>
                  <div className="flex items-center rounded-xl border-2 border-border focus-within:border-[#6C5CE7] overflow-hidden">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min 8 characters"
                      className="flex-1 px-4 py-2 font-semibold focus:outline-none"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="pr-4 text-sm text-muted-foreground font-semibold hover:text-foreground"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-[#D63031]">{errors.password.message}</p>
                  )}
                </div>

                {/* Date of birth */}
                <div className="space-y-1">
                  <label htmlFor="dateOfBirth" className="block text-sm font-semibold">
                    Date of Birth
                  </label>
                  <input
                    id="dateOfBirth"
                    type="date"
                    className="w-full rounded-xl border-2 border-border px-4 py-2 font-semibold focus:border-[#6C5CE7] focus:outline-none"
                    {...register("dateOfBirth")}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-xs text-[#D63031]">{errors.dateOfBirth.message}</p>
                  )}
                </div>

                {error && (
                  <p className="text-sm text-[#D63031] bg-red-50 rounded-xl px-4 py-2">
                    {error}
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
                    {loading ? "Creating…" : "Create Account"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
