"use client";

import { formatTimeAgo, isDataStale } from "@/lib/date-utils";
import { isBenchmarkFresh } from "@/lib/benchmark-utils";
import { getPiForAmortization } from "@/lib/amortization";
import type { MortgageForTabs } from "./property-detail-types";

function Chip({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "warn" | "good" }) {
  const toneClass =
    tone === "good"
      ? "border-positive/30 text-positive"
      : tone === "warn"
        ? "border-negative/30 text-negative"
        : "border-border text-muted";
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${toneClass}`}>
      {label}
    </span>
  );
}

type MortgageWithBalance = MortgageForTabs & {
  balanceAsOfDate?: string | null;
};

/**
 * Shared “data & benchmark health” strip for property Overview + Details tabs.
 */
export function PropertyHealthStrip({
  property,
  mortgageData,
}: {
  property: {
    updatedAt: Date | string;
    marketRent: number | null;
    marketRentAsOf: Date | string | null;
  };
  mortgageData: MortgageWithBalance[];
}) {
  const staleProperty = isDataStale(new Date(property.updatedAt));
  const benchmarkMissing = property.marketRent == null || property.marketRent <= 0;
  const benchmarkStale =
    !benchmarkMissing && !isBenchmarkFresh(property.marketRentAsOf ?? null);
  const missingLenderCount = mortgageData.filter((m) => !m.lenderName).length;
  const potentialNegAmCount = mortgageData.filter((m) => {
    const balance = m.effectiveBalance ?? Number(m.currentBalance);
    const piPayment = getPiForAmortization({
      originalLoanAmount: Number(m.originalLoanAmount),
      currentBalance: balance,
      interestRate: Number(m.interestRate),
      termYears: m.termYears,
      startDate: m.startDate,
      monthlyPayment: Number(m.monthlyPayment),
      balanceAsOfDate: m.balanceAsOfDate ?? null,
      escrowIncluded: Boolean(m.escrowIncluded),
      escrowAmount: m.escrowAmount != null ? Number(m.escrowAmount) : null,
    });
    const monthlyInterest = (balance * Number(m.interestRate)) / 12;
    return piPayment <= monthlyInterest;
  }).length;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="mb-3 text-xs text-muted">Last updated {formatTimeAgo(new Date(property.updatedAt))}</p>
      <div className="flex flex-wrap gap-2">
        {staleProperty ? (
          <Chip label="Property data stale" tone="warn" />
        ) : (
          <Chip label="Property data fresh" tone="good" />
        )}
        {benchmarkMissing ? (
          <Chip label="Benchmark missing" tone="warn" />
        ) : benchmarkStale ? (
          <Chip label="Benchmark stale" tone="warn" />
        ) : (
          <Chip label="Benchmark fresh" tone="good" />
        )}
        {missingLenderCount > 0 && (
          <Chip
            label={`${missingLenderCount} mortgage${missingLenderCount > 1 ? "s" : ""} missing lender`}
            tone="warn"
          />
        )}
        {potentialNegAmCount > 0 && (
          <Chip
            label={`${potentialNegAmCount} potential negative-amortization risk`}
            tone="warn"
          />
        )}
      </div>
    </div>
  );
}
