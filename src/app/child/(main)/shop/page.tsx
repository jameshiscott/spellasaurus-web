import { createClient } from '@/lib/supabase/server';
import { TABLES } from '@/lib/constants';
import Link from 'next/link';
import ShopItemCard from '@/components/child/ShopItemCard';
import { CoinDisplay } from '@/components/child/CoinDisplay';

const CATEGORY_LABELS: Record<string, string> = {
  hats: '🎩 Hats',
  outfits: '👕 Outfits',
  accessories: '⭐ Accessories',
  backgrounds: '🌅 Backgrounds',
};

const CATEGORY_ORDER = ['hats', 'outfits', 'accessories', 'backgrounds'];

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

  const ownedIds = new Set(inventory?.map((i) => i.item_id) ?? []);

  // Group items by category
  const byCategory: Record<string, typeof items> = {};
  for (const item of items ?? []) {
    if (!byCategory[item.category]) byCategory[item.category] = [];
    byCategory[item.category]!.push(item);
  }

  const sortedCategories = [
    ...CATEGORY_ORDER.filter((c) => byCategory[c]),
    ...Object.keys(byCategory).filter((c) => !CATEGORY_ORDER.includes(c)),
  ];

  return (
    <div className="pt-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-foreground">Shop</h1>
        <Link href="/child" className="text-sm font-bold text-brand-500 hover:underline">
          ← Back
        </Link>
      </div>

      {/* Coin balance */}
      <div className="bg-warning/20 rounded-2xl px-5 py-3 flex items-center gap-3">
        <span className="text-2xl">🪙</span>
        <div>
          <CoinDisplay size="lg" />
        </div>
        <div className="ml-auto">
          <Link
            href="/child/wardrobe"
            className="text-xs font-bold text-yellow-700 bg-white rounded-xl px-3 py-1 hover:bg-yellow-50"
          >
            Wardrobe →
          </Link>
        </div>
      </div>

      {/* Item categories */}
      {sortedCategories.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-muted-foreground font-semibold">
          No items in the shop yet. Check back soon!
        </div>
      ) : (
        sortedCategories.map((category) => (
          <div key={category}>
            <h2 className="text-lg font-black text-foreground mb-3">
              {CATEGORY_LABELS[category] ?? category}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {byCategory[category]!.map((item) => (
                <ShopItemCard
                  key={item.id}
                  item={item}
                  isOwned={ownedIds.has(item.id)}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
