"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChartWrapper } from "./chart-wrapper";

export type DebtValueDatum = {
  name: string;
  value: number;
  debt: number;
  propertyId: string;
};

export function DebtVsValueChart({ data }: { data: DebtValueDatum[] }) {
  const isEmpty = data.length === 0;

  return (
    <ChartWrapper
      title="Debt vs value by property"
      isEmpty={isEmpty}
      emptyMessage="Add properties to see debt and value."
    >
      {!isEmpty && (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
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
              contentStyle={{ fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="value" name="Value" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="debt" name="Debt" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartWrapper>
  );
}
