'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCoinBalance } from '@/contexts/CoinBalanceContext';

interface ArcadeGame {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  price_coins: number;
  unlocked: boolean;
}

interface ArcadeLobbyProps {
  games: ArcadeGame[];
}

export default function ArcadeLobby({ games }: ArcadeLobbyProps) {
  const [unlocking, setUnlocking] = useState<string | null>(null);
  const { coinBalance, refreshBalance } = useCoinBalance();
  const [localUnlocks, setLocalUnlocks] = useState<Set<string>>(
    new Set(games.filter((g) => g.unlocked).map((g) => g.id)),
  );
  const router = useRouter();

  async function handleUnlock(gameId: string) {
    setUnlocking(gameId);
    try {
      const res = await fetch('/api/arcade/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId }),
      });

      if (res.ok) {
        setLocalUnlocks((prev) => new Set([...prev, gameId]));
        await refreshBalance();
        router.refresh();
      } else {
        const data = await res.json();
        if (data.error === 'insufficient_coins') {
          alert('Not enough coins! Keep practising to earn more.');
        } else if (data.error === 'already_unlocked') {
          setLocalUnlocks((prev) => new Set([...prev, gameId]));
        }
      }
    } finally {
      setUnlocking(null);
    }
  }

  if (games.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
        <p className="text-3xl mb-2">🕹️</p>
        <p className="text-muted-foreground font-semibold">
          No games available yet. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {games.map((game) => {
        const isUnlocked = localUnlocks.has(game.id);
        const canAfford = coinBalance >= game.price_coins;
        const isUnlocking = unlocking === game.id;

        return (
          <div
            key={game.id}
            className="bg-white rounded-2xl shadow-sm overflow-hidden border-2 border-transparent hover:border-brand-200 transition-all"
          >
            {/* Thumbnail */}
            {game.thumbnail_url && (
              <div className="relative w-full aspect-video bg-gray-100">
                <Image
                  src={game.thumbnail_url}
                  alt={game.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 512px) 100vw, 512px"
                />
                {!isUnlocked && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-4xl">🔒</span>
                  </div>
                )}
              </div>
            )}

            <div className="p-4 space-y-3">
              <div>
                <h3 className="text-lg font-black text-foreground">{game.name}</h3>
                {game.description && (
                  <p className="text-sm text-muted-foreground font-semibold mt-1">
                    {game.description}
                  </p>
                )}
              </div>

              {isUnlocked ? (
                <button
                  onClick={() => router.push(`/child/arcade/${game.slug}`)}
                  className="w-full rounded-2xl bg-brand-500 text-white font-bold py-3 text-sm hover:bg-brand-600 transition-colors"
                >
                  🎮 Play Now
                </button>
              ) : (
                <button
                  onClick={() => handleUnlock(game.id)}
                  disabled={!canAfford || isUnlocking}
                  className="w-full rounded-2xl bg-yellow-500 text-white font-bold py-3 text-sm hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUnlocking
                    ? 'Unlocking...'
                    : `🔓 Unlock for ${game.price_coins} coins`}
                </button>
              )}

              {!isUnlocked && !canAfford && (
                <p className="text-xs text-red-500 font-semibold text-center">
                  You need {game.price_coins - coinBalance} more coins
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
