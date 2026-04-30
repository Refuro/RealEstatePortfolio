export type KpiMetricColor = "pos" | "neg" | "neutral";

export type KpiDelta = {
  /** Signed amount; sign drives the arrow. Use 0 for "no change". */
  amount: number;
  /** Pre-formatted display, e.g. "+$5,000" or "−$50 / mo". Caller chooses currency vs percent vs custom suffix. */
  formatted: string;
  /** Visual tone. Callers decide semantics (e.g. for debt, "up" should be neg). */
  tone: KpiMetricColor;
  /** Optional caption like "vs last month". */
  caption?: string;
};

export type KpiMetric = {
  label: string;
  value: string;
  /** Sub-line under the value (small muted text). */
  hint?: string;
  valueColor?: KpiMetricColor;
  /** Drop this metric from the mobile (<md) grid. Used on the property detail strip to drop "Property value" on mobile. */
  hideOnMobile?: boolean;
  /** Optional MoM delta indicator. Renders below the value with arrow. */
  delta?: KpiDelta;
};

export type KpiStripProps = {
  metrics: KpiMetric[];
  /** Desktop column count. Defaults to the metrics length when 4 or 5. */
  desktopCols?: 4 | 5;
};

const VALUE_COLOR: Record<KpiMetricColor, string> = {
  pos: "var(--positive)",
  neg: "var(--negative)",
  neutral: "var(--foreground)",
};

const DESKTOP_COL_CLASS: Record<4 | 5, string> = {
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
};

/**
 * Shared 1-row KPI strip used across dashboard portfolio hero and property detail.
 * Fork on copy/content, share on structure (decision #9).
 */
export function KpiStrip({ metrics, desktopCols }: KpiStripProps) {
  const cols = desktopCols ?? (metrics.length === 5 ? 5 : 4);
  return (
    <div
      className={`grid grid-cols-2 ${DESKTOP_COL_CLASS[cols]} rounded-xl overflow-hidden border`}
      style={{ gap: "1px", background: "var(--border)", borderColor: "var(--border)" }}
    >
      {metrics.map((m, i) => (
        <div
          key={i}
          className={`bg-card px-4 py-3 md:px-[22px] md:py-[18px] ${
            m.hideOnMobile ? "hidden md:block" : ""
          }`}
        >
          <div
            className="mb-1 md:mb-1.5"
            style={{
              fontSize: "10.5px",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--foreground-muted)",
            }}
          >
            {m.label}
          </div>
          <div
            className="text-xl leading-tight md:text-[28px]"
            style={{
              fontWeight: 600,
              letterSpacing: "-0.03em",
              fontVariantNumeric: "tabular-nums",
              color: VALUE_COLOR[m.valueColor ?? "neutral"],
            }}
          >
            {m.value}
          </div>
          {m.delta && (
            <div
              className="mt-1 flex items-center gap-1 text-[10.5px] md:text-[11px]"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              <span style={{ color: VALUE_COLOR[m.delta.tone] }}>
                {m.delta.amount > 0 ? "▲" : m.delta.amount < 0 ? "▼" : "■"}{" "}
                {m.delta.formatted}
              </span>
              {m.delta.caption && (
                <span style={{ color: "var(--foreground-muted)" }}>
                  {m.delta.caption}
                </span>
              )}
            </div>
          )}
          {m.hint && (
            <div
              className="mt-1 text-[10.5px] md:text-[11px]"
              style={{ color: "var(--foreground-muted)" }}
            >
              {m.hint}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
