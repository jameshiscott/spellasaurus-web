import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TABLES, USER_ROLES } from "@/lib/constants";

const BooleanSettingSchema = z.object({
  childId: z.string().min(1),
  field: z.enum([
    "play_tts_audio",
    "show_description",
    "show_example_sentence",
    "leaderboard_opt_in",
  ]),
  value: z.boolean(),
});

const KeyboardLayoutSchema = z.object({
  childId: z.string().min(1),
  field: z.literal("keyboard_layout"),
  value: z.enum(["qwerty", "abc"]),
});

const UpdateSettingsSchema = z.union([BooleanSettingSchema, KeyboardLayoutSchema]);

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    const parsed = UpdateSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { childId, field, value } = parsed.data;

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

    // Verify parent owns child
    const { data: ownership } = await supabase
      .from(TABLES.PARENT_CHILDREN)
      .select("id")
      .eq("parent_id", user.id)
      .eq("child_id", childId)
      .single();

    if (!ownership) {
      return NextResponse.json(
        { error: "Child not found or not owned by you" },
        { status: 404 }
      );
    }

    // Upsert settings using service role
    const serviceClient = createServiceClient();
    const { error: upsertError } = await serviceClient
      .from(TABLES.CHILD_PRACTICE_SETTINGS)
      .upsert(
        {
          child_id: childId,
          [field]: value,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "child_id" }
      );

    if (upsertError) {
      console.error("update-settings upsert error:", upsertError);
      return NextResponse.json(
        { error: "Failed to update settings" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("update-settings unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
