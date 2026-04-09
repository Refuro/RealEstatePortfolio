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
  Cell,
} from "recharts";
import { ChartWrapper } from "./chart-wrapper";

export type EquityDatum = {
  name: string;
  equity: number;
  propertyId: string;
};

function formatAxisLabel(value: string): string {
  return value.length > 11 ? `${value.slice(0, 10)}...` : value;
}

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
  "var(--chart-7)",
  "var(--chart-8)",
  "var(--chart-9)",
  "var(--chart-10)",
];

export function EquityChart({
  data,
  embedded,
  heightPx,
}: {
  data: EquityDatum[];
  embedded?: boolean;
  heightPx?: number;
}) {
  const isEmpty = data.length === 0 || data.every((d) => d.equity === 0);

  return (
    <ChartWrapper
      title="Portfolio equity by property"
      isEmpty={isEmpty}
      emptyMessage="Add properties with values and mortgages to see equity."
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
            <XAxis type="number" tickFormatter={(v) => `$${v / 1000}k`} />
            <YAxis
              type="category"
              dataKey="name"
              width={100}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatAxisLabel(String(value))}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{ fontSize: 12 }}
            />
            <Bar dataKey="equity" radius={[0, 4, 4, 0]} maxBarSize={32}>
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartWrapper>
  );
}
