"use client";

import { useEffect, useState } from "react";
import { getBenchmarkDisplayModel } from "@/lib/benchmark-display-utils";
import { RentCastQuotaHint } from "@/components/rentcast-quota-hint";
import { BenchmarkRefreshButton } from "./benchmark-refresh-button";

type BenchmarkDisplayProps = {
  propertyId: string;
  isRented: boolean;
  totalRent: number;
  marketRent: number | null;
  marketRentAsOf: Date | string | null;
};

export function BenchmarkDisplay({
  propertyId,
  isRented,
  totalRent,
  marketRent,
  marketRentAsOf,
}: BenchmarkDisplayProps) {
  const [nowMs, setNowMs] = useState<number | null>(null);
  const [quotaKey, setQuotaKey] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setNowMs(Date.now()));
    return () => cancelAnimationFrame(id);
  }, []);

  const model = getBenchmarkDisplayModel({
    isRented,
    userRent: totalRent,
    marketRent,
    marketRentAsOf,
    nowMs,
  });

  if (model.kind === "pending_time") {
    return null;
  }

  if (model.kind === "hidden") {
    return (
      <dd className="mt-1 text-sm text-muted">{model.message}</dd>
    );
  }

  if (model.kind === "eligible") {
    return (
      <dd className="mt-1 text-sm text-muted">{model.message}</dd>
    );
  }

  if (model.staleSummary) {
    return (
      <dd className="mt-1 space-y-1 text-sm text-muted">
        <RentCastQuotaHint refreshKey={quotaKey} />
        <div className="flex flex-wrap items-center gap-x-2">
          <span>{model.staleSummary}</span>
          <BenchmarkRefreshButton
            propertyId={propertyId}
            label="Refresh estimate"
            showQuotaHint={false}
            onSuccess={() => setQuotaKey((k) => k + 1)}
          />
        </div>
      </dd>
    );
  }

  return (
    <dd className="mt-1 space-y-1 text-sm text-muted">
      <RentCastQuotaHint refreshKey={quotaKey} />
      <BenchmarkRefreshButton
        propertyId={propertyId}
        label="Refresh estimate"
        showQuotaHint={false}
        onSuccess={() => setQuotaKey((k) => k + 1)}
      />
    </dd>
  );
}
