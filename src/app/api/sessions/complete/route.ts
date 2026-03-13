import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TABLES, USER_ROLES } from "@/lib/constants";
import { calculateCoinsEarned } from "@/lib/utils";

const WordResultSchema = z.object({
  wordId: z.string().uuid(),
  word: z.string(),
  userAnswer: z.string(),
  wasCorrect: z.boolean(),
  timeTakenMs: z.number().int().min(0),
});

const CompleteSessionSchema = z.object({
  setId: z.string().uuid(),
  correctCount: z.number().int().min(0),
  totalWords: z.number().int().min(1),
  timeTakenMs: z.number().int().min(0),
  wordResults: z.array(WordResultSchema).max(10),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();

    const parsed = CompleteSessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { setId, correctCount, totalWords, timeTakenMs, wordResults } =
      parsed.data;

    // Auth check
    const supabase = await createClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const childId = session.user.id;

    // Role check
    const { data: currentUser, error: userError } = await supabase
      .from(TABLES.USERS)
      .select("role")
      .eq("id", childId)
      .single();

    if (userError || !currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (currentUser.role !== USER_ROLES.CHILD) {
      return NextResponse.json(
        { error: "Forbidden: child role required" },
        { status: 403 }
      );
    }

    // Verify access to set: class membership or personal set
    const { data: classEnrolments } = await supabase
      .from(TABLES.CLASS_STUDENTS)
      .select("class_id")
      .eq("child_id", childId);

    const classIds = classEnrolments?.map((e) => e.class_id) ?? [];

    let hasAccess = false;

    if (classIds.length > 0) {
      const { data: classSetAccess } = await supabase
        .from(TABLES.SPELLING_SETS)
        .select("id")
        .eq("id", setId)
        .in("class_id", classIds)
        .limit(1);
      if (classSetAccess && classSetAccess.length > 0) hasAccess = true;
    }

    if (!hasAccess) {
      const { data: personalAccess } = await supabase
        .from(TABLES.CHILD_PERSONAL_SETS)
        .select("id")
        .eq("child_id", childId)
        .eq("set_id", setId)
        .limit(1);
      if (personalAccess && personalAccess.length > 0) hasAccess = true;
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Forbidden: no access to this set" },
        { status: 403 }
      );
    }

    const coinsEarned = calculateCoinsEarned(correctCount);

    const serviceClient = createServiceClient();

    // Call the existing RPC to record session + update stats + award coins
    const { data: rpcData, error: rpcError } = await serviceClient.rpc(
      "complete_spelling_session",
      {
        p_child_id: childId,
        p_set_id: setId,
        p_correct_count: correctCount,
        p_total_words: totalWords,
        p_coins_earned: coinsEarned,
        p_time_taken_ms: timeTakenMs,
      }
    );

    if (rpcError) {
      console.error("RPC complete_spelling_session error:", rpcError);
      return NextResponse.json(
        { error: "Failed to complete session" },
        { status: 500 }
      );
    }

    const result = rpcData as unknown as { sessionId: string; newBalance: number } | null;
    const sessionId = result?.sessionId ?? null;

    // Store word_results on the created session row
    if (sessionId) {
      const { error: updateError } = await serviceClient
        .from(TABLES.PRACTICE_SESSIONS)
        .update({ word_results: wordResults })
        .eq("id", sessionId);

      if (updateError) {
        // Non-fatal: log but still return success so the child sees results
        console.error("Failed to store word_results:", updateError);
      }
    }

    return NextResponse.json(
      {
        sessionId,
        coinsEarned,
        newBalance: result?.newBalance ?? null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error in sessions/complete:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
