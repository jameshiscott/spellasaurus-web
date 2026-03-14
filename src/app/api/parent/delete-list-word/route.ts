import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TABLES, USER_ROLES } from "@/lib/constants";

const DeleteListWordSchema = z.object({
  wordId: z.string().min(1),
});

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    const parsed = DeleteListWordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { wordId } = parsed.data;

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

    const serviceClient = createServiceClient();

    // Verify ownership: word → spelling_set → created_by = user.id AND type = 'personal'
    const { data: word } = await serviceClient
      .from(TABLES.SPELLING_WORDS)
      .select("id, spelling_sets!spelling_words_set_id_fkey(created_by, type)")
      .eq("id", wordId)
      .single();

    if (!word) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }

    const ownerSet = word.spelling_sets;
    if (
      !ownerSet ||
      ownerSet.created_by !== user.id ||
      ownerSet.type !== "personal"
    ) {
      return NextResponse.json(
        { error: "Word not found or not owned by you" },
        { status: 403 }
      );
    }
    const { error: deleteError } = await serviceClient
      .from(TABLES.SPELLING_WORDS)
      .delete()
      .eq("id", wordId);

    if (deleteError) {
      console.error("delete-list-word delete error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete word" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("delete-list-word unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
