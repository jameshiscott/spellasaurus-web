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

    // Verify teacher created the set
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

    // Delete from class_spelling_sets junction table
    // eslint-disable-next-line
    const { error: deleteError } = await (serviceClient as any)
      .from(TABLES.CLASS_SPELLING_SETS)
      .delete()
      .eq("set_id", setId)
      .eq("class_id", classId);

    if (deleteError) {
      console.error("unassign-set-from-class delete error:", deleteError);
      return NextResponse.json(
        { error: "Failed to unassign set from class" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("teacher/unassign-set-from-class error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
