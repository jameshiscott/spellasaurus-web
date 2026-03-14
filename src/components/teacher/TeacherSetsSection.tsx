"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import CreateSetButton from "@/components/teacher/CreateSetButton";

interface ClassLink {
  id: string;
  name: string;
}

interface SpellingSetItem {
  id: string;
  name: string;
  weekStart: string;
  weekNumber: number | null;
  isActive: boolean;
  activeFrom: string | null;
  createdAt: string;
  classes: ClassLink[];
  practiceCount: number;
  wordCount: number;
}

type Tab = "active" | "inactive";

export function TeacherSetsSection() {
  const [sets, setSets] = useState<SpellingSetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("active");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchSets = useCallback(async () => {
    try {
      const res = await fetch("/api/teacher/my-sets");
      if (res.ok) {
        const data = await res.json();
        setSets(data.sets ?? []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSets();
  }, [fetchSets]);

  const handleToggle = async (setId: string, currentlyActive: boolean) => {
    setTogglingId(setId);
    try {
      const res = await fetch("/api/teacher/toggle-set-active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setId, isActive: !currentlyActive }),
      });
      if (res.ok) {
        setSets((prev) =>
          prev.map((s) =>
            s.id === setId ? { ...s, isActive: !currentlyActive } : s
          )
        );
      }
    } catch {
      // silently fail
    } finally {
      setTogglingId(null);
    }
  };

  const activeSets = sets.filter((s) => s.isActive);
  const inactiveSets = sets.filter((s) => !s.isActive);
  const displayedSets = activeTab === "active" ? activeSets : inactiveSets;

  const header = (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <h2 className="text-xl font-black text-foreground">Your Lists</h2>
      <CreateSetButton onCreated={fetchSets} />
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {header}
        <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
          <p className="text-muted-foreground">Loading your spelling lists...</p>
        </div>
      </div>
    );
  }

  if (sets.length === 0) {
    return (
      <div className="space-y-4">
        {header}
        <div className="bg-white rounded-2xl border-2 border-dashed border-border p-10 text-center">
          <p className="text-4xl mb-3">📝</p>
          <p className="font-bold text-foreground">No spelling lists yet</p>
          <p className="text-muted-foreground text-sm mt-1">
            Create your first spelling list using the button above
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {header}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === "active"
              ? "bg-white text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Active ({activeSets.length})
        </button>
        <button
          onClick={() => setActiveTab("inactive")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === "inactive"
              ? "bg-white text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Inactive ({inactiveSets.length})
        </button>
      </div>

      {/* Table */}
      {displayedSets.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-border p-10 text-center">
          <p className="text-muted-foreground">
            {activeTab === "active"
              ? "No active lists. Activate a list to make it visible to students."
              : "No inactive lists."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="text-left px-4 py-3 font-bold text-foreground">Name</th>
                  <th className="text-right px-4 py-3 font-bold text-foreground">Words</th>
                  <th className="text-left px-4 py-3 font-bold text-foreground">Classes</th>
                  <th className="text-left px-4 py-3 font-bold text-foreground">Week</th>
                  <th className="text-right px-4 py-3 font-bold text-foreground">Practices</th>
                  <th className="text-left px-4 py-3 font-bold text-foreground">Active From</th>
                  <th className="text-right px-4 py-3 font-bold text-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {displayedSets.map((set) => {
                  let weekDisplay = "";
                  try {
                    weekDisplay = format(new Date(set.weekStart), "dd MMM yyyy");
                  } catch {
                    weekDisplay = set.weekStart;
                  }

                  let activeFromDisplay = "";
                  if (set.activeFrom) {
                    try {
                      activeFromDisplay = format(
                        new Date(set.activeFrom),
                        "dd MMM yyyy"
                      );
                    } catch {
                      activeFromDisplay = set.activeFrom;
                    }
                  }

                  return (
                    <tr
                      key={set.id}
                      className="border-b border-border last:border-b-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        {set.weekNumber != null && (
                          <span className="mr-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-500 text-white">
                            Wk {set.weekNumber}
                          </span>
                        )}
                        <Link
                          href={`/teacher/set/${set.id}/edit`}
                          className="font-semibold text-foreground hover:text-brand-500 transition-colors"
                        >
                          {set.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {set.wordCount}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {set.classes.length === 0
                          ? "—"
                          : set.classes.map((c) => c.name).join(", ")}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {weekDisplay}
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {set.practiceCount}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {activeFromDisplay || "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleToggle(set.id, set.isActive)}
                          disabled={togglingId === set.id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            set.isActive
                              ? "bg-orange-50 text-orange-700 hover:bg-orange-100"
                              : "bg-green-50 text-green-700 hover:bg-green-100"
                          } disabled:opacity-50`}
                        >
                          {togglingId === set.id
                            ? "..."
                            : set.isActive
                              ? "Deactivate"
                              : "Activate"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
