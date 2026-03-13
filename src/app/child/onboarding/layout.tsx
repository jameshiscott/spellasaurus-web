import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TABLES, USER_ROLES } from "@/lib/constants";

/** Onboarding layout — allows child in, but only if onboarding is NOT yet complete. */
export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from(TABLES.USERS)
    .select("role, onboarding_complete")
    .eq("id", user.id)
    .single();

  if (profile?.role !== USER_ROLES.CHILD) redirect("/login");
  if (profile.onboarding_complete) redirect("/child");

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-lg">{children}</div>
    </div>
  );
}
