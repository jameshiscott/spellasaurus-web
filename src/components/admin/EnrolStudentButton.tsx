"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface EnrolStudentButtonProps {
  classId: string;
  schoolId: string;
}

export function EnrolStudentButton({ classId, schoolId }: EnrolStudentButtonProps) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleOpen = () => {
    setUsername("");
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
    const trimmed = username.trim();
    if (!trimmed) {
      setSubmitError("Please enter a username");
      return;
    }

    setSubmitLoading(true);
    setSubmitError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/enrol-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId, username: trimmed, schoolId }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setSubmitError(body.error ?? "Failed to enrol student");
        return;
      }

      setSuccess(`Student "${trimmed}" enrolled successfully.`);
      setUsername("");
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
              <div>
                <label
                  htmlFor="admin-enrol-username"
                  className="block text-sm font-semibold text-foreground mb-1"
                >
                  Child&apos;s username
                </label>
                <input
                  id="admin-enrol-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !submitLoading) {
                      handleSubmit();
                    }
                  }}
                  placeholder="e.g. dino_max"
                  className="w-full px-3 py-2 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                />
                <p className="mt-1 text-xs text-muted-foreground font-semibold">
                  Enter the child&apos;s display name to enrol them in this class.
                </p>
              </div>

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
                  disabled={submitLoading || !username.trim()}
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
