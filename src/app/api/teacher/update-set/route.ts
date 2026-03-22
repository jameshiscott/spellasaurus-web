import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getISOWeek } from "date-fns";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TABLES, USER_ROLES } from "@/lib/constants";

const UpdateSetSchema = z.object({
  setId: z.string().uuid(),
  name: z.string().min(2, "Set name must be at least 2 characters").optional(),
  weekStart: z.string().min(1).optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = UpdateSetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { setId, name, weekStart } = parsed.data;

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
      .from(TABLES.SPELLING_SETS)
      .select("id")
      .eq("id", setId)
      .eq("created_by", user.id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Set not found" }, { status: 404 });
    }

    // Build update payload
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (weekStart !== undefined) {
      updates.week_start = weekStart;
      updates.week_number = getISOWeek(new Date(weekStart));

      // Auto-deactivate if in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(weekStart) > today) {
        updates.is_active = false;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const { error: updateError } = await serviceClient
      .from(TABLES.SPELLING_SETS)
      .update(updates)
      .eq("id", setId);

    if (updateError) {
      console.error("update-set error:", updateError);
      return NextResponse.json(
        { error: "Failed to update set" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("update-set unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
