// Mirrors the FastAPI schemas (app/schemas/*.py) provided by the backend.

export interface SuccessResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  page: number;
  size: number;
  total: number;
  pages: number;
}

// ---- Auth ----

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AuthResponse {
  user: UserRead;
  tokens: TokenResponse;
}

// ---- User ----

export interface UserRead {
  id: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface UserUpdatePayload {
  username?: string;
  email?: string;
}

// ---- Project ----

export interface ProjectRead {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectReadWithStats extends ProjectRead {
  task_count: number;
  completed_task_count: number;
}

export interface ProjectCreatePayload {
  name: string;
  description?: string | null;
  color?: string | null;
}

export type ProjectUpdatePayload = Partial<ProjectCreatePayload>;

// ---- Task ----
// TaskStatus / TaskPriority match app/models/task.py exactly (SQLAlchemy str enums).
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface TaskRead {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  completed_at: string | null;
  project_id: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface TaskCreatePayload {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;
  project_id?: string | null;
}

export interface TaskUpdatePayload {
  title?: string;
  description?: string | null;
  priority?: TaskPriority;
  due_date?: string | null;
  status?: TaskStatus;
}

export interface TaskFilterParams {
  status?: TaskStatus;
  priority?: TaskPriority;
  project_id?: string;
  search?: string;
  overdue?: boolean;
  due_today?: boolean;
  completed?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}

export type NavKey = "all" | "today" | "upcoming" | "overdue" | `project:${string}`;

// ---- Sharing ----
// Response of the public GET /projects/shared/{token} endpoint.
export interface SharedProjectView {
  name: string;
  description: string | null;
  color: string | null;
  tasks: Omit<TaskRead, "owner_id">[];
}
