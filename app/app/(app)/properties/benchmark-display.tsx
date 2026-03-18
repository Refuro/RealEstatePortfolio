"use client";

import { useEffect, useState } from "react";
import { BenchmarkRefreshButton } from "./benchmark-refresh-button";

const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;

type BenchmarkDisplayProps = {
  propertyId: string;
  totalRent: number;
  marketRent: number | null;
  marketRentAsOf: Date | string | null;
};

export function BenchmarkDisplay({
  propertyId,
  totalRent,
  marketRent,
  marketRentAsOf,
}: BenchmarkDisplayProps) {
  const [nowMs, setNowMs] = useState<number | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setNowMs(Date.now()));
    return () => cancelAnimationFrame(id);
  }, []);

  if (nowMs === null) {
    return (
      <dd className="mt-1 text-sm text-muted">
        <BenchmarkRefreshButton propertyId={propertyId} label="Refresh estimate" />
      </dd>
    );
  }

  const asOfDate = marketRentAsOf instanceof Date ? marketRentAsOf : marketRentAsOf ? new Date(marketRentAsOf) : null;
  const isFresh = marketRent != null && asOfDate && nowMs - asOfDate.getTime() < SIXTY_DAYS_MS;

  if (isFresh && marketRent != null && marketRent > 0) {
    const pct = ((totalRent - marketRent) / marketRent) * 100;
    const absPct = Math.abs(pct);
    const pctStr =
      absPct < 0.5 ? "At market" : pct >= 0 ? `+${pct.toFixed(1)}% above market` : `${pct.toFixed(1)}% below market`;
    return (
      <dd className="mt-1 text-sm text-muted">
        Market: ${marketRent.toLocaleString()} ({pctStr})
      </dd>
    );
  }

  if (marketRent != null && asOfDate) {
    const daysAgo = Math.floor((nowMs - asOfDate.getTime()) / (24 * 60 * 60 * 1000));
    return (
      <dd className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-muted">
        <span>Market: ${marketRent.toLocaleString()} · Updated {daysAgo} days ago</span>
        <BenchmarkRefreshButton propertyId={propertyId} label="Refresh estimate" />
      </dd>
    );
  }

  return (
    <dd className="mt-1 text-sm text-muted">
      <BenchmarkRefreshButton propertyId={propertyId} label="Refresh estimate" />
    </dd>
  );
}
