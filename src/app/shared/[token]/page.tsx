"use client";

import { use, useEffect, useState } from "react";
import { ApiError, shareApi } from "@/lib/api";
import { SharedProjectView } from "@/lib/types";
import { formatDueDate } from "@/lib/format";
import { PRIORITY_COLOR, PRIORITY_LABEL, STATUS_LABEL } from "@/lib/task-meta";

export default function SharedProjectPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);

  const [data, setData] = useState<SharedProjectView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    shareApi
      .getSharedProject(token)
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError && err.status === 404
            ? "This link is invalid or has expired."
            : "Couldn't load this list right now.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] p-4 sm:p-8">
      <div className="mx-auto max-w-2xl rounded-3xl bg-[var(--color-surface)] p-6 sm:p-8">
        {loading && <p className="text-sm text-[var(--color-ink-faint)]">Loading…</p>}

        {!loading && error && (
          <p className="text-sm text-[var(--color-coral)]">{error}</p>
        )}

        {!loading && data && (
          <>
            <div className="flex items-center gap-2">
              {data.color && (
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: data.color }}
                />
              )}
              <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
                {data.name}
              </h1>
            </div>
            {data.description && (
              <p className="mt-1 text-sm text-[var(--color-ink-soft)]">{data.description}</p>
            )}
            <p className="mt-1 text-xs text-[var(--color-ink-faint)]">
              Shared read-only view — {data.tasks.length} task{data.tasks.length === 1 ? "" : "s"}
            </p>

            <div className="mt-6 flex flex-col gap-2">
              {data.tasks.length === 0 && (
                <p className="text-sm text-[var(--color-ink-faint)]">No tasks in this list yet.</p>
              )}
              {data.tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 rounded-2xl border border-[var(--color-line)] p-3.5"
                >
                  <span
                    className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 ${
                      task.status === "DONE"
                        ? "border-[var(--color-teal)] bg-[var(--color-teal)]"
                        : "border-[var(--color-line)]"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-medium ${
                        task.status === "DONE" ? "text-[var(--color-ink-faint)] line-through" : ""
                      }`}
                    >
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="mt-0.5 text-xs text-[var(--color-ink-soft)]">{task.description}</p>
                    )}
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-[var(--color-ink-faint)]">
                      <span
                        className="rounded-full px-2 py-0.5 font-semibold"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${PRIORITY_COLOR[task.priority]} 18%, transparent)`,
                          color: PRIORITY_COLOR[task.priority],
                        }}
                      >
                        {PRIORITY_LABEL[task.priority]}
                      </span>
                      <span>{STATUS_LABEL[task.status]}</span>
                      {task.due_date && <span>Due {formatDueDate(task.due_date)}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
