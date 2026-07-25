import {
  AuthResponse,
  LoginPayload,
  PaginatedResponse,
  ProjectCreatePayload,
  ProjectRead,
  ProjectReadWithStats,
  ProjectUpdatePayload,
  RegisterPayload,
  SharedProjectView,
  SuccessResponse,
  TaskCreatePayload,
  TaskFilterParams,
  TaskRead,
  TaskUpdatePayload,
  TokenResponse,
  UserRead,
  UserUpdatePayload,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://todo-backend-production-ce11.up.railway.app/api/v1/";

const ACCESS_KEY = "ledger.access_token";
const REFRESH_KEY = "ledger.refresh_token";

export const tokenStore = {
  get access() {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(ACCESS_KEY);
  },
  get refresh() {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(REFRESH_KEY);
  },
  set(tokens: TokenResponse) {
    window.localStorage.setItem(ACCESS_KEY, tokens.access_token);
    window.localStorage.setItem(REFRESH_KEY, tokens.refresh_token);
  },
  clear() {
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  },
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

let refreshPromise: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  const refresh_token = tokenStore.refresh;
  if (!refresh_token) return false;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token }),
    });
    if (!res.ok) return false;
    const json: SuccessResponse<TokenResponse> = await res.json();
    tokenStore.set(json.data);
    return true;
  } catch {
    return false;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
  query?: Record<string, string | number | boolean | undefined>;
}

function buildQuery(query?: RequestOptions["query"]) {
  if (!query) return "";
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, query } = options;

  const doFetch = async (): Promise<Response> => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (auth) {
      const token = tokenStore.access;
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    return fetch(`${BASE_URL}${path}${buildQuery(query)}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  let res = await doFetch();

  if (res.status === 401 && auth) {
    if (!refreshPromise) {
      refreshPromise = doRefresh().finally(() => {
        refreshPromise = null;
      });
    }
    const refreshed = await refreshPromise;
    if (refreshed) {
      res = await doFetch();
    }
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const errJson = await res.json();
      message = errJson.detail ?? errJson.message ?? message;
    } catch {
      // ignore parse errors, keep default message
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ---- Auth ----

export const authApi = {
  register: (payload: RegisterPayload) =>
    request<SuccessResponse<UserRead>>("/auth/register", { method: "POST", body: payload, auth: false }),
  login: (payload: LoginPayload) =>
    request<SuccessResponse<AuthResponse>>("/auth/login", { method: "POST", body: payload, auth: false }),
  logout: (refresh_token: string) =>
    request<SuccessResponse<null>>("/auth/logout", { method: "POST", body: { refresh_token } }),
  me: () => request<SuccessResponse<UserRead>>("/auth/me"),
};

// ---- Users ----

export const usersApi = {
  me: () => request<SuccessResponse<UserRead>>("/users/me"),
  update: (payload: UserUpdatePayload) =>
    request<SuccessResponse<UserRead>>("/users/me", { method: "PATCH", body: payload }),
};

// ---- Projects ----

export const projectsApi = {
  list: () => request<SuccessResponse<ProjectRead[]>>("/projects"),
  get: (id: string) => request<SuccessResponse<ProjectReadWithStats>>(`/projects/${id}`),
  create: (payload: ProjectCreatePayload) =>
    request<SuccessResponse<ProjectRead>>("/projects", { method: "POST", body: payload }),
  update: (id: string, payload: ProjectUpdatePayload) =>
    request<SuccessResponse<ProjectRead>>(`/projects/${id}`, { method: "PATCH", body: payload }),
  remove: (id: string) => request<SuccessResponse<null>>(`/projects/${id}`, { method: "DELETE" }),
};

// ---- Tasks ----

export const tasksApi = {
  list: (filters: TaskFilterParams = {}) =>
    request<PaginatedResponse<TaskRead>>("/tasks", { query: { ...filters } }),
  get: (id: string) => request<SuccessResponse<TaskRead>>(`/tasks/${id}`),
  create: (payload: TaskCreatePayload) =>
    request<SuccessResponse<TaskRead>>("/tasks", { method: "POST", body: payload }),
  update: (id: string, payload: TaskUpdatePayload) =>
    request<SuccessResponse<TaskRead>>(`/tasks/${id}`, { method: "PATCH", body: payload }),
  remove: (id: string) => request<SuccessResponse<null>>(`/tasks/${id}`, { method: "DELETE" }),
  setStatus: (id: string, status: TaskRead["status"]) =>
    request<SuccessResponse<TaskRead>>(`/tasks/${id}/status`, { method: "PATCH", body: { status } }),
  move: (id: string, project_id: string | null) =>
    request<SuccessResponse<TaskRead>>(`/tasks/${id}/move`, { method: "PATCH", body: { project_id } }),
};

// ---- Sharing ----
// The backend does not yet expose an email-sending endpoint (per project notes).
// This calls a REST-conventional endpoint so it works the moment it's added;
// until then the UI surfaces a clear "not available yet" error instead of failing silently.

export const shareApi = {
  shareProject: (id: string, email: string) =>
    request<SuccessResponse<null>>(`/projects/${id}/share`, { method: "POST", body: { email } }),
  getSharedProject: (token: string) =>
    request<SuccessResponse<SharedProjectView>>(`/projects/shared/${token}`, { auth: false }),
};
