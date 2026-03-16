import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TABLES, USER_ROLES } from "@/lib/constants";
import { ChildHeader } from "@/components/child/ChildHeader";
import WelcomeModal from "@/components/WelcomeModal";
import { CoinBalanceProvider } from "@/contexts/CoinBalanceContext";

/**
 * Layout for all authenticated, onboarded child routes.
 * This layout is a route group (main) so it does NOT wrap /child/onboarding,
 * meaning we can redirect freely to /child/onboarding without a loop.
 */
export default async function ChildMainLayout({
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
    .select("role, onboarding_complete, display_name, last_seen_version, coin_balance")
    .eq("id", user.id)
    .single();

  if (profile?.role !== USER_ROLES.CHILD) redirect("/login");

  // Redirect to onboarding if not yet complete.
  // Safe to do unconditionally here because this layout does not wrap /child/onboarding.
  if (!profile.onboarding_complete) {
    redirect("/child/onboarding");
  }

  return (
    <CoinBalanceProvider initialBalance={profile.coin_balance ?? 0}>
      <div className="min-h-screen bg-surface">
        <WelcomeModal lastSeenVersion={profile.last_seen_version ?? null} />
        <ChildHeader displayName={profile.display_name ?? "Explorer"} />
        <main className="max-w-lg mx-auto px-4 pb-8">{children}</main>
      </div>
    </CoinBalanceProvider>
  );
}
