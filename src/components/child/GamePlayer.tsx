'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface GamePlayerProps {
  slug: string;
  name: string;
}

export default function GamePlayer({ slug, name }: GamePlayerProps) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900">
        <p className="text-white font-bold text-sm truncate">{name}</p>
        <button
          onClick={() => router.push('/child/arcade')}
          className="text-white bg-gray-700 hover:bg-gray-600 rounded-xl px-3 py-1 text-xs font-bold transition-colors"
        >
          Exit Game
        </button>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10 pointer-events-none">
          <p className="text-white font-bold text-lg animate-pulse">Loading game...</p>
        </div>
      )}

      {/* Game iframe */}
      <iframe
        src={`/arcade/${slug}/index.html`}
        className="flex-1 w-full border-0"
        onLoad={() => setLoading(false)}
        allow="autoplay"
        sandbox="allow-scripts allow-same-origin"
        title={name}
      />
    </div>
  );
}
