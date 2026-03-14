"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ClassOption {
  id: string;
  name: string;
}

interface ManageSetClassesProps {
  setId: string;
  homeClassId: string | null;
  linkedClassIds: string[];
  allClasses: ClassOption[];
}

export function ManageSetClasses({
  setId,
  homeClassId,
  linkedClassIds,
  allClasses,
}: ManageSetClassesProps) {
  const router = useRouter();
  const [linked, setLinked] = useState<string[]>(linkedClassIds);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const linkedClasses = allClasses.filter((c) => linked.includes(c.id));
  const unlinkedClasses = allClasses.filter((c) => !linked.includes(c.id));

  const handleAssign = async (classId: string) => {
    setLoading(classId);
    setError(null);
    try {
      const res = await fetch("/api/teacher/assign-set-to-class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setId, classId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Failed to assign");
        return;
      }
      setLinked((prev) => [...prev, classId]);
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  const handleUnassign = async (classId: string) => {
    // Don't allow removing the home class (it's the original class_id on the set)
    if (classId === homeClassId) return;

    setLoading(classId);
    setError(null);
    try {
      const res = await fetch("/api/teacher/unassign-set-from-class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setId, classId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Failed to unassign");
        return;
      }
      setLinked((prev) => prev.filter((id) => id !== classId));
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  if (allClasses.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
      <h2 className="text-lg font-bold text-foreground">Assigned Classes</h2>

      {linkedClasses.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Not assigned to any class yet.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {linkedClasses.map((cls) => (
            <span
              key={cls.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-700"
            >
              {cls.name}
              {cls.id !== homeClassId && (
                <button
                  onClick={() => handleUnassign(cls.id)}
                  disabled={loading === cls.id}
                  className="ml-1 text-blue-400 hover:text-blue-700 transition-colors disabled:opacity-50"
                  aria-label={`Remove ${cls.name}`}
                >
                  &times;
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {unlinkedClasses.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {unlinkedClasses.map((cls) => (
            <button
              key={cls.id}
              onClick={() => handleAssign(cls.id)}
              disabled={loading === cls.id}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border border-dashed border-border text-muted-foreground hover:border-brand-500 hover:text-brand-500 transition-colors disabled:opacity-50"
            >
              + {cls.name}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-danger bg-red-50 rounded-xl px-4 py-2">
          {error}
        </p>
      )}
    </div>
  );
}
