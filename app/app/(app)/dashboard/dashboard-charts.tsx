"use client";

import dynamic from "next/dynamic";
import { BenchmarkRefreshButton } from "@/app/(app)/properties/benchmark-refresh-button";
import type { EquityDatum } from "@/components/charts/equity-chart";
import type { DebtValueDatum } from "@/components/charts/debt-vs-value-chart";
import type { CashFlowDatum } from "@/components/charts/cash-flow-chart";
import { formatCurrency } from "@/lib/format-currency";

function ChartLoadingPlaceholder() {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      <div className="mt-4 flex h-[240px] items-center justify-center rounded border border-dashed border-border bg-subtle/50 text-sm text-muted">
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
  /** When stale/missing: property ID for inline refresh button */
  propertyId?: string;
};

export function DashboardCharts({
  data,
  propertyCount,
  benchmark,
}: {
  data: DashboardChartData;
  propertyCount: number;
  benchmark?: BenchmarkAtGlance;
}) {
  const isSingleProperty = propertyCount === 1;
  const singleProperty = isSingleProperty ? data.equity[0] : null;

  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-base font-semibold uppercase tracking-wide text-muted">
        Portfolio charts
      </h2>

      {isSingleProperty && singleProperty && (
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-base font-semibold uppercase tracking-wide text-muted">
            Property at a glance
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            <div>
              <p className="text-sm font-medium text-muted">Value</p>
              <p className="mt-0.5 text-lg font-semibold text-foreground">
                {formatCurrency(data.debtVsValue[0]?.value ?? 0)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted">Debt</p>
              <p className="mt-0.5 text-lg font-semibold text-foreground">
                {formatCurrency(data.debtVsValue[0]?.debt ?? 0)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted">Equity</p>
              <p className="mt-0.5 text-lg font-semibold text-foreground">
                {formatCurrency(singleProperty.equity)}
              </p>
            </div>
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
            <div>
              <p className="text-sm font-medium text-muted">Rent vs. market</p>
              {benchmark?.benchmarkLabel ? (
                <p className="mt-0.5 text-lg font-semibold text-foreground">
                  {benchmark.benchmarkLabel}
                </p>
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
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {!isSingleProperty && <EquityChart data={data.equity} />}
        <DebtVsValueChart data={data.debtVsValue} />
      </div>
      {!isSingleProperty && (
        <div className="grid gap-6 lg:grid-cols-1">
          <CashFlowChart data={data.cashFlow} />
        </div>
      )}
    </div>
  );
}
