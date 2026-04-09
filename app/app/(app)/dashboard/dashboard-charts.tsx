"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState } from "react";
import { BenchmarkRefreshButton } from "@/app/(app)/properties/benchmark-refresh-button";
import type { EquityDatum } from "@/components/charts/equity-chart";
import type { DebtValueDatum } from "@/components/charts/debt-vs-value-chart";
import type { CashFlowDatum } from "@/components/charts/cash-flow-chart";
import { formatCurrency } from "@/lib/format-currency";

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
              backgroundColor: "var(--chart-3)",
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
            style={{ backgroundColor: "var(--chart-3)" }}
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
}: {
  data: DashboardChartData;
  propertyCount: number;
  benchmark?: BenchmarkAtGlance;
  singlePropertyId?: string;
  singlePropertyMetrics?: SinglePropertyMetrics;
  singlePropertyEquityDeltaMoM?: number | null;
}) {
  const isSingleProperty = propertyCount === 1;
  const singleProperty = isSingleProperty ? data.equity[0] : null;
  const debtVsValueFirst = data.debtVsValue[0];
  const [activeChart, setActiveChart] = useState<"equity" | "debt_vs_value" | "cash_flow">(
    "equity"
  );

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
  const activeChartPanel =
    activeChart === "equity" ? (
      <EquityChart data={data.equity} embedded />
    ) : activeChart === "debt_vs_value" ? (
      <DebtVsValueChart data={data.debtVsValue} embedded />
    ) : (
      <CashFlowChart data={data.cashFlow} embedded />
    );

  return (
    <div className="mt-8">
      <div className="rounded-xl border border-border bg-card shadow-sm">
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
