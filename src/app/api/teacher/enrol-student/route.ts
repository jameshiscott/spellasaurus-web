import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TABLES, USER_ROLES } from "@/lib/constants";

const bodySchema = z.object({
  classId: z.string().uuid("Invalid class ID"),
  childId: z.string().uuid("Invalid child ID"),
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

    const { classId, childId } = parsed.data;

    // Verify authenticated teacher
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

    if (profile?.role !== USER_ROLES.TEACHER) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify teacher owns the class
    const { data: cls } = await supabase
      .from(TABLES.CLASSES)
      .select("id, school_id")
      .eq("id", classId)
      .eq("teacher_id", user.id)
      .single();

    if (!cls) {
      return NextResponse.json(
        { error: "Class not found or not owned by you" },
        { status: 404 }
      );
    }

    const schoolId = (cls as { school_id: string }).school_id;

    // Verify the child exists and is a child role
    const serviceClient = createServiceClient();
    const { data: child } = await serviceClient
      .from(TABLES.USERS)
      .select("id, role")
      .eq("id", childId)
      .single();

    if (!child) {
      return NextResponse.json(
        { error: "Child not found" },
        { status: 404 }
      );
    }

    if ((child as { role: string }).role !== USER_ROLES.CHILD) {
      return NextResponse.json(
        { error: "That user is not a child account" },
        { status: 400 }
      );
    }

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
    console.error("teacher/enrol-student error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
