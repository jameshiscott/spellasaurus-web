"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Teacher {
  id: string;
  full_name: string;
  email: string;
}

interface AssignTeacherButtonProps {
  classId: string;
  schoolId: string;
  currentTeacherId: string | null;
  currentTeacherName: string | null;
}

export function AssignTeacherButton({
  classId,
  schoolId,
  currentTeacherId,
  currentTeacherName,
}: AssignTeacherButtonProps) {
  const [open, setOpen] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(currentTeacherId);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;

    const fetchTeachers = async () => {
      setFetchLoading(true);
      setFetchError(null);
      try {
        const res = await fetch(`/api/admin/teachers?schoolId=${schoolId}`);
        if (!res.ok) {
          const body = await res.json();
          setFetchError(body.error ?? "Failed to load teachers");
          return;
        }
        const body = await res.json();
        setTeachers(body.teachers ?? []);
      } catch {
        setFetchError("Something went wrong loading teachers");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchTeachers();
  }, [open, schoolId]);

  const handleOpen = () => {
    setSelectedId(currentTeacherId);
    setSubmitError(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    setSubmitLoading(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/admin/assign-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, teacherId: selectedId }),
      });
      if (!res.ok) {
        const body = await res.json();
        setSubmitError(body.error ?? "Failed to assign teacher");
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setSubmitError("Something went wrong");
    } finally {
      setSubmitLoading(false);
    }
  };

  const label = currentTeacherName ? "Change Teacher" : "Assign Teacher";

  return (
    <>
      <button
        onClick={handleOpen}
        className="rounded-xl border-2 border-brand-200 text-brand-500 font-bold px-4 py-2 text-sm hover:bg-brand-50 transition-colors"
      >
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-black mb-4">{label}</h2>

            {fetchLoading ? (
              <div className="py-8 text-center text-muted-foreground font-semibold">
                Loading teachers…
              </div>
            ) : fetchError ? (
              <p className="text-sm text-danger bg-red-50 rounded-xl px-4 py-2 mb-4">
                {fetchError}
              </p>
            ) : (
              <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                {/* Remove teacher option */}
                {currentTeacherId && (
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    className={`w-full text-left rounded-xl border-2 px-4 py-3 font-semibold text-sm transition-colors ${
                      selectedId === null
                        ? "border-danger bg-red-50 text-danger"
                        : "border-border hover:bg-gray-50 text-muted-foreground"
                    }`}
                  >
                    Remove teacher
                  </button>
                )}

                {teachers.length === 0 ? (
                  <p className="text-center text-muted-foreground font-semibold text-sm py-4">
                    No teachers in this school yet.
                  </p>
                ) : (
                  teachers.map((teacher) => (
                    <button
                      key={teacher.id}
                      type="button"
                      onClick={() => setSelectedId(teacher.id)}
                      className={`w-full text-left rounded-xl border-2 px-4 py-3 transition-colors ${
                        selectedId === teacher.id
                          ? "border-brand-500 bg-brand-50"
                          : "border-border hover:bg-gray-50"
                      }`}
                    >
                      <p className="font-bold text-foreground text-sm">{teacher.full_name}</p>
                      <p className="text-xs text-muted-foreground font-semibold">{teacher.email}</p>
                    </button>
                  ))
                )}
              </div>
            )}

            {submitError && (
              <p className="text-sm text-danger bg-red-50 rounded-xl px-4 py-2 mb-4">
                {submitError}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-2xl border-2 border-border font-bold py-2 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitLoading || fetchLoading}
                className="flex-1 rounded-2xl bg-brand-500 text-white font-bold py-2 text-sm hover:bg-brand-600 disabled:opacity-60"
              >
                {submitLoading ? "Saving…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
