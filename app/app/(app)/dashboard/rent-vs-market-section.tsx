"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BENCHMARK_UX_MESSAGES,
  getBenchmarkEligibility,
  getBenchmarkPct,
  getBenchmarkLabel,
  getBenchmarkDaysAgo,
} from "@/lib/benchmark-utils";
import {
  MAX_AUTO_BENCHMARK_REFRESH_ON_LOAD,
  computeBenchmarkDashboardPartition,
  sortFreshByBenchmarkPct,
} from "@/lib/benchmark-dashboard-utils";
import { getPropertyTotalRent } from "@/lib/property-utils";
import { RentCastQuotaHint } from "@/components/rentcast-quota-hint";

type PropertyForBenchmark = {
  id: string;
  nickname: string | null;
  addressLine1: string;
  marketRent: number | null;
  marketRentAsOf: Date | string | null;
  currentMonthlyRent: number;
  unitRents?: unknown;
  isRented: boolean;
};

type RefreshStatus = "idle" | "refreshing" | "success" | "failed";

export function RentVsMarketSection({
  properties,
}: {
  properties: PropertyForBenchmark[];
}) {
  const router = useRouter();
  const [refreshStatus, setRefreshStatus] = useState<Record<string, RefreshStatus>>({});
  const [rentCastQuotaTick, setRentCastQuotaTick] = useState(0);
  const hasTriggeredRefreshes = useRef(false);

  const propsById = new Map(properties.map((p) => [p.id, p]));

  const inputs = properties.map((p) => ({
    id: p.id,
    isRented: p.isRented,
    userRent: getPropertyTotalRent(p),
    marketRent: p.marketRent != null ? Number(p.marketRent) : null,
    marketRentAsOf: p.marketRentAsOf,
  }));

  const partition = computeBenchmarkDashboardPartition(inputs);
  const refreshCandidates = partition.refreshCandidates;
  const fresh = sortFreshByBenchmarkPct(partition.fresh).map((row) => propsById.get(row.id)!);
  const staleOrMissing = partition.staleOrMissing.map((row) => propsById.get(row.id)!);
  const cappedRefreshCandidates = partition.cappedRefreshCandidates.map(
    (row) => propsById.get(row.id)!
  );
  const cappedRefreshIds = new Set(cappedRefreshCandidates.map((p) => p.id));

  const marketRentNum = (p: PropertyForBenchmark) =>
    p.marketRent != null ? Number(p.marketRent) : 0;

  const getEligibility = (p: PropertyForBenchmark) =>
    getBenchmarkEligibility({
      isRented: p.isRented,
      userRent: getPropertyTotalRent(p),
      marketRent: p.marketRent != null ? Number(p.marketRent) : null,
      marketRentAsOf: p.marketRentAsOf,
    });

  const ordered = [...fresh, ...staleOrMissing];
  const aboveCount = fresh.filter(
    (p) => getBenchmarkPct(getPropertyTotalRent(p), marketRentNum(p)) > 0
  ).length;
  const belowCount = fresh.filter(
    (p) => getBenchmarkPct(getPropertyTotalRent(p), marketRentNum(p)) < 0
  ).length;
  const alignedCount = fresh.length - aboveCount - belowCount;

  useEffect(() => {
    if (cappedRefreshCandidates.length === 0 || hasTriggeredRefreshes.current) return;
    hasTriggeredRefreshes.current = true;

    const ids = cappedRefreshCandidates.map((p) => p.id);
    queueMicrotask(() => {
      setRefreshStatus((prev) => {
        const next = { ...prev };
        for (const id of ids) next[id] = "refreshing";
        return next;
      });
    });

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
      const anySuccess = results.some((r) => r.ok);
      if (anySuccess) {
        setRentCastQuotaTick((t) => t + 1);
        router.refresh();
      }
      setRefreshStatus((prev) => {
        const next = { ...prev };
        for (const r of results) {
          next[r.id] = r.ok ? "success" : "failed";
        }
        return next;
      });
    });
  }, [cappedRefreshCandidates, router]);

  if (ordered.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-border/70 bg-card/95 p-4 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Rent vs. market
        </h2>
        <p className="mt-2 text-sm text-muted">
          <Link
            href="/properties"
            className="font-medium text-foreground hover:underline"
          >
            See how your rent compares to market
          </Link>
        </p>
      </div>
    );
  }

  return (
    <section className="mt-6 rounded-xl border border-border/70 bg-card/95 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Rent vs. market
          </h2>
          <RentCastQuotaHint refreshKey={rentCastQuotaTick} className="mt-1" />
          <p className="mt-1 text-sm text-muted">
            {fresh.length} fresh benchmark{fresh.length === 1 ? "" : "s"}
            {refreshCandidates.length > 0 && (
              <>
                {" "}
                · Auto-refresh on load: {cappedRefreshCandidates.length} of{" "}
                {refreshCandidates.length} stale
                {refreshCandidates.length > MAX_AUTO_BENCHMARK_REFRESH_ON_LOAD
                  ? ` (capped at ${MAX_AUTO_BENCHMARK_REFRESH_ON_LOAD}; refresh others from each property)`
                  : ""}
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-border bg-background/60 px-2.5 py-1 text-muted">
            Above: <span className="font-semibold text-foreground">{aboveCount}</span>
          </span>
          <span className="rounded-full border border-border bg-background/60 px-2.5 py-1 text-muted">
            Below: <span className="font-semibold text-foreground">{belowCount}</span>
          </span>
          <span className="rounded-full border border-border bg-background/60 px-2.5 py-1 text-muted">
            Aligned: <span className="font-semibold text-foreground">{alignedCount}</span>
          </span>
        </div>
      </div>
      <ul className="mt-4 space-y-2">
        {ordered.map((p) => {
          const status = refreshStatus[p.id];
          const eligibility = getEligibility(p);
          const isFresh = eligibility === "eligible_fresh";
          const name = p.nickname || p.addressLine1;

          if (isFresh) {
            const pct = getBenchmarkPct(getPropertyTotalRent(p), marketRentNum(p));
            const badge =
              pct > 0
                ? "text-positive"
                : pct < 0
                  ? "text-negative"
                  : "text-foreground";
            return (
              <li
                key={p.id}
                className="rounded-lg border border-border/70 bg-background/50 px-3 py-2"
              >
                <Link
                  href={`/properties/${p.id}`}
                  className="flex flex-wrap items-center justify-between gap-2"
                >
                  <span className="text-sm font-medium text-foreground hover:underline">
                    {name}
                  </span>
                  <span className={`text-sm font-semibold ${badge}`}>
                    {getBenchmarkLabel(getPropertyTotalRent(p), marketRentNum(p))}
                  </span>
                </Link>
              </li>
            );
          }

          const isStaleBenchmark = eligibility === "benchmark_stale";
          const daysAgo = getBenchmarkDaysAgo(p.marketRentAsOf);

          const stalePart = isStaleBenchmark
            ? `Market $${marketRentNum(p).toLocaleString()} · Updated ${daysAgo} days ago`
            : "";
          const inCappedAutoRefresh =
            cappedRefreshIds.has(p.id) &&
            (eligibility === "benchmark_missing" || eligibility === "benchmark_stale");
          const statusPart = inCappedAutoRefresh
            ? status === "failed"
              ? "Unable to refresh"
              : status === "refreshing" || status === "idle"
                ? "Refreshing…"
                : ""
            : eligibility === "benchmark_missing" || eligibility === "benchmark_stale"
              ? "Open property to refresh benchmark"
              : "";
          let suffix = [stalePart, statusPart].filter(Boolean).join(" · ");
          if (eligibility === "not_rented") {
            suffix = BENCHMARK_UX_MESSAGES.notRented;
          } else if (eligibility === "rent_missing") {
            suffix = BENCHMARK_UX_MESSAGES.rentMissing;
          } else if (eligibility === "benchmark_missing" && status === "success") {
            suffix = "Benchmark unavailable";
          }

          return (
            <li
              key={p.id}
              className="rounded-lg border border-border/70 bg-background/50 px-3 py-2"
            >
              <Link
                href={`/properties/${p.id}`}
                className="text-sm font-medium text-foreground hover:underline"
              >
                {name}
              </Link>
              <span
                className={`mt-1 block text-sm ${
                  status === "failed" ? "text-negative" : "text-muted"
                }`}
              >
                {suffix || "Benchmark unavailable"}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
