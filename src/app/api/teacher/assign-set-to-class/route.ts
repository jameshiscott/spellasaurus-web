import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TABLES, USER_ROLES } from "@/lib/constants";

const bodySchema = z.object({
  setId: z.string().uuid("Invalid set ID"),
  classId: z.string().uuid("Invalid class ID"),
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

    const { setId, classId } = parsed.data;

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

    const serviceClient = createServiceClient();

    // Verify teacher created the set — use service client to bypass RLS
    const { data: set } = await serviceClient
      .from(TABLES.SPELLING_SETS)
      .select("id")
      .eq("id", setId)
      .eq("created_by", user.id)
      .single();

    if (!set) {
      return NextResponse.json(
        { error: "Spelling set not found or not created by you" },
        { status: 404 }
      );
    }

    // Verify teacher owns the target class
    const { data: cls } = await serviceClient
      .from(TABLES.CLASSES)
      .select("id")
      .eq("id", classId)
      .eq("teacher_id", user.id)
      .single();

    if (!cls) {
      return NextResponse.json(
        { error: "Class not found or not owned by you" },
        { status: 404 }
      );
    }

    // Insert into class_spelling_sets
    // eslint-disable-next-line
    const { error: insertError } = await (serviceClient as any)
      .from(TABLES.CLASS_SPELLING_SETS)
      .insert({
        class_id: classId,
        set_id: setId,
      });

    if (insertError) {
      if (insertError.code === "23505") {
        return NextResponse.json(
          { error: "Set is already assigned to this class" },
          { status: 409 }
        );
      }
      console.error("assign-set-to-class insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to assign set to class" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("teacher/assign-set-to-class error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
