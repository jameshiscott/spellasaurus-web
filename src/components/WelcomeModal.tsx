"use client";

import { useState } from "react";

export const CURRENT_APP_VERSION = "2026.3.14";

const RELEASE_NOTES: Record<string, { title: string; features: string[]; notice?: string }> = {
  "2026.3.14": {
    title: "Welcome to Spellasaurus!",
    features: [
      "Practise your weekly spelling words with audio and hints",
      "Earn coins for every correct answer",
      "Customise your dinosaur in the Wardrobe with hats, capes, and more",
      "Unlock games in the Arcade by spending coins",
      "Compete on class and global Leaderboards",
      "Parents and teachers can manage word lists and track progress",
    ],
    notice:
      "Please note: This app is made to help with spellings and is built by a busy parent. It is just for fun and learning and gives no guarantees of working or keeping any coins earned.",
  },
};

interface WelcomeModalProps {
  lastSeenVersion: string | null;
}

export default function WelcomeModal({ lastSeenVersion }: WelcomeModalProps) {
  const shouldShow = lastSeenVersion !== CURRENT_APP_VERSION;
  const notes = RELEASE_NOTES[CURRENT_APP_VERSION];
  const [open, setOpen] = useState(shouldShow && !!notes);

  async function dismiss() {
    setOpen(false);
    await fetch("/api/user/dismiss-welcome", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version: CURRENT_APP_VERSION }),
    }).catch(() => {});
  }

  if (!open || !notes) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="text-center">
          <p className="text-5xl mb-2">🦕</p>
          <h2 className="text-2xl font-black text-foreground">{notes.title}</h2>
          <p className="text-sm text-muted-foreground font-semibold mt-1">
            Version {CURRENT_APP_VERSION}
          </p>
        </div>

        <div>
          <h3 className="font-black text-foreground text-sm uppercase tracking-wide mb-2">
            What you can do
          </h3>
          <ul className="space-y-2">
            {notes.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground font-semibold">
                <span className="text-brand-500 mt-0.5 shrink-0">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {notes.notice && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3">
            <p className="text-xs text-yellow-800 font-semibold leading-relaxed">
              {notes.notice}
            </p>
          </div>
        )}

        <button
          onClick={dismiss}
          className="w-full bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-black text-lg py-3 rounded-2xl transition-all shadow-md"
        >
          Let&apos;s go!
        </button>
      </div>
    </div>
  );
}
