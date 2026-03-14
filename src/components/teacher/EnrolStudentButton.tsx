"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface EnrolStudentButtonProps {
  classId: string;
}

interface ChildResult {
  id: string;
  fullName: string;
  displayName: string | null;
}

export function EnrolStudentButton({ classId }: EnrolStudentButtonProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ChildResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedChild, setSelectedChild] = useState<ChildResult | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleOpen = () => {
    setQuery("");
    setResults([]);
    setSelectedChild(null);
    setSubmitError(null);
    setSuccess(null);
    setOpen(true);
  };

  const handleClose = () => {
    if (!submitLoading) {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search-children?q=${encodeURIComponent(trimmed)}`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.children ?? []);
        }
      } catch {
        // silently fail
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, open]);

  const handleSelect = (child: ChildResult) => {
    setSelectedChild(child);
    setQuery("");
    setResults([]);
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    if (!selectedChild) return;

    setSubmitLoading(true);
    setSubmitError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/teacher/enrol-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, childId: selectedChild.id }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setSubmitError(body.error ?? "Failed to enrol student");
        return;
      }

      setSuccess(`${selectedChild.fullName} enrolled successfully!`);
      setSelectedChild(null);
      router.refresh();
    } catch {
      setSubmitError("Something went wrong");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="rounded-xl border-2 border-brand-200 text-brand-500 font-bold px-4 py-2 text-sm hover:bg-brand-50 transition-colors"
      >
        Add Student
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={handleClose}
        >
          <div
            className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black">Add Student</h2>
              <button
                onClick={handleClose}
                disabled={submitLoading}
                className="text-muted-foreground hover:text-foreground transition-colors text-xl leading-none"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              {/* Selected child */}
              {selectedChild ? (
                <div className="flex items-center justify-between gap-3 rounded-xl border-2 border-brand-200 bg-brand-50 px-4 py-3">
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      {selectedChild.fullName}
                    </p>
                    {selectedChild.displayName && (
                      <p className="text-xs text-muted-foreground">
                        @{selectedChild.displayName}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedChild(null)}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="teacher-enrol-search"
                    className="block text-sm font-semibold text-foreground mb-1"
                  >
                    Search by name or username
                  </label>
                  <input
                    id="teacher-enrol-search"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Start typing a name..."
                    autoComplete="off"
                    className="w-full px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Only children not already in a class are shown.
                  </p>

                  {/* Search results dropdown */}
                  {query.trim().length >= 2 && (
                    <div className="mt-2 rounded-xl border border-border bg-white shadow-sm max-h-48 overflow-y-auto">
                      {searching ? (
                        <p className="px-4 py-3 text-sm text-muted-foreground">
                          Searching...
                        </p>
                      ) : results.length === 0 ? (
                        <p className="px-4 py-3 text-sm text-muted-foreground">
                          No matching children found
                        </p>
                      ) : (
                        results.map((child) => (
                          <button
                            key={child.id}
                            onClick={() => handleSelect(child)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-border last:border-b-0"
                          >
                            <p className="font-semibold text-foreground text-sm">
                              {child.fullName}
                            </p>
                            {child.displayName && (
                              <p className="text-xs text-muted-foreground">
                                @{child.displayName}
                              </p>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {submitError && (
                <p className="text-sm text-danger bg-red-50 rounded-xl px-4 py-2">
                  {submitError}
                </p>
              )}

              {success && (
                <p className="text-sm text-green-700 bg-green-50 rounded-xl px-4 py-2 font-semibold">
                  {success}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={submitLoading}
                  className="flex-1 rounded-2xl border-2 border-border font-bold py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitLoading || !selectedChild}
                  className="flex-1 rounded-2xl bg-brand-500 text-white font-bold py-2 text-sm hover:bg-brand-600 disabled:opacity-60"
                >
                  {submitLoading ? "Enrolling..." : "Add Student"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
