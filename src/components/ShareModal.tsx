"use client";

import { FormEvent, useState } from "react";
import { ApiError, shareApi } from "@/lib/api";
import { ProjectRead } from "@/lib/types";
import { useToast } from "@/lib/toast-context";

interface Props {
  project: ProjectRead | null;
  open: boolean;
  onClose: () => void;
}

export default function ShareModal({ project, open, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const { push } = useToast();

  if (!open || !project) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      await shareApi.shareProject(project!.id, email);
      push(`Sent "${project!.name}" to ${email}`);
      setEmail("");
      onClose();
    } catch (err) {
      // The backend doesn't expose an email-sending endpoint yet (see project
      // notes) — a 404 here means that piece hasn't been built server-side.
      if (err instanceof ApiError && err.status === 404) {
        push("Email sharing isn't wired up on the backend yet", "error");
      } else {
        push(err instanceof ApiError ? err.message : "Couldn't send that email", "error");
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-3xl bg-[var(--color-surface)] p-6 shadow-2xl"
      >
        <h2 className="font-[family-name:var(--font-display)] text-lg font-bold">Share list</h2>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
          Send &ldquo;{project.name}&rdquo; to someone so they can view its tasks and mark them done.
        </p>

        <label className="mt-4 flex flex-col gap-1 text-sm font-medium">
          Email address
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-[var(--color-line)] bg-[var(--color-surface-muted)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-ink)]"
            placeholder="teammate@example.com"
          />
        </label>

        <div className="mt-6 flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--color-ink-soft)] hover:bg-[var(--color-surface-muted)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={sending}
            className="rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--color-accent-ink)] hover:brightness-95 disabled:opacity-60"
          >
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
