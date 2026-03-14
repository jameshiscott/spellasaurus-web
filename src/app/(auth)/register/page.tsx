"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { USER_ROLES } from "@/lib/constants";

const registerSchema = z.object({
  accessCode: z.string().min(1, "Early access code is required"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Must contain at least one special character"),
  role: z.enum([USER_ROLES.PARENT, USER_ROLES.TEACHER, USER_ROLES.SCHOOL_ADMIN], {
    required_error: "Please select your role",
  }),
});

type RegisterForm = z.infer<typeof registerSchema>;

const ROLE_LABELS: Record<string, string> = {
  [USER_ROLES.PARENT]: "Parent",
  [USER_ROLES.TEACHER]: "Teacher",
  [USER_ROLES.SCHOOL_ADMIN]: "School Admin",
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  [USER_ROLES.PARENT]: "Create word lists and manage your child's practice",
  [USER_ROLES.TEACHER]: "Create spelling sets for your class",
  [USER_ROLES.SCHOOL_ADMIN]: "Manage schools, classes, and teachers",
};

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {},
  });

  const selectedRole = watch("role");

  const onSubmit = async ({ accessCode, fullName, email, password, role }: RegisterForm) => {
    setError(null);
    setLoading(true);

    try {
      // Validate early access code server-side
      const codeRes = await fetch("/api/auth/verify-access-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: accessCode }),
      });
      const codeData = await codeRes.json();
      if (!codeData.valid) {
        setError(codeData.error ?? "Invalid early access code");
        return;
      }

      const supabase = createClient();

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role, full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      setEmailSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
        <h1 className="text-4xl font-black text-brand-500">🦕 Spellasaurus</h1>
        <div className="mt-6 space-y-4">
          <div className="text-5xl">📧</div>
          <h2 className="text-2xl font-bold text-foreground">Check your email!</h2>
          <p className="text-muted-foreground">
            We&apos;ve sent a confirmation link to your email address.
            Click the link to activate your account.
          </p>
          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive it? Check your spam folder.
          </p>
          <Link
            href="/login"
            className="inline-block mt-4 text-brand-500 font-bold hover:underline"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-black text-brand-500">🦕 Spellasaurus</h1>
        <p className="text-muted-foreground mt-2">Create your account</p>
      </div>

      <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 mb-6">
        <p className="font-bold">Early Access Beta</p>
        <p className="mt-1">
          Spellasaurus is still in beta. Please enter your early access code to register.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Early access code */}
        <div className="space-y-1">
          <label
            htmlFor="accessCode"
            className="block text-sm font-semibold text-foreground"
          >
            Early Access Code
          </label>
          <input
            id="accessCode"
            type="text"
            placeholder="Enter your access code"
            className="w-full rounded-xl border-2 border-border px-4 py-3 font-semibold placeholder:text-muted-foreground focus:border-brand-500 focus:outline-none transition-colors"
            {...register("accessCode")}
          />
          {errors.accessCode && (
            <p className="text-sm text-danger">{errors.accessCode.message}</p>
          )}
        </div>

        {/* Role selector */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-foreground">
            I am a…
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[USER_ROLES.PARENT, USER_ROLES.TEACHER, USER_ROLES.SCHOOL_ADMIN].map(
              (role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setValue("role", role as RegisterForm["role"])}
                  className={`rounded-xl border-2 p-3 text-sm font-bold transition-all ${
                    selectedRole === role
                      ? "border-brand-500 bg-brand-50 text-brand-500"
                      : "border-border text-muted-foreground hover:border-brand-300"
                  }`}
                >
                  {ROLE_LABELS[role]}
                </button>
              )
            )}
          </div>
          {selectedRole && (
            <p className="text-xs text-muted-foreground">
              {ROLE_DESCRIPTIONS[selectedRole]}
            </p>
          )}
          {errors.role && (
            <p className="text-sm text-danger">{errors.role.message}</p>
          )}
        </div>

        {/* Full name */}
        <div className="space-y-1">
          <label
            htmlFor="fullName"
            className="block text-sm font-semibold text-foreground"
          >
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder="Jane Smith"
            className="w-full rounded-xl border-2 border-border px-4 py-3 font-semibold placeholder:text-muted-foreground focus:border-brand-500 focus:outline-none transition-colors"
            {...register("fullName")}
          />
          {errors.fullName && (
            <p className="text-sm text-danger">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-foreground"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="jane@example.com"
            className="w-full rounded-xl border-2 border-border px-4 py-3 font-semibold placeholder:text-muted-foreground focus:border-brand-500 focus:outline-none transition-colors"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-danger">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-foreground"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Min 8 chars, upper, lower, number, special"
            className="w-full rounded-xl border-2 border-border px-4 py-3 font-semibold placeholder:text-muted-foreground focus:border-brand-500 focus:outline-none transition-colors"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-danger">{errors.password.message}</p>
          )}
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-danger font-semibold">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-brand-500 text-white font-bold py-3 text-lg hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Creating account…" : "Create Account"}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-brand-500 font-bold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
