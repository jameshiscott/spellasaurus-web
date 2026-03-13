import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { TABLES, USER_ROLES } from '@/lib/constants';

const PurchaseSchema = z.object({
  itemId: z.string().min(1),
});

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

    const { itemId } = parsed.data;

    const supabase = await createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const childId = session.user.id;

    const { data: currentUser, error: userError } = await supabase
      .from(TABLES.USERS)
      .select('role, coin_balance')
      .eq('id', childId)
      .single();

    if (userError || !currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.role !== USER_ROLES.CHILD) {
      return NextResponse.json({ error: 'Forbidden: child role required' }, { status: 403 });
    }

    const serviceClient = await createServiceClient();

    // Fetch the shop item
    const { data: shopItem, error: itemError } = await serviceClient
      .from(TABLES.SHOP_ITEMS)
      .select('id, price_coins, is_active')
      .eq('id', itemId)
      .single();

    if (itemError || !shopItem || !shopItem.is_active) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Check coin balance
    const coinBalance = (currentUser as any).coin_balance as number;
    if (coinBalance < shopItem.price_coins) {
      return NextResponse.json({ error: 'insufficient_coins' }, { status: 400 });
    }

    // Check if already owned
    const { data: existingInventory, error: inventoryCheckError } = await serviceClient
      .from(TABLES.CHILD_INVENTORY)
      .select('id')
      .eq('child_id', childId)
      .eq('item_id', itemId)
      .limit(1);

    if (inventoryCheckError) {
      console.error('Inventory check error:', inventoryCheckError);
      return NextResponse.json({ error: 'Failed to check inventory' }, { status: 500 });
    }

    if (existingInventory && existingInventory.length > 0) {
      return NextResponse.json({ error: 'already_owned' }, { status: 409 });
    }

    // Deduct coins — only proceeds if balance is still sufficient (atomic check)
    const { data: updateData, error: updateError } = await serviceClient
      .from(TABLES.USERS)
      .update({ coin_balance: coinBalance - shopItem.price_coins })
      .eq('id', childId)
      .gte('coin_balance', shopItem.price_coins)
      .select('coin_balance')
      .single();

    if (updateError || !updateData) {
      console.error('Coin deduction error:', updateError);
      return NextResponse.json({ error: 'Failed to deduct coins' }, { status: 500 });
    }

    const newBalance = (updateData as any).coin_balance as number;

    // Insert into child_inventory
    const { error: inventoryInsertError } = await serviceClient
      .from(TABLES.CHILD_INVENTORY)
      .insert({ child_id: childId, item_id: itemId, purchase_price_coins: shopItem.price_coins });

    if (inventoryInsertError) {
      console.error('Inventory insert error:', inventoryInsertError);
      // Attempt to refund coins
      await serviceClient
        .from(TABLES.USERS)
        .update({ coin_balance: coinBalance })
        .eq('id', childId);
      return NextResponse.json({ error: 'Failed to add item to inventory' }, { status: 500 });
    }

    // Record the coin transaction
    const { error: transactionError } = await serviceClient
      .from(TABLES.COIN_TRANSACTIONS)
      .insert({
        child_id: childId,
        type: 'spend_shop',
        amount: -shopItem.price_coins,
        balance_after: newBalance,
        reference_id: itemId,
      });

    if (transactionError) {
      // Non-fatal: log but don't fail the request since the purchase succeeded
      console.error('Coin transaction record error:', transactionError);
    }

    return NextResponse.json({ success: true, newBalance }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in shop/purchase:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
