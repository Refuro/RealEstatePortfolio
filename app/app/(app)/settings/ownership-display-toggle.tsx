"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DisplayMode = "proportional" | "full_liability";

export function OwnershipDisplayToggle({
  initialMode,
}: {
  initialMode: "proportional" | "full_liability";
}) {
  const [mode, setMode] = useState<DisplayMode>(initialMode);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function handleChange(newMode: DisplayMode) {
    if (newMode === mode || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ownershipDisplayMode: newMode }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to update");
      }
      setMode(newMode);
      router.refresh();
    } catch (err) {
      console.error(err);
      // Revert on error
      setMode(mode);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-muted">Display mode</span>
        <div
          className="flex rounded-md border border-border bg-subtle/50 p-0.5"
          role="radiogroup"
          aria-label="Portfolio display mode"
        >
          {(
            [
              { value: "proportional" as const, label: "My share (proportional)" },
              { value: "full_liability" as const, label: "Full liability" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={mode === opt.value}
              disabled={saving}
              onClick={() => handleChange(opt.value)}
              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                mode === opt.value
                  ? "bg-accent text-accent-foreground"
                  : "text-muted hover:text-foreground hover:bg-subtle"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-sm text-muted">
        Proportional scales rent, expenses, debt balances, and debt service by your ownership
        share. Full liability keeps rent and expenses ownership-scaled, but shows 100% debt
        and debt service to reflect joint liability exposure.
      </p>
    </div>
  );
}
