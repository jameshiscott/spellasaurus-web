import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/constants";
import { AssignTeacherButton } from "@/components/admin/AssignTeacherButton";

interface ClassData {
  id: string;
  name: string;
  school_year: string;
  teacher_id: string | null;
  school_id: string;
  schools: { id: string; name: string; admin_ids: string[] } | null;
  users: { full_name: string } | null;
}

interface ClassStudent {
  id: string;
  child_id: string;
  users: { full_name: string; display_name: string | null } | null;
}

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch class with school and teacher info
  const { data: cls } = await supabase
    .from(TABLES.CLASSES)
    .select(
      "id, name, school_year, teacher_id, school_id, schools!classes_school_id_fkey(id, name, admin_ids), users!classes_teacher_id_fkey(full_name)"
    )
    .eq("id", classId)
    .single();

  const typedClass = cls as unknown as ClassData | null;

  if (!typedClass || !typedClass.schools) redirect("/admin");

  // Verify admin owns this school
  const adminIds = typedClass.schools.admin_ids as string[];
  if (!adminIds.includes(user.id)) redirect("/admin");

  const schoolId = typedClass.school_id;
  const schoolName = typedClass.schools.name;

  // Fetch enrolled students
  const { data: classStudents } = await supabase
    .from(TABLES.CLASS_STUDENTS)
    .select("id, child_id, users!class_students_child_id_fkey(full_name, display_name)")
    .eq("class_id", classId)
    .order("id");

  const typedStudents = (classStudents ?? []) as unknown as ClassStudent[];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground font-semibold flex-wrap">
        <Link href="/admin" className="hover:text-foreground transition-colors">
          Admin
        </Link>
        <span className="mx-1">›</span>
        <Link
          href={`/admin/classes/${schoolId}`}
          className="hover:text-foreground transition-colors"
        >
          {schoolName}
        </Link>
        <span className="mx-1">›</span>
        <Link
          href={`/admin/classes/${schoolId}`}
          className="hover:text-foreground transition-colors"
        >
          Classes
        </Link>
        <span className="mx-1">›</span>
        <span className="text-foreground">{typedClass.name}</span>
      </nav>

      {/* Class info card */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h1 className="text-3xl font-black text-foreground">{typedClass.name}</h1>
        <p className="text-muted-foreground mt-1 font-semibold">Year {typedClass.school_year}</p>
        <p className="text-sm text-muted-foreground font-semibold mt-1">{schoolName}</p>
      </div>

      {/* Assigned Teacher section */}
      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-foreground">Assigned Teacher</h2>
          <AssignTeacherButton
            classId={classId}
            schoolId={schoolId}
            currentTeacherId={typedClass.teacher_id}
            currentTeacherName={typedClass.users?.full_name ?? null}
          />
        </div>
        {typedClass.users?.full_name ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-500 font-black text-sm">
              {typedClass.users.full_name.charAt(0).toUpperCase()}
            </div>
            <span className="font-semibold text-foreground">{typedClass.users.full_name}</span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground font-semibold italic">
            No teacher assigned to this class
          </p>
        )}
      </div>

      {/* Students section */}
      <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-foreground">
            Students
            <span className="ml-2 text-sm font-semibold text-muted-foreground">
              ({typedStudents.length})
            </span>
          </h2>
        </div>

        {typedStudents.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center">
            <p className="text-3xl mb-2">🎒</p>
            <p className="font-bold text-foreground">No students enrolled</p>
            <p className="text-sm text-muted-foreground mt-1">
              Students are enrolled via the teacher dashboard
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {typedStudents.map((student) => {
              const fullName = student.users?.full_name ?? "Unknown";
              const displayName = student.users?.display_name ?? null;
              return (
                <li
                  key={student.id}
                  className="flex items-center gap-3 rounded-xl border border-border px-4 py-3"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-muted-foreground font-black text-sm flex-shrink-0">
                    {fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{fullName}</p>
                    {displayName && (
                      <p className="text-xs text-muted-foreground font-semibold">
                        @{displayName}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Back link */}
      <div>
        <Link
          href={`/admin/classes/${schoolId}`}
          className="text-sm text-muted-foreground font-semibold hover:text-foreground transition-colors"
        >
          ← Back to Classes
        </Link>
      </div>
    </div>
  );
}
