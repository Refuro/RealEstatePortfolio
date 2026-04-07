"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TIER_OPTIONS = [
  { value: "", label: "— (clear)" },
  { value: "free", label: "Free" },
  { value: "investor", label: "Investor" },
  { value: "pro", label: "Pro" },
] as const;

type TierValue = "free" | "investor" | "pro" | "";

export function AdminUserTierSelect({
  userId,
  currentOverride,
  currentTier,
}: {
  userId: string;
  currentOverride: string | null;
  currentTier: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState<TierValue>(
    (currentOverride?.toLowerCase() as TierValue) ?? ""
  );

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const raw = e.target.value as TierValue;
    setValue(raw);
    setLoading(true);
    try {
      const tier = raw === "" ? null : raw;
      const res = await fetch(`/api/admin/users/${userId}/tier`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setValue((currentOverride?.toLowerCase() as TierValue) ?? "");
        console.error("Tier update failed:", data.error ?? res.statusText);
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      value={value}
      onChange={handleChange}
      disabled={loading}
      className="min-h-[44px] rounded-md border border-border bg-background px-3 py-2 text-base text-foreground disabled:opacity-50 md:text-sm"
      aria-label={`Set tier for user (effective: ${currentTier})`}
    >
      {TIER_OPTIONS.map((opt) => (
        <option key={opt.value || "clear"} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
