import { createClient } from '@/lib/supabase/server';
import { TABLES } from '@/lib/constants';
import Link from 'next/link';
import WardrobeClient from '@/components/child/WardrobeClient';
import type { DinoType, DinoColor } from '@/components/dino/dino-types';

export default async function WardrobePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from(TABLES.USERS)
    .select('dino_type, dino_color, avatar_loadout')
    .eq('id', user!.id)
    .single();

  const { data: inventory } = await supabase
    .from(TABLES.CHILD_INVENTORY)
    .select('item_id, shop_items(name, slot, rarity, description)')
    .eq('child_id', user!.id);

  const dinoType = (profile?.dino_type as DinoType | null) ?? 'trex';
  const dinoColor = (profile?.dino_color as DinoColor | null) ?? 'green';
  const initialLoadout =
    (profile?.avatar_loadout as Record<string, string | null> | null) ?? {};

  return (
    <div className="pt-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-foreground">Wardrobe</h1>
        <div className="flex gap-3">
          <Link
            href="/child/shop"
            className="text-sm font-bold text-brand-500 hover:underline"
          >
            Shop
          </Link>
          <Link href="/child" className="text-sm font-bold text-brand-500 hover:underline">
            ← Back
          </Link>
        </div>
      </div>

      <WardrobeClient
        dinoType={dinoType}
        dinoColor={dinoColor}
        initialLoadout={initialLoadout}
        inventory={inventory ?? []}
      />
    </div>
  );
}
