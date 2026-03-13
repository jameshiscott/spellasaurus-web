import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TABLES, USER_ROLES } from "@/lib/constants";

const bodySchema = z.object({
  schoolId: z.string().uuid("Invalid school ID"),
  email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = bodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid request" },
        { status: 400 }
      );
    }

    const { schoolId, email } = parsed.data;

    // Verify authenticated school admin
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from(TABLES.USERS)
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== USER_ROLES.SCHOOL_ADMIN) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify admin owns this school
    const { data: school } = await supabase
      .from(TABLES.SCHOOLS)
      .select("id")
      .eq("id", schoolId)
      .contains("admin_ids", [user.id])
      .single();

    if (!school) {
      return NextResponse.json(
        { error: "School not found or access denied" },
        { status: 403 }
      );
    }

    // Find teacher by email using service client (email may not be in RLS-accessible columns)
    const service = createServiceClient();
    const { data: teacher, error: teacherError } = await service
      .from(TABLES.USERS)
      .select("id, full_name, role")
      .eq("email", email)
      .eq("role", USER_ROLES.TEACHER)
      .single();

    if (teacherError || !teacher) {
      return NextResponse.json(
        { error: "No teacher account found with that email" },
        { status: 404 }
      );
    }

    const teacherId = (teacher as { id: string }).id;
    const teacherName = (teacher as { full_name: string }).full_name;

    // Link teacher to school
    const { error: updateError } = await service
      .from(TABLES.USERS)
      .update({ school_id: schoolId })
      .eq("id", teacherId);

    if (updateError) {
      console.error("add-teacher update error:", updateError);
      return NextResponse.json({ error: "Failed to link teacher to school" }, { status: 500 });
    }

    return NextResponse.json({ teacherId, teacherName }, { status: 200 });
  } catch (err) {
    console.error("add-teacher error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
