'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

interface ShopItemCardProps {
  item: ShopItem;
  isOwned: boolean;
  coinBalance: number;
}

const RARITY_STYLES: Record<string, string> = {
  common: 'bg-gray-100 text-gray-700',
  rare: 'bg-blue-100 text-blue-700',
  epic: 'bg-purple-100 text-purple-700',
  legendary: 'bg-yellow-100 text-yellow-800',
};

const SLOT_ICONS: Record<string, string> = {
  head: '🎩',
  body: '👕',
  eyes: '👓',
  feet: '👟',
  handheld: '🪄',
  background: '🌅',
  accessory: '⭐',
};

export default function ShopItemCard({ item, isOwned, coinBalance }: ShopItemCardProps) {
  const [loading, setLoading] = useState(false);
  const [owned, setOwned] = useState(isOwned);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleBuy() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/shop/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setOwned(true);
        router.refresh();
      } else if (data.error === 'already_owned') {
        setOwned(true);
      } else if (data.error === 'insufficient_coins') {
        setError('Not enough coins!');
      } else {
        setError('Something went wrong.');
      }
    } finally {
      setLoading(false);
    }
  }

  const canAfford = coinBalance >= item.price_coins;
  const rarityStyle = RARITY_STYLES[item.rarity] ?? RARITY_STYLES.common;
  const slotIcon = SLOT_ICONS[item.slot] ?? '🎁';

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col">
      {/* Icon area */}
      <div className="w-full aspect-square bg-brand-50 rounded-xl mb-3 flex items-center justify-center text-5xl">
        {slotIcon}
      </div>

      <p className="font-black text-foreground text-sm leading-tight">{item.name}</p>
      {item.description && (
        <p className="text-xs text-muted-foreground font-semibold mt-1 mb-2 line-clamp-2 flex-1">
          {item.description}
        </p>
      )}

      <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-3 capitalize ${rarityStyle}`}>
        {item.rarity}
      </span>

      {error && (
        <p className="text-xs font-bold text-red-500 mb-2">{error}</p>
      )}

      {owned ? (
        <div className="w-full bg-green-100 text-green-700 font-bold text-sm py-2 rounded-xl text-center">
          Owned ✓
        </div>
      ) : (
        <button
          onClick={handleBuy}
          disabled={loading || !canAfford}
          className="w-full bg-brand-500 text-white font-bold text-sm py-2 rounded-xl disabled:opacity-50 hover:bg-brand-600 transition-colors"
        >
          {loading ? '…' : `🪙 ${item.price_coins}`}
        </button>
      )}
    </div>
  );
}
