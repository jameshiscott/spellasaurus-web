import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TABLES, USER_ROLES } from "@/lib/constants";
import OnboardingFlow from "@/components/child/OnboardingFlow";

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from(TABLES.USERS)
    .select("role, full_name, onboarding_complete")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== USER_ROLES.CHILD) redirect("/login");

  // Already onboarded — send to dashboard
  if (profile.onboarding_complete) redirect("/child");

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center px-4 py-12">
      <OnboardingFlow
        childId={user.id}
        childName={profile.full_name ?? "Explorer"}
      />
    </div>
  );
}
