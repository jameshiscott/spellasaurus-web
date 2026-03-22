import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TABLES, USER_ROLES } from "@/lib/constants";

const UpdateClassSchema = z.object({
  classId: z.string().uuid(),
  name: z.string().min(2, "Class name must be at least 2 characters"),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = UpdateClassSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { classId, name } = parsed.data;

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Verify ownership
    const { data: existing } = await serviceClient
      .from(TABLES.CLASSES)
      .select("id")
      .eq("id", classId)
      .eq("teacher_id", user.id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    const { error: updateError } = await serviceClient
      .from(TABLES.CLASSES)
      .update({ name })
      .eq("id", classId);

    if (updateError) {
      console.error("update-class error:", updateError);
      return NextResponse.json(
        { error: "Failed to update class" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("update-class unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
