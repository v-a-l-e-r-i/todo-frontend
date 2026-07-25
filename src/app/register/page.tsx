"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
  const { register, error, clearError } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register(username, email, password);
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
          Create your account
        </h1>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
          Organize tasks across as many projects as you need.
        </p>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Username
            <input
              required
              minLength={3}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                clearError();
              }}
              className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-muted)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-ink)]"
              placeholder="johndoe"
            />
          </label>
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
              minLength={8}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError();
              }}
              className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-muted)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-ink)]"
              placeholder="At least 8 characters, 1 letter + 1 number"
            />
          </label>

          {error && <p className="text-sm font-medium text-[var(--color-coral)]">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-xl bg-[var(--color-accent)] py-2.5 text-sm font-semibold text-[var(--color-accent-ink)] transition hover:brightness-95 disabled:opacity-60"
          >
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[var(--color-ink-soft)]">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[var(--color-ink)] underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
