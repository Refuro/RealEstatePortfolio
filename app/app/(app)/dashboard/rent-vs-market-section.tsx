"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  isBenchmarkFresh,
  getBenchmarkPct,
  getBenchmarkLabel,
  getBenchmarkDaysAgo,
} from "@/lib/benchmark-utils";
import { getPropertyTotalRent } from "@/lib/property-utils";

type PropertyForBenchmark = {
  id: string;
  nickname: string | null;
  addressLine1: string;
  marketRent: number | null;
  marketRentAsOf: Date | string | null;
  currentMonthlyRent: number;
  unitRents?: unknown;
};

type RefreshStatus = "idle" | "refreshing" | "success" | "failed";

export function RentVsMarketSection({
  properties,
}: {
  properties: PropertyForBenchmark[];
}) {
  const router = useRouter();
  const [refreshStatus, setRefreshStatus] = useState<Record<string, RefreshStatus>>({});
  const hasTriggeredRefreshes = useRef(false);

  const marketRentNum = (p: PropertyForBenchmark) =>
    p.marketRent != null ? Number(p.marketRent) : 0;

  const fresh = properties.filter(
    (p) =>
      p.marketRent != null &&
      Number(p.marketRent) > 0 &&
      isBenchmarkFresh(p.marketRentAsOf)
  );
  const staleOrMissing = properties.filter(
    (p) =>
      !(
        p.marketRent != null &&
        Number(p.marketRent) > 0 &&
        isBenchmarkFresh(p.marketRentAsOf)
      )
  );

  const sortedFresh = [...fresh].sort((a, b) => {
    const pctA = getBenchmarkPct(getPropertyTotalRent(a), marketRentNum(a));
    const pctB = getBenchmarkPct(getPropertyTotalRent(b), marketRentNum(b));
    return pctA - pctB;
  });

  const ordered = [...sortedFresh, ...staleOrMissing];

  useEffect(() => {
    if (staleOrMissing.length === 0 || hasTriggeredRefreshes.current) return;
    hasTriggeredRefreshes.current = true;

    const ids = staleOrMissing.map((p) => p.id);
    queueMicrotask(() => {
      setRefreshStatus((prev) => {
        const next = { ...prev };
        for (const id of ids) next[id] = "refreshing";
        return next;
      });
    });

    Promise.all(
      staleOrMissing.map(async (p) => {
        try {
          const res = await fetch(`/api/properties/${p.id}/benchmark/refresh`, {
            method: "POST",
          });
          const json = (await res.json()) as { error?: string };
          if (res.ok && !json.error) {
            return { id: p.id, ok: true } as const;
          }
          return { id: p.id, ok: false } as const;
        } catch {
          return { id: p.id, ok: false } as const;
        }
      })
    ).then((results) => {
      const anySuccess = results.some((r) => r.ok);
      if (anySuccess) {
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
  }, [staleOrMissing, router]);

  if (ordered.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="text-base font-semibold uppercase tracking-wide text-muted">
          Rent vs. market
        </h2>
        <p className="mt-3 text-sm text-muted">
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
    <div className="mt-8">
      <h2 className="text-base font-semibold uppercase tracking-wide text-muted">
        Rent vs. market
      </h2>
      <ul className="mt-3 space-y-1">
        {ordered.map((p) => {
          const status = refreshStatus[p.id];
          const isFresh =
            p.marketRent != null &&
            Number(p.marketRent) > 0 &&
            isBenchmarkFresh(p.marketRentAsOf);
          const name = p.nickname || p.addressLine1;

          if (isFresh) {
            return (
              <li key={p.id}>
                <Link
                  href={`/properties/${p.id}`}
                  className="text-sm text-muted hover:text-foreground hover:underline"
                >
                  {name}: {getBenchmarkLabel(getPropertyTotalRent(p), marketRentNum(p))}
                </Link>
              </li>
            );
          }

          const hasStaleData =
            p.marketRent != null &&
            Number(p.marketRent) > 0 &&
            p.marketRentAsOf != null;
          const daysAgo = getBenchmarkDaysAgo(p.marketRentAsOf);

          const stalePart = hasStaleData
            ? `Market $${marketRentNum(p).toLocaleString()} · Updated ${daysAgo} days ago`
            : "";
          const statusPart =
            status === "failed"
              ? "Unable to refresh"
              : status === "refreshing" || status === "idle"
                ? "Refreshing…"
                : "";
          const suffix = [stalePart, statusPart].filter(Boolean).join(" · ");

          return (
            <li key={p.id} className="flex flex-wrap items-baseline gap-x-1">
              <Link
                href={`/properties/${p.id}`}
                className="text-sm text-muted hover:text-foreground hover:underline"
              >
                {name}
              </Link>
              <span
                className={`text-sm ${status === "failed" ? "text-negative" : "text-muted"}`}
              >
                : {suffix || "Refreshing…"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
