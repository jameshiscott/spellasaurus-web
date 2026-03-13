"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm the password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof schema>;

interface Props {
  childId: string;
}

export function ResetPasswordButton({ childId }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(schema) });

  const handleClose = () => {
    setOpen(false);
    reset();
    setApiError(null);
    setSuccess(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setApiError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/parent/reset-child-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childId, newPassword: data.newPassword }),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        setApiError(body.error ?? "Failed to reset password");
        return;
      }
      setSuccess(true);
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
        className="rounded-xl border-2 border-border font-bold px-4 py-2 text-sm hover:bg-[#F8F6FF] transition-colors"
      >
        Reset Password 🔑
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-black mb-1">Reset Password</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Set a new password for your child&apos;s account.
            </p>

            {success ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-3">✅</p>
                <p className="font-bold text-[#00B894] text-lg">
                  Password updated successfully
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="mt-5 rounded-2xl border-2 border-border font-bold px-6 py-2 text-sm hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* New password */}
                <div className="space-y-1">
                  <label htmlFor="newPassword" className="block text-sm font-semibold">
                    New Password
                  </label>
                  <div className="flex items-center rounded-xl border-2 border-border focus-within:border-[#6C5CE7] overflow-hidden">
                    <input
                      id="newPassword"
                      type={showNew ? "text" : "password"}
                      placeholder="Min 8 characters"
                      className="flex-1 px-4 py-2 font-semibold focus:outline-none"
                      {...register("newPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      className="pr-4 text-sm text-muted-foreground font-semibold hover:text-foreground"
                    >
                      {showNew ? "Hide" : "Show"}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-xs text-[#D63031]">{errors.newPassword.message}</p>
                  )}
                </div>

                {/* Confirm password */}
                <div className="space-y-1">
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold">
                    Confirm Password
                  </label>
                  <div className="flex items-center rounded-xl border-2 border-border focus-within:border-[#6C5CE7] overflow-hidden">
                    <input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Repeat the password"
                      className="flex-1 px-4 py-2 font-semibold focus:outline-none"
                      {...register("confirmPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="pr-4 text-sm text-muted-foreground font-semibold hover:text-foreground"
                    >
                      {showConfirm ? "Hide" : "Show"}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-[#D63031]">{errors.confirmPassword.message}</p>
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
                    {loading ? "Saving…" : "Save Password"}
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
