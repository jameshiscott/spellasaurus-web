import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TABLES, USER_ROLES } from "@/lib/constants";

const bodySchema = z.object({
  schoolId: z.string().uuid("Invalid school ID"),
  name: z.string().min(2, "Class name must be at least 2 characters"),
  schoolYear: z.string().min(1, "School year is required"),
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

    const { schoolId, name, schoolYear } = parsed.data;

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

    // Create the class using service client
    const service = createServiceClient();
    const { data: newClass, error: insertError } = await service
      .from(TABLES.CLASSES)
      .insert({
        school_id: schoolId,
        name,
        school_year: schoolYear,
        teacher_id: null,
      })
      .select("id")
      .single();

    if (insertError || !newClass) {
      console.error("create-class insert error:", insertError);
      return NextResponse.json({ error: "Failed to create class" }, { status: 500 });
    }

    return NextResponse.json({ classId: newClass.id }, { status: 201 });
  } catch (err) {
    console.error("create-class error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
