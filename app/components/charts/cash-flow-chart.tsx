"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { ChartWrapper } from "./chart-wrapper";

export type CashFlowDatum = {
  name: string;
  monthlyCashFlow: number;
  propertyId: string;
};

export function CashFlowChart({ data }: { data: CashFlowDatum[] }) {
  const isEmpty = data.length === 0;
  const allZero = data.length > 0 && data.every((d) => d.monthlyCashFlow === 0);

  return (
    <ChartWrapper
      title="Monthly cash flow by property"
      isEmpty={isEmpty}
      emptyMessage="Add properties with rent, expenses, and mortgage to see cash flow."
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
              tickFormatter={(v) => `$${v}`}
              tick={{ fontSize: 11 }}
              allowDataOverflow
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
            {!allZero && <ReferenceLine y={0} stroke="var(--foreground-muted)" />}
            <Bar
              dataKey="monthlyCashFlow"
              name="Monthly cash flow"
              radius={[4, 4, 0, 0]}
            >
              {data.map((d, i) => (
                <Cell
                  key={i}
                  fill={d.monthlyCashFlow >= 0 ? "var(--positive)" : "var(--negative)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartWrapper>
  );
}
