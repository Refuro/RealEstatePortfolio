"use client";

import { EquityChart, type EquityDatum } from "@/components/charts/equity-chart";
import { DebtVsValueChart, type DebtValueDatum } from "@/components/charts/debt-vs-value-chart";
import { CashFlowChart, type CashFlowDatum } from "@/components/charts/cash-flow-chart";

export type DashboardChartData = {
  equity: EquityDatum[];
  debtVsValue: DebtValueDatum[];
  cashFlow: CashFlowDatum[];
};

export function DashboardCharts({ data }: { data: DashboardChartData }) {
  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
        Portfolio charts
      </h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <EquityChart data={data.equity} />
        <DebtVsValueChart data={data.debtVsValue} />
      </div>
      <div className="grid gap-6 lg:grid-cols-1">
        <CashFlowChart data={data.cashFlow} />
      </div>
    </div>
  );
}
