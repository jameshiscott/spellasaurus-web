import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/constants";
import Link from "next/link";
import { ResetPasswordButton } from "@/components/parent/ResetPasswordButton";

interface Props {
  params: Promise<{ childId: string }>;
}

export default async function ChildDetailPage({ params }: Props) {
  const { childId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Verify parent owns this child
  const { data: ownership } = await supabase
    .from(TABLES.PARENT_CHILDREN)
    .select("id")
    .eq("parent_id", user.id)
    .eq("child_id", childId)
    .single();

  if (!ownership) redirect("/parent");

  // Child profile
  const { data: child } = await supabase
    .from(TABLES.USERS)
    .select(
      "id, full_name, display_name, coin_balance, dino_type, dino_color, onboarding_complete"
    )
    .eq("id", childId)
    .single();

  if (!child) redirect("/parent");

  // Child's class
  const { data: classEnrollment } = await supabase
    .from(TABLES.CLASS_STUDENTS)
    .select("classes(id, name, school_year)")
    .eq("child_id", childId)
    .maybeSingle();

  const childClass = classEnrollment?.classes ?? null;

  const serviceClient = createServiceClient();

  // Personal sets assigned to child
  const { data: personalSetLinks } = await serviceClient
    .from(TABLES.CHILD_PERSONAL_SETS)
    .select("spelling_sets(id, name)")
    .eq("child_id", childId);

  const personalSets =
    personalSetLinks
      ?.map((l) => l.spelling_sets)
      .filter(
        (s): s is { id: string; name: string } => s !== null
      ) ?? [];

  // Class spelling sets (recent 5) — junction table + legacy class_id
  let classSets: Array<{ id: string; name: string; week_start: string | null; wordCount: number }> = [];
  if (childClass) {
    const classId = (childClass as { id: string }).id;

    // Junction table links
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: classSetLinks } = await (serviceClient as any)
      .from(TABLES.CLASS_SPELLING_SETS)
      .select("set_id")
      .eq("class_id", classId);

    const junctionSetIds: string[] = (classSetLinks ?? []).map(
      (l: { set_id: string }) => l.set_id
    );

    // Legacy sets with class_id directly on spelling_sets
    const { data: legacySets } = await serviceClient
      .from(TABLES.SPELLING_SETS)
      .select("id")
      .eq("class_id", classId)
      .eq("is_active", true);

    const legacySetIds = (legacySets ?? []).map((s) => s.id);

    // Merge and dedupe
    const allSetIds = [...new Set([...junctionSetIds, ...legacySetIds])];

    if (allSetIds.length > 0) {
      const { data: sets } = await serviceClient
        .from(TABLES.SPELLING_SETS)
        .select("id, name, week_start")
        .in("id", allSetIds)
        .eq("is_active", true)
        .order("week_start", { ascending: false })
        .limit(5);

      if (sets) {
        const setsWithCounts = await Promise.all(
          sets.map(async (s) => {
            const { count } = await serviceClient
              .from(TABLES.SPELLING_WORDS)
              .select("id", { count: "exact", head: true })
              .eq("set_id", s.id);
            return { ...s, wordCount: count ?? 0 };
          })
        );
        classSets = setsWithCounts;
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/parent" className="hover:text-foreground font-semibold transition-colors">
          My Children
        </Link>
        <span>›</span>
        <span className="text-foreground font-semibold">{child.full_name}</span>
      </nav>

      {/* Child identity card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-border flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-24 h-24 rounded-full bg-[#F8F6FF] flex items-center justify-center text-5xl shrink-0">
          🦕
        </div>
        <div className="flex-1 text-center sm:text-left space-y-2">
          <h1 className="text-2xl font-black text-foreground">{child.full_name}</h1>
          {child.display_name && (
            <p className="text-muted-foreground font-semibold">@{child.display_name}</p>
          )}
          <div className="flex flex-wrap justify-center sm:justify-start gap-3">
            <span className="inline-flex items-center gap-1 text-sm font-bold text-yellow-700 bg-[#FDCB6E]/20 rounded-xl px-3 py-1">
              🪙 {child.coin_balance ?? 0} coins
            </span>
            {child.onboarding_complete ? (
              <span className="inline-flex items-center gap-1 text-sm font-bold text-[#00B894] bg-[#00B894]/10 rounded-xl px-3 py-1">
                Onboarding: Complete ✅
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-700 bg-amber-100 rounded-xl px-3 py-1">
                Onboarding: Pending ⏳
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-black text-foreground mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href={`/parent/child/${childId}/settings`}
            className="bg-white rounded-2xl p-5 shadow-sm border border-border hover:border-[#6C5CE7]/40 hover:shadow-md transition-all text-center group"
          >
            <p className="text-3xl mb-2">⚙️</p>
            <p className="font-bold text-foreground">Practice Settings</p>
            <p className="text-xs text-muted-foreground mt-1">Audio, hints & leaderboard</p>
          </Link>
          <Link
            href="/parent/lists"
            className="bg-white rounded-2xl p-5 shadow-sm border border-border hover:border-[#6C5CE7]/40 hover:shadow-md transition-all text-center group"
          >
            <p className="text-3xl mb-2">📝</p>
            <p className="font-bold text-foreground">My Word Lists</p>
            <p className="text-xs text-muted-foreground mt-1">Create &amp; assign personal lists</p>
          </Link>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-border text-center">
            <p className="text-3xl mb-2">🔑</p>
            <p className="font-bold text-foreground mb-3">Reset Password</p>
            <ResetPasswordButton childId={childId} />
          </div>
        </div>
      </div>

      {/* Class section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
        <h2 className="text-lg font-black text-foreground mb-4">Class</h2>
        {childClass ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏫</span>
              <div>
                <p className="font-bold text-foreground">{childClass.name}</p>
                {childClass.school_year && (
                  <p className="text-sm text-muted-foreground">Year {childClass.school_year}</p>
                )}
              </div>
            </div>

            {classSets.length > 0 ? (
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-2">Recent spelling sets</p>
                <div className="space-y-2">
                  {classSets.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-xl bg-[#F8F6FF] px-4 py-2"
                    >
                      <span className="font-semibold text-sm text-foreground">{s.name}</span>
                      <span className="text-xs text-muted-foreground font-semibold">
                        {s.wordCount} {s.wordCount === 1 ? "word" : "words"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No spelling sets yet for this class.</p>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-2xl mb-2">📚</p>
            <p className="text-muted-foreground text-sm">Not enrolled in a class yet</p>
          </div>
        )}
      </div>

      {/* Personal lists */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-foreground">Personal Lists</h2>
          <Link
            href="/parent/lists"
            className="text-sm font-bold text-[#6C5CE7] hover:underline"
          >
            Manage lists →
          </Link>
        </div>
        {personalSets.length > 0 ? (
          <div className="space-y-2">
            {personalSets.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-xl bg-[#F8F6FF] px-4 py-2"
              >
                <span className="font-semibold text-sm text-foreground">{s.name}</span>
                <Link
                  href={`/parent/lists/${s.id}/edit`}
                  className="text-xs font-bold text-[#6C5CE7] hover:underline"
                >
                  Edit words
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-2xl mb-2">📋</p>
            <p className="text-muted-foreground text-sm">No personal lists assigned</p>
          </div>
        )}
      </div>
    </div>
  );
}
