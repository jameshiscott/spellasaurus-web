import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TABLES, USER_ROLES } from "@/lib/constants";

/**
 * Root page — redirects authenticated users to their role dashboard,
 * unauthenticated users to /login.
 */
export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from(TABLES.USERS)
    .select("role")
    .eq("id", user.id)
    .single();

  switch (profile?.role) {
    case USER_ROLES.CHILD:
      redirect("/child");
    case USER_ROLES.PARENT:
      redirect("/parent");
    case USER_ROLES.TEACHER:
      redirect("/teacher");
    case USER_ROLES.SCHOOL_ADMIN:
      redirect("/admin");
    default:
      redirect("/login");
  }
}
