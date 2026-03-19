"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { isBenchmarkFresh } from "@/lib/benchmark-utils";
import { DetailsTabContent } from "./details-tab-content";
import { OverviewTabContent } from "./overview-tab-content";
import type { PropertyDetailTabsProps } from "./property-detail-types";

export type { MortgageForTabs, PropertyDetailTabsProps } from "./property-detail-types";

export type TabId = "overview" | "details";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "details", label: "Details" },
];

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
          <OverviewTabContent
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
