"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  computeBenchmarkDashboardPartition,
  type BenchmarkDashboardPropertyInput,
} from "@/lib/benchmark-dashboard-utils";

/**
 * Invisible component that fires auto-refresh for up to 3 stale benchmarks on mount.
 * Extracted from RentVsMarketSection so it runs for 6+ property users who see the
 * table view instead of the rent-vs-market list.
 */
export function BenchmarkAutoRefresh({
  properties,
}: {
  properties: BenchmarkDashboardPropertyInput[];
}) {
  const router = useRouter();
  const hasTriggeredRefreshes = useRef(false);

  const { cappedRefreshCandidates } = computeBenchmarkDashboardPartition(properties);

  useEffect(() => {
    if (cappedRefreshCandidates.length === 0 || hasTriggeredRefreshes.current) return;
    hasTriggeredRefreshes.current = true;

    (async () => {
      const results: { id: string; ok: boolean }[] = [];
      for (const p of cappedRefreshCandidates) {
        try {
          const res = await fetch(`/api/properties/${p.id}/benchmark/refresh`, {
            method: "POST",
          });
          const json = (await res.json()) as { error?: string };
          results.push({ id: p.id, ok: res.ok && !json.error });
        } catch {
          results.push({ id: p.id, ok: false });
        }
      }
      return results;
    })().then((results) => {
      if (results.some((r) => r.ok)) {
        router.refresh();
      }
    });
  }, [cappedRefreshCandidates, router]);

  return null;
}
