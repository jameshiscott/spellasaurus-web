'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ARCADE_LIFE_COST } from '@/lib/constants';
import { useCoinBalance } from '@/contexts/CoinBalanceContext';
import {
  FORT_ALPHABET_UPGRADES,
  canPurchaseFort,
  type FortUpgradeDef,
} from '@/lib/fort-alphabet-upgrades';

interface FortAlphabetPlayerProps {
  gameId: string;
  initialLives: number;
  initialUpgrades: string[];
}

type Screen = 'launch' | 'shop' | 'playing' | 'game_over';

export default function FortAlphabetPlayer({
  gameId,
  initialLives,
  initialUpgrades,
}: FortAlphabetPlayerProps) {
  const [screen, setScreen] = useState<Screen>('launch');
  const [lives, setLives] = useState(initialLives);
  const { coinBalance, refreshBalance } = useCoinBalance();
  const [finalScore, setFinalScore] = useState(0);
  const [finalWave, setFinalWave] = useState(0);
  const [buying, setBuying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ownedUpgrades, setOwnedUpgrades] = useState<Set<string>>(
    new Set(initialUpgrades)
  );
  const [purchasingUpgrade, setPurchasingUpgrade] = useState<string | null>(null);
  const [shopCategory, setShopCategory] = useState<'towers' | 'base' | 'special'>('towers');
  const [levelStars, setLevelStars] = useState<number[]>([0, 0, 0, 0, 0]);
  const [totalStars, setTotalStars] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const router = useRouter();

  // Listen for messages from the game iframe
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const data = event.data;
      if (!data || !data.type) return;

      if (data.type === 'life_lost') {
        setLives(data.lives as number);
      }

      if (data.type === 'level_complete') {
        // Update stars
        if (data.levelStars && Array.isArray(data.levelStars)) {
          setLevelStars(data.levelStars as number[]);
          setTotalStars(data.totalStars as number);
          saveLevelStars(data.levelStars as number[]);
        }
        // Submit score for leaderboard on level complete too
        if (data.score) {
          submitScore(data.score as number, lives);
        }
      }

      if (data.type === 'game_over') {
        setFinalScore(data.score as number);
        setFinalWave(data.wave as number || 0);
        // Update stars even on game over
        if (data.levelStars && Array.isArray(data.levelStars)) {
          setLevelStars(data.levelStars as number[]);
          setTotalStars(data.totalStars as number);
          saveLevelStars(data.levelStars as number[]);
        }
        submitScore(data.score as number, 0);
        setScreen('game_over');
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  // Load saved stars on mount
  useEffect(() => {
    const saved = localStorage.getItem('fort_alphabet_stars');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as number[];
        if (Array.isArray(parsed) && parsed.length === 5) {
          setLevelStars(parsed);
          setTotalStars(parsed.reduce((s: number, v: number) => s + v, 0));
        }
      } catch { /* ignore */ }
    }
  }, []);

  function saveLevelStars(stars: number[]) {
    localStorage.setItem('fort_alphabet_stars', JSON.stringify(stars));
  }

  const submitScore = useCallback(
    async (score: number, livesRemaining: number) => {
      try {
        await fetch('/api/arcade/submit-score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameId, score, livesRemaining }),
        });
      } catch (e) {
        console.error('Failed to submit score:', e);
      }
    },
    [gameId]
  );

  function startGame() {
    if (lives <= 0) return;
    setScreen('playing');
    setLoading(true);
  }

  function onIframeLoad() {
    setLoading(false);
    setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(
        {
          type: 'init_game',
          lives,
          upgrades: Array.from(ownedUpgrades),
          levelStars,
        },
        '*'
      );
    }, 100);
  }

  async function buyLife() {
    if (coinBalance < ARCADE_LIFE_COST || buying) return;
    setBuying(true);
    try {
      const res = await fetch('/api/arcade/lives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId }),
      });
      if (res.ok) {
        const data = await res.json();
        setLives(data.lives as number);
        await refreshBalance();
      } else {
        const data = await res.json();
        if (data.error === 'insufficient_coins') {
          alert('Not enough coins! Keep practising to earn more.');
        }
      }
    } finally {
      setBuying(false);
    }
  }

  async function buyUpgrade(upgradeId: string) {
    if (purchasingUpgrade) return;
    setPurchasingUpgrade(upgradeId);
    try {
      const res = await fetch('/api/arcade/upgrades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, upgradeId }),
      });
      if (res.ok) {
        const data = await res.json();
        setOwnedUpgrades(new Set(data.upgrades as string[]));
        await refreshBalance();
      } else {
        const data = await res.json();
        if (data.error === 'insufficient_coins') {
          alert('Not enough coins! Keep practising to earn more.');
        }
      }
    } finally {
      setPurchasingUpgrade(null);
    }
  }

  function handleQuit() {
    if (screen === 'playing' && lives > 0) {
      fetch('/api/arcade/submit-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, score: 0, livesRemaining: lives }),
      }).catch(() => {});
    }
    router.push('/child/arcade');
  }

  const categoryUpgrades = FORT_ALPHABET_UPGRADES.filter(
    (u) => u.category === shopCategory
  );

  const LEVEL_NAMES = [
    '📓 Notebook Nook',
    '🌻 Alphabet Garden',
    '❗ Punctuation Park',
    '🏰 Dictionary Keep',
    '🏔️ Mount Trickyletter',
  ];

  // ── Launch Screen ─────────────────────────────────────────────
  if (screen === 'launch') {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl shadow-xl p-6 max-w-sm w-full text-center space-y-4">
          <h2 className="text-2xl font-black text-foreground">
            🏰 Fort Alphabet
          </h2>

          {/* Stars */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg">⭐</span>
            <span className="font-black text-yellow-600 text-lg">{totalStars}</span>
            <span className="text-sm text-muted-foreground font-semibold">stars</span>
          </div>

          {/* Level progress */}
          <div className="space-y-1.5 text-left">
            {LEVEL_NAMES.map((name, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="font-bold text-foreground flex-1">{name}</span>
                <span className="text-xs text-muted-foreground">
                  {levelStars[i] > 0
                    ? '⭐'.repeat(levelStars[i])
                    : i === 0 || totalStars >= [0, 6, 14, 22, 30][i]
                      ? '—'
                      : '🔒'}
                </span>
              </div>
            ))}
          </div>

          {/* Lives */}
          <div className="space-y-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Lives</p>
            <div className="flex items-center justify-center gap-1">
              {Array.from({ length: Math.max(lives, 0) }).map((_, i) => (
                <span key={i} className="text-2xl">❤️</span>
              ))}
              {lives === 0 && (
                <p className="text-sm font-bold text-red-500">No lives left!</p>
              )}
            </div>
          </div>

          {/* Coins */}
          <div className="bg-warning/20 rounded-2xl px-4 py-2 inline-flex items-center gap-2">
            <span className="text-lg">🪙</span>
            <span className="font-black text-yellow-800">{coinBalance}</span>
          </div>

          {/* Buy life */}
          <button
            onClick={buyLife}
            disabled={coinBalance < ARCADE_LIFE_COST || buying}
            className="w-full rounded-2xl bg-yellow-500 text-white font-bold py-2.5 text-sm hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {buying ? 'Buying...' : `❤️ Buy a Life (${ARCADE_LIFE_COST} coins)`}
          </button>

          {/* Shop */}
          <button
            onClick={() => setScreen('shop')}
            className="w-full rounded-2xl bg-purple-500 text-white font-bold py-2.5 text-sm hover:bg-purple-600 transition-colors"
          >
            🛒 Upgrade Shop ({ownedUpgrades.size}/{FORT_ALPHABET_UPGRADES.length})
          </button>

          {/* Play */}
          {lives > 0 ? (
            <button
              onClick={startGame}
              className="w-full rounded-2xl bg-brand-500 text-white font-bold py-3 text-lg hover:bg-brand-600 transition-colors"
            >
              🎮 Play Now
            </button>
          ) : (
            <p className="text-sm text-muted-foreground font-semibold">
              Buy a life to keep playing!
            </p>
          )}

          <button
            onClick={handleQuit}
            className="w-full rounded-2xl bg-gray-200 text-foreground font-bold py-2.5 text-sm hover:bg-gray-300 transition-colors"
          >
            Back to Arcade
          </button>
        </div>
      </div>
    );
  }

  // ── Shop Screen ───────────────────────────────────────────────
  if (screen === 'shop') {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col items-center p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl shadow-xl p-5 max-w-md w-full space-y-4 my-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-foreground">🛒 Upgrade Shop</h2>
            <div className="bg-warning/20 rounded-xl px-3 py-1 flex items-center gap-1">
              <span className="text-sm">🪙</span>
              <span className="font-black text-yellow-800 text-sm">{coinBalance}</span>
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2">
            {([
              { key: 'towers', label: '✏️ Towers' },
              { key: 'base', label: '🏠 Base' },
              { key: 'special', label: '⚡ Special' },
            ] as const).map((cat) => (
              <button
                key={cat.key}
                onClick={() => setShopCategory(cat.key)}
                className={`flex-1 rounded-xl py-2 text-xs font-bold transition-colors ${
                  shopCategory === cat.key
                    ? 'bg-brand-500 text-white'
                    : 'bg-gray-100 text-foreground hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Upgrade cards */}
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {categoryUpgrades.map((upgrade) => (
              <FortUpgradeCard
                key={upgrade.id}
                upgrade={upgrade}
                owned={ownedUpgrades.has(upgrade.id)}
                canBuy={canPurchaseFort(upgrade.id, ownedUpgrades)}
                canAfford={coinBalance >= upgrade.cost}
                purchasing={purchasingUpgrade === upgrade.id}
                locked={!!upgrade.requires && !ownedUpgrades.has(upgrade.requires)}
                onBuy={() => buyUpgrade(upgrade.id)}
              />
            ))}
          </div>

          <button
            onClick={() => setScreen('launch')}
            className="w-full rounded-2xl bg-gray-200 text-foreground font-bold py-2.5 text-sm hover:bg-gray-300 transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // ── Game Over Screen ──────────────────────────────────────────
  if (screen === 'game_over') {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-6 max-w-sm w-full text-center space-y-4">
          <h2 className="text-2xl font-black text-foreground">💀 Game Over</h2>

          <div className="space-y-1">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Final Score</p>
            <p className="text-4xl font-black text-brand-500">{finalScore}</p>
            {finalWave > 0 && (
              <p className="text-sm font-semibold text-muted-foreground">
                Reached Wave {finalWave}
              </p>
            )}
          </div>

          {/* Stars earned */}
          {totalStars > 0 && (
            <p className="text-sm font-bold text-yellow-600">
              ⭐ {totalStars} total stars
            </p>
          )}

          <div className="bg-warning/20 rounded-2xl px-4 py-2 inline-flex items-center gap-2">
            <span className="text-lg">🪙</span>
            <span className="font-black text-yellow-800">{coinBalance}</span>
          </div>

          <button
            onClick={buyLife}
            disabled={coinBalance < ARCADE_LIFE_COST || buying}
            className="w-full rounded-2xl bg-yellow-500 text-white font-bold py-2.5 text-sm hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {buying ? 'Buying...' : `❤️ Buy a Life (${ARCADE_LIFE_COST} coins)`}
          </button>

          {lives > 0 && (
            <button
              onClick={startGame}
              className="w-full rounded-2xl bg-brand-500 text-white font-bold py-3 text-lg hover:bg-brand-600 transition-colors"
            >
              🎮 Play Again
            </button>
          )}

          <button
            onClick={() => setScreen('shop')}
            className="w-full rounded-2xl bg-purple-500 text-white font-bold py-2.5 text-sm hover:bg-purple-600 transition-colors"
          >
            🛒 Upgrade Shop
          </button>

          <button
            onClick={handleQuit}
            className="w-full rounded-2xl bg-gray-200 text-foreground font-bold py-2.5 text-sm hover:bg-gray-300 transition-colors"
          >
            Back to Arcade
          </button>
        </div>
      </div>
    );
  }

  // ── Playing Screen (iframe) ───────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900">
        <div className="flex items-center gap-3">
          <p className="text-white font-bold text-sm">Fort Alphabet</p>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: Math.max(lives, 0) }).map((_, i) => (
              <span key={i} className="text-sm">❤️</span>
            ))}
          </div>
        </div>
        <button
          onClick={handleQuit}
          className="text-white bg-gray-700 hover:bg-gray-600 rounded-xl px-3 py-1 text-xs font-bold transition-colors"
        >
          Quit
        </button>
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10 pointer-events-none">
          <p className="text-white font-bold text-lg animate-pulse">Loading game...</p>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src="/arcade/fort-alphabet/index.html"
        className="flex-1 w-full border-0"
        onLoad={onIframeLoad}
        allow="autoplay"
        sandbox="allow-scripts allow-same-origin"
        title="Fort Alphabet"
      />
    </div>
  );
}

// ── Upgrade Card Sub-Component ──────────────────────────────────
function FortUpgradeCard({
  upgrade,
  owned,
  canBuy,
  canAfford,
  purchasing,
  locked,
  onBuy,
}: {
  upgrade: FortUpgradeDef;
  owned: boolean;
  canBuy: boolean;
  canAfford: boolean;
  purchasing: boolean;
  locked: boolean;
  onBuy: () => void;
}) {
  return (
    <div
      className={`rounded-xl border-2 p-3 transition-all ${
        owned
          ? 'border-green-300 bg-green-50'
          : locked
            ? 'border-gray-200 bg-gray-50 opacity-60'
            : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{upgrade.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-sm text-foreground">{upgrade.name}</p>
            {owned && (
              <span className="text-xs font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">
                OWNED
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{upgrade.description}</p>
          {locked && upgrade.requires && (
            <p className="text-xs text-orange-500 font-semibold mt-1">
              Requires:{' '}
              {FORT_ALPHABET_UPGRADES.find((u) => u.id === upgrade.requires)?.name ?? upgrade.requires}
            </p>
          )}
        </div>
        {!owned && (
          <button
            onClick={onBuy}
            disabled={!canBuy || !canAfford || purchasing}
            className="shrink-0 rounded-xl bg-yellow-500 text-white font-bold px-3 py-1.5 text-xs hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {purchasing ? '...' : `🪙 ${upgrade.cost}`}
          </button>
        )}
      </div>
    </div>
  );
}
