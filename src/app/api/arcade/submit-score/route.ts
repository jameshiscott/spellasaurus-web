import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { TABLES, USER_ROLES } from "@/lib/constants";

const SubmitScoreSchema = z.object({
  gameId: z.string().uuid(),
  score: z.number().int().min(0),
  livesRemaining: z.number().int().min(0),
});

/**
 * POST /api/arcade/submit-score
 * Saves a game score and updates remaining lives.
 * Called when the game ends (game over, won, or quit).
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = SubmitScoreSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }

    const { gameId, score, livesRemaining } = parsed.data;

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serviceClient = createServiceClient();

    // Verify child role
    const { data: profile } = await serviceClient
      .from(TABLES.USERS)
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== USER_ROLES.CHILD) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Save the score
    // eslint-disable-next-line
    await (serviceClient as any).from(TABLES.ARCADE_HIGH_SCORES).insert({
      child_id: user.id,
      game_id: gameId,
      score,
    });

    // Update remaining lives
    // eslint-disable-next-line
    await (serviceClient as any)
      .from(TABLES.ARCADE_GAME_LIVES)
      .upsert(
        {
          child_id: user.id,
          game_id: gameId,
          lives_remaining: livesRemaining,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "child_id,game_id" }
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in arcade/submit-score:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
