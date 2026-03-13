import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getISOWeek } from "date-fns";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TABLES, USER_ROLES } from "@/lib/constants";

const CreateListSchema = z.object({
  name: z.string().min(2, "List name must be at least 2 characters"),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    const parsed = CreateListSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name } = parsed.data;

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

    if (profile?.role !== USER_ROLES.PARENT) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();
    const weekStart = now.toISOString().split("T")[0];
    const weekNumber = getISOWeek(now);

    const serviceClient = createServiceClient();
    const { data: newSet, error: insertError } = await serviceClient
      .from(TABLES.SPELLING_SETS)
      .insert({
        name,
        created_by: user.id,
        type: "personal",
        week_start: weekStart,
        week_number: weekNumber,
        class_id: null,
      })
      .select("id")
      .single();

    if (insertError || !newSet) {
      console.error("create-list insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to create list" },
        { status: 500 }
      );
    }

    return NextResponse.json({ setId: newSet.id }, { status: 201 });
  } catch (err) {
    console.error("create-list unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
