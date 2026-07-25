import { TaskPriority, TaskStatus } from "./types";

export const STATUS_ORDER: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

export const STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};

export const PRIORITY_ORDER: TaskPriority[] = ["LOW", "MEDIUM", "HIGH"];

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

// Tailwind-safe hex values referenced directly (see globals.css tokens).
export const PRIORITY_COLOR: Record<TaskPriority, string> = {
  LOW: "var(--color-teal)",
  MEDIUM: "var(--color-accent)",
  HIGH: "var(--color-coral)",
};
