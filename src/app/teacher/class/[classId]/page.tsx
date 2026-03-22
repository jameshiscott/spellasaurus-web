import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/constants";
import { EnrolStudentButton } from "@/components/teacher/EnrolStudentButton";
import { EditableClassName } from "@/components/teacher/EditableClassName";

interface ClassPageProps {
  params: Promise<{ classId: string }>;
}

interface ClassData {
  id: string;
  name: string;
  school_year: string;
  school_id: string | null;
}

interface StudentStats {
  user_id: string;
  full_name: string | null;
  display_name: string | null;
  username: string | null;
  spellingsThisWeek: number;
  accuracyThisWeek: number | null;
  spellingsThisMonth: number;
  accuracyThisMonth: number | null;
  spellingsThisYear: number;
  accuracyThisYear: number | null;
  lastPractised: string | null;
  coinBalance: number;
  totalCoinsEver: number;
}

function getStartOfWeek(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1; // Monday = start of week
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getStartOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function getStartOfYear(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), 0, 1);
}

export default async function ClassPage({ params }: ClassPageProps) {
  const { classId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: cls } = await supabase
    .from(TABLES.CLASSES)
    .select("id, name, school_year, school_id")
    .eq("id", classId)
    .eq("teacher_id", user.id)
    .single();

  if (!cls) redirect("/teacher");

  const classData = cls as ClassData;

  const serviceClient = createServiceClient();

  // Fetch active set count for this class (junction table + legacy class_id)
  // eslint-disable-next-line
  const { data: classSetLinks } = await (serviceClient as any)
    .from(TABLES.CLASS_SPELLING_SETS)
    .select("set_id")
    .eq("class_id", classId);

  const junctionSetIds: string[] = (classSetLinks ?? []).map(
    (l: { set_id: string }) => l.set_id
  );

  // Legacy sets with class_id directly on spelling_sets
  const { data: legacyClassSets } = await serviceClient
    .from(TABLES.SPELLING_SETS)
    .select("id")
    .eq("class_id", classId)
    .eq("is_active", true);

  const legacySetIds = (legacyClassSets ?? []).map((s) => s.id);
  const allClassSetIds = [...new Set([...junctionSetIds, ...legacySetIds])];

  let activeSetCount = 0;
  if (allClassSetIds.length > 0) {
    const { data: activeSets } = await serviceClient
      .from(TABLES.SPELLING_SETS)
      .select("id")
      .in("id", allClassSetIds)
      .eq("is_active", true);
    activeSetCount = activeSets?.length ?? 0;
  }

  // Fetch students with profile data
  const { data: classStudents } = await serviceClient
    .from(TABLES.CLASS_STUDENTS)
    .select(
      `
      child_id,
      users:child_id (
        full_name,
        display_name,
        email,
        coin_balance
      )
    `
    )
    .eq("class_id", classId);

  const childIds: string[] = (classStudents ?? []).map(
    (cs) => cs.child_id as string
  );

  // Fetch practice sessions for all students in this class
  let allSessions: {
    child_id: string;
    total_words: number;
    correct_count: number;
    completed_at: string;
    coins_awarded: number;
  }[] = [];
  if (childIds.length > 0) {
    const { data: sessions } = await serviceClient
      .from(TABLES.PRACTICE_SESSIONS)
      .select("child_id, total_words, correct_count, completed_at, coins_awarded")
      .in("child_id", childIds);
    allSessions = (sessions ?? []) as typeof allSessions;
  }

  // Fetch child_stats for last_practised_at
  let childStatsMap: Record<string, string | null> = {};
  if (childIds.length > 0) {
    const { data: stats } = await serviceClient
      .from(TABLES.CHILD_STATS)
      .select("child_id, last_practised_at")
      .in("child_id", childIds);
    for (const s of stats ?? []) {
      childStatsMap[s.child_id] = s.last_practised_at;
    }
  }

  const weekStart = getStartOfWeek().toISOString();
  const monthStart = getStartOfMonth().toISOString();
  const yearStart = getStartOfYear().toISOString();

  function computeAccuracy(
    filteredSessions: typeof allSessions
  ): number | null {
    const totalWords = filteredSessions.reduce(
      (sum, s) => sum + s.total_words,
      0
    );
    if (totalWords === 0) return null;
    const totalCorrect = filteredSessions.reduce(
      (sum, s) => sum + s.correct_count,
      0
    );
    return Math.round((totalCorrect / totalWords) * 100);
  }

  const students: StudentStats[] = (classStudents ?? []).map((cs) => {
    const childId = cs.child_id as string;
    const u = cs.users as {
      full_name: string | null;
      display_name: string | null;
      email: string | null;
      coin_balance: number;
    } | null;

    const sessions = allSessions.filter((s) => s.child_id === childId);

    const weekSessions = sessions.filter((s) => s.completed_at >= weekStart);
    const monthSessions = sessions.filter(
      (s) => s.completed_at >= monthStart
    );
    const yearSessions = sessions.filter((s) => s.completed_at >= yearStart);

    const spellingsThisWeek = weekSessions.reduce(
      (sum, s) => sum + s.total_words,
      0
    );
    const spellingsThisMonth = monthSessions.reduce(
      (sum, s) => sum + s.total_words,
      0
    );
    const spellingsThisYear = yearSessions.reduce(
      (sum, s) => sum + s.total_words,
      0
    );

    const totalCoinsEver = sessions.reduce(
      (sum, s) => sum + s.coins_awarded,
      0
    );

    // Extract username from email (strip @spellasaurus.internal)
    let username: string | null = null;
    if (u?.email) {
      username = u.email.replace(/@spellasaurus\.internal$/, "");
    }

    return {
      user_id: childId,
      full_name: u?.full_name ?? null,
      display_name: u?.display_name ?? null,
      username,
      spellingsThisWeek,
      accuracyThisWeek: computeAccuracy(weekSessions),
      spellingsThisMonth,
      accuracyThisMonth: computeAccuracy(monthSessions),
      spellingsThisYear,
      accuracyThisYear: computeAccuracy(yearSessions),
      lastPractised: childStatsMap[childId] ?? null,
      coinBalance: u?.coin_balance ?? 0,
      totalCoinsEver,
    };
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/teacher"
          className="hover:text-foreground transition-colors"
        >
          My Classes
        </Link>
        <span>›</span>
        <span className="text-foreground font-semibold">{classData.name}</span>
      </nav>

      {/* Class info card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <EditableClassName classId={classData.id} initialName={classData.name} />
            {classData.school_id && (
              <p className="text-sm text-muted-foreground mt-1">
                School ID: {classData.school_id}
              </p>
            )}
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-brand-500 text-white">
            Year {classData.school_year}
          </span>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href={`/teacher/class/${classId}/sets`}
          className="bg-white rounded-2xl p-6 shadow-sm border border-border hover:border-brand-500 hover:shadow-md transition-all group"
        >
          <div className="text-3xl mb-3">📝</div>
          <h2 className="text-lg font-bold text-foreground group-hover:text-brand-500 transition-colors">
            Spelling Sets
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {activeSetCount === 0
              ? "No active sets"
              : `${activeSetCount} active set${activeSetCount !== 1 ? "s" : ""}`}{" "}
            for this class
          </p>
        </Link>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
          <div className="text-3xl mb-3">👥</div>
          <h2 className="text-lg font-bold text-foreground">
            Students ({students.length})
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Enrolled students in this class
          </p>
        </div>
      </div>

      {/* Students section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">
            Students ({students.length})
          </h2>
          <EnrolStudentButton classId={classId} />
        </div>

        {students.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <div className="text-4xl mb-3">🦕</div>
            <p className="text-muted-foreground">
              No students enrolled yet — use &quot;Add Student&quot; to enrol
              children.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-gray-50">
                    <th className="text-left px-4 py-3 font-bold text-foreground">
                      Student
                    </th>
                    <th className="text-right px-4 py-3 font-bold text-foreground">
                      This Week
                    </th>
                    <th className="text-right px-4 py-3 font-bold text-foreground">
                      This Month
                    </th>
                    <th className="text-right px-4 py-3 font-bold text-foreground">
                      This Year
                    </th>
                    <th className="text-left px-4 py-3 font-bold text-foreground">
                      Last Practised
                    </th>
                    <th className="text-right px-4 py-3 font-bold text-foreground">
                      Coins
                    </th>
                    <th className="text-right px-4 py-3 font-bold text-foreground">
                      Total Earned
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    let lastPractisedDisplay = "—";
                    if (student.lastPractised) {
                      try {
                        const d = new Date(student.lastPractised);
                        lastPractisedDisplay = d.toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        });
                      } catch {
                        lastPractisedDisplay = student.lastPractised;
                      }
                    }

                    return (
                      <tr
                        key={student.user_id}
                        className="border-b border-border last:border-b-0 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <p className="font-semibold text-foreground">
                            {student.full_name ?? "Unknown Student"}
                          </p>
                          {student.display_name && (
                            <p className="text-xs text-muted-foreground">
                              {student.display_name}
                            </p>
                          )}
                          {student.username && (
                            <p className="text-xs text-muted-foreground/70">
                              @{student.username}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">
                          {student.spellingsThisWeek}
                          {student.accuracyThisWeek !== null && (
                            <span className="text-xs ml-1 text-muted-foreground/70">
                              ({student.accuracyThisWeek}%)
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">
                          {student.spellingsThisMonth}
                          {student.accuracyThisMonth !== null && (
                            <span className="text-xs ml-1 text-muted-foreground/70">
                              ({student.accuracyThisMonth}%)
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">
                          {student.spellingsThisYear}
                          {student.accuracyThisYear !== null && (
                            <span className="text-xs ml-1 text-muted-foreground/70">
                              ({student.accuracyThisYear}%)
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {lastPractisedDisplay}
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">
                          {student.coinBalance}
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">
                          {student.totalCoinsEver}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Back link */}
      <Link
        href="/teacher"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Back to My Classes
      </Link>
    </div>
  );
}
