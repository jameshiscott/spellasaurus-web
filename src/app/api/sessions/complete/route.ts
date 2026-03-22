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
  wasRetry: z.boolean().optional(),
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

    // Only award fastest-ever bonus if there IS a prior session (first attempt sets baseline)
    const isFastestEverSet = fastestSession != null && timeTakenMs < fastestSession.time_taken_ms;
    const fastestBonus = isFastestEverSet ? COINS_FASTEST_EVER : 0;

    // Add perfect score bonus if 100%
    const isPerfect = correctCount === totalWords;
    const perfectBonus = isPerfect ? COINS_PERFECT_BONUS : 0;
    // Round up to nearest integer — DB columns are INTEGER
    const rawCoins = wordCoins + perfectBonus + fastestBonus;
    const coinsEarned = Math.ceil(rawCoins);
    const wasRoundedUp = coinsEarned > rawCoins;

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

    // Pick a random rounding quip if we rounded up
    let roundingQuip: string | null = null;
    if (wasRoundedUp) {
      const quips = [
        "Bonus 0.5: just because.",
        "Whole numbers are nicer.",
        "Decimals are rubbish. Have the point.",
        "A tiny boost for a job well done.",
        "Your score just got a little glow-up.",
        "Extra 0.5 unlocked!",
        "A little bonus makes everything better.",
        "Your score deserved a little sparkle.",
        "Tiny bonus. Big energy.",
        "A cheerful 0.5 for you!",
        "Score upgrade complete.",
        "That deserved a little extra.",
        "Bonus points have entered the chat.",
        "Have a bonus 0.5 on the house.",
        "A little extra for extra effort.",
        "Your score looked like it wanted a friend.",
        "Half a point, full of joy.",
        "This set earned a tiny celebration.",
        "A bonus bump for being brilliant.",
        "Your score has been officially improved.",
        "Just adding a little extra shine.",
        "Tiny bonus incoming!",
        "A happy little 0.5 for you.",
        "Whole numbers feel more complete.",
        "Consider this a bonus sprinkle.",
        "Your score has been gently upgraded.",
        "Decimals are untidy. Fixed it.",
        "A small boost for big spelling energy.",
        "Your points have multiplied... a bit.",
        "This score needed a little pizzazz.",
        "Bonus mode: activated.",
        "A tiny top-up for a terrific set.",
        "Your score just got fancier.",
        "Half a point of pure kindness.",
        "Adding 0.5 for style.",
        "This set deserves a bonus wiggle.",
        "Your score has been polished.",
        "A little extra never hurt anyone.",
        "Bonus 0.5, courtesy of good vibes.",
        "That score deserved a tiny upgrade.",
        "Have some extra points for fun.",
        "Just rounding life in a better direction.",
        "Your score got a bonus bounce.",
        "A neat little extra for you.",
        "Points have been added for awesomeness.",
        "This set earned a little fanfare.",
        "Your score now comes with extra sparkle.",
        "A tiny boost, because why not?",
        "Half a point makes everything happier.",
        "Bonus 0.5 awarded with great enthusiasm.",
        "Bonus 0.5 awarded!",
        "Tiny boost added!",
        "Score upgrade: complete.",
        "Extra points for extra fun.",
        "A little bonus for this set!",
        "Decimals are rubbish. Sorted.",
        "Whole numbers win again.",
        "Bonus sparkle applied.",
        "Score boosted!",
        "A cheerful extra 0.5!",
        "Tiny bonus incoming!",
        "Points added for excellence.",
        "This set gets a little extra.",
        "Half a point, coming right up.",
        "Score improved. Everyone wins.",
      ];
      roundingQuip = quips[Math.floor(Math.random() * quips.length)];
    }

    return NextResponse.json(
      {
        sessionId,
        coinsEarned,
        perfectBonus,
        fastestBonus,
        isFastestEverSet,
        roundingQuip,
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
