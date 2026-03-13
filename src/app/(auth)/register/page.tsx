"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { USER_ROLES, TABLES } from "@/lib/constants";

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum([USER_ROLES.PARENT, USER_ROLES.TEACHER, USER_ROLES.SCHOOL_ADMIN]),
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

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: USER_ROLES.PARENT },
  });

  const selectedRole = watch("role");

  const onSubmit = async ({ fullName, email, password, role }: RegisterForm) => {
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (!data.user) {
        setError("Failed to create account. Please try again.");
        return;
      }

      const { error: profileError } = await supabase.from(TABLES.USERS).insert({
        id: data.user.id,
        role,
        full_name: fullName,
        email,
        onboarding_complete: true,
      });

      if (profileError) {
        setError("Failed to create profile. Please try again.");
        return;
      }

      const destinations: Record<string, string> = {
        [USER_ROLES.PARENT]: "/parent",
        [USER_ROLES.TEACHER]: "/teacher",
        [USER_ROLES.SCHOOL_ADMIN]: "/admin",
      };
      router.push(destinations[role]);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black text-brand-500">🦕 Spellasaurus</h1>
        <p className="text-muted-foreground mt-2">Create your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
          <p className="text-xs text-muted-foreground">
            {ROLE_DESCRIPTIONS[selectedRole]}
          </p>
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
            placeholder="At least 8 characters"
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
