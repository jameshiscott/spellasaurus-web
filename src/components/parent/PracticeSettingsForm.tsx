"use client";

import { useState, useCallback } from "react";

type KeyboardLayout = "qwerty" | "abc";

interface PracticeSettingsFormProps {
  childId: string;
  childName: string;
  settings: {
    play_tts_audio: boolean;
    show_description: boolean;
    show_example_sentence: boolean;
    leaderboard_opt_in: boolean;
    keyboard_layout: KeyboardLayout;
  };
}

type BooleanField =
  | "play_tts_audio"
  | "show_description"
  | "show_example_sentence"
  | "leaderboard_opt_in";

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6C5CE7] focus-visible:ring-offset-2 ${
        checked ? "bg-[#6C5CE7]" : "bg-gray-200"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export function PracticeSettingsForm({
  childId,
  childName,
  settings: initialSettings,
}: PracticeSettingsFormProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = useCallback(
    async (field: BooleanField, value: boolean) => {
      const previous = settings[field];
      setSettings((prev) => ({ ...prev, [field]: value }));
      setSaving(field);
      setError(null);

      try {
        const res = await fetch("/api/parent/update-settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ childId, field, value }),
        });

        if (!res.ok) throw new Error("Failed to save");
        setSaved(field);
        setTimeout(() => setSaved(null), 2000);
      } catch {
        setSettings((prev) => ({ ...prev, [field]: previous }));
        setError("Failed to save setting. Please try again.");
      } finally {
        setSaving(null);
      }
    },
    [childId, settings]
  );

  const handleKeyboardLayout = useCallback(
    async (layout: KeyboardLayout) => {
      const previous = settings.keyboard_layout;
      setSettings((prev) => ({ ...prev, keyboard_layout: layout }));
      setSaving("keyboard_layout");
      setError(null);

      try {
        const res = await fetch("/api/parent/update-settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ childId, field: "keyboard_layout", value: layout }),
        });

        if (!res.ok) throw new Error("Failed to save");
        setSaved("keyboard_layout");
        setTimeout(() => setSaved(null), 2000);
      } catch {
        setSettings((prev) => ({ ...prev, keyboard_layout: previous }));
        setError("Failed to save setting. Please try again.");
      } finally {
        setSaving(null);
      }
    },
    [childId, settings.keyboard_layout]
  );

  const toggleRows: Array<{
    field: BooleanField;
    label: string;
    description: string;
    extra?: React.ReactNode;
  }> = [
    {
      field: "play_tts_audio",
      label: "Read word aloud",
      description: "Automatically plays the audio when a word appears",
    },
    {
      field: "show_description",
      label: "Show description",
      description: "Shows the AI-generated definition during practice",
    },
    {
      field: "show_example_sentence",
      label: "Show example sentence",
      description: "Shows the fill-in-the-blank sentence",
    },
    {
      field: "leaderboard_opt_in",
      label: "Leaderboard participation",
      description: `Allows ${childName} to appear on class and school leaderboards`,
      extra: settings.leaderboard_opt_in && (
        <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2">
          By enabling this, {childName}&apos;s display name and score will be
          visible to other children in their class.
        </p>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
      {error && (
        <div className="px-6 py-3 bg-red-50 border-b border-red-100">
          <p className="text-sm text-[#D63031] font-semibold">{error}</p>
        </div>
      )}
      <div className="divide-y divide-border">
        {toggleRows.map(({ field, label, description, extra }) => (
          <div key={field} className="px-6 py-5">
            <div className="flex items-center justify-between gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <p className="font-bold text-foreground">{label}</p>
                  {saving === field && (
                    <span className="text-xs text-muted-foreground animate-pulse">
                      Saving…
                    </span>
                  )}
                  {saved === field && saving !== field && (
                    <span className="text-xs font-semibold text-[#00B894]">
                      Saved ✓
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
                {extra}
              </div>
              <Toggle
                checked={settings[field]}
                onChange={(v) => void handleToggle(field, v)}
                label={label}
              />
            </div>
          </div>
        ))}

        {/* Keyboard layout selector */}
        <div className="px-6 py-5">
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <p className="font-bold text-foreground">Keyboard layout</p>
                {saving === "keyboard_layout" && (
                  <span className="text-xs text-muted-foreground animate-pulse">
                    Saving…
                  </span>
                )}
                {saved === "keyboard_layout" && saving !== "keyboard_layout" && (
                  <span className="text-xs font-semibold text-[#00B894]">
                    Saved ✓
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Choose the on-screen keyboard layout for spelling practice
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void handleKeyboardLayout("qwerty")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  settings.keyboard_layout === "qwerty"
                    ? "bg-[#6C5CE7] text-white"
                    : "bg-gray-100 text-foreground hover:bg-gray-200"
                }`}
              >
                QWERTY
              </button>
              <button
                type="button"
                onClick={() => void handleKeyboardLayout("abc")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  settings.keyboard_layout === "abc"
                    ? "bg-[#6C5CE7] text-white"
                    : "bg-gray-100 text-foreground hover:bg-gray-200"
                }`}
              >
                ABC
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
