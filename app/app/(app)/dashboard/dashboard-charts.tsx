"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useIsMobile } from "@/lib/use-is-mobile";
import { BenchmarkRefreshButton } from "@/app/(app)/properties/benchmark-refresh-button";
import type { EquityDatum } from "@/components/charts/equity-chart";
import type { DebtValueDatum } from "@/components/charts/debt-vs-value-chart";
import type { CashFlowDatum } from "@/components/charts/cash-flow-chart";
import { formatCurrency } from "@/lib/format-currency";

type ChartKey = "equity" | "debt_vs_value" | "cash_flow";

function ExpandButton({
  chartKey,
  slice,
  onToggle,
}: {
  chartKey: ChartKey;
  slice: { total: number; isExpanded: boolean; shouldSlice: boolean };
  onToggle: (key: ChartKey) => void;
}) {
  if (!slice.shouldSlice) return null;
  return (
    <div className="mt-3 text-center">
      <button
        type="button"
        onClick={() => onToggle(chartKey)}
        className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted transition-all duration-150 hover:bg-subtle hover:text-foreground"
      >
        {slice.isExpanded ? "Show less" : `Show all ${slice.total}`}
      </button>
    </div>
  );
}

function ChartLoadingPlaceholder() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-4 w-24 rounded-md bg-subtle" />
      <div className="flex h-[240px] items-center justify-center rounded-lg border border-dashed border-border bg-subtle/50 text-sm text-muted">
        Loading charts…
      </div>
    </div>
  );
}

const EquityChart = dynamic(
  () => import("@/components/charts/equity-chart").then((m) => ({ default: m.EquityChart })),
  { ssr: false, loading: ChartLoadingPlaceholder }
);

const DebtVsValueChart = dynamic(
  () => import("@/components/charts/debt-vs-value-chart").then((m) => ({ default: m.DebtVsValueChart })),
  { ssr: false, loading: ChartLoadingPlaceholder }
);

const CashFlowChart = dynamic(
  () => import("@/components/charts/cash-flow-chart").then((m) => ({ default: m.CashFlowChart })),
  { ssr: false, loading: ChartLoadingPlaceholder }
);

export type DashboardChartData = {
  equity: EquityDatum[];
  debtVsValue: DebtValueDatum[];
  cashFlow: CashFlowDatum[];
};

export type BenchmarkAtGlance = {
  /** When fresh: display label (e.g. "Rent 1.6% below market") */
  benchmarkLabel?: string;
  /** When not_rented / rent_missing: static copy (no refresh action) */
  benchmarkMessage?: string;
  /** When stale/missing benchmark data: property ID for inline refresh button */
  propertyId?: string;
};

export type SinglePropertyMetrics = {
  weightedCapRate: number | null;
  portfolioLtv: number | null;
  totalNoi: number;
  portfolioCashOnCashReturn: number | null;
  totalAnnualRent: number;
  dscr: number | null;
};

