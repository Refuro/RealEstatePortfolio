"use client";

import { useEffect, useState } from "react";
import {
  isBenchmarkFresh,
  getBenchmarkDaysAgo,
  getBenchmarkLabel,
} from "@/lib/benchmark-utils";
import { BenchmarkRefreshButton } from "./benchmark-refresh-button";

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

  const isFresh = marketRent != null && marketRent > 0 && isBenchmarkFresh(marketRentAsOf);

  if (isFresh && marketRent != null && marketRent > 0) {
    const label = getBenchmarkLabel(totalRent, marketRent).replace(/^Rent /, "");
    const displayLabel = label === "at market" ? "At market" : label;
    return (
      <dd className="mt-1 text-sm text-muted">
        Market: ${marketRent.toLocaleString()} ({displayLabel})
      </dd>
    );
  }

  if (marketRent != null && marketRentAsOf) {
    const daysAgo = getBenchmarkDaysAgo(marketRentAsOf);
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
