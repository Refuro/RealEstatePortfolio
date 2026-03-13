"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    fetch(`/api/properties/${propertyId}/amortization`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.schedule)) setSchedule(data.schedule);
      })
      .finally(() => setLoading(false));
  }, [propertyId]);

  const isEmpty = !loading && schedule.length === 0;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  };

  const chartData = schedule.map((row) => ({
    ...row,
    displayDate: formatDate(row.date),
  }));

  return (
    <ChartWrapper
      title="Mortgage amortization — balance over time"
      isEmpty={isEmpty}
      emptyMessage="Add a mortgage to this property to see the amortization schedule."
    >
      {loading && (
        <div className="flex h-full items-center justify-center text-sm text-zinc-500">
          Loading…
        </div>
      )}
      {!loading && !isEmpty && (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
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
              formatter={(value: number) =>
                new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(value)
              }
              labelFormatter={(_, payload) =>
                payload?.[0]?.payload?.date
                  ? formatDate(payload[0].payload.date)
                  : ""
              }
              contentStyle={{ fontSize: 12 }}
            />
            <Line
              type="monotone"
              dataKey="balance"
              name="Remaining balance"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartWrapper>
  );
}
