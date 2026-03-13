"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TABLES } from "@/lib/constants";

interface ClassOption {
  id: string;
  name: string;
}

interface AssignSetToClassButtonProps {
  setId: string;
  currentClassId: string;
}

export function AssignSetToClassButton({
  setId,
  currentClassId,
}: AssignSetToClassButtonProps) {
  const [open, setOpen] = useState(false);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;

    const fetchClasses = async () => {
      setFetchLoading(true);
      setFetchError(null);
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setFetchError("Not authenticated");
          return;
        }

        const { data, error } = await supabase
          .from(TABLES.CLASSES)
          .select("id, name")
          .eq("teacher_id", user.id)
          .neq("id", currentClassId)
          .order("name");

        if (error) {
          setFetchError("Failed to load classes");
          return;
        }

        setClasses(data ?? []);
      } catch {
        setFetchError("Something went wrong loading classes");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchClasses();
  }, [open, currentClassId]);

  const handleOpen = () => {
    setSelectedClassId(null);
    setSubmitError(null);
    setSuccess(null);
    setOpen(true);
  };

  const handleClose = () => {
    if (!submitLoading) {
      setOpen(false);
      setSubmitError(null);
      setSuccess(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedClassId) {
      setSubmitError("Please select a class");
      return;
    }

    setSubmitLoading(true);
    setSubmitError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/teacher/assign-set-to-class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setId, classId: selectedClassId }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setSubmitError(body.error ?? "Failed to assign set");
        return;
      }

      const selected = classes.find((c) => c.id === selectedClassId);
      setSuccess(`Set assigned to "${selected?.name ?? "class"}" successfully.`);
      setSelectedClassId(null);
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
        Assign to Class
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
              <h2 className="text-xl font-black">Assign Set to Class</h2>
              <button
                onClick={handleClose}
                disabled={submitLoading}
                className="text-muted-foreground hover:text-foreground transition-colors text-xl leading-none"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            {fetchLoading ? (
              <div className="py-8 text-center text-muted-foreground font-semibold">
                Loading classes...
              </div>
            ) : fetchError ? (
              <p className="text-sm text-danger bg-red-50 rounded-xl px-4 py-2 mb-4">
                {fetchError}
              </p>
            ) : classes.length === 0 ? (
              <p className="text-center text-muted-foreground font-semibold text-sm py-4 mb-4">
                No other classes available.
              </p>
            ) : (
              <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                {classes.map((cls) => (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => setSelectedClassId(cls.id)}
                    className={`w-full text-left rounded-xl border-2 px-4 py-3 transition-colors ${
                      selectedClassId === cls.id
                        ? "border-brand-500 bg-brand-50"
                        : "border-border hover:bg-gray-50"
                    }`}
                  >
                    <p className="font-bold text-foreground text-sm">{cls.name}</p>
                  </button>
                ))}
              </div>
            )}

            {submitError && (
              <p className="text-sm text-danger bg-red-50 rounded-xl px-4 py-2 mb-4">
                {submitError}
              </p>
            )}

            {success && (
              <p className="text-sm text-green-700 bg-green-50 rounded-xl px-4 py-2 mb-4 font-semibold">
                {success}
              </p>
            )}

            <div className="flex gap-3">
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
                disabled={submitLoading || fetchLoading || !selectedClassId}
                className="flex-1 rounded-2xl bg-brand-500 text-white font-bold py-2 text-sm hover:bg-brand-600 disabled:opacity-60"
              >
                {submitLoading ? "Assigning..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
