"use client";

import { useState } from "react";
import { BenchmarkAutoRefresh } from "./benchmark-auto-refresh";
import { PropertyPerformanceTable, type PropertyTableRow } from "./property-performance-table";
import { DashboardCharts, type DashboardChartData } from "./dashboard-charts";
import type { BenchmarkDashboardPropertyInput } from "@/lib/benchmark-dashboard-utils";

export function PortfolioOverviewSection({
  rows,
  chartData,
  propertyCount,
}: {
  rows: PropertyTableRow[];
  chartData: DashboardChartData;
  propertyCount: number;
}) {
  const [activeTab, setActiveTab] = useState<"properties" | "charts">("properties");

  const benchmarkInputs: BenchmarkDashboardPropertyInput[] = rows.map((r) => ({
    id: r.id,
    isRented: r.isRented,
    userRent: r.userRent,
    marketRent: r.marketRent,
    marketRentAsOf: r.marketRentAsOf,
  }));

  return (
    <div className="mt-6 rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">Portfolio overview</h2>
        <div className="flex gap-2">
          <TabButton
            label="Properties"
            active={activeTab === "properties"}
            onClick={() => setActiveTab("properties")}
          />
          <TabButton
            label="Charts"
            active={activeTab === "charts"}
            onClick={() => setActiveTab("charts")}
          />
        </div>
      </div>

      {activeTab === "properties" ? (
        <>
          <BenchmarkAutoRefresh properties={benchmarkInputs} />
          <PropertyPerformanceTable rows={rows} />
        </>
      ) : (
        <DashboardCharts
          data={chartData}
          propertyCount={propertyCount}
          containerless
        />
      )}
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-all duration-150 ${
        active
          ? "border-accent/50 bg-accent/15 text-foreground"
          : "border-border bg-transparent text-muted hover:bg-subtle hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
