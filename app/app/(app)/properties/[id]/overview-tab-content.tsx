"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/format-currency";
import { MobileCollapsible } from "@/components/mobile-collapsible";
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
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Overview</h2>
        <p className="mt-1 max-w-xl text-sm text-muted">
          Performance and input snapshot. Use the Details tab for a full ledger, or{" "}
          <Link href={`/properties/${propertyId}/edit`} className="font-medium text-accent hover:underline">
            Edit property
          </Link>{" "}
          to change values.
        </p>
      </div>

      <PropertyHero nickname={property.nickname} address={address} />

      <PropertyHealthStrip
        property={{
          updatedAt: property.updatedAt,
          isRented: property.isRented,
          currentMonthlyRent: totalRent,
          unitRents: property.unitRents,
          marketRent: property.marketRent,
          marketRentAsOf: property.marketRentAsOf,
        }}
        mortgageData={mortgageDataForHealth}
      />

      {showRefreshBenchmark && (
        <section className="flex flex-wrap items-center gap-2">
          <span className="rounded-md border border-border px-3 py-1.5">
            <BenchmarkRefreshButton propertyId={propertyId} label="Refresh benchmark" />
          </span>
        </section>
      )}

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
            <p className="text-sm font-medium text-foreground">
              {property.isRented ? "Currently rented" : "Not currently rented"}
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
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
            Performance at a glance
          </h3>
          <Link
            href={`/modeling?propertyId=${encodeURIComponent(propertyId)}`}
            className="rounded-md border border-border bg-transparent px-2.5 py-1 text-sm font-medium text-foreground hover:bg-subtle"
          >
            Open Modeling workspace
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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
              className={`mt-1 text-lg font-semibold ${
                dscr == null
                  ? "text-muted"
                  : dscr < 1
                    ? "text-negative"
                    : dscr < 1.2
                      ? "text-warning"
                      : "text-positive"
              }`}
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
            <p
              className={`mt-1 text-lg font-semibold ${
                metrics.ltv == null
                  ? "text-foreground"
                  : metrics.ltv > 0.8
                    ? "text-negative"
                    : metrics.ltv > 0.7
                      ? "text-warning"
                      : "text-foreground"
              }`}
            >
              {metrics.ltv != null ? `${(metrics.ltv * 100).toFixed(1)}%` : "—"}
            </p>
          </div>
        </div>
        <MobileCollapsible label="Supporting metrics">
          <div className="mt-3 rounded-md border border-border bg-subtle/20 px-3 py-3">
            <p className="hidden text-xs font-semibold uppercase tracking-wide text-muted md:block">Supporting metrics</p>
            <div className="mt-0 grid grid-cols-2 gap-3 md:mt-3 lg:grid-cols-4">
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
          </div>
        </MobileCollapsible>
      </section>
    </div>
  );
}
