import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/constants";
import { CreateClassButton } from "@/components/admin/CreateClassButton";

interface ClassWithTeacher {
  id: string;
  name: string;
  school_year: string;
  teacher_id: string | null;
  users: { full_name: string } | null;
}

export default async function ClassesPage({
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

  const { data: classes } = await supabase
    .from(TABLES.CLASSES)
    .select("id, name, school_year, teacher_id, users!classes_teacher_id_fkey(full_name)")
    .eq("school_id", schoolId)
    .order("name");

  const typedClasses = (classes ?? []) as unknown as ClassWithTeacher[];

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
        <span className="text-foreground">Classes</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black text-foreground">{school.name}</h1>
          <p className="text-muted-foreground mt-1 font-semibold">Classes</p>
        </div>
        <CreateClassButton schoolId={schoolId} />
      </div>

      {/* Class grid */}
      {typedClasses.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-border p-10 text-center">
          <p className="text-4xl mb-3">🏫</p>
          <p className="font-bold text-foreground">No classes yet</p>
          <p className="text-muted-foreground text-sm mt-1">
            Create a class to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {typedClasses.map((cls) => (
            <Link
              key={cls.id}
              href={`/admin/class/${cls.id}`}
              className="block rounded-2xl bg-white shadow-sm p-5 border-2 border-transparent hover:border-brand-200 transition-all"
            >
              <p className="font-black text-foreground text-lg">{cls.name}</p>
              <p className="text-sm text-muted-foreground font-semibold mt-1">
                Year {cls.school_year}
              </p>
              <p className="text-sm mt-3">
                {cls.users?.full_name ? (
                  <span className="font-semibold text-foreground">
                    {cls.users.full_name}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground font-semibold italic">
                    No teacher assigned
                  </span>
                )}
              </p>
            </Link>
          ))}
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
