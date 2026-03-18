"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef } from "react";
import { isBenchmarkFresh } from "@/lib/benchmark-utils";
import { PropertyHero } from "./property-hero";
import { QuickActions } from "./quick-actions";
import { PropertyMetricsSection } from "../property-metrics-section";
import { MortgageTabContent } from "./mortgage-tab-content";
import { ProjectionsTabContent } from "./projections-tab-content";
import { DetailsTabContent } from "./details-tab-content";
import type { OwnershipDisplayMode } from "@/lib/metrics/property-metrics";

export type TabId = "overview" | "mortgage" | "projections" | "details";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "mortgage", label: "Mortgage" },
  { id: "projections", label: "Projections" },
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

function useTabState(): [TabId, (tab: TabId) => void] {
  const router = useRouter();
  const searchParams = useSearchParams();

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
  const [activeTab, setTab] = useTabState();
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
            onNavigateToProjections={() => setTab("projections")}
          />
        )}
        {activeTab === "mortgage" && (
          <MortgageTabContent
            propertyId={props.propertyId}
            mortgageData={props.mortgageData}
            onNavigateToDetails={() => {
              setTab("details");
              setTimeout(() => {
                document.getElementById("mortgages")?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
          />
        )}
        {activeTab === "projections" && (
          <ProjectionsTabContent
            monthlyRent={props.totalRent}
            monthlyExpenses={props.property.currentMonthlyExpenses}
            estimatedValue={props.property.currentEstimatedValue}
            cashInvested={props.property.cashInvested}
            totalMortgageBalance={props.totalMortgageBalance}
            totalMonthlyPayment={props.totalMonthlyPayment}
            ownershipPercent={props.ownershipPercent}
            vacancyPercent={props.vacancyPercent}
            displayMode={props.displayMode}
            mortgageData={props.mortgageData}
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
  totalRent,
  metrics,
  dscr,
  showRefreshBenchmark,
  onNavigateToProjections,
}: PropertyDetailTabsProps & {
  showRefreshBenchmark: boolean;
  onNavigateToProjections: () => void;
}) {
  return (
    <div className="space-y-6">
      <PropertyHero
        propertyId={propertyId}
        nickname={property.nickname}
        address={address}
        value={property.currentEstimatedValue}
        equity={metrics.equity}
        monthlyCashFlow={metrics.monthlyCashFlow}
        totalRent={totalRent}
        marketRent={property.marketRent}
        marketRentAsOf={property.marketRentAsOf}
        dscr={dscr}
      />
      <QuickActions propertyId={propertyId} showRefreshBenchmark={showRefreshBenchmark} />
      <PropertyMetricsSection
        metrics={{
          noi: metrics.noi,
          capRate: metrics.capRate,
          ltv: metrics.ltv,
          cashOnCashReturn: metrics.cashOnCashReturn,
          annualRent: metrics.grossAnnualRent,
        }}
      />
      <p>
        <button
          type="button"
          onClick={onNavigateToProjections}
          className="text-sm font-medium text-accent hover:underline"
        >
          Model scenarios →
        </button>
      </p>
    </div>
  );
}
