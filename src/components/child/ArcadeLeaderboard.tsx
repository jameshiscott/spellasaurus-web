'use client';

import { useState, useEffect } from 'react';

interface LeaderboardEntry {
  rank: number;
  childId: string;
  displayName: string;
  dinoType: string | null;
  dinoColor: string | null;
  score: number;
  isMe: boolean;
}

interface ArcadeLeaderboardProps {
  gameId: string;
  gameName: string;
}

export default function ArcadeLeaderboard({ gameId, gameName }: ArcadeLeaderboardProps) {
  const [scope, setScope] = useState<'school' | 'global'>('school');
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/arcade/leaderboard?gameId=${gameId}&scope=${scope}`)
      .then((res) => res.json())
      .then((data) => {
        setScores(data.scores ?? []);
      })
      .catch(() => setScores([]))
      .finally(() => setLoading(false));
  }, [gameId, scope]);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header with toggle */}
      <div className="px-4 pt-4 pb-3 space-y-3">
        <h3 className="text-lg font-black text-foreground">
          🏆 {gameName} Leaderboard
        </h3>

        <div className="flex rounded-xl bg-gray-100 p-1">
          <button
            onClick={() => setScope('school')}
            className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${
              scope === 'school'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            My School
          </button>
          <button
            onClick={() => setScope('global')}
            className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${
              scope === 'global'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Global
          </button>
        </div>
      </div>

      {/* Scores list */}
      <div className="px-4 pb-4">
        {loading ? (
          <p className="text-center text-muted-foreground font-semibold py-4 animate-pulse">
            Loading...
          </p>
        ) : scores.length === 0 ? (
          <p className="text-center text-muted-foreground font-semibold py-4">
            No scores yet. Be the first!
          </p>
        ) : (
          <div className="space-y-2">
            {scores.map((entry) => (
              <div
                key={`${entry.childId}-${entry.rank}`}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl ${
                  entry.isMe
                    ? 'bg-brand-50 border-2 border-brand-300'
                    : 'bg-gray-50'
                }`}
              >
                {/* Rank */}
                <div className="w-8 text-center">
                  {entry.rank === 1 ? (
                    <span className="text-xl">🥇</span>
                  ) : entry.rank === 2 ? (
                    <span className="text-xl">🥈</span>
                  ) : entry.rank === 3 ? (
                    <span className="text-xl">🥉</span>
                  ) : (
                    <span className="text-sm font-black text-muted-foreground">
                      {entry.rank}
                    </span>
                  )}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-bold truncate ${
                      entry.isMe ? 'text-brand-500' : 'text-foreground'
                    }`}
                  >
                    {entry.displayName}
                    {entry.isMe && ' (You)'}
                  </p>
                </div>

                {/* Score */}
                <p className="text-sm font-black text-foreground">
                  {entry.score.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
