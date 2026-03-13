import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { TABLES, USER_ROLES } from '@/lib/constants';

const VALID_SLOTS = ['head', 'body', 'eyes', 'feet', 'handheld', 'background', 'accessory'] as const;

const EquipSchema = z.object({
  slot: z.enum(VALID_SLOTS),
  itemId: z.string().uuid().nullable(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = EquipSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { slot, itemId } = parsed.data;

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const childId = user.id;

    const { data: profile, error: profileError } = await supabase
      .from(TABLES.USERS)
      .select('role, avatar_loadout')
      .eq('id', childId)
      .single();

    if (profileError || !profile || profile.role !== USER_ROLES.CHILD) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // If equipping (not unequipping), verify the child owns the item
    if (itemId !== null) {
      const { data: inventoryItem } = await supabase
        .from(TABLES.CHILD_INVENTORY)
        .select('id')
        .eq('child_id', childId)
        .eq('item_id', itemId)
        .limit(1);

      if (!inventoryItem || inventoryItem.length === 0) {
        return NextResponse.json({ error: 'Item not owned' }, { status: 403 });
      }
    }

    // Merge the new slot value into the existing loadout
    const existingLoadout =
      (profile.avatar_loadout as Record<string, string | null> | null) ?? {};
    const newLoadout = { ...existingLoadout, [slot]: itemId };

    const { error: updateError } = await supabase
      .from(TABLES.USERS)
      .update({ avatar_loadout: newLoadout })
      .eq('id', childId);

    if (updateError) {
      console.error('Wardrobe update error:', updateError);
      return NextResponse.json({ error: 'Failed to update loadout' }, { status: 500 });
    }

    return NextResponse.json({ success: true, loadout: newLoadout });
  } catch (error) {
    console.error('Unexpected error in wardrobe/equip:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
