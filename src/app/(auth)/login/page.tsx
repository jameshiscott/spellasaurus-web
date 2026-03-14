"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { USER_ROLES } from "@/lib/constants";
import { TABLES } from "@/lib/constants";

const loginSchema = z.object({
  identifier: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async ({ identifier, password }: LoginForm) => {
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();

      // If no @ present, treat as child username
      const email = identifier.includes("@")
        ? identifier
        : `${identifier}@spellasaurus.internal`;

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError("Invalid credentials. Please try again.");
        return;
      }

      // Fetch role and redirect
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from(TABLES.USERS)
        .select("role, onboarding_complete")
        .eq("id", user.id)
        .maybeSingle();

      // Profile missing — create it from user_metadata (set during registration)
      if (!profile) {
        const res = await fetch("/api/auth/ensure-profile", { method: "POST" });
        if (!res.ok) {
          setError("Failed to set up your profile. Please try again.");
          return;
        }
        const created = await res.json();
        const dest: Record<string, string> = {
          [USER_ROLES.CHILD]: "/child",
          [USER_ROLES.PARENT]: "/parent",
          [USER_ROLES.TEACHER]: "/teacher",
          [USER_ROLES.SCHOOL_ADMIN]: "/admin",
        };
        router.push(dest[created.role ?? ""] ?? "/");
        router.refresh();
        return;
      }

      if (profile.role === USER_ROLES.CHILD && !profile.onboarding_complete) {
        router.push("/child/onboarding");
      } else {
        const destinations: Record<string, string> = {
          [USER_ROLES.CHILD]: "/child",
          [USER_ROLES.PARENT]: "/parent",
          [USER_ROLES.TEACHER]: "/teacher",
          [USER_ROLES.SCHOOL_ADMIN]: "/admin",
        };
        router.push(destinations[profile.role ?? ""] ?? "/");
      }
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8">
      {/* Logo / Brand */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-brand-500">🦕 Spellasaurus</h1>
        <p className="text-muted-foreground mt-2">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Identifier */}
        <div className="space-y-1">
          <label
            htmlFor="identifier"
            className="block text-sm font-semibold text-foreground"
          >
            Email or Username
          </label>
          <input
            id="identifier"
            type="text"
            autoComplete="username"
            placeholder="your@email.com or username"
            className="w-full rounded-xl border-2 border-border px-4 py-3 font-semibold text-foreground placeholder:text-muted-foreground focus:border-brand-500 focus:outline-none transition-colors"
            {...register("identifier")}
          />
          {errors.identifier && (
            <p className="text-sm text-danger">{errors.identifier.message}</p>
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
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              className="w-full rounded-xl border-2 border-border px-4 py-3 pr-12 font-semibold text-foreground placeholder:text-muted-foreground focus:border-brand-500 focus:outline-none transition-colors"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-danger">{errors.password.message}</p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-danger font-semibold">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-brand-500 text-white font-bold py-3 text-lg hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        New here?{" "}
        <Link
          href="/register"
          className="text-brand-500 font-bold hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
