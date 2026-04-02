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
  ReferenceLine,
  Cell,
} from "recharts";
import { ChartWrapper } from "./chart-wrapper";

export type CashFlowDatum = {
  name: string;
  monthlyCashFlow: number;
  propertyId: string;
};

export function CashFlowChart({
  data,
  embedded,
}: {
  data: CashFlowDatum[];
  embedded?: boolean;
}) {
  const isEmpty = data.length === 0;
  const allZero = data.length > 0 && data.every((d) => d.monthlyCashFlow === 0);

  // Domain: symmetric around zero so negative bars are visible; pad if all same sign
  const values = data.map((d) => d.monthlyCashFlow);
  const dataMin = values.length ? Math.min(...values) : 0;
  const dataMax = values.length ? Math.max(...values) : 0;
  const range = Math.max(Math.abs(dataMin), Math.abs(dataMax), 1);
  const domain: [number, number] = [-range, range];

  // Diverging bar: horizontal layout — bars extend left (negative) and right (positive) from center
  return (
    <ChartWrapper
      title="Monthly cash flow by property"
      isEmpty={isEmpty}
      emptyMessage="Add properties with rent, expenses, and mortgage to see cash flow."
      embedded={embedded}
    >
      {!isEmpty && (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 8, left: 8, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              type="number"
              tickFormatter={(v) => formatCurrency(v)}
              tick={{ fontSize: 11 }}
              domain={domain}
            />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{ fontSize: 12 }}
            />
            {!allZero && <ReferenceLine x={0} stroke="var(--foreground-muted)" />}
            <Bar
              dataKey="monthlyCashFlow"
              name="Monthly cash flow"
              radius={[0, 4, 4, 0]}
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
