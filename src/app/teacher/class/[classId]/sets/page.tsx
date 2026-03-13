import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/constants";
import CreateSetButton from "@/components/teacher/CreateSetButton";

interface SetsPageProps {
  params: Promise<{ classId: string }>;
}

interface SpellingSet {
  id: string;
  name: string;
  week_start: string;
  week_number: number | null;
  type: string;
}

export default async function SetsPage({ params }: SetsPageProps) {
  const { classId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: cls } = await supabase
    .from(TABLES.CLASSES)
    .select("id, name, school_year")
    .eq("id", classId)
    .eq("teacher_id", user.id)
    .single();

  if (!cls) redirect("/teacher");

  const className = cls.name as string;

  const { data: setsData } = await supabase
    .from(TABLES.SPELLING_SETS)
    .select("id, name, week_start, week_number, type")
    .eq("class_id", classId)
    .order("week_start", { ascending: false });

  const sets: SpellingSet[] = (setsData ?? []) as SpellingSet[];

  // Fetch word counts for each set
  const wordCountMap: Record<string, number> = {};
  if (sets.length > 0) {
    await Promise.all(
      sets.map(async (set) => {
        const { count } = await supabase
          .from(TABLES.SPELLING_WORDS)
          .select("id", { count: "exact", head: true })
          .eq("set_id", set.id);
        wordCountMap[set.id] = count ?? 0;
      })
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
        <Link href="/teacher" className="hover:text-foreground transition-colors">
          My Classes
        </Link>
        <span>›</span>
        <Link
          href={`/teacher/class/${classId}`}
          className="hover:text-foreground transition-colors"
        >
          {className}
        </Link>
        <span>›</span>
        <span className="text-foreground font-semibold">Spelling Sets</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-black text-foreground">Spelling Sets</h1>
        <CreateSetButton classId={classId} />
      </div>

      {/* Sets grid */}
      {sets.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">📝</div>
          <h2 className="text-lg font-bold text-foreground mb-2">
            No spelling sets yet
          </h2>
          <p className="text-muted-foreground">
            Create your first spelling set to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sets.map((set) => {
            const wordCount = wordCountMap[set.id] ?? 0;
            let weekDisplay = "";
            try {
              weekDisplay = format(new Date(set.week_start), "dd MMM yyyy");
            } catch {
              weekDisplay = set.week_start;
            }

            return (
              <div
                key={set.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-border hover:border-brand-500 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h2 className="font-bold text-foreground text-lg leading-tight">
                    {set.name}
                  </h2>
                  {set.week_number != null ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-500 text-white shrink-0">
                      Week {set.week_number}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-muted-foreground shrink-0">
                      {weekDisplay}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{weekDisplay}</span>
                    {wordCount === 0 ? (
                      <span className="text-sm font-semibold text-warning">
                        No words yet
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {wordCount} {wordCount === 1 ? "word" : "words"}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/teacher/set/${set.id}/edit`}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-brand-500 text-white hover:bg-brand-600 transition-colors"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Back link */}
      <Link
        href={`/teacher/class/${classId}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Back to {className}
      </Link>
    </div>
  );
}
