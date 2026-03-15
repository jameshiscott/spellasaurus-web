import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TABLES, USER_ROLES, COINS_PERFECT_BONUS, COINS_FASTEST_EVER } from "@/lib/constants";
import { calculateWordCoins } from "@/lib/utils";

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

    const serviceClient = createServiceClient();

    // Verify access to set: class membership (junction + legacy) or personal set
    const { data: classEnrolments } = await supabase
      .from(TABLES.CLASS_STUDENTS)
      .select("class_id")
      .eq("child_id", childId);

    const classIds = classEnrolments?.map((e) => e.class_id) ?? [];

    let hasAccess = false;

    if (classIds.length > 0) {
      // Check junction table
      // eslint-disable-next-line
      const { data: junctionAccess } = await (serviceClient as any)
        .from(TABLES.CLASS_SPELLING_SETS)
        .select("set_id")
        .eq("set_id", setId)
        .in("class_id", classIds)
        .limit(1);
      if (junctionAccess && junctionAccess.length > 0) hasAccess = true;

      // Check legacy class_id on spelling_sets
      if (!hasAccess) {
        const { data: legacyAccess } = await serviceClient
          .from(TABLES.SPELLING_SETS)
          .select("id")
          .eq("id", setId)
          .in("class_id", classIds)
          .limit(1);
        if (legacyAccess && legacyAccess.length > 0) hasAccess = true;
      }
    }

    if (!hasAccess) {
      const { data: personalAccess } = await serviceClient
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

    // Fetch child's average time, word streak
    const { data: childStats } = await serviceClient
      .from(TABLES.CHILD_STATS)
      .select("average_time_ms, current_word_streak, best_word_streak")
      .eq("child_id", childId)
      .single();

    const avgTimeMs = childStats?.average_time_ms ?? 0;
    let currentWordStreak = childStats?.current_word_streak ?? 0;

    // Calculate per-word coin breakdown (correctness + speed vs avg)
    const { breakdown, totalCoins: wordCoins } = calculateWordCoins(
      wordResults,
      avgTimeMs,
    );

    // Check if this session is the fastest ever for this set
    const { data: fastestSession } = await serviceClient
      .from(TABLES.PRACTICE_SESSIONS)
      .select("time_taken_ms")
      .eq("child_id", childId)
      .eq("set_id", setId)
      .order("time_taken_ms", { ascending: true })
      .limit(1)
      .maybeSingle();

    const isFastestEverSet = !fastestSession || timeTakenMs < fastestSession.time_taken_ms;
    const fastestBonus = isFastestEverSet ? COINS_FASTEST_EVER : 0;

    // Add perfect score bonus if 100%
    const isPerfect = correctCount === totalWords;
    const perfectBonus = isPerfect ? COINS_PERFECT_BONUS : 0;
    const coinsEarned = wordCoins + perfectBonus + fastestBonus;

    // Build enriched word_results with coin breakdown
    const enrichedWordResults = wordResults.map((wr) => {
      const coinInfo = breakdown.find((b) => b.wordId === wr.wordId);
      return {
        ...wr,
        coinsEarned: coinInfo?.total ?? 0,
        isFasterThanAvg: coinInfo?.isFasterThanAvg ?? false,
      };
    });

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

    const result = rpcData as unknown as { sessionId: string; newBalance: number; coinsEarned: number } | null;
    const sessionId = result?.sessionId ?? null;

    // Calculate word streak: walk through results in order
    for (const wr of wordResults) {
      if (wr.wasCorrect) {
        currentWordStreak++;
      } else {
        currentWordStreak = 0;
      }
    }
    const bestWordStreak = Math.max(childStats?.best_word_streak ?? 0, currentWordStreak);

    // Update word streak in child_stats
    await serviceClient
      .from(TABLES.CHILD_STATS)
      .update({
        current_word_streak: currentWordStreak,
        best_word_streak: bestWordStreak,
      })
      .eq("child_id", childId);

    // Fetch updated day streak info
    const { data: updatedStats } = await serviceClient
      .from(TABLES.CHILD_STATS)
      .select("current_streak, best_streak")
      .eq("child_id", childId)
      .single();

    const currentDayStreak = updatedStats?.current_streak ?? 1;
    const bestDayStreak = updatedStats?.best_streak ?? 1;

    // Store enriched word_results on the created session row
    if (sessionId) {
      const { error: updateError } = await serviceClient
        .from(TABLES.PRACTICE_SESSIONS)
        .update({ word_results: enrichedWordResults })
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
        perfectBonus,
        fastestBonus,
        isFastestEverSet,
        newBalance: result?.newBalance ?? null,
        currentDayStreak,
        bestDayStreak,
        currentWordStreak,
        bestWordStreak,
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
