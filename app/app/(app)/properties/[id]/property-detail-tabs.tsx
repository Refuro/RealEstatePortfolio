"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { isBenchmarkFresh } from "@/lib/benchmark-utils";
import { formatCurrency } from "@/lib/format-currency";
import { BenchmarkRefreshButton } from "../benchmark-refresh-button";
import { PropertyHero } from "./property-hero";
import { DetailsTabContent } from "./details-tab-content";
import type { OwnershipDisplayMode } from "@/lib/metrics/property-metrics";

export type TabId = "overview" | "details";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "details", label: "Details" },
];

export type MortgageForTabs = {
  id: string;
  originalLoanAmount: string;
  currentBalance: string;
  balanceAsOfDate?: string | null;
  interestRate: string;
  termYears: number;
  startDate: string;
  monthlyPayment: string;
  paymentEffectiveDate?: string | null;
  escrowIncluded?: boolean;
  escrowAmount?: string | null;
  lenderName: string | null;
  loanType: string | null;
  effectiveBalance?: number;
  balanceSource?: "stored" | "projected";
  payoffProjection?: { payoffDate: string | null; remainingAtTermEnd: number | null };
};

export type PropertyDetailTabsProps = {
  propertyId: string;
  property: {
    nickname: string | null;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    zipCode: string;
    propertyType: string;
    units: number;
    bedrooms: number | null;
    bathrooms: number | null;
    unitMix: string | null;
    purchasePrice: number;
    purchaseDate: Date | string;
    currentEstimatedValue: number;
    currentMonthlyExpenses: number;
    unitRents: number[] | null;
    ownershipPercent: number | null;
    vacancyPercent: number | null;
    cashInvested: number | null;
    notes: string | null;
    marketRent: number | null;
    marketRentAsOf: Date | string | null;
    updatedAt: Date | string;
  };
  address: string;
  totalRent: number;
  mortgageData: MortgageForTabs[];
  metrics: {
    equity: number;
    monthlyCashFlow: number;
    noi: number;
    capRate: number | null;
    ltv: number | null;
    cashOnCashReturn: number | null;
    grossAnnualRent: number;
  };
  dscr: number | null;
  totalMortgageBalance: number;
  totalMonthlyPayment: number;
  ownershipPercent: number;
  vacancyPercent: number;
  displayMode: OwnershipDisplayMode | null;
};

