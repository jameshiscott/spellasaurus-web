import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { TABLES, USER_ROLES, COIN_TRANSACTION_TYPES } from '@/lib/constants';

const UnlockSchema = z.object({
  gameId: z.string().uuid(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = UnlockSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { gameId } = parsed.data;

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const childId = user.id;

    // Verify child role and get balance
    const { data: profile, error: profileError } = await supabase
      .from(TABLES.USERS)
      .select('role, coin_balance')
      .eq('id', childId)
      .single();

    if (profileError || !profile || profile.role !== USER_ROLES.CHILD) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const serviceClient = await createServiceClient();

    // Fetch the game
    const { data: game, error: gameError } = await serviceClient
      .from(TABLES.ARCADE_GAMES)
      .select('id, price_coins, is_active')
      .eq('id', gameId)
      .single();

    if (gameError || !game || !game.is_active) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Check if already unlocked
    const { data: existing } = await serviceClient
      .from(TABLES.ARCADE_UNLOCKS)
      .select('id')
      .eq('child_id', childId)
      .eq('game_id', gameId)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: 'already_unlocked' }, { status: 409 });
    }

    // Check coin balance
    const coinBalance = profile.coin_balance as number;
    if (coinBalance < game.price_coins) {
      return NextResponse.json({ error: 'insufficient_coins' }, { status: 400 });
    }

    // Deduct coins atomically
    const { data: updateData, error: updateError } = await serviceClient
      .from(TABLES.USERS)
      .update({ coin_balance: coinBalance - game.price_coins })
      .eq('id', childId)
      .gte('coin_balance', game.price_coins)
      .select('coin_balance')
      .single();

    if (updateError || !updateData) {
      return NextResponse.json({ error: 'Failed to deduct coins' }, { status: 500 });
    }

    const newBalance = (updateData as Record<string, unknown>).coin_balance as number;

    // Insert unlock record
    const { error: unlockError } = await serviceClient
      .from(TABLES.ARCADE_UNLOCKS)
      .insert({ child_id: childId, game_id: gameId });

    if (unlockError) {
      console.error('Arcade unlock insert error:', unlockError);
      // Refund coins
      await serviceClient
        .from(TABLES.USERS)
        .update({ coin_balance: coinBalance })
        .eq('id', childId);
      return NextResponse.json({ error: 'Failed to unlock game' }, { status: 500 });
    }

    // Record coin transaction
    await serviceClient.from(TABLES.COIN_TRANSACTIONS).insert({
      child_id: childId,
      type: COIN_TRANSACTION_TYPES.SPEND_ARCADE,
      amount: -game.price_coins,
      balance_after: newBalance,
      related_item_id: gameId,
    });

    return NextResponse.json({ success: true, newBalance });
  } catch (error) {
    console.error('Unexpected error in arcade/unlock:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
