'use client';

import { useState } from 'react';
import Link from 'next/link';
import ShopItemCard from '@/components/child/ShopItemCard';
import { CoinDisplay } from '@/components/child/CoinDisplay';
import { useCoinBalance } from '@/contexts/CoinBalanceContext';

interface ShopItem {
  id: string;
  name: string;
  description: string | null;
  category: string;
  slot: string;
  price_coins: number;
  rarity: string;
  asset_url: string | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  hats: '🎩 Hats',
  outfits: '👕 Outfits',
  accessories: '⭐ Accessories',
  backgrounds: '🌅 Backgrounds',
};

const CATEGORY_ORDER = ['hats', 'outfits', 'accessories', 'backgrounds'];

interface ShopClientProps {
  items: ShopItem[];
  ownedIds: string[];
}

export default function ShopClient({ items, ownedIds }: ShopClientProps) {
  const [affordableOnly, setAffordableOnly] = useState(false);
  const { coinBalance } = useCoinBalance();
  const ownedSet = new Set(ownedIds);

  const filtered = affordableOnly
    ? items.filter((item) => ownedSet.has(item.id) || item.price_coins <= coinBalance)
    : items;

  // Group items by category
  const byCategory: Record<string, ShopItem[]> = {};
  for (const item of filtered) {
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

      {/* Affordable toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setAffordableOnly((v) => !v)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            affordableOnly ? 'bg-brand-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              affordableOnly ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className="text-sm font-bold text-foreground">Show only what I can afford</span>
      </div>

      {/* Item categories */}
      {sortedCategories.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-muted-foreground font-semibold">
          {affordableOnly
            ? 'Nothing you can afford right now. Keep practising to earn more coins!'
            : 'No items in the shop yet. Check back soon!'}
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
                  isOwned={ownedSet.has(item.id)}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
