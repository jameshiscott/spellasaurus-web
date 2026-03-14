import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TABLES, USER_ROLES } from "@/lib/constants";

const AddWordSchema = z.object({
  setId: z.string().min(1),
  word: z.string().min(1, "Word is required"),
  hint: z.string().optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    const parsed = AddWordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { setId, word, hint } = parsed.data;

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

    const serviceClient = createServiceClient();

    // Verify teacher owns the set — use service client to bypass RLS
    const { data: spellingSet } = await serviceClient
      .from(TABLES.SPELLING_SETS)
      .select("id")
      .eq("id", setId)
      .eq("created_by", user.id)
      .single();

    if (!spellingSet) {
      return NextResponse.json(
        { error: "Spelling set not found or not owned by you" },
        { status: 404 }
      );
    }

    // Get current max sort_order for this set
    const { data: maxOrderData } = await serviceClient
      .from(TABLES.SPELLING_WORDS)
      .select("sort_order")
      .eq("set_id", setId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .single();

    const nextSortOrder = (maxOrderData?.sort_order ?? 0) + 1;
    const { data: newWord, error: insertError } = await serviceClient
      .from(TABLES.SPELLING_WORDS)
      .insert({
        set_id: setId,
        word: word.trim(),
        hint: hint?.trim() || null,
        sort_order: nextSortOrder,
      })
      .select("id")
      .single();

    if (insertError || !newWord) {
      console.error("add-word insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to add word" },
        { status: 500 }
      );
    }

    // Fire-and-forget AI generation
    const origin = new URL(request.url).origin;
    fetch(`${origin}/api/words/generate-content`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") ?? "",
      },
      body: JSON.stringify({ wordId: newWord.id }),
    }).catch(() => {}); // ignore errors — teacher can manually retry

    return NextResponse.json({ wordId: newWord.id }, { status: 201 });
  } catch (err) {
    console.error("add-word unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
