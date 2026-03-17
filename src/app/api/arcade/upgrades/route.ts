import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { TABLES, USER_ROLES, COIN_TRANSACTION_TYPES } from '@/lib/constants';
import {
  getUpgrade,
  canPurchase,
} from '@/lib/emoji-invaders-upgrades';

const PurchaseSchema = z.object({
  gameId: z.string().uuid(),
  upgradeId: z.string().min(1),
});

/** GET — list upgrades the child owns for a game. */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const gameId = request.nextUrl.searchParams.get('gameId');
    if (!gameId) {
      return NextResponse.json({ error: 'gameId required' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceClient = createServiceClient();

    // eslint-disable-next-line
    const { data: rows } = await (serviceClient as any)
      .from(TABLES.ARCADE_UPGRADES)
      .select('upgrade_id')
      .eq('child_id', user.id)
      .eq('game_id', gameId);

    const upgradeIds = (rows ?? []).map(
      (r: { upgrade_id: string }) => r.upgrade_id
    );

    return NextResponse.json({ upgrades: upgradeIds });
  } catch (error) {
    console.error('GET /api/arcade/upgrades error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** POST — purchase an upgrade for a game. */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = PurchaseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { gameId, upgradeId } = parsed.data;

    // Validate upgrade exists in catalog
    const upgrade = getUpgrade(upgradeId);
    if (!upgrade) {
      return NextResponse.json({ error: 'Unknown upgrade' }, { status: 400 });
    }

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
    const { data: profile } = await supabase
      .from(TABLES.USERS)
      .select('role, coin_balance')
      .eq('id', childId)
      .single();

    if (!profile || profile.role !== USER_ROLES.CHILD) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const serviceClient = createServiceClient();

    // Fetch current owned upgrades
    // eslint-disable-next-line
    const { data: owned } = await (serviceClient as any)
      .from(TABLES.ARCADE_UPGRADES)
      .select('upgrade_id')
      .eq('child_id', childId)
      .eq('game_id', gameId);

    const ownedIds = new Set<string>(
      (owned ?? []).map((r: { upgrade_id: string }) => r.upgrade_id)
    );

    // Check prerequisites
    if (!canPurchase(upgradeId, ownedIds)) {
      return NextResponse.json(
        { error: 'Cannot purchase — already owned or missing prerequisite' },
        { status: 400 }
      );
    }

    // Check coin balance
    const coinBalance = profile.coin_balance as number;
    if (coinBalance < upgrade.cost) {
      return NextResponse.json({ error: 'insufficient_coins' }, { status: 400 });
    }

    // Deduct coins atomically
    const { data: updateData, error: updateError } = await serviceClient
      .from(TABLES.USERS)
      .update({ coin_balance: coinBalance - upgrade.cost })
      .eq('id', childId)
      .gte('coin_balance', upgrade.cost)
      .select('coin_balance')
      .single();

    if (updateError || !updateData) {
      return NextResponse.json({ error: 'Failed to deduct coins' }, { status: 500 });
    }

    const newBalance = (updateData as Record<string, unknown>).coin_balance as number;

    // Insert upgrade record
    // eslint-disable-next-line
    const { error: insertError } = await (serviceClient as any)
      .from(TABLES.ARCADE_UPGRADES)
      .insert({
        child_id: childId,
        game_id: gameId,
        upgrade_id: upgradeId,
      });

    if (insertError) {
      console.error('Arcade upgrade insert error:', insertError);
      // Refund coins
      await serviceClient
        .from(TABLES.USERS)
        .update({ coin_balance: coinBalance })
        .eq('id', childId);
      return NextResponse.json({ error: 'Failed to save upgrade' }, { status: 500 });
    }

    // Record coin transaction
    await serviceClient.from(TABLES.COIN_TRANSACTIONS).insert({
      child_id: childId,
      type: COIN_TRANSACTION_TYPES.SPEND_ARCADE,
      amount: -upgrade.cost,
      balance_after: newBalance,
      related_item_id: gameId,
    });

    return NextResponse.json({
      success: true,
      newBalance,
      upgrades: [...ownedIds, upgradeId],
    });
  } catch (error) {
    console.error('POST /api/arcade/upgrades error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
