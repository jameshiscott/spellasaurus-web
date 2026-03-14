import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/constants";

interface SetsPageProps {
  params: Promise<{ classId: string }>;
}

interface SpellingSet {
  id: string;
  name: string;
  week_start: string;
  week_number: number | null;
  is_active: boolean;
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

  const serviceClient = createServiceClient();

  // Fetch sets linked to this class (junction table + legacy class_id)
  // eslint-disable-next-line
  const { data: classSetLinks } = await (serviceClient as any)
    .from(TABLES.CLASS_SPELLING_SETS)
    .select("set_id")
    .eq("class_id", classId);

  const junctionSetIds: string[] = (classSetLinks ?? []).map(
    (l: { set_id: string }) => l.set_id
  );

  // Legacy sets with class_id directly on spelling_sets
  const { data: legacySetsData } = await serviceClient
    .from(TABLES.SPELLING_SETS)
    .select("id")
    .eq("class_id", classId);

  const legacySetIds = (legacySetsData ?? []).map((s) => s.id);
  const allSetIds = [...new Set([...junctionSetIds, ...legacySetIds])];

  let sets: SpellingSet[] = [];
  if (allSetIds.length > 0) {
    const { data: setsData } = await serviceClient
      .from(TABLES.SPELLING_SETS)
      .select("id, name, week_start, week_number, is_active")
      .in("id", allSetIds)
      .order("week_start", { ascending: false });
    sets = (setsData ?? []) as SpellingSet[];
  }

  // Fetch word counts for each set
  const wordCountMap: Record<string, number> = {};
  if (sets.length > 0) {
    await Promise.all(
      sets.map(async (set) => {
        const { count } = await serviceClient
          .from(TABLES.SPELLING_WORDS)
          .select("id", { count: "exact", head: true })
          .eq("set_id", set.id);
        wordCountMap[set.id] = count ?? 0;
      })
    );
  }

  const activeSets = sets.filter((s) => s.is_active);
  const inactiveSets = sets.filter((s) => !s.is_active);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
        <Link
          href="/teacher"
          className="hover:text-foreground transition-colors"
        >
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
      <h1 className="text-2xl font-black text-foreground">
        Spelling Sets ({activeSets.length} active)
      </h1>

      {/* Sets list */}
      {sets.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">📝</div>
          <h2 className="text-lg font-bold text-foreground mb-2">
            No spelling sets assigned
          </h2>
          <p className="text-muted-foreground">
            Assign spelling sets to this class from the set edit page.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="text-left px-4 py-3 font-bold text-foreground">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 font-bold text-foreground">
                    Week
                  </th>
                  <th className="text-right px-4 py-3 font-bold text-foreground">
                    Words
                  </th>
                  <th className="text-left px-4 py-3 font-bold text-foreground">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 font-bold text-foreground">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...activeSets, ...inactiveSets].map((set) => {
                  const wordCount = wordCountMap[set.id] ?? 0;
                  let weekDisplay = "";
                  try {
                    weekDisplay = format(
                      new Date(set.week_start),
                      "dd MMM yyyy"
                    );
                  } catch {
                    weekDisplay = set.week_start;
                  }

                  return (
                    <tr
                      key={set.id}
                      className="border-b border-border last:border-b-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        {set.week_number != null && (
                          <span className="mr-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-500 text-white">
                            Wk {set.week_number}
                          </span>
                        )}
                        <Link
                          href={`/teacher/set/${set.id}/edit`}
                          className="font-semibold text-foreground hover:text-brand-500 transition-colors"
                        >
                          {set.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {weekDisplay}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {wordCount}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            set.is_active
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-muted-foreground"
                          }`}
                        >
                          {set.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/teacher/set/${set.id}/edit`}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
