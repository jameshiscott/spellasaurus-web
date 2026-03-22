'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCoinBalance } from '@/contexts/CoinBalanceContext';
import ArcadeLeaderboard from './ArcadeLeaderboard';

interface ArcadeGame {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  thumbnail_url: string | null;
  price_coins: number;
  unlocked: boolean;
}

interface ArcadeTabsProps {
  games: ArcadeGame[];
}

export default function ArcadeTabs({ games }: ArcadeTabsProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [unlocking, setUnlocking] = useState<string | null>(null);
  const { coinBalance, refreshBalance } = useCoinBalance();
  const [localUnlocks, setLocalUnlocks] = useState<Set<string>>(
    new Set(games.filter((g) => g.unlocked).map((g) => g.id))
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

  const activeGame = games[activeTab];
  const isUnlocked = localUnlocks.has(activeGame.id);
  const canAfford = coinBalance >= activeGame.price_coins;
  const isUnlocking = unlocking === activeGame.id;

  return (
    <div className="space-y-4">
      {/* Game tabs */}
      <div className="flex rounded-xl bg-gray-100 p-1 gap-1">
        {games.map((game, idx) => (
          <button
            key={game.id}
            onClick={() => setActiveTab(idx)}
            className={`flex-1 rounded-lg py-2.5 px-2 text-sm font-bold transition-all truncate ${
              activeTab === idx
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-gray-200'
            }`}
          >
            {game.name}
          </button>
        ))}
      </div>

      {/* Active game card */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border-2 border-transparent">
        {activeGame.thumbnail_url && (
          <div className="relative w-full aspect-video bg-gray-100">
            <Image
              src={activeGame.thumbnail_url}
              alt={activeGame.name}
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
            <h3 className="text-lg font-black text-foreground">
              {activeGame.name}
            </h3>
            {activeGame.description && (
              <p className="text-sm text-muted-foreground font-semibold mt-1">
                {activeGame.description}
              </p>
            )}
          </div>

          {isUnlocked ? (
            <button
              onClick={() => router.push(`/child/arcade/${activeGame.slug}`)}
              className="w-full rounded-2xl bg-brand-500 text-white font-bold py-3 text-sm hover:bg-brand-600 transition-colors"
            >
              🎮 Play Now
            </button>
          ) : activeGame.slug === 'fort-alphabet' ? (
            <div className="w-full rounded-2xl bg-gray-300 text-gray-600 font-bold py-3 text-sm text-center">
              🏰 Coming Soon!
            </div>
          ) : (
            <button
              onClick={() => handleUnlock(activeGame.id)}
              disabled={!canAfford || isUnlocking}
              className="w-full rounded-2xl bg-yellow-500 text-white font-bold py-3 text-sm hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUnlocking
                ? 'Unlocking...'
                : `🔓 Unlock for ${activeGame.price_coins} coins`}
            </button>
          )}

          {!isUnlocked && !canAfford && activeGame.slug !== 'fort-alphabet' && (
            <p className="text-xs text-red-500 font-semibold text-center">
              You need {activeGame.price_coins - coinBalance} more coins
            </p>
          )}
        </div>
      </div>

      {/* Leaderboard for the active game */}
      <ArcadeLeaderboard
        key={activeGame.id}
        gameId={activeGame.id}
        gameName={activeGame.name}
      />
    </div>
  );
}
