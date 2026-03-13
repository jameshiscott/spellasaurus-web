import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TABLES, USER_ROLES } from "@/lib/constants";

export default async function SetsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from(TABLES.USERS)
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== USER_ROLES.TEACHER) redirect("/login");
  const { data: cls } = await supabase
    .from(TABLES.CLASSES)
    .select("id")
    .eq("id", classId)
    .eq("teacher_id", user.id)
    .single();
  if (!cls) redirect("/teacher");
  return <>{children}</>;
}
