import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TABLES, USER_ROLES } from "@/lib/constants";

const DeleteWordSchema = z.object({
  wordId: z.string().min(1),
});

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    const parsed = DeleteWordSchema.safeParse(body);
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

    if (profile?.role !== USER_ROLES.TEACHER) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify ownership: spelling_words → spelling_sets → created_by = user.id
    const { data: wordData } = await supabase
      .from(TABLES.SPELLING_WORDS)
      .select(
        `
        id,
        audio_url,
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

    const audioUrl = wordData.audio_url as string | null;

    const serviceClient = createServiceClient();

    // Delete the word
    const { error: deleteError } = await serviceClient
      .from(TABLES.SPELLING_WORDS)
      .delete()
      .eq("id", wordId);

    if (deleteError) {
      console.error("delete-word error:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete word" },
        { status: 500 }
      );
    }

    // Also delete audio from Storage if present
    if (audioUrl) {
      try {
        const url = new URL(audioUrl);
        // Extract path after /storage/v1/object/public/audio/
        const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/audio\/(.+)$/);
        if (pathMatch && pathMatch[1]) {
          await serviceClient.storage.from("audio").remove([pathMatch[1]]);
        }
      } catch {
        // Non-fatal — log and continue
        console.warn("delete-word: could not delete audio file for word", wordId);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("delete-word unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
