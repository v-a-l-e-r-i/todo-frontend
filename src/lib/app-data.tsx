"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { ApiError, projectsApi, tasksApi } from "./api";
import { ProjectRead, TaskCreatePayload, TaskRead, TaskUpdatePayload } from "./types";
import { useToast } from "./toast-context";

interface AppDataContextValue {
  tasks: TaskRead[];
  projects: ProjectRead[];
  loading: boolean;
  refresh: () => Promise<void>;
  createTask: (payload: TaskCreatePayload) => Promise<TaskRead>;
  updateTask: (id: string, payload: TaskUpdatePayload) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleDone: (task: TaskRead) => Promise<void>;
  moveTask: (id: string, projectId: string | null) => Promise<void>;
  createProject: (payload: { name: string; description?: string | null; color?: string | null }) => Promise<ProjectRead>;
  updateProject: (
    id: string,
    payload: { name?: string; description?: string | null; color?: string | null },
  ) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

// Fetches every task page from the backend so client-side nav filters (Today,
// Upcoming, per-project counts) can work against the full set. Fine for a
// personal task list; swap for server-side filtering if volume grows a lot.
async function fetchAllTasks(): Promise<TaskRead[]> {
  const size = 100;
  let page = 1;
  let all: TaskRead[] = [];
  for (;;) {
    const res = await tasksApi.list({ page, size, sort: "-created_at" });
    all = all.concat(res.data);
    if (page >= res.pages || res.data.length === 0) break;
    page += 1;
  }
  return all;
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<TaskRead[]>([]);
  const [projects, setProjects] = useState<ProjectRead[]>([]);
  const [loading, setLoading] = useState(true);
  const { push } = useToast();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [taskList, projectRes] = await Promise.all([fetchAllTasks(), projectsApi.list()]);
      setTasks(taskList);
      setProjects(projectRes.data);
    } catch (e) {
      push(e instanceof ApiError ? e.message : "Could not load your data", "error");
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => {
    // Initial data load on mount, not synchronizing with an external system's changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const createTask = useCallback(
    async (payload: TaskCreatePayload) => {
      const res = await tasksApi.create(payload);
      setTasks((prev) => [res.data, ...prev]);
      return res.data;
    },
    [],
  );

  const updateTask = useCallback(async (id: string, payload: TaskUpdatePayload) => {
    const res = await tasksApi.update(id, payload);
    setTasks((prev) => prev.map((t) => (t.id === id ? res.data : t)));
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    await tasksApi.remove(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleDone = useCallback(async (task: TaskRead) => {
    const nextStatus = task.status === "DONE" ? "TODO" : "DONE";
    const res = await tasksApi.setStatus(task.id, nextStatus);
    setTasks((prev) => prev.map((t) => (t.id === task.id ? res.data : t)));
  }, []);

  const moveTask = useCallback(async (id: string, projectId: string | null) => {
    const res = await tasksApi.move(id, projectId);
    setTasks((prev) => prev.map((t) => (t.id === id ? res.data : t)));
  }, []);

  const createProject = useCallback(
    async (payload: { name: string; description?: string | null; color?: string | null }) => {
      const res = await projectsApi.create(payload);
      setProjects((prev) => [...prev, res.data]);
      return res.data;
    },
    [],
  );

  const updateProject = useCallback(
    async (id: string, payload: { name?: string; description?: string | null; color?: string | null }) => {
      const res = await projectsApi.update(id, payload);
      setProjects((prev) => prev.map((p) => (p.id === id ? res.data : p)));
    },
    [],
  );

  const deleteProject = useCallback(async (id: string) => {
    await projectsApi.remove(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    // Cascades server-side; drop the project's tasks from local state too.
    setTasks((prev) => prev.filter((t) => t.project_id !== id));
  }, []);

  return (
    <AppDataContext.Provider
      value={{
        tasks,
        projects,
        loading,
        refresh,
        createTask,
        updateTask,
        deleteTask,
        toggleDone,
        moveTask,
        createProject,
        updateProject,
        deleteProject,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
