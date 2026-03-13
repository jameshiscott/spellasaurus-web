"use client";

import { useState, useCallback } from "react";

interface PracticeSettingsFormProps {
  childId: string;
  childName: string;
  settings: {
    play_tts_audio: boolean;
    show_description: boolean;
    show_example_sentence: boolean;
    leaderboard_opt_in: boolean;
  };
}

type SettingField =
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
  const [saving, setSaving] = useState<SettingField | null>(null);
  const [saved, setSaved] = useState<SettingField | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = useCallback(
    async (field: SettingField, value: boolean) => {
      const previous = settings[field];
      // Optimistic update
      setSettings((prev) => ({ ...prev, [field]: value }));
      setSaving(field);
      setError(null);

      try {
        const res = await fetch("/api/parent/update-settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ childId, field, value }),
        });

        if (!res.ok) {
          throw new Error("Failed to save");
        }

        setSaved(field);
        setTimeout(() => setSaved(null), 2000);
      } catch {
        // Revert on error
        setSettings((prev) => ({ ...prev, [field]: previous }));
        setError("Failed to save setting. Please try again.");
      } finally {
        setSaving(null);
      }
    },
    [childId, settings]
  );

  const toggleRows: Array<{
    field: SettingField;
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
      </div>
    </div>
  );
}
