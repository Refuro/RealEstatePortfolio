"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RentCastQuotaHint } from "@/components/rentcast-quota-hint";

export function BenchmarkRefreshButton({
  propertyId,
  label = "Refresh estimate",
  onSuccess,
  showQuotaHint = true,
}: {
  propertyId: string;
  label?: string;
  onSuccess?: () => void;
  /** When false, parent renders quota (e.g. BenchmarkDisplay). */
  showQuotaHint?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quotaKey, setQuotaKey] = useState(0);

  async function handleRefresh() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/benchmark/refresh`, {
        method: "POST",
      });
      const json = (await res.json()) as { error?: string };
      if (res.ok && !json.error) {
        router.refresh();
        setQuotaKey((k) => k + 1);
        onSuccess?.();
      } else {
        setError(json.error ?? "Failed to refresh benchmark");
      }
    } catch {
      setError("Failed to refresh benchmark");
    } finally {
      setLoading(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      {showQuotaHint && <RentCastQuotaHint refreshKey={quotaKey} />}
      <button
        type="button"
        onClick={handleRefresh}
        disabled={loading}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading && (
          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent border-t-transparent" aria-hidden />
        )}
        {loading ? "Refreshing…" : label}
      </button>
      {error && (
        <span className="text-xs text-negative">{error}</span>
      )}
    </span>
  );
}
