import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/constants";

interface ClassPageProps {
  params: Promise<{ classId: string }>;
}

interface ClassData {
  id: string;
  name: string;
  school_year: string;
  school_id: string | null;
}

interface StudentData {
  user_id: string;
  full_name: string | null;
  display_name: string | null;
  dino_type: string | null;
  dino_color: string | null;
}

const DINO_EMOJIS: Record<string, string> = {
  trex: "🦖",
  triceratops: "🦕",
  stegosaurus: "🦕",
  brachiosaurus: "🦕",
  raptor: "🦖",
  ankylosaurus: "🦕",
  diplodocus: "🦕",
  spinosaurus: "🦖",
  pterodactyl: "🦅",
  parasaurolophus: "🦕",
};

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

  const { data: classStudents } = await supabase
    .from(TABLES.CLASS_STUDENTS)
    .select(
      `
      child_id,
      users:child_id (
        full_name,
        display_name,
        dino_type,
        dino_color
      )
    `
    )
    .eq("class_id", classId);

  const students: StudentData[] = (classStudents ?? []).map((cs) => {
    const u = cs.users as {
      full_name: string | null;
      display_name: string | null;
      dino_type: string | null;
      dino_color: string | null;
    } | null;
    return {
      user_id: cs.child_id as string,
      full_name: u?.full_name ?? null,
      display_name: u?.display_name ?? null,
      dino_type: u?.dino_type ?? null,
      dino_color: u?.dino_color ?? null,
    };
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/teacher" className="hover:text-foreground transition-colors">
          My Classes
        </Link>
        <span>›</span>
        <span className="text-foreground font-semibold">{classData.name}</span>
      </nav>

      {/* Class info card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-foreground">{classData.name}</h1>
            {classData.school_id && (
              <p className="text-sm text-muted-foreground mt-1">School ID: {classData.school_id}</p>
            )}
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-brand-500 text-white">
            Year {classData.school_year}
          </span>
        </div>
      </div>

      {/* Action cards */}
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
            Manage weekly spelling lists for this class
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
        <h2 className="text-lg font-bold text-foreground mb-4">
          Students ({students.length})
        </h2>

        {students.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <div className="text-4xl mb-3">🦕</div>
            <p className="text-muted-foreground">
              No students enrolled yet — ask your school admin to add students.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => {
              const dinoEmoji = student.dino_type
                ? DINO_EMOJIS[student.dino_type] ?? "🦕"
                : "🦕";
              return (
                <div
                  key={student.user_id}
                  className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4"
                >
                  <div className="text-3xl">{dinoEmoji}</div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {student.full_name ?? "Unknown Student"}
                    </p>
                    {student.display_name && (
                      <p className="text-sm text-muted-foreground truncate">
                        {student.display_name}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
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
