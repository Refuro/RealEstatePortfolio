"use client";

import dynamic from "next/dynamic";

const AmortizationChart = dynamic(
  () => import("@/components/charts/amortization-chart").then((m) => ({ default: m.AmortizationChart })),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="mt-4 flex h-[240px] items-center justify-center rounded border border-dashed border-border bg-subtle/50 text-sm text-muted">
          Loading…
        </div>
      </div>
    ),
  }
);

export function AmortizationChartDynamic({ propertyId }: { propertyId: string }) {
  return <AmortizationChart propertyId={propertyId} />;
}