function useTabState(propertyId: string): [TabId, (tab: TabId) => void] {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");

  useEffect(() => {
    if (requestedTab === "mortgage") {
      router.replace(`/mortgage?propertyId=${encodeURIComponent(propertyId)}`, { scroll: false });
      return;
    }
    if (requestedTab === "projections") {
      router.replace(`/modeling?propertyId=${encodeURIComponent(propertyId)}`, { scroll: false });
    }
  }, [requestedTab, propertyId, router]);

  const tab = (searchParams.get("tab") as TabId) || "overview";
  const validTab = TABS.some((t) => t.id === tab) ? tab : "overview";

  const setTab = useCallback(
    (newTab: TabId) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", newTab);
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  return [validTab, setTab];
}

export function PropertyDetailTabs(props: PropertyDetailTabsProps) {
  const [activeTab, setTab] = useTabState(props.propertyId);
  const scrollRef = useRef<HTMLDivElement>(null);

  const showRefreshBenchmark =
    props.property.marketRent == null ||
    props.property.marketRent <= 0 ||
    !isBenchmarkFresh(props.property.marketRentAsOf);

  return (
    <div ref={scrollRef}>
      {/* Tab nav: horizontal scroll on mobile, or Jump to dropdown */}
      <nav
        className="mt-4 flex items-center border-b border-border"
        aria-label="Property sections"
      >
        {/* Desktop: horizontal tabs */}
        <div className="hidden overflow-x-auto md:flex md:flex-wrap md:gap-0">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === id
                  ? "border-accent text-foreground"
                  : "border-transparent text-muted hover:border-border hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="flex flex-1 overflow-x-auto md:hidden scrollbar-thin">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`shrink-0 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === id
                  ? "border-accent text-foreground"
                  : "border-transparent text-muted hover:border-border hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Mobile: Jump to dropdown (alternative - we use horizontal scroll per AC-9) */}
      </nav>

      <div className="mt-6">
        {activeTab === "overview" && (
          <OverviewTab
            {...props}
            showRefreshBenchmark={showRefreshBenchmark}
          />
        )}
        {activeTab === "details" && (
          <DetailsTabContent
            propertyId={props.propertyId}
            property={props.property}
            address={props.address}
            totalRent={props.totalRent}
            mortgageData={props.mortgageData}
          />
        )}
      </div>
    </div>
  );
}

function OverviewTab({
  propertyId,
  property,
  address,
  mortgageData,
  metrics,
  dscr,
  showRefreshBenchmark,
}: PropertyDetailTabsProps & {
  showRefreshBenchmark: boolean;
}) {
  const hasMortgage = mortgageData.length > 0;
  const primaryMortgage = mortgageData[0] ?? null;
  const ownershipLabel =
    property.ownershipPercent != null ? `${property.ownershipPercent}%` : "100%";
  const vacancyLabel =
    property.vacancyPercent != null ? `${property.vacancyPercent}%` : "5%";

  return (
    <div className="space-y-4">
      <PropertyHero
        nickname={property.nickname}
        address={address}
        equity={metrics.equity}
        monthlyCashFlow={metrics.monthlyCashFlow}
        ltv={metrics.ltv}
        dscr={dscr}
      />

      <section className="flex flex-wrap items-center gap-2">
        <Link
          href={`/properties/${propertyId}/edit`}
          className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-subtle"
        >
          Edit property
        </Link>
        <Link
          href={`/modeling?propertyId=${encodeURIComponent(propertyId)}`}
          className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-subtle"
        >
          Open Modeling workspace
        </Link>
        {showRefreshBenchmark && (
          <span className="rounded-md border border-border px-3 py-1.5">
            <BenchmarkRefreshButton propertyId={propertyId} label="Refresh benchmark" />
          </span>
        )}
      </section>

      <section className="rounded-lg border border-border/70 bg-card/90 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Verification</p>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          <div className="rounded-md bg-subtle/30 px-3 py-2">
            <p className="text-xs text-muted">Property inputs</p>
            <p className="mt-0.5 text-sm font-medium text-foreground">
              {formatCurrency(property.purchasePrice)} purchase · {formatCurrency(property.currentMonthlyExpenses)}/mo expenses
            </p>
            <p className="text-sm font-medium text-foreground">
              {ownershipLabel} ownership · {vacancyLabel} vacancy
            </p>
            <p className="mt-1">
              <Link
                href={`/properties/${propertyId}/edit`}
                className="text-sm font-medium text-accent hover:underline"
              >
                Edit property
              </Link>
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
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">
          Performance at a glance
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-md bg-subtle/30 p-3">
            <p className="text-xs font-medium text-muted">Monthly cash flow</p>
            <p className={`mt-1 text-lg font-semibold ${metrics.monthlyCashFlow >= 0 ? "text-positive" : "text-negative"}`}>
              {formatCurrency(metrics.monthlyCashFlow)}
            </p>
          </div>
          <div className="rounded-md bg-subtle/30 p-3">
            <p className="text-xs font-medium text-muted">DSCR</p>
            <p className={`mt-1 text-lg font-semibold ${dscr != null && dscr >= 1 ? "text-positive" : "text-negative"}`}>
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
        <details className="mt-3 rounded-md border border-border/70 bg-subtle/20 px-3 py-2">
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

        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={`/modeling?propertyId=${encodeURIComponent(propertyId)}`}
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-subtle"
          >
            Open Modeling workspace
          </Link>
          <Link
            href={`/mortgage?propertyId=${encodeURIComponent(propertyId)}`}
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium hover:bg-subtle"
          >
            Open Mortgage workspace
          </Link>
        </div>
      </section>
    </div>
  );
}
