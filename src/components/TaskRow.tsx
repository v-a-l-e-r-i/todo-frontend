"use client";

import { ChevronRight } from "lucide-react";
import { ProjectRead, TaskRead } from "@/lib/types";
import { PRIORITY_COLOR } from "@/lib/task-meta";
import { formatDueDate, isOverdue } from "@/lib/format";

interface Props {
  task: TaskRead;
  project?: ProjectRead;
  active: boolean;
  onToggleDone: (task: TaskRead) => void;
  onOpen: (task: TaskRead) => void;
}

export default function TaskRow({ task, project, active, onToggleDone, onOpen }: Props) {
  const due = formatDueDate(task.due_date);
  const overdue = isOverdue(task);
  const done = task.status === "DONE";

  return (
    <div
      className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 transition ${
        active
          ? "border-[var(--color-ink)] bg-[var(--color-surface-muted)]"
          : "border-transparent hover:bg-[var(--color-surface-muted)]/70"
      }`}
    >
      <input
        type="checkbox"
        className="task-checkbox"
        checked={done}
        onChange={() => onToggleDone(task)}
        aria-label={done ? "Mark as not done" : "Mark as done"}
      />
      <button onClick={() => onOpen(task)} className="flex flex-1 items-center justify-between gap-3 text-left">
        <div className="min-w-0">
          <p className={`truncate text-sm font-medium ${done ? "text-[var(--color-ink-faint)] line-through" : "text-[var(--color-ink)]"}`}>
            {task.title}
          </p>
          <div className="mt-1 flex items-center gap-2 text-xs text-[var(--color-ink-faint)]">
            {due && (
              <span className={overdue ? "font-semibold text-[var(--color-coral)]" : ""}>{due}</span>
            )}
            {project && (
              <span className="flex items-center gap-1 rounded-full bg-[var(--color-surface)] px-2 py-0.5">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: project.color ?? "var(--color-ink-faint)" }}
                />
                {project.name}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: PRIORITY_COLOR[task.priority] }}
            title={`${task.priority} priority`}
          />
          <ChevronRight size={16} className="text-[var(--color-ink-faint)] opacity-0 transition group-hover:opacity-100" />
        </div>
      </button>
    </div>
  );
}
