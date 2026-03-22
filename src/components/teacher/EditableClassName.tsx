"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface EditableClassNameProps {
  classId: string;
  initialName: string;
}

export function EditableClassName({ classId, initialName }: EditableClassNameProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim() || name.trim() === initialName) {
      setName(initialName);
      setEditing(false);
      return;
    }
    setSaving(true);
    const res = await fetch("/api/teacher/update-class", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId, name: name.trim() }),
    });
    setSaving(false);
    if (res.ok) {
      setEditing(false);
      router.refresh();
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") {
              setName(initialName);
              setEditing(false);
            }
          }}
          autoFocus
          disabled={saving}
          className="text-2xl font-black text-foreground border-b-2 border-brand-500 bg-transparent outline-none flex-1 min-w-0"
        />
        <button
          onClick={save}
          disabled={saving}
          className="px-3 py-1 rounded-lg text-xs font-semibold bg-brand-500 text-white hover:bg-brand-600 transition-colors disabled:opacity-50"
        >
          Save
        </button>
        <button
          onClick={() => {
            setName(initialName);
            setEditing(false);
          }}
          disabled={saving}
          className="px-3 py-1 rounded-lg text-xs font-semibold border border-border text-foreground hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <h1
      className="text-2xl font-black text-foreground cursor-pointer hover:text-brand-500 transition-colors group"
      onClick={() => setEditing(true)}
      title="Click to edit name"
    >
      {name}
      <span className="text-muted-foreground opacity-0 group-hover:opacity-100 text-sm font-normal ml-2 transition-opacity">
        (edit)
      </span>
    </h1>
  );
}
