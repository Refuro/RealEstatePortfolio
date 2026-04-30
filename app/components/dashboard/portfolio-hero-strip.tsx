import { KpiStrip, type KpiDelta, type KpiMetricColor } from "@/components/ui/kpi-strip";

export type HeroMetricColor = KpiMetricColor;

export type HeroMetric = {
  label: string;
  value: string;
  sub: string;
  valueColor?: HeroMetricColor;
  delta?: KpiDelta;
};

type PortfolioHeroStripProps = {
  metrics: [HeroMetric, HeroMetric, HeroMetric, HeroMetric];
};

export function PortfolioHeroStrip({ metrics }: PortfolioHeroStripProps) {
  return (
    <KpiStrip
      desktopCols={4}
      metrics={metrics.map((m) => ({
        label: m.label,
        value: m.value,
        hint: m.sub,
        valueColor: m.valueColor,
        delta: m.delta,
      }))}
    />
  );
}
