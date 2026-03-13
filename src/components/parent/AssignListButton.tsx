"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  setId: string;
  currentChildIds: string[];
  availableChildren: Array<{ id: string; full_name: string }>;
}

export function AssignListButton({ setId, currentChildIds, availableChildren }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(
    new Set(currentChildIds)
  );
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const router = useRouter();

  const handleOpen = () => {
    setSelected(new Set(currentChildIds));
    setApiError(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setApiError(null);
  };

  const toggleChild = (childId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(childId)) {
        next.delete(childId);
      } else {
        next.add(childId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    setApiError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/parent/assign-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setId, childIds: Array.from(selected) }),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        setApiError(body.error ?? "Failed to save assignments");
        return;
      }
      handleClose();
      router.refresh();
    } catch {
      setApiError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="rounded-xl bg-[#6C5CE7] text-white font-bold px-4 py-2 text-sm hover:bg-[#5a4bd1] transition-colors"
      >
        Assign
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-black mb-1">Assign to Children</h2>
            <p className="text-sm text-muted-foreground mb-5">
              Select which children should practise this list.
            </p>

            {availableChildren.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No children added yet.
              </p>
            ) : (
              <div className="space-y-2 mb-5">
                {availableChildren.map((c) => {
                  const isChecked = selected.has(c.id);
                  return (
                    <label
                      key={c.id}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer border-2 transition-colors ${
                        isChecked
                          ? "border-[#6C5CE7] bg-[#6C5CE7]/5"
                          : "border-border hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleChild(c.id)}
                        className="w-4 h-4 accent-[#6C5CE7] shrink-0"
                      />
                      <span className="text-2xl">🦕</span>
                      <span className="font-semibold text-foreground">
                        {c.full_name}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            {apiError && (
              <p className="text-sm text-[#D63031] bg-red-50 rounded-xl px-4 py-2 mb-4">
                {apiError}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-2xl border-2 border-border font-bold py-2 text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={loading}
                className="flex-1 rounded-2xl bg-[#6C5CE7] text-white font-bold py-2 text-sm hover:bg-[#5a4bd1] disabled:opacity-60 transition-colors"
              >
                {loading ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
