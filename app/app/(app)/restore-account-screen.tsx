"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RestoreAccountScreen() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRestore() {
    setLoading(true);
    try {
      const res = await fetch("/api/account/restore", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Restore failed");
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="max-w-md rounded-lg border border-border bg-card p-8 text-center">
        <h1 className="text-2xl font-semibold text-foreground">
          Your account was deactivated
        </h1>
        <p className="mt-2 text-base text-muted">
          Restore your account to access your portfolio and properties again.
        </p>
        <button
          type="button"
          onClick={handleRestore}
          disabled={loading}
          className="mt-6 rounded-md bg-accent px-4 py-2 text-base font-medium text-accent-foreground hover:bg-accent-hover disabled:opacity-50"
        >
          {loading ? "Restoring…" : "Restore account"}
        </button>
      </div>
    </div>
  );
}
