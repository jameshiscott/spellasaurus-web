"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface EditableSetHeaderProps {
  setId: string;
  initialName: string;
  initialWeekStart: string;
  weekNumber: number | null;
  wordCount: number;
  isActive: boolean;
}

export function EditableSetHeader({
  setId,
  initialName,
  initialWeekStart,
  weekNumber,
  wordCount,
  isActive,
}: EditableSetHeaderProps) {
  const router = useRouter();
  const [editingName, setEditingName] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  const [name, setName] = useState(initialName);
  const [weekStart, setWeekStart] = useState(initialWeekStart);
  const [saving, setSaving] = useState(false);

  async function saveName() {
    if (!name.trim() || name === initialName) {
      setName(initialName);
      setEditingName(false);
      return;
    }
    setSaving(true);
    const res = await fetch("/api/teacher/update-set", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setId, name: name.trim() }),
    });
    setSaving(false);
    if (res.ok) {
      setEditingName(false);
      router.refresh();
    }
  }

  async function saveDate() {
    if (!weekStart || weekStart === initialWeekStart) {
      setWeekStart(initialWeekStart);
      setEditingDate(false);
      return;
    }
    setSaving(true);
    const res = await fetch("/api/teacher/update-set", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setId, weekStart }),
    });
    setSaving(false);
    if (res.ok) {
      setEditingDate(false);
      router.refresh();
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex-1 min-w-0">
          {/* Editable name */}
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveName();
                  if (e.key === "Escape") {
                    setName(initialName);
                    setEditingName(false);
                  }
                }}
                autoFocus
                disabled={saving}
                className="text-2xl font-black text-foreground border-b-2 border-brand-500 bg-transparent outline-none flex-1 min-w-0"
              />
              <button
                onClick={saveName}
                disabled={saving}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-brand-500 text-white hover:bg-brand-600 transition-colors disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setName(initialName);
                  setEditingName(false);
                }}
                disabled={saving}
                className="px-3 py-1 rounded-lg text-xs font-semibold border border-border text-foreground hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <h1
              className="text-2xl font-black text-foreground cursor-pointer hover:text-brand-500 transition-colors group"
              onClick={() => setEditingName(true)}
              title="Click to edit name"
            >
              {name}
              <span className="text-muted-foreground opacity-0 group-hover:opacity-100 text-sm font-normal ml-2 transition-opacity">
                (edit)
              </span>
            </h1>
          )}

          {/* Info line with editable date */}
          <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1 flex-wrap">
            {editingDate ? (
              <span className="inline-flex items-center gap-2">
                <span>Active from:</span>
                <input
                  type="date"
                  value={weekStart}
                  onChange={(e) => setWeekStart(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveDate();
                    if (e.key === "Escape") {
                      setWeekStart(initialWeekStart);
                      setEditingDate(false);
                    }
                  }}
                  autoFocus
                  disabled={saving}
                  className="px-2 py-0.5 rounded-lg border border-brand-500 text-sm focus:outline-none"
                />
                <button
                  onClick={saveDate}
                  disabled={saving}
                  className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-brand-500 text-white hover:bg-brand-600 transition-colors disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setWeekStart(initialWeekStart);
                    setEditingDate(false);
                  }}
                  disabled={saving}
                  className="px-2 py-0.5 rounded-lg text-xs font-semibold border border-border text-foreground hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </span>
            ) : (
              <span
                className="cursor-pointer hover:text-brand-500 transition-colors"
                onClick={() => setEditingDate(true)}
                title="Click to edit date"
              >
                {weekNumber != null ? `Week ${weekNumber}` : weekStart}
              </span>
            )}
            <span> · </span>
            <span>
              {wordCount} {wordCount === 1 ? "word" : "words"}
            </span>
            <span> · </span>
            <span className={cn(isActive ? "text-green-600" : "text-orange-600")}>
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {weekNumber != null && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-brand-500 text-white">
            Week {weekNumber}
          </span>
        )}
      </div>
    </div>
  );
}
