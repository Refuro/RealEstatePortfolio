"use client";

import { formatCurrency } from "@/lib/format-currency";
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

function formatAxisLabel(value: string): string {
  return value.length > 11 ? `${value.slice(0, 10)}...` : value;
}

export function DebtVsValueChart({
  data,
  embedded,
  heightPx,
}: {
  data: DebtValueDatum[];
  embedded?: boolean;
  heightPx?: number;
}) {
  const isEmpty = data.length === 0;

  return (
    <ChartWrapper
      title="Debt vs value by property"
      isEmpty={isEmpty}
      emptyMessage="Add properties to see debt and value."
      embedded={embedded}
      heightPx={heightPx}
    >
      {!isEmpty && (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              type="number"
              tickFormatter={(v) => `$${v / 1000}k`}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => formatAxisLabel(String(value))}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{ fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="value" name="Value" fill="var(--chart-3)" radius={[0, 4, 4, 0]} />
            <Bar dataKey="debt" name="Debt" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartWrapper>
  );
}
