"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/format-currency";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartWrapper } from "./chart-wrapper";

export type AmortizationRow = {
  monthIndex: number;
  date: string;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
};

export function AmortizationChart({ propertyId }: { propertyId: string }) {
  const [schedule, setSchedule] = useState<AmortizationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [negativeAmortization, setNegativeAmortization] = useState(false);

  useEffect(() => {
    fetch(`/api/properties/${propertyId}/amortization`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.schedule)) setSchedule(data.schedule);
        setNegativeAmortization(Boolean(data.negativeAmortization));
      })
      .finally(() => setLoading(false));
  }, [propertyId]);

  const isEmpty = !loading && schedule.length === 0;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  };

  const formatDateTooltip = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const chartData = schedule.map((row) => ({
    ...row,
    displayDate: formatDate(row.date),
  }));

  return (
    <ChartWrapper
      title="Mortgage amortization — balance over time"
      isEmpty={isEmpty}
      emptyMessage={
        negativeAmortization
          ? "P&I doesn’t cover monthly interest on the current balance. Update the mortgage so payment (after escrow) is at least the monthly interest—then the schedule can be shown."
          : "Add a mortgage to this property to see the amortization schedule."
      }
    >
      {loading && (
        <div className="flex h-full items-center justify-center text-sm text-muted">
          Loading…
        </div>
      )}
      {!loading && !isEmpty && (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 10 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={(v) => `$${v / 1000}k`}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload;
                const dateLabel = p.date ? formatDateTooltip(p.date) : "";
                const balanceVal = p.balance;
                return (
                  <div className="rounded border border-border bg-card px-3 py-2 text-sm shadow-sm">
                    <div className="font-medium text-foreground">{dateLabel}</div>
                    <div className="text-muted">
                      Remaining balance: {formatCurrency(balanceVal)}
                    </div>
                  </div>
                );
              }}
            />
            <Line
              type="monotone"
              dataKey="balance"
              name="Remaining balance"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartWrapper>
  );
}
