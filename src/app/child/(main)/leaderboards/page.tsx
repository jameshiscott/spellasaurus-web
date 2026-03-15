import { createClient, createServiceClient } from '@/lib/supabase/server';
import { TABLES } from '@/lib/constants';
import Link from 'next/link';
import LeaderboardTabs from '@/components/child/LeaderboardTabs';

export default async function LeaderboardsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: practiceSettings } = await supabase
    .from(TABLES.CHILD_PRACTICE_SETTINGS)
    .select('leaderboard_opt_in')
    .eq('child_id', user!.id)
    .single();

  const serviceClient = createServiceClient();

  // Get classes the child belongs to
  const { data: classEnrolments } = await supabase
    .from(TABLES.CLASS_STUDENTS)
    .select('class_id, classes(name)')
    .eq('child_id', user!.id);

  // Build tabs: "Global" first, then one per class
  const tabs: Array<{
    id: string;
    label: string;
    childIds: string[];
  }> = [];

  // Global tab — get eligible child IDs from global_leaderboard_stats
  const { data: globalEntries } = await supabase
    .from(TABLES.GLOBAL_LEADERBOARD_STATS)
    .select('child_id')
    .eq('leaderboard_eligible', true)
    .limit(20);

  const globalChildIds = (globalEntries ?? []).map((e) => e.child_id);
  if (globalChildIds.length > 0) {
    tabs.push({ id: 'global', label: '🌍 Global', childIds: globalChildIds });
  }

  // Class tabs
  for (const enrolment of classEnrolments ?? []) {
    const className =
      (enrolment.classes as { name: string } | null)?.name ?? 'Class';

    const { data: classEntries } = await supabase
      .from(TABLES.CLASS_LEADERBOARD_STATS)
      .select('child_id')
      .eq('class_id', enrolment.class_id)
      .eq('leaderboard_eligible', true)
      .limit(20);

    const classChildIds = (classEntries ?? []).map((e) => e.child_id);
    if (classChildIds.length > 0) {
      tabs.push({
        id: enrolment.class_id,
        label: `📚 ${className}`,
        childIds: classChildIds,
      });
    }
  }

  // Collect all unique child IDs across all tabs
  const allChildIds = new Set<string>();
  for (const tab of tabs) {
    for (const id of tab.childIds) allChildIds.add(id);
  }

  // Fetch stats from child_stats (single source of truth)
  const statsMap: Record<string, {
    display_name: string;
    weekly_coins: number;
    weekly_words: number;
    current_word_streak: number;
  }> = {};

  if (allChildIds.size > 0) {
    const { data: statsData } = await serviceClient
      .from(TABLES.CHILD_STATS)
      .select('child_id, weekly_coins, weekly_words: total_words, current_word_streak')
      .in('child_id', [...allChildIds]);

    // Also fetch display names from users table
    const { data: usersData } = await serviceClient
      .from(TABLES.USERS)
      .select('id, display_name')
      .in('id', [...allChildIds]);

    const nameMap: Record<string, string> = {};
    for (const u of usersData ?? []) {
      nameMap[u.id] = u.display_name ?? 'Unknown';
    }

    for (const s of statsData ?? []) {
      statsMap[s.child_id] = {
        display_name: nameMap[s.child_id] ?? 'Unknown',
        weekly_coins: s.weekly_coins ?? 0,
        weekly_words: s.weekly_words ?? 0,
        current_word_streak: s.current_word_streak ?? 0,
      };
    }
  }

  // Build final tab data with entries sorted by weekly_coins
  const tabsWithEntries = tabs.map((tab) => ({
    id: tab.id,
    label: tab.label,
    entries: tab.childIds
      .map((childId) => {
        const stat = statsMap[childId];
        return {
          child_id: childId,
          display_name: stat?.display_name ?? 'Unknown',
          weekly_coins: stat?.weekly_coins ?? 0,
          weekly_words: stat?.weekly_words ?? 0,
          word_streak: stat?.current_word_streak ?? 0,
        };
      })
      .sort((a, b) => b.weekly_coins - a.weekly_coins),
  }));

  const isOptedIn = practiceSettings?.leaderboard_opt_in ?? false;

  return (
    <div className="pt-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-foreground">🏆 Leaderboard</h1>
        <Link href="/child" className="text-sm font-bold text-brand-500 hover:underline">
          ← Back
        </Link>
      </div>

      {/* Opt-out notice */}
      {!isOptedIn && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-sm font-semibold text-yellow-800">
          You are not on the leaderboard. Ask a parent to turn it on in your profile settings.
        </div>
      )}

      {tabsWithEntries.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <p className="text-4xl mb-3">🏆</p>
          <p className="text-muted-foreground font-semibold">
            No leaderboard data yet. Start practising to earn coins and climb the ranks!
          </p>
        </div>
      ) : (
        <LeaderboardTabs tabs={tabsWithEntries} currentUserId={user!.id} />
      )}
    </div>
  );
}
