import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/constants";

interface SpellingSetWithCount {
  id: string;
  name: string;
  week_number: number | null;
  week_start: string | null;
  type: string;
  wordCount: number;
}

export default async function SetsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // 1. Get class memberships
  const { data: classEnrolments } = await supabase
    .from(TABLES.CLASS_STUDENTS)
    .select("class_id")
    .eq("child_id", user.id);

  const classIds = classEnrolments?.map((e) => e.class_id) ?? [];

  // 2. Get class spelling sets via junction table + legacy class_id
  const serviceClient = createServiceClient();
  let rawClassSets: Array<{ id: string; name: string; week_number: number | null; week_start: string | null; type: string }> = [];

  if (classIds.length > 0) {
    // Junction table links
    // eslint-disable-next-line
    const { data: junctionLinks } = await (serviceClient as any)
      .from(TABLES.CLASS_SPELLING_SETS)
      .select("set_id")
      .in("class_id", classIds);

    const junctionSetIds: string[] = (junctionLinks ?? []).map(
      (l: { set_id: string }) => l.set_id
    );

    // Legacy sets with class_id directly on spelling_sets
    const { data: legacySets } = await serviceClient
      .from(TABLES.SPELLING_SETS)
      .select("id")
      .in("class_id", classIds)
      .eq("is_active", true);

    const legacySetIds = (legacySets ?? []).map((s) => s.id);

    // Merge and dedupe
    const allSetIds = [...new Set([...junctionSetIds, ...legacySetIds])];

    if (allSetIds.length > 0) {
      const { data: sets } = await serviceClient
        .from(TABLES.SPELLING_SETS)
        .select("id, name, week_number, week_start, type")
        .in("id", allSetIds)
        .eq("is_active", true)
        .order("week_start", { ascending: false });

      rawClassSets = (sets ?? []) as typeof rawClassSets;
    }
  }

  // 3. Get personal sets via child_personal_sets join
  const { data: personalSetLinks } = await serviceClient
    .from(TABLES.CHILD_PERSONAL_SETS)
    .select("spelling_sets(id, name, week_number, week_start, type)")
    .eq("child_id", user.id);

  const rawPersonalSets =
    personalSetLinks
      ?.map((l) => l.spelling_sets)
      .filter(
        (s): s is NonNullable<typeof s> => s !== null && s !== undefined
      ) ?? [];

  // 4. Fetch word counts for each set
  async function enrichWithWordCount(
    sets: Array<{ id: string; name: string; week_number: number | null; week_start: string | null; type: string }>
  ): Promise<SpellingSetWithCount[]> {
    return Promise.all(
      sets.map(async (set) => {
        const { count } = await serviceClient
          .from(TABLES.SPELLING_WORDS)
          .select("id", { count: "exact", head: true })
          .eq("set_id", set.id);
        return { ...set, wordCount: count ?? 0 };
      })
    );
  }

  const classSetsWithCount = await enrichWithWordCount(rawClassSets ?? []);
  const personalSetsWithCount = await enrichWithWordCount(rawPersonalSets);

  // Split class sets into "this week" vs "all"
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const thisWeekSets = classSetsWithCount.filter(
    (s) => s.week_start && new Date(s.week_start) >= sevenDaysAgo
  );
  const olderSets = classSetsWithCount.filter(
    (s) => !s.week_start || new Date(s.week_start) < sevenDaysAgo
  );

  return (
    <div className="pt-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-foreground">
          My Spelling Sets 🦕
        </h1>
        <p className="text-muted-foreground font-semibold mt-1">
          Pick a set to practise!
        </p>
      </div>

      {/* This Week's Class Sets */}
      {thisWeekSets.length > 0 && (
        <section>
          <h2 className="text-lg font-black text-foreground mb-3">
            This Week&apos;s Class Sets
          </h2>
          <div className="space-y-3 sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0">
            {thisWeekSets.map((set) => (
              <SetCard key={set.id} set={set} />
            ))}
          </div>
        </section>
      )}

      {/* All Sets */}
      {olderSets.length > 0 && (
        <section>
          <h2 className="text-lg font-black text-foreground mb-3">All Sets</h2>
          <div className="space-y-3 sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0">
            {olderSets.map((set) => (
              <SetCard key={set.id} set={set} />
            ))}
          </div>
        </section>
      )}

      {/* Personal Sets */}
      {personalSetsWithCount.length > 0 && (
        <section>
          <h2 className="text-lg font-black text-foreground mb-3">
            Personal Sets
          </h2>
          <div className="space-y-3 sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0">
            {personalSetsWithCount.map((set) => (
              <SetCard key={set.id} set={set} isPersonal />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {classSetsWithCount.length === 0 && personalSetsWithCount.length === 0 && (
        <div className="bg-white rounded-3xl p-10 text-center shadow-sm">
          <div className="text-5xl mb-4">😢</div>
          <p className="font-bold text-lg text-foreground">No sets assigned yet</p>
          <p className="text-muted-foreground font-semibold mt-1">
            Ask your teacher to add some spelling sets!
          </p>
        </div>
      )}
    </div>
  );
}

function SetCard({
  set,
  isPersonal = false,
}: {
  set: SpellingSetWithCount;
  isPersonal?: boolean;
}) {
  return (
    <Link
      href={`/child/practice/${set.id}`}
      className="block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md border-l-4 border-brand-500 hover:border-brand-600 transition-all active:scale-95"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-black text-lg text-foreground truncate">{set.name}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {set.week_number !== null && (
              <span className="inline-block bg-brand-100 text-brand-700 text-xs font-bold px-2 py-0.5 rounded-full">
                Week {set.week_number}
              </span>
            )}
            {isPersonal && (
              <span className="inline-block bg-warning/30 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full">
                Personal
              </span>
            )}
            <span className="text-xs text-muted-foreground font-semibold">
              {set.wordCount} word{set.wordCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <span className="text-brand-500 text-2xl flex-shrink-0 mt-1">→</span>
      </div>
    </Link>
  );
}
