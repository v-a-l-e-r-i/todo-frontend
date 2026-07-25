"use client";

import { useEffect, useState } from "react";
import { Trash2, X } from "lucide-react";
import { ProjectRead, TaskPriority, TaskRead, TaskStatus } from "@/lib/types";
import { PRIORITY_LABEL, PRIORITY_ORDER, STATUS_LABEL, STATUS_ORDER } from "@/lib/task-meta";
import { toDateInputValue } from "@/lib/format";

interface Props {
  task: TaskRead | null;
  projects: ProjectRead[];
  onClose: () => void;
  onSave: (
    id: string,
    payload: {
      title: string;
      description: string | null;
      priority: TaskPriority;
      status: TaskStatus;
      due_date: string | null;
    },
  ) => Promise<void>;
  onMove: (id: string, projectId: string | null) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function TaskDetailPanel({ task, projects, onClose, onSave, onMove, onDelete }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [dueDate, setDueDate] = useState("");
  const [projectId, setProjectId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!task) return;
    // Resetting the local draft form whenever the selected task changes, not syncing external state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTitle(task.title);
    setDescription(task.description ?? "");
    setPriority(task.priority);
    setStatus(task.status);
    setDueDate(toDateInputValue(task.due_date));
    setProjectId(task.project_id ?? "");
  }, [task]);

  if (!task) {
    return (
      <aside className="hidden w-full flex-col items-center justify-center gap-2 border-t border-[var(--color-line)] bg-[var(--color-surface)] p-6 text-center sm:border-l sm:border-t-0 lg:flex lg:w-[380px] lg:shrink-0">
        <p className="text-sm font-medium text-[var(--color-ink-faint)]">
          Select a task to see its details
        </p>
      </aside>
    );
  }

  async function handleSave() {
    if (!task) return;
    setSaving(true);
    try {
      if (projectId !== (task.project_id ?? "")) {
        await onMove(task.id, projectId || null);
      }
      await onSave(task.id, {
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
        priority,
        status,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!task) return;
    setDeleting(true);
    try {
      await onDelete(task.id);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <aside className="fixed inset-0 top-auto z-50 flex w-full shrink-0 flex-col border-t border-[var(--color-line)] bg-[var(--color-surface)] p-4 sm:static sm:p-6 lg:w-[380px]">
      <div className="flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">Task</h2>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-[var(--color-ink-faint)] hover:bg-[var(--color-surface-muted)] sm:hidden"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-4 overflow-y-auto sm:mt-5">
        <label className="flex flex-col gap-1 text-sm font-medium">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-muted)] px-3 py-2.5 text-base font-semibold outline-none focus:border-[var(--color-ink)]"
            placeholder="Task title"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-[var(--color-ink-soft)]">
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="resize-none rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-muted)] px-3 py-2.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]"
            placeholder="Add more detail…"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium text-[var(--color-ink-soft)]">
            List
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-muted)] px-3 py-2.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]"
            >
              <option value="">No list</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-[var(--color-ink-soft)]">
            Due date
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-muted)] px-3 py-2.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium text-[var(--color-ink-soft)]">
            Priority
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-muted)] px-3 py-2.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]"
            >
              {PRIORITY_ORDER.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABEL[p]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-[var(--color-ink-soft)]">
            Status
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-muted)] px-3 py-2.5 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-ink)]"
            >
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-[var(--color-line)] pt-4 sm:flex-row sm:items-center sm:gap-2">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-[var(--color-line)] px-4 py-2.5 text-sm font-semibold text-[var(--color-coral)] transition hover:bg-[var(--color-surface-muted)] disabled:opacity-60 sm:justify-start"
        >
          <Trash2 size={15} />
          Delete
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !title.trim()}
          className="rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--color-accent-ink)] transition hover:brightness-95 disabled:opacity-60 w-full sm:ml-auto sm:w-auto"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </aside>
  );
}
