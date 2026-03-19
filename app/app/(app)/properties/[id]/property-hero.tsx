"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/format-currency";
import { isBenchmarkFresh, getBenchmarkLabel } from "@/lib/benchmark-utils";
import { BenchmarkRefreshButton } from "../benchmark-refresh-button";

export type PropertyHeroProps = {
  propertyId: string;
  nickname: string | null;
  address: string;
  value: number;
  equity: number;
  monthlyCashFlow: number;
  totalRent: number;
  marketRent: number | null;
  marketRentAsOf: Date | string | null;
  /** DSCR = noi / (totalMonthlyPayment * 12). Shown in hero when payment > 0. */
  dscr?: number | null;
};

export function PropertyHero({
  propertyId,
  nickname,
  address,
  value,
  equity,
  monthlyCashFlow,
  totalRent,
  marketRent,
  marketRentAsOf,
  dscr,
}: PropertyHeroProps) {
  const isFresh = marketRent != null && marketRent > 0 && isBenchmarkFresh(marketRentAsOf);
  const benchmarkLabel =
    isFresh && marketRent != null && marketRent > 0
      ? getBenchmarkLabel(totalRent, marketRent)
      : null;
  const showRefreshBenchmark = marketRent == null || marketRent <= 0 || !isBenchmarkFresh(marketRentAsOf);

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            {nickname || address || "Property"}
          </h2>
          {address && nickname && (
            <p className="mt-0.5 text-sm text-muted">{address}</p>
          )}
        </div>
        <Link
          href={`/properties/${propertyId}/edit`}
          className="text-sm font-medium text-muted hover:text-foreground hover:underline"
        >
          Edit property
        </Link>
      </div>
      <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-6">
        <div>
          <p className="text-sm font-medium text-muted">Value</p>
          <p className="mt-0.5 text-lg font-semibold text-foreground">
            {formatCurrency(value)}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted">Equity</p>
          <p className="mt-0.5 text-lg font-semibold text-foreground">
            {formatCurrency(equity)}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted">Cash flow</p>
          <p
            className={`mt-0.5 text-lg font-semibold ${
              monthlyCashFlow >= 0 ? "text-positive" : "text-negative"
            }`}
          >
            {formatCurrency(monthlyCashFlow)}
          </p>
        </div>
        <div className="min-w-[10rem]">
          <p className="text-sm font-medium text-muted">Rent vs. market</p>
          {benchmarkLabel ? (
            <p className="mt-0.5 text-lg font-semibold text-foreground">
              {benchmarkLabel}
            </p>
          ) : showRefreshBenchmark ? (
            <p className="mt-0.5">
              <BenchmarkRefreshButton
                propertyId={propertyId}
                label="Refresh estimate"
              />
            </p>
          ) : (
            <p className="mt-0.5 text-lg font-semibold text-foreground">
              —
            </p>
          )}
        </div>
        {dscr != null && (
          <div>
            <p className="text-sm font-medium text-muted">DSCR</p>
            <p
              className={`mt-0.5 text-lg font-semibold ${
                dscr >= 1 ? "text-positive" : "text-negative"
              }`}
            >
              {dscr.toFixed(2)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
