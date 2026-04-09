"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/format-currency";
import { getPropertyCompleteness } from "@/lib/property-completeness";
import { MobileCollapsible } from "@/components/mobile-collapsible";
import { PropertyHero } from "./property-hero";
import { PropertyHealthStrip } from "./property-health-strip";
import type { PropertyDetailTabsProps } from "./property-detail-types";
import { PayoffCard } from "./payoff-card";
import { QuickActions } from "./quick-actions";

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
  const completeness = getPropertyCompleteness({
    purchasePrice: Number(property.purchasePrice),
    currentEstimatedValue: Number(property.currentEstimatedValue),
    cashInvested: property.cashInvested,
    mortgageCount: mortgageData.length,
    hasMortgage: property.hasMortgage,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    squareFeet: property.squareFeet,
  });
  const hasAnyHomeProfileField =
    property.bedrooms != null || property.bathrooms != null || property.squareFeet != null;

  const mortgageDataForHealth = mortgageData.map((m) => ({
    ...m,
    balanceAsOfDate: m.balanceAsOfDate ?? null,
    paymentEffectiveDate: m.paymentEffectiveDate ?? null,
    escrowIncluded: m.escrowIncluded ?? false,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-foreground">Overview</h2>
      </div>

      {!completeness.isComplete && (
        <div className="rounded-lg bg-subtle/40 p-4">
          <p className="text-sm font-semibold text-foreground">
            Complete these for full metrics
          </p>
          <p className="mt-1 text-xs text-muted">
            {completeness.missingFields.join(", ")}
          </p>
          <Link
            href={`/properties/${propertyId}/edit`}
            className="mt-3 inline-flex min-h-[44px] items-center rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-subtle"
          >
            Complete details
          </Link>
        </div>
      )}

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

      <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <QuickActions propertyId={propertyId} showRefreshBenchmark={showRefreshBenchmark} />
      </section>

      <section className="rounded-xl border border-border bg-card shadow-sm">
        <div className="p-4">
          <h3 className="text-base font-semibold text-foreground">Performance at a glance</h3>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-md bg-subtle/30 p-3">
            <p className="text-xs font-medium text-muted">Monthly cash flow</p>
            <p
              className={`mt-1 tabular-nums text-lg font-semibold ${metrics.monthlyCashFlow >= 0 ? "text-positive" : "text-negative"}`}
            >
              {formatCurrency(metrics.monthlyCashFlow)}
            </p>
          </div>
          <div className="rounded-md bg-subtle/30 p-3">
            <p className="text-xs font-medium text-muted">DSCR</p>
            <p
              className={`mt-1 tabular-nums text-lg font-semibold ${
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
            <p className="mt-1 tabular-nums text-lg font-semibold text-foreground">{formatCurrency(metrics.equity)}</p>
          </div>
          <div className="rounded-md bg-subtle/30 p-3">
            <p className="text-xs font-medium text-muted">Loan-to-value</p>
            <p
              className={`mt-1 tabular-nums text-lg font-semibold ${
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
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/modeling?propertyId=${encodeURIComponent(propertyId)}`}
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-md border border-border bg-transparent px-3 py-2 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-subtle md:w-auto"
            >
              Open Modeling workspace
            </Link>
            <Link
              href={`/refinance?propertyId=${encodeURIComponent(propertyId)}`}
              className="inline-flex min-h-[44px] w-full items-center justify-center rounded-md border border-border bg-transparent px-3 py-2 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-subtle md:w-auto"
            >
              Open Refinance workspace
            </Link>
          </div>
          <div className="mt-4 rounded-lg bg-subtle/40 px-4 py-3 text-sm text-muted">
            Purchased <span className="tabular-nums font-medium text-foreground">{formatCurrency(property.purchasePrice)}</span> ·{" "}
            <span className="tabular-nums font-medium text-foreground">{formatCurrency(totalRent)}</span>/mo rent ·{" "}
            <span className="tabular-nums font-medium text-foreground">{formatCurrency(property.currentMonthlyExpenses)}</span>/mo expenses
          </div>
          <div className="mt-3 rounded-lg bg-subtle/40 px-4 py-3 text-sm text-muted">
            Home profile:{" "}
            {hasAnyHomeProfileField ? (
              <>
                <span className="font-medium text-foreground">
                  {property.bedrooms != null ? property.bedrooms : "—"}
                </span>{" "}
                bd ·{" "}
                <span className="font-medium text-foreground tabular-nums">
                  {property.bathrooms != null ? property.bathrooms : "—"}
                </span>{" "}
                ba ·{" "}
                <span className="font-medium text-foreground tabular-nums">
                  {property.squareFeet != null ? property.squareFeet.toLocaleString() : "—"}
                </span>{" "}
                sqft
              </>
            ) : (
              <span className="font-medium text-foreground">Not set</span>
            )}
          </div>
          <MobileCollapsible label="Supporting metrics">
            <div className="mt-3 rounded-md bg-subtle/40 px-3 py-3">
            <p className="hidden text-xs font-medium text-muted md:block">Supporting metrics</p>
            <div className="mt-0 grid grid-cols-2 gap-3 md:mt-3 lg:grid-cols-4">
              <div>
                <p className="text-xs font-medium text-muted">NOI</p>
                <p className="tabular-nums text-sm font-medium text-foreground">{formatCurrency(metrics.noi)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted">Cap rate</p>
                <p className="tabular-nums text-sm font-medium text-foreground">
                  {metrics.capRate != null ? `${(metrics.capRate * 100).toFixed(2)}%` : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted">Cash-on-cash return</p>
                <p className="tabular-nums text-sm font-medium text-foreground">
                  {metrics.cashOnCashReturn != null
                    ? `${(metrics.cashOnCashReturn * 100).toFixed(2)}%`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted">Annual rent</p>
                <p className="tabular-nums text-sm font-medium text-foreground">
                  {formatCurrency(metrics.grossAnnualRent)}
                </p>
              </div>
            </div>
            </div>
          </MobileCollapsible>
        </div>
      </section>
      {hasMortgage && (
        <PayoffCard
          mortgages={mortgageData}
          propertyId={propertyId}
        />
      )}
    </div>
  );
}
