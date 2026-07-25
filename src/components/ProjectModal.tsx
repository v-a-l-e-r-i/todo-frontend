"use client";

import { useEffect, useState } from "react";
import { ProjectRead } from "@/lib/types";

const SWATCHES = ["#e2604c", "#f6c445", "#4f8f86", "#6d8fe0", "#a674d1", "#e07ea0"];

interface Props {
  project: ProjectRead | null; // null = creating a new one
  open: boolean;
  onClose: () => void;
  onCreate: (payload: { name: string; description?: string | null; color?: string | null }) => Promise<void>;
  onUpdate: (id: string, payload: { name?: string; description?: string | null; color?: string | null }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function ProjectModal({ project, open, onClose, onCreate, onUpdate, onDelete }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(SWATCHES[0]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!open) return;
    // Resetting the local draft form whenever the modal opens for a (possibly different) project.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(project?.name ?? "");
    setDescription(project?.description ?? "");
    setColor(project?.color ?? SWATCHES[0]);
  }, [open, project]);

  if (!open) return null;

  async function handleSubmit() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (project) {
        await onUpdate(project.id, { name: name.trim(), description: description.trim() || null, color });
      } else {
        await onCreate({ name: name.trim(), description: description.trim() || null, color });
      }
      onClose();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!project) return;
    setDeleting(true);
    try {
      await onDelete(project.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-[var(--color-surface)] p-6 shadow-2xl">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">
          {project ? "Edit list" : "New list"}
        </h2>

        <div className="mt-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Name
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-muted)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-ink)]"
              placeholder="Work"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Description
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-muted)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-ink)]"
              placeholder="Optional"
            />
          </label>
          <div className="flex flex-col gap-1.5 text-sm font-medium">
            Color
            <div className="flex items-center gap-2">
              {SWATCHES.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  aria-label={c}
                  className="h-7 w-7 rounded-full ring-offset-2 transition"
                  style={{
                    background: c,
                    boxShadow: color === c ? `0 0 0 2px ${c}` : "none",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2">
          {project && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-xl border border-[var(--color-line)] px-4 py-2.5 text-sm font-semibold text-[var(--color-coral)] hover:bg-[var(--color-surface-muted)] disabled:opacity-60"
            >
              Delete
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-auto rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-muted)]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !name.trim()}
            className="rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--color-accent-ink)] hover:brightness-95 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
