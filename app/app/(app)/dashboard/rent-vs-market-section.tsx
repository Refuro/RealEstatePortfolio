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

/** Initial rows shown before “Show all”; full list order preserved (worst gap first). */
const INITIAL_VISIBLE_ROWS = 6;

const BADGE_STYLES = {
  pos: {
    background: "var(--positive-dim)",
    color: "var(--positive)",
    border: "1px solid rgba(52,211,153,0.2)",
  },
  neg: {
    background: "var(--negative-dim)",
    color: "var(--negative)",
    border: "1px solid rgba(248,113,113,0.2)",
  },
  neutral: {
    background: "rgba(255,255,255,0.05)",
    color: "var(--foreground-muted)",
    border: "1px solid var(--border)",
  },
} as const;

export function RentVsMarketSection({
  properties,
}: {
  properties: PropertyForBenchmark[];
}) {
  const router = useRouter();
  const [refreshStatus, setRefreshStatus] = useState<Record<string, RefreshStatus>>({});
  const [rentCastQuotaTick, setRentCastQuotaTick] = useState(0);
  const [listExpanded, setListExpanded] = useState(false);
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
  const visibleOrdered =
    listExpanded || ordered.length <= INITIAL_VISIBLE_ROWS
      ? ordered
      : ordered.slice(0, INITIAL_VISIBLE_ROWS);
  const showListDisclosure = ordered.length > INITIAL_VISIBLE_ROWS;

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
      <section
        className="rounded-xl border overflow-hidden"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="px-[18px] py-[14px]">
          <h2
            className="text-[13px] font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            Rent vs. market
          </h2>
          <p className="mt-2 text-[12px]" style={{ color: "var(--foreground-muted)" }}>
            <Link
              href="/properties"
              className="font-medium hover:underline"
              style={{ color: "var(--foreground)" }}
            >
              See how your rent compares to market
            </Link>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="rounded-xl border overflow-hidden"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      {/* Header */}
      <div
        className="flex flex-wrap items-start justify-between gap-3 px-[18px] py-[14px]"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="min-w-0">
          <h2
            className="text-[13px] font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            Rent vs. market
          </h2>
          <p
            className="text-[11.5px] mt-0.5"
            style={{ color: "var(--foreground-muted)" }}
          >
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
          <RentCastQuotaHint refreshKey={rentCastQuotaTick} className="mt-1" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span
            className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-full font-medium"
            style={BADGE_STYLES.pos}
          >
            Above: {aboveCount}
          </span>
          <span
            className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-full font-medium"
            style={BADGE_STYLES.neg}
          >
            Below: {belowCount}
          </span>
          <span
            className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-full font-medium"
            style={BADGE_STYLES.neutral}
          >
            Aligned: {alignedCount}
          </span>
        </div>
      </div>

      {/* Rows */}
      <ul id="rent-vs-market-property-list">
        {visibleOrdered.map((p, i) => {
          const status = refreshStatus[p.id];
          const eligibility = getEligibility(p);
          const isFresh = eligibility === "eligible_fresh";
          const name = p.nickname || p.addressLine1;
          const isLast = i === visibleOrdered.length - 1;

          if (isFresh) {
            const pct = getBenchmarkPct(getPropertyTotalRent(p), marketRentNum(p));
            const statusColor =
              pct > 0
                ? "var(--positive)"
                : pct < 0
                  ? "var(--negative)"
                  : "var(--foreground-muted)";

            return (
              <li
                key={p.id}
                style={{
                  borderBottom: isLast ? "none" : "1px solid var(--border-subtle)",
                }}
              >
                <Link
                  href={`/properties/${p.id}`}
                  className="flex items-center justify-between gap-3 px-[18px] py-[10px] transition-colors duration-100"
                  style={{ background: "transparent" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--card-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div className="min-w-0">
                    <div
                      className="text-[12.5px] font-medium truncate"
                      style={{ color: "var(--foreground)" }}
                    >
                      {name}
                    </div>
                    {p.nickname && (
                      <div
                        className="text-[11px] truncate"
                        style={{ color: "var(--foreground-muted)" }}
                      >
                        {p.addressLine1}
                      </div>
                    )}
                  </div>
                  <span
                    className="text-[12px] font-semibold tabular-nums whitespace-nowrap"
                    style={{ color: statusColor }}
                  >
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
              style={{
                borderBottom: isLast ? "none" : "1px solid var(--border-subtle)",
              }}
            >
              <Link
                href={`/properties/${p.id}`}
                className="block px-[18px] py-[10px] transition-colors duration-100"
                style={{ background: "transparent" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--card-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <div
                  className="text-[12.5px] font-medium truncate"
                  style={{ color: "var(--foreground)" }}
                >
                  {name}
                </div>
                <span
                  className="mt-0.5 block text-[11.5px]"
                  style={{
                    color: status === "failed" ? "var(--negative)" : "var(--foreground-muted)",
                  }}
                >
                  {suffix || "Benchmark unavailable"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {showListDisclosure && (
        <div
          className="flex justify-center border-t px-[18px] py-2"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <button
            type="button"
            className="flex w-full max-w-md items-center justify-center rounded-lg px-4 text-[12.5px] font-medium transition-colors duration-100 min-h-[44px] hover:bg-card-hover md:min-h-9"
            style={{ color: "var(--accent)" }}
            aria-expanded={listExpanded}
            aria-controls="rent-vs-market-property-list"
            onClick={() => setListExpanded((v) => !v)}
          >
            {listExpanded ? "Show less" : `Show all (${ordered.length})`}
          </button>
        </div>
      )}
    </section>
  );
}
