"use client";

import { formatTimeAgo } from "@/lib/date-utils";
import {
  getBenchmarkEligibility,
  isBenchmarkFresh,
} from "@/lib/benchmark-utils";

export type DataFreshnessCardProps = {
  propertyUpdatedAt: Date | string;
  estimatedValueAsOf: Date | string | null;
  marketRentAsOf: Date | string | null;
  isRented: boolean;
  totalRent: number;
  marketRent: number | null;
};

type RowTone = "fresh" | "stale" | "empty";

export function DataFreshnessCard({
  propertyUpdatedAt,
  estimatedValueAsOf,
  marketRentAsOf,
  isRented,
  totalRent,
  marketRent,
}: DataFreshnessCardProps) {
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
    benchmarkValue = `${formatTimeAgo(new Date(marketRentAsOf))} · stale`;
    benchmarkTone = "stale";
  } else if (marketRentAsOf) {
    benchmarkValue = formatTimeAgo(new Date(marketRentAsOf));
    benchmarkTone = "fresh";
  } else {
    benchmarkValue = "—";
    benchmarkTone = "empty";
  }

  const valueEstimate = estimatedValueAsOf
    ? {
        value: formatTimeAgo(new Date(estimatedValueAsOf)),
        tone: "fresh" as RowTone,
      }
    : { value: "Not set", tone: "empty" as RowTone };

  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold text-foreground">Data freshness</h2>
      </div>
      <ul className="divide-y divide-border-subtle">
        <Row
          label="Property data"
          value={formatTimeAgo(new Date(propertyUpdatedAt))}
          tone="fresh"
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
