import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TABLES, USER_ROLES } from "@/lib/constants";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from(TABLES.USERS)
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== USER_ROLES.SCHOOL_ADMIN) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/admin" className="text-xl font-black text-brand-500">
            🦕 Spellasaurus Admin
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground font-semibold">
              {profile.full_name}
            </span>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
