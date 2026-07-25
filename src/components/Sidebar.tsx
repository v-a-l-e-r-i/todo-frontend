"use client";

import { CalendarClock, CalendarDays, ListChecks, LogOut, Plus, AlertCircle, Search } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ProjectRead, TaskRead, NavKey } from "@/lib/types";
import { isOverdue, isToday, isUpcoming } from "@/lib/format";

interface Props {
  projects: ProjectRead[];
  tasks: TaskRead[];
  activeNav: NavKey;
  onNavChange: (key: NavKey) => void;
  onAddProject: () => void;
  onEditProject: (project: ProjectRead) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

export default function Sidebar({
  projects,
  tasks,
  activeNav,
  onNavChange,
  onAddProject,
  onEditProject,
  search,
  onSearchChange,
}: Props) {
  const { user, logout } = useAuth();

  const incomplete = tasks.filter((t) => t.status !== "DONE");
  const counts = {
    all: incomplete.length,
    today: incomplete.filter((t) => isToday(t.due_date)).length,
    upcoming: incomplete.filter((t) => isUpcoming(t)).length,
    overdue: incomplete.filter((t) => isOverdue(t)).length,
  };

  function projectCount(projectId: string) {
    return tasks.filter((t) => t.project_id === projectId && t.status !== "DONE").length;
  }

  const navItem = (key: NavKey, label: string, icon: React.ReactNode, count: number) => (
    <button
      onClick={() => onNavChange(key)}
      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition ${
        activeNav === key
          ? "bg-[var(--color-surface-muted)] text-[var(--color-ink)]"
          : "text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-muted)]/60"
      }`}
    >
      <span className="flex items-center gap-2.5">
        {icon}
        {label}
      </span>
      {count > 0 && <span className="text-xs text-[var(--color-ink-faint)]">{count}</span>}
    </button>
  );

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col justify-between bg-[var(--color-surface)] p-5">
      <div className="flex flex-col gap-6 overflow-y-auto">
        <div className="flex items-center gap-2 px-1">
          <div className="h-7 w-7 rounded-lg bg-[var(--color-accent)]" />
          <span className="font-[family-name:var(--font-display)] text-lg font-bold">Ledger</span>
        </div>

        <label className="flex items-center gap-2 rounded-xl bg-[var(--color-surface-muted)] px-3 py-2 text-sm text-[var(--color-ink-faint)] focus-within:text-[var(--color-ink)]">
          <Search size={15} />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search"
            className="w-full bg-transparent text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-faint)]"
          />
        </label>

        <div className="flex flex-col gap-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-faint)]">
            Tasks
          </p>
          {navItem("all", "All tasks", <ListChecks size={17} />, counts.all)}
          {navItem("today", "Today", <CalendarDays size={17} />, counts.today)}
          {navItem("upcoming", "Upcoming", <CalendarClock size={17} />, counts.upcoming)}
          {navItem("overdue", "Overdue", <AlertCircle size={17} />, counts.overdue)}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between px-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-faint)]">
              Lists
            </p>
            <button
              onClick={onAddProject}
              aria-label="Add list"
              className="rounded-md p-0.5 text-[var(--color-ink-faint)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)]"
            >
              <Plus size={15} />
            </button>
          </div>
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => onNavChange(`project:${p.id}`)}
              onDoubleClick={() => onEditProject(p)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition ${
                activeNav === `project:${p.id}`
                  ? "bg-[var(--color-surface-muted)] text-[var(--color-ink)]"
                  : "text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-muted)]/60"
              }`}
              title="Double-click to edit"
            >
              <span className="flex items-center gap-2.5 truncate">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: p.color ?? "var(--color-ink-faint)" }}
                />
                <span className="truncate">{p.name}</span>
              </span>
              <span className="text-xs text-[var(--color-ink-faint)]">{projectCount(p.id)}</span>
            </button>
          ))}
          {projects.length === 0 && (
            <p className="px-3 text-sm text-[var(--color-ink-faint)]">No lists yet.</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-[var(--color-line)] pt-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{user?.username}</p>
          <p className="truncate text-xs text-[var(--color-ink-faint)]">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          aria-label="Sign out"
          className="rounded-lg p-2 text-[var(--color-ink-faint)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-coral)]"
        >
          <LogOut size={17} />
        </button>
      </div>
    </aside>
  );
}
