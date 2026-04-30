"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { RentCastQuotaHint } from "@/components/rentcast-quota-hint";
import { formatDateOnlyRelative, isDataStale } from "@/lib/date-utils";
import { getDataFreshnessRefreshPlan } from "@/lib/data-freshness-refresh-plan";
import { getBenchmarkEligibility, isBenchmarkFresh } from "@/lib/benchmark-utils";

export type DataFreshnessCardProps = {
  propertyId: string;
  propertyUpdatedAt: Date | string;
  estimatedValueAsOf: Date | string | null;
  marketRentAsOf: Date | string | null;
  isRented: boolean;
  totalRent: number;
  marketRent: number | null;
};

type RowTone = "fresh" | "stale" | "empty";

export function DataFreshnessCard({
  propertyId,
  propertyUpdatedAt,
  estimatedValueAsOf,
  marketRentAsOf,
  isRented,
  totalRent,
  marketRent,
}: DataFreshnessCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quotaKey, setQuotaKey] = useState(0);

  const refreshPlan = useMemo(
    () =>
      getDataFreshnessRefreshPlan({
        estimatedValueAsOf,
        isRented,
        totalRent,
        marketRent,
        marketRentAsOf,
      }),
    [estimatedValueAsOf, isRented, totalRent, marketRent, marketRentAsOf]
  );

  const canRefresh =
    refreshPlan.needsValueRefresh || refreshPlan.needsBenchmarkRefresh;

  const benchmarkEligibility = getBenchmarkEligibility({
    isRented,
    userRent: totalRent,
    marketRent,
    marketRentAsOf,
  });

  let benchmarkValue: string;
  let benchmarkTone: RowTone;
  if (benchmarkEligibility === "not_rented") {
    benchmarkValue = "Hidden — not rented";
    benchmarkTone = "empty";
  } else if (benchmarkEligibility === "rent_missing") {
    benchmarkValue = "Set rent to enable";
    benchmarkTone = "empty";
  } else if (benchmarkEligibility === "benchmark_missing") {
    benchmarkValue = "Not configured";
    benchmarkTone = "empty";
  } else if (marketRentAsOf && !isBenchmarkFresh(marketRentAsOf)) {
    benchmarkValue = `${formatDateOnlyRelative(marketRentAsOf)} · stale`;
    benchmarkTone = "stale";
  } else if (marketRentAsOf) {
    benchmarkValue = formatDateOnlyRelative(marketRentAsOf);
    benchmarkTone = "fresh";
  } else {
    benchmarkValue = "—";
    benchmarkTone = "empty";
  }

  let valueEstimate: { value: string; tone: RowTone };
  if (estimatedValueAsOf) {
    const fresh = isBenchmarkFresh(estimatedValueAsOf);
    valueEstimate = fresh
      ? {
          value: formatDateOnlyRelative(estimatedValueAsOf),
          tone: "fresh",
        }
      : {
          value: `${formatDateOnlyRelative(estimatedValueAsOf)} · stale`,
          tone: "stale",
        };
  } else {
    valueEstimate = { value: "Not set", tone: "empty" };
  }

  const handleRefresh = useCallback(async () => {
    if (!canRefresh || loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/properties/${propertyId}/data-freshness/refresh`, {
        method: "POST",
      });
      const json = (await res.json()) as {
        error?: string;
        skippedReason?: string;
        refreshed?: ("value" | "benchmark")[];
      };
      if (!res.ok) {
        setError(json.error ?? "Refresh failed");
        return;
      }
      setQuotaKey((k) => k + 1);
      router.refresh();
    } catch {
      setError("Refresh failed");
    } finally {
      setLoading(false);
    }
  }, [canRefresh, loading, propertyId, router]);

  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-foreground">Data freshness</h2>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={!canRefresh || loading}
            title={canRefresh ? undefined : "All estimates are current"}
            aria-label="Refresh stale estimates"
            aria-busy={loading}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-transparent text-muted transition-colors hover:bg-subtle hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            {loading ? (
              <span
                className="inline-block size-3.5 animate-spin rounded-full border-2 border-muted border-t-transparent"
                aria-hidden
              />
            ) : (
              <RefreshCw className="size-4" aria-hidden strokeWidth={2} />
            )}
          </button>
        </div>
        <RentCastQuotaHint refreshKey={quotaKey} className="mt-2" />
        {error && <p className="mt-2 text-xs text-negative">{error}</p>}
      </div>
      <ul className="divide-y divide-border-subtle">
        <Row
          label="Property data"
          value={formatDateOnlyRelative(new Date(propertyUpdatedAt))}
          tone={isDataStale(new Date(propertyUpdatedAt)) ? "stale" : "fresh"}
        />
        <Row label="Value estimate" value={valueEstimate.value} tone={valueEstimate.tone} />
        <Row label="Rent benchmark" value={benchmarkValue} tone={benchmarkTone} />
      </ul>
    </section>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: RowTone;
}) {
  const dotColor =
    tone === "fresh"
      ? "var(--positive)"
      : tone === "stale"
        ? "var(--warning)"
        : "var(--fg-dimmer)";
  const valueColor =
    tone === "stale"
      ? "var(--warning)"
      : tone === "empty"
        ? "var(--foreground-muted)"
        : "var(--foreground)";
  return (
    <li className="flex items-center justify-between gap-4 px-5 py-3">
      <span className="text-sm text-foreground">{label}</span>
      <span className="flex items-center gap-1.5 text-sm">
        <span
          className="inline-block size-1.5 rounded-full"
          style={{ background: dotColor }}
          aria-hidden
        />
        <span style={{ color: valueColor }}>{value}</span>
      </span>
    </li>
  );
}
