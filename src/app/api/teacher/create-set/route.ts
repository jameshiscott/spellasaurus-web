import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getISOWeek } from "date-fns";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TABLES, USER_ROLES } from "@/lib/constants";

const CreateSetSchema = z.object({
  classId: z.string().min(1),
  name: z.string().min(2, "Set name must be at least 2 characters"),
  weekStart: z.string().min(1, "Week start date is required"),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    const parsed = CreateSetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { classId, name, weekStart } = parsed.data;

    // Auth check
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

    // Verify teacher owns the class
    const { data: cls } = await supabase
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

    // Compute week number from the weekStart date
    const weekStartDate = new Date(weekStart);
    const weekNumber = getISOWeek(weekStartDate);

    // Insert the spelling set using service role
    const serviceClient = createServiceClient();
    const { data: newSet, error: insertError } = await serviceClient
      .from(TABLES.SPELLING_SETS)
      .insert({
        name,
        class_id: classId,
        created_by: user.id,
        week_start: weekStart,
        week_number: weekNumber,
        type: "class",
      })
      .select("id")
      .single();

    if (insertError || !newSet) {
      console.error("create-set insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to create spelling set" },
        { status: 500 }
      );
    }

    return NextResponse.json({ setId: newSet.id }, { status: 201 });
  } catch (err) {
    console.error("create-set unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
