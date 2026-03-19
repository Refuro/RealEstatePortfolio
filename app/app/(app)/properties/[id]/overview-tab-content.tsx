"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/format-currency";
import { BenchmarkRefreshButton } from "../benchmark-refresh-button";
import { PropertyHero } from "./property-hero";
import { PropertyHealthStrip } from "./property-health-strip";
import type { PropertyDetailTabsProps } from "./property-detail-types";

export type OverviewTabContentProps = PropertyDetailTabsProps & {
  showRefreshBenchmark: boolean;
};

export function OverviewTabContent({
  propertyId,
  property,
  address,
  totalRent,
  mortgageData,
  metrics,
  dscr,
  showRefreshBenchmark,
}: OverviewTabContentProps) {
  const hasMortgage = mortgageData.length > 0;
  const primaryMortgage = mortgageData[0] ?? null;
  const ownershipLabel =
    property.ownershipPercent != null ? `${property.ownershipPercent}%` : "100%";
  const vacancyLabel =
    property.vacancyPercent != null ? `${property.vacancyPercent}%` : "5%";

  const mortgageDataForHealth = mortgageData.map((m) => ({
    ...m,
    balanceAsOfDate: m.balanceAsOfDate ?? null,
    paymentEffectiveDate: m.paymentEffectiveDate ?? null,
    escrowIncluded: m.escrowIncluded ?? false,
  }));

  const detailsTabHref = `/properties/${propertyId}?tab=details`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Overview</h2>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Performance and input snapshot. Edit fields on the full editor; open the Details tab for a
            read-only ledger of everything on file.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <Link
            href={`/properties/${propertyId}/edit`}
            className="inline-flex shrink-0 items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
          >
            Edit property
          </Link>
          <Link href={detailsTabHref} className="text-sm font-medium text-accent hover:underline">
            View full property data (Details tab)
          </Link>
        </div>
      </div>

      <PropertyHero nickname={property.nickname} address={address} />

      <PropertyHealthStrip
        property={{
          updatedAt: property.updatedAt,
          marketRent: property.marketRent,
          marketRentAsOf: property.marketRentAsOf,
        }}
        mortgageData={mortgageDataForHealth}
      />

      <section className="flex flex-wrap items-center gap-2">
        <Link
          href={`/modeling?propertyId=${encodeURIComponent(propertyId)}`}
          className="rounded-md border border-border bg-transparent px-3 py-1.5 text-sm font-medium hover:bg-subtle"
        >
          Open Modeling workspace
        </Link>
        {showRefreshBenchmark && (
          <span className="rounded-md border border-border px-3 py-1.5">
            <BenchmarkRefreshButton propertyId={propertyId} label="Refresh benchmark" />
          </span>
        )}
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Inputs at a glance</h3>
        <p className="mt-1 text-xs text-muted">
          Condensed from your saved property and mortgage records. For the full breakdown, use{" "}
          <Link href={detailsTabHref} className="font-medium text-accent hover:underline">
            Details
          </Link>{" "}
          or{" "}
          <Link
            href={`/properties/${propertyId}/edit`}
            className="font-medium text-accent hover:underline"
          >
            Edit property
          </Link>
          .
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-md bg-subtle/30 px-3 py-2">
            <p className="text-xs text-muted">Property &amp; income inputs</p>
            <p className="mt-0.5 text-sm font-medium text-foreground">
              {formatCurrency(property.purchasePrice)} purchase · {formatCurrency(totalRent)}/mo rent ·{" "}
              {formatCurrency(property.currentMonthlyExpenses)}/mo expenses
            </p>
            <p className="text-sm font-medium text-foreground">
              {ownershipLabel} ownership · {vacancyLabel} vacancy
            </p>
          </div>
          <div className="rounded-md bg-subtle/30 px-3 py-2">
            <p className="text-xs text-muted">Mortgage inputs</p>
            {!hasMortgage ? (
              <>
                <p className="mt-0.5 text-sm font-medium text-foreground">No mortgage on file</p>
                <p className="mt-1">
                  <Link
                    href={`/mortgage?propertyId=${encodeURIComponent(propertyId)}`}
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    Add mortgage details
                  </Link>
                </p>
              </>
            ) : (
              <>
                <p className="mt-0.5 text-sm font-medium text-foreground">
                  {formatCurrency(
                    primaryMortgage?.effectiveBalance ?? Number(primaryMortgage?.currentBalance ?? 0)
                  )}{" "}
                  · {(Number(primaryMortgage?.interestRate ?? 0) * 100).toFixed(2)}% ·{" "}
                  {primaryMortgage?.termYears ?? 0} years
                </p>
                <p className="text-sm font-medium text-foreground">
                  {formatCurrency(Number(primaryMortgage?.monthlyPayment ?? 0))}/mo payment
                </p>
                <p className="mt-1">
                  <Link
                    href={`/mortgage?propertyId=${encodeURIComponent(propertyId)}`}
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    Edit mortgage
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
          Performance at a glance
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-md bg-subtle/30 p-3">
            <p className="text-xs font-medium text-muted">Monthly cash flow</p>
            <p
              className={`mt-1 text-lg font-semibold ${metrics.monthlyCashFlow >= 0 ? "text-positive" : "text-negative"}`}
            >
              {formatCurrency(metrics.monthlyCashFlow)}
            </p>
          </div>
          <div className="rounded-md bg-subtle/30 p-3">
            <p className="text-xs font-medium text-muted">DSCR</p>
            <p
              className={`mt-1 text-lg font-semibold ${dscr != null && dscr >= 1 ? "text-positive" : "text-negative"}`}
            >
              {dscr != null ? dscr.toFixed(2) : "—"}
            </p>
          </div>
          <div className="rounded-md bg-subtle/30 p-3">
            <p className="text-xs font-medium text-muted">Equity</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{formatCurrency(metrics.equity)}</p>
          </div>
          <div className="rounded-md bg-subtle/30 p-3">
            <p className="text-xs font-medium text-muted">Loan-to-value</p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              {metrics.ltv != null ? `${(metrics.ltv * 100).toFixed(1)}%` : "—"}
            </p>
          </div>
        </div>
        <details className="mt-3 rounded-md border border-border bg-subtle/20 px-3 py-2">
          <summary className="cursor-pointer text-sm font-medium text-foreground">
            Show supporting metrics
          </summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-medium text-muted">NOI</p>
              <p className="text-sm font-medium text-foreground">{formatCurrency(metrics.noi)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted">Cap rate</p>
              <p className="text-sm font-medium text-foreground">
                {metrics.capRate != null ? `${(metrics.capRate * 100).toFixed(2)}%` : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted">Cash-on-cash return</p>
              <p className="text-sm font-medium text-foreground">
                {metrics.cashOnCashReturn != null
                  ? `${(metrics.cashOnCashReturn * 100).toFixed(2)}%`
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted">Annual rent</p>
              <p className="text-sm font-medium text-foreground">
                {formatCurrency(metrics.grossAnnualRent)}
              </p>
            </div>
          </div>
        </details>
      </section>
    </div>
  );
}
