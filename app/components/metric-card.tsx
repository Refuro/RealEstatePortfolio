type MetricCardProps = {
  label: string;
  value: string;
  primary?: boolean;
  cashFlow?: number;
  compact?: boolean;
  tone?: "positive" | "warning" | "negative";
  /** Optional: raw delta number to determine color direction. */
  delta?: number | null;
  /** Optional: formatted string shown below the value (e.g., "+$1,200 this month"). */
  deltaLabel?: string | null;
};

const toneClass: Record<"positive" | "warning" | "negative", string> = {
  positive: "text-positive",
  warning: "text-warning",
  negative: "text-negative",
};

export function MetricCard({
  label,
  value,
  primary = true,
  cashFlow,
  compact = false,
  tone,
  delta,
  deltaLabel,
}: MetricCardProps) {
  const sizeClass = compact ? "text-base md:text-lg" : "text-2xl";
  const valueClassName = tone
    ? `font-semibold ${toneClass[tone]} ${sizeClass}`
    : cashFlow !== undefined
      ? `font-semibold ${cashFlow >= 0 ? "text-positive" : "text-negative"} ${sizeClass}`
      : primary
        ? compact
          ? "text-base md:text-lg font-semibold text-foreground"
          : "text-2xl sm:text-3xl font-semibold text-foreground"
        : compact
          ? "text-sm md:text-base font-medium text-foreground"
          : "text-lg font-medium text-foreground";

  const deltaColorClass =
    delta === undefined || delta === null
      ? "text-muted"
      : delta > 0
        ? "text-positive"
        : delta < 0
          ? "text-negative"
          : "text-muted";

  return (
    <div
      className={`min-w-0 rounded-lg border border-border bg-card shadow-sm ${
        compact ? "p-3" : "p-5"
      }`}
    >
      <dt
        className={`font-medium text-muted ${compact ? "text-xs" : "text-base"}`}
      >
        {label}
      </dt>
      <dd className={`mt-1 truncate ${valueClassName}`}>{value}</dd>
      {deltaLabel && (
        <p className={`mt-0.5 text-xs ${deltaColorClass}`}>{deltaLabel}</p>
      )}
    </div>
  );
}
