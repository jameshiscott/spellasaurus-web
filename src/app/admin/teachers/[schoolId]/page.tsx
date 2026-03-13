import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TABLES, USER_ROLES } from "@/lib/constants";
import { AddTeacherButton } from "@/components/admin/AddTeacherButton";

interface Teacher {
  id: string;
  full_name: string;
  email: string;
}

interface ClassRecord {
  id: string;
  name: string;
  teacher_id: string | null;
}

export default async function TeachersPage({
  params,
}: {
  params: Promise<{ schoolId: string }>;
}) {
  const { schoolId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Verify admin owns this school
  const { data: school } = await supabase
    .from(TABLES.SCHOOLS)
    .select("id, name")
    .eq("id", schoolId)
    .contains("admin_ids", [user.id])
    .single();

  if (!school) redirect("/admin");

  // Fetch all teachers in this school
  const { data: teachers } = await supabase
    .from(TABLES.USERS)
    .select("id, full_name, email")
    .eq("role", USER_ROLES.TEACHER)
    .eq("school_id", schoolId)
    .order("full_name");

  const typedTeachers = (teachers ?? []) as Teacher[];

  // Fetch all classes for this school
  const { data: classes } = await supabase
    .from(TABLES.CLASSES)
    .select("id, name, teacher_id")
    .eq("school_id", schoolId);

  const typedClasses = (classes ?? []) as ClassRecord[];

  // Build a map of teacher_id → assigned class names
  const teacherClassMap = new Map<string, string[]>();
  for (const cls of typedClasses) {
    if (cls.teacher_id) {
      const existing = teacherClassMap.get(cls.teacher_id) ?? [];
      existing.push(cls.name);
      teacherClassMap.set(cls.teacher_id, existing);
    }
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground font-semibold">
        <Link href="/admin" className="hover:text-foreground transition-colors">
          Admin
        </Link>
        <span className="mx-1">›</span>
        <span className="text-foreground">{school.name}</span>
        <span className="mx-1">›</span>
        <span className="text-foreground">Teachers</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black text-foreground">{school.name}</h1>
          <p className="text-muted-foreground mt-1 font-semibold">Teachers</p>
        </div>
        <AddTeacherButton schoolId={schoolId} />
      </div>

      {/* Teacher list */}
      {typedTeachers.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-border p-10 text-center">
          <p className="text-4xl mb-3">👩‍🏫</p>
          <p className="font-bold text-foreground">No teachers yet</p>
          <p className="text-muted-foreground text-sm mt-1">
            Add a teacher by their email address to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {typedTeachers.map((teacher) => {
            const assignedClasses = teacherClassMap.get(teacher.id) ?? [];
            return (
              <div
                key={teacher.id}
                className="bg-white rounded-2xl shadow-sm p-5 border border-border"
              >
                <p className="font-black text-foreground text-lg">{teacher.full_name}</p>
                <p className="text-sm text-muted-foreground font-semibold mt-1">
                  {teacher.email}
                </p>
                <div className="mt-3">
                  {assignedClasses.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {assignedClasses.map((className) => (
                        <span
                          key={className}
                          className="rounded-xl bg-brand-50 text-brand-500 font-bold text-xs px-3 py-1"
                        >
                          {className}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground font-semibold italic">
                      No classes assigned
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Back link */}
      <div>
        <Link
          href="/admin"
          className="text-sm text-muted-foreground font-semibold hover:text-foreground transition-colors"
        >
          ← Back to Admin
        </Link>
      </div>
    </div>
  );
}
