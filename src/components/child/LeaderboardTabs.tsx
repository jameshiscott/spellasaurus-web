"use client";

import { useState } from "react";

const MEDAL_ICONS = ["🥇", "🥈", "🥉"];

function getRankIcon(rank: number): string {
  return MEDAL_ICONS[rank] ?? `${rank + 1}.`;
}

interface LeaderboardEntry {
  child_id: string;
  display_name: string;
  weekly_coins: number;
  weekly_words: number;
  word_streak: number;
}

interface Tab {
  id: string;
  label: string;
  entries: LeaderboardEntry[];
}

interface LeaderboardTabsProps {
  tabs: Tab[];
  currentUserId: string;
}

export default function LeaderboardTabs({ tabs, currentUserId }: LeaderboardTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? "");

  if (tabs.length === 0) return null;

  const activeEntries = tabs.find((t) => t.id === activeTab)?.entries ?? [];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-xl py-2 px-3 text-sm font-bold transition-all ${
              activeTab === tab.id
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Column headers */}
        <div className="grid grid-cols-[2rem_1fr_auto_auto] gap-3 px-4 py-2 bg-gray-50 text-xs font-bold text-muted-foreground uppercase tracking-wide">
          <span>#</span>
          <span>Player</span>
          <span className="text-right">🔥</span>
          <span className="text-right">🪙</span>
        </div>

        {activeEntries.length === 0 ? (
          <div className="px-4 py-8 text-center text-muted-foreground font-semibold text-sm">
            No entries yet
          </div>
        ) : (
          activeEntries.map((entry, index) => {
            const isMe = entry.child_id === currentUserId;
            return (
              <div
                key={entry.child_id}
                className={`grid grid-cols-[2rem_1fr_auto_auto] gap-3 items-center px-4 py-3 border-t border-gray-100 ${
                  isMe ? "bg-brand-50" : ""
                }`}
              >
                <span className="text-base font-black text-center">
                  {getRankIcon(index)}
                </span>
                <div>
                  <span className="font-bold text-sm text-foreground">
                    {entry.display_name}
                    {isMe && (
                      <span className="ml-2 text-xs font-bold text-brand-500">(you)</span>
                    )}
                  </span>
                  <p className="text-xs text-muted-foreground font-semibold">
                    {entry.weekly_words} word{entry.weekly_words !== 1 ? "s" : ""} this week
                  </p>
                </div>
                <span className="font-black text-orange-600 text-sm text-right">
                  {entry.word_streak > 0 ? entry.word_streak : "-"}
                </span>
                <span className="font-black text-yellow-700 text-sm text-right">
                  {entry.weekly_coins}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
