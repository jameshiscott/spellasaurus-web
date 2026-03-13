import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TABLES, USER_ROLES } from "@/lib/constants";

const UpdateWordSchema = z
  .object({
    wordId: z.string().min(1),
    hint: z.string().optional(),
    sortOrder: z.number().int().nonnegative().optional(),
  })
  .refine((data) => data.hint !== undefined || data.sortOrder !== undefined, {
    message: "At least one of hint or sortOrder must be provided",
  });

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    const parsed = UpdateWordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { wordId, hint, sortOrder } = parsed.data;

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

    // Verify ownership: spelling_words → spelling_sets → created_by = user.id
    const { data: wordData } = await supabase
      .from(TABLES.SPELLING_WORDS)
      .select(
        `
        id,
        spelling_sets!inner ( created_by )
      `
      )
      .eq("id", wordId)
      .eq("spelling_sets.created_by", user.id)
      .single();

    if (!wordData) {
      return NextResponse.json(
        { error: "Word not found or not owned by you" },
        { status: 404 }
      );
    }

    // Build the update object from only the fields that were sent
    const updatePayload: { hint?: string | null; sort_order?: number } = {};

    if (hint !== undefined) {
      updatePayload.hint = hint.trim() || null;
    }
    if (sortOrder !== undefined) {
      updatePayload.sort_order = sortOrder;
    }

    const serviceClient = createServiceClient();
    const { error: updateError } = await serviceClient
      .from(TABLES.SPELLING_WORDS)
      .update(updatePayload)
      .eq("id", wordId);

    if (updateError) {
      console.error("update-word error:", updateError);
      return NextResponse.json(
        { error: "Failed to update word" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("update-word unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
