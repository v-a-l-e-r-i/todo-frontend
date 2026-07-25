"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AppDataProvider } from "@/lib/app-data";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-canvas)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-ink)] border-t-transparent" />
      </div>
    );
  }

  return <AppDataProvider>{children}</AppDataProvider>;
}
