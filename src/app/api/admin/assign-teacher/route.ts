import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TABLES, USER_ROLES } from "@/lib/constants";

const bodySchema = z.object({
  classId: z.string().uuid("Invalid class ID"),
  teacherId: z.string().uuid("Invalid teacher ID").nullable(),
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

    const { classId, teacherId } = parsed.data;

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

    // Fetch class to get school_id
    const { data: cls } = await supabase
      .from(TABLES.CLASSES)
      .select("id, school_id")
      .eq("id", classId)
      .single();

    if (!cls) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Verify admin owns the school
    const { data: school } = await supabase
      .from(TABLES.SCHOOLS)
      .select("id")
      .eq("id", (cls as { school_id: string }).school_id)
      .contains("admin_ids", [user.id])
      .single();

    if (!school) {
      return NextResponse.json(
        { error: "Access denied to this class" },
        { status: 403 }
      );
    }

    const schoolId = (cls as { school_id: string }).school_id;

    // If assigning a teacher, verify they exist and have the correct role
    if (teacherId !== null) {
      const { data: teacher } = await supabase
        .from(TABLES.USERS)
        .select("id, role, school_id")
        .eq("id", teacherId)
        .single();

      if (!teacher) {
        return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
      }

      if ((teacher as { role: string }).role !== USER_ROLES.TEACHER) {
        return NextResponse.json(
          { error: "User is not a teacher" },
          { status: 400 }
        );
      }

      // Update teacher's school_id if not already set
      const service = createServiceClient();

      await service
        .from(TABLES.CLASSES)
        .update({ teacher_id: teacherId })
        .eq("id", classId);

      if ((teacher as { school_id: string | null }).school_id === null) {
        await service
          .from(TABLES.USERS)
          .update({ school_id: schoolId })
          .eq("id", teacherId);
      }
    } else {
      // Remove teacher
      const service = createServiceClient();
      await service
        .from(TABLES.CLASSES)
        .update({ teacher_id: null })
        .eq("id", classId);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("assign-teacher error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
