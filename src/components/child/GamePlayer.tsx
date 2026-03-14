'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ARCADE_LIFE_COST } from '@/lib/constants';

interface GamePlayerProps {
  slug: string;
  name: string;
  gameId: string;
  initialLives: number;
  coinBalance: number;
}

type Screen = 'launch' | 'playing' | 'game_over' | 'game_won';

export default function GamePlayer({
  slug,
  name,
  gameId,
  initialLives,
  coinBalance: initialBalance,
}: GamePlayerProps) {
  const [screen, setScreen] = useState<Screen>('launch');
  const [lives, setLives] = useState(initialLives);
  const [balance, setBalance] = useState(initialBalance);
  const [finalScore, setFinalScore] = useState(0);
  const [buying, setBuying] = useState(false);
  const [loading, setLoading] = useState(true);
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

      if (data.type === 'game_over') {
        setFinalScore(data.score as number);
        setLives(0);
        // Submit score to server
        submitScore(data.score as number, 0);
        setScreen('game_over');
      }

      if (data.type === 'game_won') {
        setFinalScore(data.score as number);
        setLives(data.lives as number);
        submitScore(data.score as number, data.lives as number);
        setScreen('game_won');
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

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
    // Send initial lives to game
    setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'init_lives', lives },
        '*'
      );
    }, 100);
  }

  async function buyLife() {
    if (balance < ARCADE_LIFE_COST || buying) return;
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
        setBalance(data.newBalance as number);
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

  function handleQuit() {
    // Save remaining lives if quitting mid-game
    if (screen === 'playing' && lives > 0) {
      fetch('/api/arcade/submit-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, score: 0, livesRemaining: lives }),
      }).catch(() => {});
    }
    router.push('/child/arcade');
  }

  // ── Launch screen ─────────────────────────────────────────────────
  if (screen === 'launch') {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center space-y-5">
          <h2 className="text-2xl font-black text-foreground">{name}</h2>

          {/* Lives display */}
          <div className="space-y-2">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
              Lives Remaining
            </p>
            <div className="flex items-center justify-center gap-1">
              {Array.from({ length: Math.max(lives, 0) }).map((_, i) => (
                <span key={i} className="text-3xl">
                  ❤️
                </span>
              ))}
              {lives === 0 && (
                <p className="text-lg font-bold text-red-500">No lives left!</p>
              )}
            </div>
          </div>

          {/* Coin balance */}
          <div className="bg-warning/20 rounded-2xl px-4 py-2 inline-flex items-center gap-2">
            <span className="text-xl">🪙</span>
            <span className="font-black text-yellow-800">{balance}</span>
          </div>

          {/* Buy life button */}
          <button
            onClick={buyLife}
            disabled={balance < ARCADE_LIFE_COST || buying}
            className="w-full rounded-2xl bg-yellow-500 text-white font-bold py-3 text-sm hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {buying
              ? 'Buying...'
              : `❤️ Buy a Life (${ARCADE_LIFE_COST} coins)`}
          </button>

          {/* Play / Quit buttons */}
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
            className="w-full rounded-2xl bg-gray-200 text-foreground font-bold py-3 text-sm hover:bg-gray-300 transition-colors"
          >
            Back to Arcade
          </button>
        </div>
      </div>
    );
  }

  // ── Game Over screen ──────────────────────────────────────────────
  if (screen === 'game_over' || screen === 'game_won') {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full text-center space-y-5">
          <h2 className="text-2xl font-black text-foreground">
            {screen === 'game_won' ? '🏆 You Win!' : '💀 Game Over'}
          </h2>

          <div className="space-y-1">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
              Final Score
            </p>
            <p className="text-4xl font-black text-brand-500">{finalScore}</p>
          </div>

          {/* Lives remaining */}
          <div className="flex items-center justify-center gap-1">
            {Array.from({ length: Math.max(lives, 0) }).map((_, i) => (
              <span key={i} className="text-2xl">
                ❤️
              </span>
            ))}
            {lives === 0 && (
              <p className="text-sm font-bold text-red-500">No lives left</p>
            )}
          </div>

          {/* Coin balance */}
          <div className="bg-warning/20 rounded-2xl px-4 py-2 inline-flex items-center gap-2">
            <span className="text-xl">🪙</span>
            <span className="font-black text-yellow-800">{balance}</span>
          </div>

          {/* Buy life */}
          {lives === 0 && (
            <button
              onClick={buyLife}
              disabled={balance < ARCADE_LIFE_COST || buying}
              className="w-full rounded-2xl bg-yellow-500 text-white font-bold py-3 text-sm hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {buying
                ? 'Buying...'
                : `❤️ Buy a Life (${ARCADE_LIFE_COST} coins)`}
            </button>
          )}

          {/* Play again if lives > 0 */}
          {lives > 0 && (
            <button
              onClick={startGame}
              className="w-full rounded-2xl bg-brand-500 text-white font-bold py-3 text-lg hover:bg-brand-600 transition-colors"
            >
              🎮 Play Again
            </button>
          )}

          <button
            onClick={handleQuit}
            className="w-full rounded-2xl bg-gray-200 text-foreground font-bold py-3 text-sm hover:bg-gray-300 transition-colors"
          >
            Back to Arcade
          </button>
        </div>
      </div>
    );
  }

  // ── Playing screen (iframe) ───────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900">
        <div className="flex items-center gap-3">
          <p className="text-white font-bold text-sm truncate">{name}</p>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: Math.max(lives, 0) }).map((_, i) => (
              <span key={i} className="text-sm">
                ❤️
              </span>
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

      {/* Loading indicator */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10 pointer-events-none">
          <p className="text-white font-bold text-lg animate-pulse">
            Loading game...
          </p>
        </div>
      )}

      {/* Game iframe */}
      <iframe
        ref={iframeRef}
        src={`/arcade/${slug}/index.html`}
        className="flex-1 w-full border-0"
        onLoad={onIframeLoad}
        allow="autoplay"
        sandbox="allow-scripts allow-same-origin"
        title={name}
      />
    </div>
  );
}
