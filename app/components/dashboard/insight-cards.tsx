"use client";

import type { Insight, Severity } from "@/lib/insights/types";

const CARD_BORDER: Record<Severity, string> = {
  negative: "rgba(248,113,113,0.18)",
  warning: "rgba(251,191,36,0.18)",
  positive: "rgba(52,211,153,0.18)",
};

const CARD_BG: Record<Severity, string> = {
  negative: "rgba(248,113,113,0.04)",
  warning: "rgba(251,191,36,0.04)",
  positive: "rgba(52,211,153,0.04)",
};

const SEVERITY_COLOR: Record<Severity, string> = {
  negative: "var(--negative)",
  warning: "var(--warning)",
  positive: "var(--positive)",
};

type InsightCardsProps = {
  insights: Insight[];
  onDismiss?: (dismissKey: string) => void;
};

export function InsightCards({ insights, onDismiss }: InsightCardsProps) {
  if (insights.length === 0) return null;

  // Adapt column count to the number of insights so a single card doesn't
  // sit lonely in 1/3 of the row. 1 → full width, 2 → halves, 3 → thirds.
  const gridColsClass =
    insights.length === 1
      ? "md:grid-cols-1"
      : insights.length === 2
        ? "md:grid-cols-2"
        : "md:grid-cols-3";

  return (
    <div>
      <div
        style={{
          fontSize: "13px",
          fontWeight: 600,
          color: "var(--foreground)",
          marginBottom: "10px",
        }}
      >
        Portfolio insights
      </div>
      <div
        className={`grid grid-cols-1 ${gridColsClass} gap-2.5 overflow-x-auto`}
        style={{ gridAutoRows: "1fr" }}
      >
        {insights.map((insight) => (
          <InsightCard key={insight.dismissKey} insight={insight} onDismiss={onDismiss} />
        ))}
      </div>
    </div>
  );
}

function InsightCard({
  insight,
  onDismiss,
}: {
  insight: Insight;
  onDismiss?: (key: string) => void;
}) {
  const accentColor = SEVERITY_COLOR[insight.severity];

  return (
    <div
      style={{
        background: CARD_BG[insight.severity],
        border: `1px solid ${CARD_BORDER[insight.severity]}`,
        borderRadius: "10px",
        padding: "16px 18px",
        position: "relative",
        minWidth: "240px",
      }}
    >
      {onDismiss && (
        <button
          onClick={() => onDismiss(insight.dismissKey)}
          aria-label="Dismiss insight"
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "none",
            border: "none",
            color: "var(--foreground-muted)",
            cursor: "pointer",
            fontSize: "16px",
            lineHeight: 1,
            padding: "2px 4px",
            opacity: 0.5,
            fontFamily: "inherit",
          }}
        >
          ×
        </button>
      )}

      <div
        style={{
          fontSize: "10.5px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: accentColor,
          opacity: 0.8,
          marginBottom: "8px",
        }}
      >
        {insight.eyebrow}
      </div>

      <div
        style={{
          fontSize: "20px",
          fontWeight: 600,
          color: accentColor,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
        }}
      >
        {insight.value}
      </div>

      <div
        style={{
          fontSize: "11.5px",
          color: "var(--foreground-muted)",
          marginTop: "6px",
          lineHeight: 1.5,
        }}
      >
        {insight.explanation}
      </div>

      {insight.cta && (
        <a
          href={insight.cta.href}
          style={{
            fontSize: "11.5px",
            color: "var(--accent)",
            fontWeight: 500,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "3px",
            marginTop: "8px",
          }}
        >
          {insight.cta.label}
        </a>
      )}
    </div>
  );
}
