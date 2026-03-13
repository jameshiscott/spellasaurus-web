'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DinoAvatar from '@/components/dino/DinoAvatar';
import type { DinoType, DinoColor, EquipmentSlot } from '@/components/dino/dino-types';

const SLOT_LABELS: Record<EquipmentSlot, string> = {
  head: '🎩 Head',
  body: '👕 Body',
  eyes: '👓 Eyes',
  feet: '👟 Feet',
  handheld: '🪄 Hand',
  background: '🌅 BG',
  accessory: '⭐ Extra',
};

const SLOT_ICONS: Record<EquipmentSlot, string> = {
  head: '🎩',
  body: '👕',
  eyes: '👓',
  feet: '👟',
  handheld: '🪄',
  background: '🌅',
  accessory: '⭐',
};

const SLOTS: EquipmentSlot[] = [
  'head',
  'body',
  'eyes',
  'feet',
  'handheld',
  'background',
  'accessory',
];

interface InventoryItem {
  item_id: string;
  shop_items: {
    name: string;
    slot: string;
    rarity: string;
    description: string | null;
  } | null;
}

interface WardrobeClientProps {
  dinoType: DinoType;
  dinoColor: DinoColor;
  initialLoadout: Record<string, string | null>;
  inventory: InventoryItem[];
}

export default function WardrobeClient({
  dinoType,
  dinoColor,
  initialLoadout,
  inventory,
}: WardrobeClientProps) {
  const [loadout, setLoadout] = useState(initialLoadout);
  const [activeSlot, setActiveSlot] = useState<EquipmentSlot>('head');
  const [loadingItem, setLoadingItem] = useState<string | null>(null);
  const router = useRouter();

  const slotItems = inventory.filter((i) => i.shop_items?.slot === activeSlot);

  // Convert loadout UUIDs → item names for DinoAvatar rendering
  const avatarLoadout = Object.fromEntries(
    Object.entries(loadout)
      .filter(([, v]) => v !== null)
      .map(([slot, itemId]) => {
        const item = inventory.find((i) => i.item_id === itemId);
        return [slot, item?.shop_items?.name ?? ''];
      })
      .filter(([, name]) => name !== ''),
  ) as Partial<Record<EquipmentSlot, string>>;

  async function handleToggleEquip(itemId: string) {
    const isEquipped = loadout[activeSlot] === itemId;
    setLoadingItem(itemId);
    try {
      const res = await fetch('/api/wardrobe/equip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot: activeSlot, itemId: isEquipped ? null : itemId }),
      });
      if (res.ok) {
        const data = await res.json();
        setLoadout(data.loadout as Record<string, string | null>);
        router.refresh();
      }
    } finally {
      setLoadingItem(null);
    }
  }

  const equippedCount = Object.values(loadout).filter(Boolean).length;

  return (
    <div className="space-y-5">
      {/* Dino preview */}
      <div className="bg-white rounded-3xl p-6 flex flex-col items-center shadow-sm">
        <DinoAvatar
          dinoType={dinoType}
          dinoColor={dinoColor}
          size="xl"
          loadout={avatarLoadout}
          animate={false}
        />
        <p className="text-sm text-muted-foreground font-semibold mt-3">
          {equippedCount === 0 ? 'No items equipped' : `${equippedCount} item${equippedCount !== 1 ? 's' : ''} equipped`}
        </p>
      </div>

      {/* Slot selector */}
      <div className="flex flex-wrap gap-2">
        {SLOTS.map((slot) => {
          const hasItem = Boolean(loadout[slot]);
          const isActive = activeSlot === slot;
          return (
            <button
              key={slot}
              onClick={() => setActiveSlot(slot)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors relative ${
                isActive
                  ? 'bg-brand-500 text-white'
                  : 'bg-white text-foreground hover:bg-brand-50 shadow-sm'
              }`}
            >
              {SLOT_LABELS[slot]}
              {hasItem && !isActive && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Items for the selected slot */}
      {slotItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
          <p className="text-3xl mb-2">{SLOT_ICONS[activeSlot]}</p>
          <p className="text-muted-foreground font-semibold">
            No {activeSlot} items yet.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Visit the{' '}
            <a href="/child/shop" className="text-brand-500 font-bold hover:underline">
              Shop
            </a>{' '}
            to get some!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {slotItems.map(({ item_id, shop_items }) => {
            if (!shop_items) return null;
            const isEquipped = loadout[activeSlot] === item_id;
            const isLoading = loadingItem === item_id;

            return (
              <button
                key={item_id}
                onClick={() => handleToggleEquip(item_id)}
                disabled={isLoading}
                className={`bg-white rounded-2xl p-4 text-left transition-all shadow-sm disabled:opacity-60 ${
                  isEquipped
                    ? 'ring-2 ring-brand-500 shadow-md'
                    : 'hover:shadow-md hover:ring-1 hover:ring-brand-200'
                }`}
              >
                <div className="w-full aspect-square bg-brand-50 rounded-xl mb-2 flex items-center justify-center text-4xl">
                  {SLOT_ICONS[activeSlot]}
                </div>
                <p className="font-black text-sm text-foreground leading-tight">
                  {shop_items.name}
                </p>
                <p className="text-xs text-muted-foreground font-semibold capitalize mt-0.5">
                  {shop_items.rarity}
                </p>
                {isEquipped && (
                  <p className="text-xs font-bold text-brand-500 mt-1">Equipped ✓</p>
                )}
                {isLoading && (
                  <p className="text-xs font-bold text-muted-foreground mt-1">Saving…</p>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
