import { createClient } from '@/lib/supabase/server';
import { TABLES } from '@/lib/constants';
import Link from 'next/link';

const MEDAL_ICONS = ['🥇', '🥈', '🥉'];

function getRankIcon(rank: number): string {
  return MEDAL_ICONS[rank] ?? `${rank + 1}.`;
}

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

  // Get classes the child belongs to
  const { data: classEnrolments } = await supabase
    .from(TABLES.CLASS_STUDENTS)
    .select('class_id, classes(name)')
    .eq('child_id', user!.id);

  // Fetch class leaderboards for each enrolled class
  const classLeaderboards: Array<{
    classId: string;
    className: string;
    entries: Array<{
      child_id: string;
      display_name: string;
      weekly_coins: number;
      total_coins: number;
      weekly_words: number;
    }>;
  }> = [];

  for (const enrolment of classEnrolments ?? []) {
    const className =
      (enrolment.classes as { name: string } | null)?.name ?? 'Class';

    const { data: entries } = await supabase
      .from(TABLES.CLASS_LEADERBOARD_STATS)
      .select('child_id, display_name, weekly_coins, total_coins, weekly_words')
      .eq('class_id', enrolment.class_id)
      .eq('leaderboard_eligible', true)
      .order('weekly_coins', { ascending: false })
      .limit(20);

    if (entries && entries.length > 0) {
      classLeaderboards.push({
        classId: enrolment.class_id,
        className,
        entries,
      });
    }
  }

  // Fetch global leaderboard
  const { data: globalEntries } = await supabase
    .from(TABLES.GLOBAL_LEADERBOARD_STATS)
    .select('child_id, display_name, weekly_coins, total_coins, weekly_words')
    .eq('leaderboard_eligible', true)
    .order('weekly_coins', { ascending: false })
    .limit(20);

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

      {/* Class leaderboards */}
      {classLeaderboards.length === 0 && (globalEntries ?? []).length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <p className="text-4xl mb-3">🏆</p>
          <p className="text-muted-foreground font-semibold">
            No leaderboard data yet. Start practising to earn coins and climb the ranks!
          </p>
        </div>
      ) : (
        <>
          {classLeaderboards.map(({ classId, className, entries }) => (
            <LeaderboardTable
              key={classId}
              title={`📚 ${className}`}
              entries={entries}
              currentUserId={user!.id}
            />
          ))}

          {(globalEntries ?? []).length > 0 && (
            <LeaderboardTable
              title="🌍 Global"
              entries={globalEntries ?? []}
              currentUserId={user!.id}
            />
          )}
        </>
      )}
    </div>
  );
}

interface LeaderboardEntry {
  child_id: string;
  display_name: string;
  weekly_coins: number;
  total_coins: number;
  weekly_words: number;
}

function LeaderboardTable({
  title,
  entries,
  currentUserId,
}: {
  title: string;
  entries: LeaderboardEntry[];
  currentUserId: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-black text-foreground mb-3">{title}</h2>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-[2rem_1fr_auto] gap-3 px-4 py-2 bg-gray-50 text-xs font-bold text-muted-foreground uppercase tracking-wide">
          <span>#</span>
          <span>Player</span>
          <span className="text-right">🪙 This week</span>
        </div>

        {entries.map((entry, index) => {
          const isMe = entry.child_id === currentUserId;
          return (
            <div
              key={entry.child_id}
              className={`grid grid-cols-[2rem_1fr_auto] gap-3 items-center px-4 py-3 border-t border-gray-100 ${
                isMe ? 'bg-brand-50' : ''
              }`}
            >
              <span className="text-base font-black text-center">
                {getRankIcon(index)}
              </span>
              <div>
                <span className="font-bold text-sm text-foreground">
                  {entry.display_name}
                  {isMe && (
                    <span className="ml-2 text-xs font-bold text-brand-500">(you)</span>
                  )}
                </span>
                <p className="text-xs text-muted-foreground font-semibold">
                  {entry.weekly_words} word{entry.weekly_words !== 1 ? 's' : ''} this week
                </p>
              </div>
              <span className="font-black text-yellow-700 text-sm">
                {entry.weekly_coins}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
