type MetricCardProps = {
  label: string;
  value: string;
  primary?: boolean;
  cashFlow?: number;
  compact?: boolean;
};

export function MetricCard({
  label,
  value,
  primary = true,
  cashFlow,
  compact = false,
}: MetricCardProps) {
  const valueClassName =
    cashFlow !== undefined
      ? `font-semibold ${cashFlow >= 0 ? "text-positive" : "text-negative"} ${
          compact ? "text-lg" : "text-2xl"
        }`
      : primary
        ? compact
          ? "text-lg font-semibold text-foreground"
          : "text-2xl sm:text-3xl font-semibold text-foreground"
        : compact
          ? "text-base font-medium text-foreground"
          : "text-lg font-medium text-foreground";

  return (
    <div
      className={`rounded-lg border border-border bg-card ${
        compact ? "p-3" : "p-5"
      }`}
    >
      <dt
        className={`font-medium text-muted ${compact ? "text-xs" : "text-base"}`}
      >
        {label}
      </dt>
      <dd className={`mt-1 ${valueClassName}`}>{value}</dd>
    </div>
  );
}
