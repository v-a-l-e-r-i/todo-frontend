"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { login, error, clearError } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace("/app");
    } catch {
      // error surfaced via auth context
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-canvas)] px-4">
      <div className="w-full max-w-sm rounded-3xl bg-[var(--color-surface)] p-8 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-ink-faint)]">
          Ledger
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
          Log in to see what&apos;s on today.
        </p>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError();
              }}
              className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-muted)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-ink)]"
              placeholder="you@example.com"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError();
              }}
              className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-muted)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-ink)]"
              placeholder="••••••••"
            />
          </label>

          {error && <p className="text-sm font-medium text-[var(--color-coral)]">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-xl bg-[var(--color-accent)] py-2.5 text-sm font-semibold text-[var(--color-accent-ink)] transition hover:brightness-95 disabled:opacity-60"
          >
            {submitting ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[var(--color-ink-soft)]">
          New here?{" "}
          <Link href="/register" className="font-semibold text-[var(--color-ink)] underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
