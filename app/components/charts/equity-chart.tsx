"use client";

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

const COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"];

export function EquityChart({ data }: { data: EquityDatum[] }) {
  const isEmpty = data.length === 0 || data.every((d) => d.equity === 0);

  return (
    <ChartWrapper
      title="Portfolio equity by property"
      isEmpty={isEmpty}
      emptyMessage="Add properties with values and mortgages to see equity."
    >
      {!isEmpty && (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
            <XAxis type="number" tickFormatter={(v) => `$${v / 1000}k`} />
            <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
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
            <Bar dataKey="equity" radius={[0, 4, 4, 0]} maxBarSize={32}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartWrapper>
  );
}
