import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/constants";
import Link from "next/link";

export default async function TeacherDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from(TABLES.USERS)
    .select("full_name")
    .eq("id", user!.id)
    .single();

  const { data: classes } = await supabase
    .from(TABLES.CLASSES)
    .select("id, name, school_year")
    .eq("teacher_id", user!.id)
    .order("name");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-foreground">
          Welcome, {profile?.full_name?.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground mt-1">Manage your spelling classes</p>
      </div>

      <div>
        <h2 className="text-xl font-black text-foreground mb-4">Your Classes</h2>

        {!classes || classes.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-border p-10 text-center">
            <p className="text-4xl mb-3">🏫</p>
            <p className="font-bold text-foreground">No classes assigned yet</p>
            <p className="text-muted-foreground text-sm mt-1">
              Contact your school admin to be assigned to a class
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <Link
                key={cls.id}
                href={`/teacher/class/${cls.id}`}
                className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md border-2 border-transparent hover:border-brand-200 transition-all"
              >
                <div className="text-3xl mb-2">📚</div>
                <p className="font-black text-foreground text-lg">{cls.name}</p>
                <p className="text-sm text-muted-foreground font-semibold">
                  Year {cls.school_year}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
