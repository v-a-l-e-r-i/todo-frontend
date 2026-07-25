"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { ApiError, authApi, tokenStore } from "./api";
import { UserRead } from "./types";

interface AuthContextValue {
  user: UserRead | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!tokenStore.access) {
        setLoading(false);
        return;
      }
      try {
        const res = await authApi.me();
        setUser(res.data);
      } catch {
        tokenStore.clear();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const res = await authApi.login({ email, password });
      tokenStore.set(res.data.tokens);
      setUser(res.data.user);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Unable to log in");
      throw e;
    }
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    setError(null);
    try {
      await authApi.register({ username, email, password });
      await login(email, password);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Unable to register");
      throw e;
    }
  }, [login]);

  const logout = useCallback(async () => {
    const refresh = tokenStore.refresh;
    tokenStore.clear();
    setUser(null);
    if (refresh) {
      try {
        await authApi.logout(refresh);
      } catch {
        // token already cleared client-side; ignore network/API errors on logout
      }
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
