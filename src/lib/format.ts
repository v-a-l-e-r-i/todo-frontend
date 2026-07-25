import { TaskRead } from "./types";

export function formatDueDate(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  const now = new Date();
  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((dateDay.getTime() - today.getTime()) / 86_400_000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function isToday(iso: string | null): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function isOverdue(task: TaskRead): boolean {
  if (!task.due_date || task.status === "DONE") return false;
  return new Date(task.due_date).getTime() < Date.now() && !isToday(task.due_date);
}

export function isUpcoming(task: TaskRead): boolean {
  if (!task.due_date || task.status === "DONE") return false;
  return new Date(task.due_date).getTime() > Date.now() && !isToday(task.due_date);
}