/** Compact inline value bar for Property at a glance. Height ~24–32px. Fallback: hide if value=0. */
function InlineValueBar({
  debt,
  equity,
  value,
}: {
  debt: number;
  equity: number;
  value: number;
}) {
  if (value <= 0) return null;
  const debtPct = (debt / value) * 100;
  const equityPct = (equity / value) * 100;

  return (
    <div className="mt-4 space-y-2">
      <div className="flex h-7 w-full overflow-hidden rounded-md">
        {debtPct > 0 && (
          <div
            className="flex items-center justify-center text-xs font-medium text-white transition-all"
            style={{
              width: `${debtPct}%`,
              backgroundColor: "var(--chart-1)",
              minWidth: debtPct > 0 && debtPct < 5 ? "1.5rem" : undefined,
            }}
            title={`Debt: ${formatCurrency(debt)}`}
          >
            {debtPct >= 12 && <span className="truncate px-1">Debt</span>}
          </div>
        )}
        {equityPct > 0 && (
          <div
            className="flex items-center justify-center text-xs font-medium text-white transition-all"
            style={{
              width: `${equityPct}%`,
              backgroundColor: "var(--positive)",
              minWidth: equityPct > 0 && equityPct < 5 ? "1.5rem" : undefined,
            }}
            title={`Equity: ${formatCurrency(equity)}`}
          >
            {equityPct >= 12 && <span className="truncate px-1">Equity</span>}
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-3 text-xs">
        <span className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-sm"
            style={{ backgroundColor: "var(--chart-1)" }}
          />
          <span className="text-muted">Debt</span>
          <span className="font-medium text-foreground">{formatCurrency(debt)}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-sm"
            style={{ backgroundColor: "var(--positive)" }}
          />
          <span className="text-muted">Equity</span>
          <span className="font-medium text-foreground">{formatCurrency(equity)}</span>
        </span>
      </div>
    </div>
  );
}

export function DashboardCharts({
  data,
  propertyCount,
  benchmark,
  singlePropertyId,
  singlePropertyMetrics,
  singlePropertyEquityDeltaMoM,
  containerless,
}: {
  data: DashboardChartData;
  propertyCount: number;
  benchmark?: BenchmarkAtGlance;
  singlePropertyId?: string;
  singlePropertyMetrics?: SinglePropertyMetrics;
  singlePropertyEquityDeltaMoM?: number | null;
  /** When true, skips outer panel chrome — parent provides the panel wrapper. */
  containerless?: boolean;
}) {
  const isSingleProperty = propertyCount === 1;
  const singleProperty = isSingleProperty ? data.equity[0] : null;
  const debtVsValueFirst = data.debtVsValue[0];
  const [activeChart, setActiveChart] = useState<ChartKey>("equity");
  const [expandedCharts, setExpandedCharts] = useState<Set<ChartKey>>(new Set());
  const isMobile = useIsMobile();

  // Single-property: Property at a glance only (with inline value bar). No Portfolio charts section.
  if (isSingleProperty && singleProperty && debtVsValueFirst) {
    return (
      <div className="mt-8">
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              Property at a glance
            </h3>
            {singlePropertyId && (
              <Link
                href={`/properties/${singlePropertyId}`}
                className="font-medium text-foreground hover:underline"
              >
                View property
              </Link>
            )}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {/* Position */}
            <div>
              <p className="text-sm font-medium text-muted">Value</p>
              <p className="mt-0.5 text-lg font-semibold text-foreground">
                {formatCurrency(debtVsValueFirst.value ?? 0)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted">Debt</p>
              <p className="mt-0.5 text-lg font-semibold text-foreground">
                {formatCurrency(debtVsValueFirst.debt ?? 0)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted">Equity</p>
              <p className="mt-0.5 text-lg font-semibold text-foreground">
                {formatCurrency(singleProperty.equity)}
              </p>
              {singlePropertyEquityDeltaMoM != null && (
                <p
                  className={`mt-0.5 text-xs tabular-nums ${
                    singlePropertyEquityDeltaMoM > 0
                      ? "text-positive"
                      : singlePropertyEquityDeltaMoM < 0
                        ? "text-negative"
                        : "text-muted"
                  }`}
                >
                  {singlePropertyEquityDeltaMoM > 0 ? "+" : ""}
                  {formatCurrency(singlePropertyEquityDeltaMoM)} vs last month
                </p>
              )}
            </div>
            {/* Income */}
            <div>
              <p className="text-sm font-medium text-muted">Monthly cash flow</p>
              <p
                className={`mt-0.5 text-lg font-semibold ${
                  (data.cashFlow[0]?.monthlyCashFlow ?? 0) >= 0
                    ? "text-positive"
                    : "text-negative"
                }`}
              >
                {formatCurrency(data.cashFlow[0]?.monthlyCashFlow ?? 0)}
              </p>
            </div>
            {singlePropertyMetrics && (
              <div>
                <p className="text-sm font-medium text-muted">Annual rent</p>
                <p className="mt-0.5 text-lg font-semibold text-foreground">
                  {formatCurrency(singlePropertyMetrics.totalAnnualRent)}
                </p>
              </div>
            )}
            {/* Returns */}
            {singlePropertyMetrics && (
              <>
                <div>
                  <p className="text-sm font-medium text-muted">Cap rate</p>
                  <p className="mt-0.5 text-lg font-semibold text-foreground">
                    {singlePropertyMetrics.weightedCapRate != null
                      ? `${(singlePropertyMetrics.weightedCapRate * 100).toFixed(2)}%`
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted">NOI</p>
                  <p className="mt-0.5 text-lg font-semibold text-foreground">
                    {formatCurrency(singlePropertyMetrics.totalNoi)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted">Cash-on-cash return</p>
                  <p
                    className={`mt-0.5 text-lg font-semibold ${
                      singlePropertyMetrics.portfolioCashOnCashReturn != null &&
                      singlePropertyMetrics.portfolioCashOnCashReturn >= 0
                        ? "text-positive"
                        : singlePropertyMetrics.portfolioCashOnCashReturn != null
                          ? "text-negative"
                          : "text-foreground"
                    }`}
                  >
                    {singlePropertyMetrics.portfolioCashOnCashReturn != null
                      ? `${(singlePropertyMetrics.portfolioCashOnCashReturn * 100).toFixed(2)}%`
                      : "—"}
                  </p>
                </div>
                {/* Leverage */}
                <div>
                  <p className="text-sm font-medium text-muted">LTV</p>
                  <p className="mt-0.5 text-lg font-semibold text-foreground">
                    {singlePropertyMetrics.portfolioLtv != null
                      ? `${(singlePropertyMetrics.portfolioLtv * 100).toFixed(1)}%`
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted">DSCR</p>
                  <p
                    className={`mt-0.5 text-lg font-semibold ${
                      singlePropertyMetrics.dscr != null
                        ? singlePropertyMetrics.dscr >= 1
                          ? "text-positive"
                          : "text-negative"
                        : "text-foreground"
                    }`}
                  >
                    {singlePropertyMetrics.dscr != null
                      ? singlePropertyMetrics.dscr.toFixed(2)
                      : "—"}
                  </p>
                </div>
              </>
            )}
            {/* Benchmark */}
            <div className="col-span-2 min-w-[10rem]">
              <p className="text-sm font-medium text-muted">Rent vs. market</p>
              {benchmark?.benchmarkLabel ? (
                <p className="mt-0.5 text-lg font-semibold text-foreground">
                  {benchmark.benchmarkLabel}
                </p>
              ) : benchmark?.benchmarkMessage ? (
                <p className="mt-0.5 text-sm text-muted">{benchmark.benchmarkMessage}</p>
              ) : benchmark?.propertyId ? (
                <p className="mt-0.5">
                  <BenchmarkRefreshButton
                    propertyId={benchmark.propertyId}
                    label="Refresh estimate"
                  />
                </p>
              ) : (
                <p className="mt-0.5 text-lg font-semibold text-muted">
                  —
                </p>
              )}
            </div>
          </div>
          <InlineValueBar
            debt={debtVsValueFirst.debt}
            equity={singleProperty.equity}
            value={debtVsValueFirst.value}
          />
        </div>
      </div>
    );
  }

  // Multi-property: Tabbed portfolio chart workspace to reduce scroll.
  const TOP_N = isMobile ? 5 : 8;

  function sliceChartData<T>(
    items: T[],
    sortFn: (a: T, b: T) => number,
    key: ChartKey
  ): { visible: T[]; total: number; isExpanded: boolean; shouldSlice: boolean } {
    const shouldSlice = items.length > 8;
    if (!shouldSlice) {
      return {
        visible: items,
        total: items.length,
        isExpanded: true,
        shouldSlice: false,
      };
    }
    const sorted = [...items].sort(sortFn);
    const isExpanded = expandedCharts.has(key);
    return {
      visible: isExpanded ? sorted : sorted.slice(0, TOP_N),
      total: sorted.length,
      isExpanded,
      shouldSlice: true,
    };
  }

  const equitySlice = sliceChartData(
    data.equity,
    (a, b) => b.equity - a.equity,
    "equity"
  );
  const cashFlowSlice = sliceChartData(
    data.cashFlow,
    (a, b) => a.monthlyCashFlow - b.monthlyCashFlow,
    "cash_flow"
  );
  const debtVsValueSlice = sliceChartData(
    data.debtVsValue,
    (a, b) => b.value - a.value,
    "debt_vs_value"
  );

  function getHeightPx(count: number): number | undefined {
    return count <= 8 ? undefined : count * 28;
  }

  function toggleExpand(key: ChartKey) {
    setExpandedCharts((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const activeChartKey = activeChart;
  const activeSlice =
    activeChartKey === "equity"
      ? equitySlice
      : activeChartKey === "debt_vs_value"
        ? debtVsValueSlice
        : cashFlowSlice;

  const activeChartPanel = (
    <>
      {activeChartKey === "equity" ? (
        <EquityChart data={equitySlice.visible} embedded heightPx={getHeightPx(equitySlice.visible.length)} />
      ) : activeChartKey === "debt_vs_value" ? (
        <DebtVsValueChart data={debtVsValueSlice.visible} embedded heightPx={getHeightPx(debtVsValueSlice.visible.length)} />
      ) : (
        <CashFlowChart data={cashFlowSlice.visible} embedded heightPx={getHeightPx(cashFlowSlice.visible.length)} />
      )}
      <ExpandButton chartKey={activeChartKey} slice={activeSlice} onToggle={toggleExpand} />
    </>
  );

  const headerContent = (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
      <h2 className="text-sm font-semibold text-foreground">
        Portfolio charts
      </h2>
      <div className="flex flex-wrap gap-2">
        <ChartTabButton
          label="Equity"
          active={activeChart === "equity"}
          onClick={() => setActiveChart("equity")}
        />
        <ChartTabButton
          label="Debt vs value"
          active={activeChart === "debt_vs_value"}
          onClick={() => setActiveChart("debt_vs_value")}
        />
        <ChartTabButton
          label="Cash flow"
          active={activeChart === "cash_flow"}
          onClick={() => setActiveChart("cash_flow")}
        />
      </div>
    </div>
  );

  if (containerless) {
    return (
      <>
        {headerContent}
        <div className="p-5">{activeChartPanel}</div>
      </>
    );
  }

  return (
    <div className="mt-8">
      <div className="rounded-xl border border-border bg-card shadow-sm">
        {headerContent}
        <div className="p-5">{activeChartPanel}</div>
      </div>
    </div>
  );
}

function ChartTabButton({
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
