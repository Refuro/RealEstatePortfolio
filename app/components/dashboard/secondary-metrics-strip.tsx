import type { ReactNode } from "react";

export type SecondaryMetricValueColor = "warn" | "bad" | "ok" | "default";

export type SecondaryMetric = {
  label: string;
  value: string;
  hint: ReactNode;
  valueColor?: SecondaryMetricValueColor;
};

type SecondaryMetricsStripProps = {
  metrics: [SecondaryMetric, SecondaryMetric, SecondaryMetric, SecondaryMetric];
};

const VALUE_COLOR: Record<SecondaryMetricValueColor, string> = {
  warn: "var(--warning)",
  bad: "var(--negative)",
  ok: "var(--positive)",
  default: "var(--foreground)",
};

export function SecondaryMetricsStrip({ metrics }: SecondaryMetricsStripProps) {
  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4 rounded-[10px] overflow-hidden border"
      style={{ gap: "1px", background: "var(--border)", borderColor: "var(--border)" }}
    >
      {metrics.map((m, i) => (
        <div
          key={i}
          style={{ background: "var(--card)", padding: "14px 18px" }}
        >
          <div
            style={{
              fontSize: "11px",
              color: "var(--foreground-muted)",
              marginBottom: "4px",
            }}
          >
            {m.label}
          </div>
          <div
            style={{
              fontSize: "17px",
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
              color: VALUE_COLOR[m.valueColor ?? "default"],
            }}
          >
            {m.value}
          </div>
          <div
            style={{
              fontSize: "10.5px",
              color: "var(--foreground-muted)",
              marginTop: "3px",
            }}
          >
            {m.hint}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Pre-built hint with a colored direction indicator for benchmark comparisons. */
export function BenchmarkHint({
  direction,
  label,
}: {
  direction: "above" | "below";
  label: string;
}) {
  const isAbove = direction === "above";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
      <span
        style={{
          color: isAbove ? "var(--positive)" : "var(--negative)",
          fontWeight: 600,
        }}
      >
        {isAbove ? "↑ above" : "✕ below"}
      </span>
      {label}
    </span>
  );
}
