import { createClient } from '@/lib/supabase/server';
import { TABLES } from '@/lib/constants';
import ShopClient from '@/components/child/ShopClient';

export default async function ShopPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: items } = await supabase
    .from(TABLES.SHOP_ITEMS)
    .select('id, name, description, category, slot, price_coins, rarity, asset_url')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  const { data: inventory } = await supabase
    .from(TABLES.CHILD_INVENTORY)
    .select('item_id')
    .eq('child_id', user!.id);

  const ownedIds = inventory?.map((i) => i.item_id) ?? [];

  return <ShopClient items={items ?? []} ownedIds={ownedIds} />;
}
