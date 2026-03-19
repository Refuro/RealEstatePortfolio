"use client";

import { formatCurrency } from "@/lib/format-currency";
import { ChartWrapper } from "./chart-wrapper";

export type ValueBreakdownDatum = {
  debt: number;
  equity: number;
  value: number;
};

export function ValueBreakdownChart({
  data,
}: {
  data: ValueBreakdownDatum;
}) {
  const isEmpty = data.value === 0;
  const debtPct = data.value > 0 ? (data.debt / data.value) * 100 : 0;
  const equityPct = data.value > 0 ? (data.equity / data.value) * 100 : 0;

  return (
    <ChartWrapper
      title="Value breakdown"
      isEmpty={isEmpty}
      emptyMessage="Add property value and mortgage data to see breakdown."
    >
      {!isEmpty && (
        <div className="mt-4 space-y-3">
          <div className="flex h-8 w-full overflow-hidden rounded-md">
            {debtPct > 0 && (
              <div
                className="flex items-center justify-center text-xs font-medium text-white transition-all"
                style={{
                  width: `${debtPct}%`,
                  backgroundColor: "var(--chart-1)",
                  minWidth: debtPct > 0 && debtPct < 5 ? "2rem" : undefined,
                }}
                title={`Debt: ${formatCurrency(data.debt)}`}
              >
                {debtPct >= 15 && (
                  <span className="truncate px-1">Debt</span>
                )}
              </div>
            )}
            {equityPct > 0 && (
              <div
                className="flex items-center justify-center text-xs font-medium text-white transition-all"
                style={{
                  width: `${equityPct}%`,
                  backgroundColor: "var(--chart-3)",
                  minWidth: equityPct > 0 && equityPct < 5 ? "2rem" : undefined,
                }}
                title={`Equity: ${formatCurrency(data.equity)}`}
              >
                {equityPct >= 15 && (
                  <span className="truncate px-1">Equity</span>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: "var(--chart-1)" }}
              />
              <span className="text-muted">Debt:</span>
              <span className="font-medium text-foreground">
                {formatCurrency(data.debt)}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: "var(--chart-3)" }}
              />
              <span className="text-muted">Equity:</span>
              <span className="font-medium text-foreground">
                {formatCurrency(data.equity)}
              </span>
            </span>
          </div>
        </div>
      )}
    </ChartWrapper>
  );
}
