import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TABLES, USER_ROLES } from "@/lib/constants";

const bodySchema = z.object({
  classId: z.string().uuid("Invalid class ID"),
  username: z.string().min(1, "Username is required"),
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

    const { classId, username } = parsed.data;

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

    const schoolId = (cls as { school_id: string }).school_id;

    // Verify admin owns the school
    const { data: school } = await supabase
      .from(TABLES.SCHOOLS)
      .select("id")
      .eq("id", schoolId)
      .contains("admin_ids", [user.id])
      .single();

    if (!school) {
      return NextResponse.json(
        { error: "Access denied to this class" },
        { status: 403 }
      );
    }

    // Look up child by display_name (username)
    const serviceClient = await createServiceClient();
    const { data: child } = await serviceClient
      .from(TABLES.USERS)
      .select("id, role, full_name")
      .eq("display_name", username.trim())
      .single();

    if (!child) {
      return NextResponse.json(
        { error: `No child found with username "${username}"` },
        { status: 404 }
      );
    }

    if ((child as { role: string }).role !== USER_ROLES.CHILD) {
      return NextResponse.json(
        { error: "That user is not a child account" },
        { status: 400 }
      );
    }

    const childId = (child as { id: string }).id;

    // Insert into class_students
    const { error: insertError } = await serviceClient
      .from(TABLES.CLASS_STUDENTS)
      .insert({
        class_id: classId,
        child_id: childId,
        school_id: schoolId,
      });

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "Student is already enrolled in this class" },
          { status: 409 }
        );
      }
      console.error("enrol-student insert error:", insertError);
      return NextResponse.json({ error: "Failed to enrol student" }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("admin/enrol-student error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
