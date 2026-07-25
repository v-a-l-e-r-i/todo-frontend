"use client";

import { FormEvent, useMemo, useState } from "react";
import { Mail, Plus } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TaskRow from "@/components/TaskRow";
import TaskDetailPanel from "@/components/TaskDetailPanel";
import ProjectModal from "@/components/ProjectModal";
import ShareModal from "@/components/ShareModal";
import { useAppData } from "@/lib/app-data";
import { useToast } from "@/lib/toast-context";
import { ApiError } from "@/lib/api";
import { NavKey, ProjectRead } from "@/lib/types";
import { isOverdue, isToday, isUpcoming } from "@/lib/format";

const NAV_TITLES: Record<string, string> = {
  all: "All tasks",
  today: "Today",
  upcoming: "Upcoming",
  overdue: "Overdue",
};

export default function DashboardPage() {
  const { tasks, projects, loading, createTask, updateTask, deleteTask, toggleDone, moveTask, createProject, updateProject, deleteProject } =
    useAppData();
  const { push } = useToast();

  const [activeNav, setActiveNav] = useState<NavKey>("today");
  const [search, setSearch] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectRead | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const activeProject = activeNav.startsWith("project:")
    ? projects.find((p) => `project:${p.id}` === activeNav) ?? null
    : null;

  const visibleTasks = useMemo(() => {
    let list = tasks;
    if (activeNav === "today") list = list.filter((t) => isToday(t.due_date) && t.status !== "DONE");
    else if (activeNav === "upcoming") list = list.filter((t) => isUpcoming(t));
    else if (activeNav === "overdue") list = list.filter((t) => isOverdue(t));
    else if (activeNav === "all") list = list.filter((t) => t.status !== "DONE");
    else if (activeProject) list = list.filter((t) => t.project_id === activeProject.id);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((t) => t.title.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }, [tasks, activeNav, activeProject, search]);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null;
  const title = activeProject ? activeProject.name : NAV_TITLES[activeNav] ?? "Tasks";

  async function handleAddTask(e: FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      const dueDate = activeNav === "today" ? new Date().toISOString() : null;
      const created = await createTask({
        title: newTitle.trim(),
        project_id: activeProject?.id ?? null,
        due_date: dueDate,
      });
      setNewTitle("");
      setSelectedTaskId(created.id);
    } catch (err) {
      push(err instanceof ApiError ? err.message : "Couldn't create that task", "error");
    } finally {
      setAdding(false);
    }
  }

  async function handleToggleDone(task: (typeof tasks)[number]) {
    try {
      await toggleDone(task);
    } catch (err) {
      push(err instanceof ApiError ? err.message : "Couldn't update the task", "error");
    }
  }

  async function handleSave(
    id: string,
    payload: Parameters<Parameters<typeof TaskDetailPanel>[0]["onSave"]>[1],
  ) {
    try {
      await updateTask(id, payload);
      push("Task updated");
    } catch (err) {
      push(err instanceof ApiError ? err.message : "Couldn't save changes", "error");
    }
  }

  async function handleMove(id: string, projectId: string | null) {
    try {
      await moveTask(id, projectId);
    } catch (err) {
      push(err instanceof ApiError ? err.message : "Couldn't move the task", "error");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTask(id);
      setSelectedTaskId(null);
      push("Task deleted");
    } catch (err) {
      push(err instanceof ApiError ? err.message : "Couldn't delete the task", "error");
    }
  }

  async function handleCreateProject(payload: { name: string; description?: string | null; color?: string | null }) {
    try {
      const created = await createProject(payload);
      setActiveNav(`project:${created.id}`);
    } catch (err) {
      push(err instanceof ApiError ? err.message : "Couldn't create that list", "error");
      throw err;
    }
  }

  async function handleUpdateProject(id: string, payload: { name?: string; description?: string | null; color?: string | null }) {
    try {
      await updateProject(id, payload);
    } catch (err) {
      push(err instanceof ApiError ? err.message : "Couldn't update that list", "error");
      throw err;
    }
  }

  async function handleDeleteProject(id: string) {
    try {
      await deleteProject(id);
      if (activeNav === `project:${id}`) setActiveNav("all");
    } catch (err) {
      push(err instanceof ApiError ? err.message : "Couldn't delete that list", "error");
      throw err;
    }
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[var(--color-canvas)] p-2 gap-2 lg:flex-row lg:p-3 lg:gap-3">
      <Sidebar
        projects={projects}
        tasks={tasks}
        activeNav={activeNav}
        onNavChange={(key) => {
          setActiveNav(key);
          setSelectedTaskId(null);
        }}
        onAddProject={() => {
          setEditingProject(null);
          setProjectModalOpen(true);
        }}
        onEditProject={(project) => {
          setEditingProject(project);
          setProjectModalOpen(true);
        }}
        search={search}
        onSearchChange={setSearch}
      />

      <main className="flex min-w-0 flex-1 flex-col rounded-2xl bg-[var(--color-surface)] p-4 lg:rounded-3xl lg:p-6">
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <h1 className="font-[family-name:var(--font-display)] text-xl font-bold sm:text-2xl">{title}</h1>
            <span className="rounded-full bg-[var(--color-surface-muted)] px-2.5 py-0.5 text-sm font-semibold text-[var(--color-ink-faint)]">
              {visibleTasks.length}
            </span>
          </div>
          {activeProject && (
            <button
              onClick={() => setShareModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-[var(--color-line)] px-3 py-2 text-sm font-medium text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-muted)]"
            >
              <Mail size={15} />
              Share
            </button>
          )}
        </div>

        <form onSubmit={handleAddTask} className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
          <Plus size={17} className="hidden text-[var(--color-ink-faint)] sm:block" />
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add new task"
            className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-[var(--color-ink-faint)]"
          />
          <button
            type="submit"
            disabled={adding || !newTitle.trim()}
            className="shrink-0 rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-accent-ink)] transition hover:brightness-95 disabled:opacity-50 w-full sm:w-auto"
          >
            Add
          </button>
        </form>

        <div className="mt-4 flex-1 overflow-y-auto pr-1">
          {loading && <p className="p-4 text-sm text-[var(--color-ink-faint)]">Loading…</p>}

          {!loading && visibleTasks.length === 0 && (
            <p className="p-4 text-sm text-[var(--color-ink-faint)]">Nothing here yet.</p>
          )}

          <div className="flex flex-col gap-1.5">
            {visibleTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                project={projects.find((p) => p.id === task.project_id)}
                active={task.id === selectedTaskId}
                onToggleDone={handleToggleDone}
                onOpen={(t) => setSelectedTaskId(t.id)}
              />
            ))}
          </div>
        </div>
      </main>

      <TaskDetailPanel
        task={selectedTask}
        projects={projects}
        onClose={() => setSelectedTaskId(null)}
        onSave={handleSave}
        onMove={handleMove}
        onDelete={handleDelete}
      />

      <ProjectModal
        open={projectModalOpen}
        project={editingProject}
        onClose={() => setProjectModalOpen(false)}
        onCreate={handleCreateProject}
        onUpdate={handleUpdateProject}
        onDelete={handleDeleteProject}
      />

      <ShareModal project={activeProject} open={shareModalOpen} onClose={() => setShareModalOpen(false)} />
    </div>
  );
}
