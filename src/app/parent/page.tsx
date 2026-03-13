import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/constants";
import Link from "next/link";
import { AddChildButton } from "@/components/parent/AddChildButton";

export default async function ParentDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from(TABLES.USERS)
    .select("full_name")
    .eq("id", user.id)
    .single();

  const { data: childLinks } = await supabase
    .from(TABLES.PARENT_CHILDREN)
    .select(
      "child_id, users!parent_children_child_id_fkey(id, full_name, display_name, coin_balance, dino_type, dino_color, onboarding_complete)"
    )
    .eq("parent_id", user.id)
    .order("child_id");

  const children =
    childLinks
      ?.map((l) => l.users)
      .filter(
        (
          c
        ): c is {
          id: string;
          full_name: string;
          display_name: string | null;
          coin_balance: number;
          dino_type: string | null;
          dino_color: string | null;
          onboarding_complete: boolean;
        } => c !== null
      ) ?? [];

  const sortedChildren = [...children].sort((a, b) =>
    (a.full_name ?? "").localeCompare(b.full_name ?? "")
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground">
            Welcome back, {profile?.full_name}! 👋
          </h1>
          <p className="text-muted-foreground mt-1 text-base">
            Manage your children&apos;s spelling practice
          </p>
        </div>
        <AddChildButton />
      </div>

      {/* Children grid */}
      {sortedChildren.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-border p-14 text-center">
          <p className="text-5xl mb-4">🦕</p>
          <p className="font-bold text-lg text-foreground">No children yet</p>
          <p className="text-muted-foreground text-sm mt-1 mb-6">
            Add your first child to get started!
          </p>
          <AddChildButton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedChildren.map((child) => (
            <Link
              key={child.id}
              href={`/parent/child/${child.id}`}
              className="group bg-white rounded-2xl p-5 shadow-sm hover:shadow-md border-2 border-transparent hover:border-[#6C5CE7]/30 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#F8F6FF] flex items-center justify-center text-3xl shrink-0">
                  🦕
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-black text-foreground truncate">
                    {child.full_name}
                  </p>
                  {child.onboarding_complete ? (
                    child.display_name ? (
                      <p className="text-sm text-muted-foreground font-semibold truncate">
                        @{child.display_name}
                      </p>
                    ) : null
                  ) : (
                    <span className="inline-block mt-1 text-xs font-bold text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">
                      Onboarding pending…
                    </span>
                  )}
                </div>
                <div className="shrink-0 flex items-center gap-1 text-sm font-bold text-yellow-700 bg-[#FDCB6E]/20 rounded-xl px-3 py-1">
                  🪙 {child.coin_balance ?? 0}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
