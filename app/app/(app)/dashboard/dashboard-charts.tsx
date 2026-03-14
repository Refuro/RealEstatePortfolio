"use client";

import { EquityChart, type EquityDatum } from "@/components/charts/equity-chart";
import { DebtVsValueChart, type DebtValueDatum } from "@/components/charts/debt-vs-value-chart";
import { CashFlowChart, type CashFlowDatum } from "@/components/charts/cash-flow-chart";

export type DashboardChartData = {
  equity: EquityDatum[];
  debtVsValue: DebtValueDatum[];
  cashFlow: CashFlowDatum[];
};

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export function DashboardCharts({
  data,
  propertyCount,
}: {
  data: DashboardChartData;
  propertyCount: number;
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
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
