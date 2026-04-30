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
        className="rounded-md border px-3 py-1.5 text-[12px] font-medium transition-all duration-150 hover:text-foreground"
        style={{
          borderColor: "var(--border)",
          color: "var(--foreground-muted)",
          background: "transparent",
        }}
      >
        {slice.isExpanded ? "Show less" : `Show all ${slice.total}`}
      </button>
    </div>
  );
}

function ChartLoadingPlaceholder() {
  return (
    <div className="animate-pulse space-y-3">
      <div
        className="h-4 w-24 rounded-md"
        style={{ background: "var(--background-subtle)" }}
      />
      <div
        className="flex h-[240px] items-center justify-center rounded-lg border border-dashed text-sm"
        style={{
          borderColor: "var(--border)",
          background: "var(--background-subtle)",
          color: "var(--foreground-muted)",
        }}
      >
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
      <div className="flex h-[10px] w-full overflow-hidden rounded-md" style={{ gap: "2px" }}>
        {debtPct > 0 && (
          <div
            className="transition-all"
            style={{
              width: `${debtPct}%`,
              background: "oklch(0.55 0.15 260)",
              borderRadius: "5px 0 0 5px",
              minWidth: debtPct > 0 && debtPct < 5 ? "1.5rem" : undefined,
            }}
            title={`Debt: ${formatCurrency(debt)}`}
          />
        )}
        {equityPct > 0 && (
          <div
            className="transition-all flex-1"
            style={{
              background: "oklch(0.65 0.14 162)",
              borderRadius: "0 5px 5px 0",
              minWidth: equityPct > 0 && equityPct < 5 ? "1.5rem" : undefined,
            }}
            title={`Equity: ${formatCurrency(equity)}`}
          />
        )}
      </div>
      <div className="flex flex-wrap gap-3 text-[11.5px]">
        <span className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-sm"
            style={{ backgroundColor: "oklch(0.55 0.15 260)" }}
          />
          <span style={{ color: "var(--foreground-muted)" }}>Debt</span>
          <span
            className="font-semibold tabular-nums"
            style={{ color: "var(--foreground)" }}
          >
            {formatCurrency(debt)}
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-sm"
            style={{ backgroundColor: "oklch(0.65 0.14 162)" }}
          />
          <span style={{ color: "var(--foreground-muted)" }}>Equity</span>
          <span
            className="font-semibold tabular-nums"
            style={{ color: "var(--foreground)" }}
          >
            {formatCurrency(equity)}
          </span>
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
        <div
          className="rounded-xl border p-5"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3
              className="text-[13px] font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Property at a glance
            </h3>
            {singlePropertyId && (
              <Link
                href={`/properties/${singlePropertyId}`}
                className="text-[12px] font-medium hover:underline"
                style={{ color: "var(--accent)" }}
              >
                View property →
              </Link>
            )}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            <GlanceMetric
              label="Value"
              value={formatCurrency(debtVsValueFirst.value ?? 0)}
            />
            <GlanceMetric
              label="Debt"
              value={formatCurrency(debtVsValueFirst.debt ?? 0)}
            />
            <GlanceMetric
              label="Equity"
              value={formatCurrency(singleProperty.equity)}
              footer={
                singlePropertyEquityDeltaMoM != null ? (
                  <p
                    className={`mt-0.5 text-[11px] tabular-nums ${
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
                ) : null
              }
            />
            <GlanceMetric
              label="Monthly cash flow"
              value={formatCurrency(data.cashFlow[0]?.monthlyCashFlow ?? 0)}
              valueColor={
                (data.cashFlow[0]?.monthlyCashFlow ?? 0) >= 0
                  ? "var(--positive)"
                  : "var(--negative)"
              }
            />
            {singlePropertyMetrics && (
              <GlanceMetric
                label="Annual rent"
                value={formatCurrency(singlePropertyMetrics.totalAnnualRent)}
              />
            )}
            {singlePropertyMetrics && (
              <>
                <GlanceMetric
                  label="Cap rate"
                  value={
                    singlePropertyMetrics.weightedCapRate != null
                      ? `${(singlePropertyMetrics.weightedCapRate * 100).toFixed(2)}%`
                      : "—"
                  }
                />
                <GlanceMetric
                  label="NOI"
                  value={formatCurrency(singlePropertyMetrics.totalNoi)}
                />
                <GlanceMetric
                  label="Cash-on-cash return"
                  value={
                    singlePropertyMetrics.portfolioCashOnCashReturn != null
                      ? `${(singlePropertyMetrics.portfolioCashOnCashReturn * 100).toFixed(2)}%`
                      : "—"
                  }
                  valueColor={
                    singlePropertyMetrics.portfolioCashOnCashReturn != null
                      ? singlePropertyMetrics.portfolioCashOnCashReturn >= 0
                        ? "var(--positive)"
                        : "var(--negative)"
                      : "var(--foreground)"
                  }
                />
                <GlanceMetric
                  label="LTV"
                  value={
                    singlePropertyMetrics.portfolioLtv != null
                      ? `${(singlePropertyMetrics.portfolioLtv * 100).toFixed(1)}%`
                      : "—"
                  }
                  valueColor={
                    singlePropertyMetrics.portfolioLtv != null &&
                    singlePropertyMetrics.portfolioLtv > 0.8
                      ? "var(--warning)"
                      : "var(--foreground)"
                  }
                />
                <GlanceMetric
                  label="DSCR"
                  value={
                    singlePropertyMetrics.dscr != null
                      ? singlePropertyMetrics.dscr.toFixed(2)
                      : "—"
                  }
                  valueColor={
                    singlePropertyMetrics.dscr != null
                      ? singlePropertyMetrics.dscr >= 1
                        ? "var(--positive)"
                        : "var(--negative)"
                      : "var(--foreground)"
                  }
                />
              </>
            )}
            {/* Benchmark — wider cell */}
            <div className="col-span-2 min-w-[10rem]">
              <p
                className="text-[11px] font-medium uppercase tracking-[0.05em]"
                style={{ color: "var(--foreground-muted)" }}
              >
                Rent vs. market
              </p>
              {benchmark?.benchmarkLabel ? (
                <p
                  className="mt-1 text-[17px] font-semibold tabular-nums"
                  style={{ color: "var(--foreground)" }}
                >
                  {benchmark.benchmarkLabel}
                </p>
              ) : benchmark?.benchmarkMessage ? (
                <p
                  className="mt-1 text-[13px]"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  {benchmark.benchmarkMessage}
                </p>
              ) : benchmark?.propertyId ? (
                <p className="mt-1">
                  <BenchmarkRefreshButton
                    propertyId={benchmark.propertyId}
                    label="Refresh estimate"
                  />
                </p>
              ) : (
                <p
                  className="mt-1 text-[17px] font-semibold"
                  style={{ color: "var(--foreground-muted)" }}
                >
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
    <div
      className="flex flex-col items-stretch gap-3 px-[18px] py-[14px] md:flex-row md:flex-wrap md:items-center md:justify-between"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <h2
        className="text-[13px] font-semibold"
        style={{ color: "var(--foreground)" }}
      >
        Portfolio charts
      </h2>
      <div className="flex flex-wrap justify-center gap-1 md:justify-start">
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
      <div
        className="rounded-xl border"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        {headerContent}
        <div className="p-5">{activeChartPanel}</div>
      </div>
    </div>
  );
}

function GlanceMetric({
  label,
  value,
  valueColor = "var(--foreground)",
  footer,
}: {
  label: string;
  value: string;
  valueColor?: string;
  footer?: React.ReactNode;
}) {
  return (
    <div>
      <p
        className="text-[11px] font-medium uppercase tracking-[0.05em]"
        style={{ color: "var(--foreground-muted)" }}
      >
        {label}
      </p>
      <p
        className="mt-1 text-[17px] font-semibold tabular-nums"
        style={{ color: valueColor }}
      >
        {value}
      </p>
      {footer}
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
      className="rounded-md border px-3 py-1.5 text-[12px] font-medium transition-all duration-150"
      style={
        active
          ? {
              background: "var(--accent-dim)",
              color: "var(--accent)",
              borderColor: "rgba(129,140,248,0.2)",
            }
          : {
              background: "transparent",
              color: "var(--foreground-muted)",
              borderColor: "transparent",
            }
      }
    >
      {label}
    </button>
  );
}
