import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  TABLES,
  USER_ROLES,
  COIN_TRANSACTION_TYPES,
  ARCADE_LIFE_COST,
  ARCADE_STARTING_LIVES,
} from "@/lib/constants";

/**
 * GET /api/arcade/lives?gameId=...
 * Returns the child's remaining lives for a game.
 * Creates an initial row with ARCADE_STARTING_LIVES if none exists.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const gameId = request.nextUrl.searchParams.get("gameId");
    if (!gameId) {
      return NextResponse.json({ error: "gameId required" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serviceClient = createServiceClient();

    // Try to get existing lives row
    // eslint-disable-next-line
    const { data: livesRow } = await (serviceClient as any)
      .from(TABLES.ARCADE_GAME_LIVES)
      .select("lives_remaining")
      .eq("child_id", user.id)
      .eq("game_id", gameId)
      .maybeSingle();

    if (livesRow) {
      return NextResponse.json({ lives: livesRow.lives_remaining });
    }

    // First time playing — create row with starting lives
    // eslint-disable-next-line
    await (serviceClient as any).from(TABLES.ARCADE_GAME_LIVES).insert({
      child_id: user.id,
      game_id: gameId,
      lives_remaining: ARCADE_STARTING_LIVES,
    });

    return NextResponse.json({ lives: ARCADE_STARTING_LIVES });
  } catch (error) {
    console.error("Error in arcade/lives GET:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const BuyLifeSchema = z.object({
  gameId: z.string().uuid(),
});

/**
 * POST /api/arcade/lives
 * Buy one extra life for ARCADE_LIFE_COST coins.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = BuyLifeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }

    const { gameId } = parsed.data;

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serviceClient = createServiceClient();

    // Verify child role and get balance
    const { data: profile } = await serviceClient
      .from(TABLES.USERS)
      .select("role, coin_balance")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== USER_ROLES.CHILD) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const coinBalance = profile.coin_balance as number;
    if (coinBalance < ARCADE_LIFE_COST) {
      return NextResponse.json({ error: "insufficient_coins" }, { status: 400 });
    }

    // Deduct coins atomically
    const { data: updateData, error: updateError } = await serviceClient
      .from(TABLES.USERS)
      .update({ coin_balance: coinBalance - ARCADE_LIFE_COST })
      .eq("id", user.id)
      .gte("coin_balance", ARCADE_LIFE_COST)
      .select("coin_balance")
      .single();

    if (updateError || !updateData) {
      return NextResponse.json({ error: "Failed to deduct coins" }, { status: 500 });
    }

    const newBalance = (updateData as Record<string, unknown>).coin_balance as number;

    // Get or create lives row, then increment
    // eslint-disable-next-line
    const { data: livesRow } = await (serviceClient as any)
      .from(TABLES.ARCADE_GAME_LIVES)
      .select("lives_remaining")
      .eq("child_id", user.id)
      .eq("game_id", gameId)
      .maybeSingle();

    const currentLives = livesRow?.lives_remaining ?? 0;

    // eslint-disable-next-line
    await (serviceClient as any)
      .from(TABLES.ARCADE_GAME_LIVES)
      .upsert(
        {
          child_id: user.id,
          game_id: gameId,
          lives_remaining: currentLives + 1,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "child_id,game_id" }
      );

    // Record coin transaction
    await serviceClient.from(TABLES.COIN_TRANSACTIONS).insert({
      child_id: user.id,
      type: COIN_TRANSACTION_TYPES.SPEND_ARCADE,
      amount: -ARCADE_LIFE_COST,
      balance_after: newBalance,
    });

    return NextResponse.json({
      lives: currentLives + 1,
      newBalance,
    });
  } catch (error) {
    console.error("Error in arcade/lives POST:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
