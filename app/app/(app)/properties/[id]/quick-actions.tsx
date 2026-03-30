"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function QuickActions({
  propertyId,
  showRefreshBenchmark,
}: {
  propertyId: string;
  /** Show Refresh benchmark when benchmark data is missing or stale (`shouldOfferBenchmarkRefresh` in benchmark-utils). */
  showRefreshBenchmark: boolean;
}) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefreshBenchmark() {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/benchmark/refresh`, {
        method: "POST",
      });
      const json = (await res.json()) as { error?: string };
      if (res.ok && !json.error) {
        router.refresh();
      }
    } finally {
      setRefreshing(false);
    }
  }

  const btnClass =
    "rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-subtle disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link href={`/properties/${propertyId}/edit`} className={btnClass}>
        Edit property
      </Link>
      <Link
        href={`/properties/${propertyId}?tab=details#mortgages`}
        className={btnClass}
      >
        Add mortgage
      </Link>
      {showRefreshBenchmark && (
        <button
          type="button"
          onClick={handleRefreshBenchmark}
          disabled={refreshing}
          className={btnClass}
        >
          {refreshing && (
            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
          )}
          {refreshing ? "Refreshing…" : "Refresh benchmark"}
        </button>
      )}
    </div>
  );
}
