import { createClient } from "@/lib/supabase/server";
import { TABLES } from "@/lib/constants";
import Link from "next/link";
import { CreateSchoolButton } from "@/components/admin/CreateSchoolButton";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from(TABLES.USERS)
    .select("full_name")
    .eq("id", user!.id)
    .single();

  // Schools where this user is an admin
  const { data: schools } = await supabase
    .from(TABLES.SCHOOLS)
    .select("id, name, address")
    .contains("admin_ids", [user!.id])
    .order("name");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-foreground">
          Welcome, {profile?.full_name?.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground mt-1">School administration dashboard</p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-foreground">Your Schools</h2>
          <CreateSchoolButton />
        </div>

        {!schools || schools.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-border p-10 text-center">
            <p className="text-4xl mb-3">🏫</p>
            <p className="font-bold text-foreground">No schools yet</p>
            <p className="text-muted-foreground text-sm mt-1">
              Create a school to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {schools.map((school) => (
              <div
                key={school.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-border"
              >
                <p className="font-black text-foreground text-lg">{school.name}</p>
                {school.address && (
                  <p className="text-sm text-muted-foreground mt-1">{school.address}</p>
                )}
                <div className="flex gap-2 mt-4">
                  <Link
                    href={`/admin/classes/${school.id}`}
                    className="rounded-xl border-2 border-brand-200 text-brand-500 font-bold px-3 py-1 text-sm hover:bg-brand-50 transition-colors"
                  >
                    Classes
                  </Link>
                  <Link
                    href={`/admin/teachers/${school.id}`}
                    className="rounded-xl border-2 border-border text-muted-foreground font-bold px-3 py-1 text-sm hover:bg-gray-50 transition-colors"
                  >
                    Teachers
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
