import { formatCurrency } from "@/lib/format-currency";

const MINUS = "−";

type CapitalStructureCardProps = {
  debt: number;
  equity: number;
  purchasePrice: number;
  gainOnValue: number;
};

export function CapitalStructureCard({
  debt,
  equity,
  purchasePrice,
  gainOnValue,
}: CapitalStructureCardProps) {
  const total = debt + equity;
  const debtPct = total > 0 ? (debt / total) * 100 : 0;
  const equityPct = total > 0 ? (equity / total) * 100 : 0;

  const gainIsPositive = gainOnValue >= 0;
  const gainFormatted = gainIsPositive
    ? `+${formatCurrency(gainOnValue)}`
    : `${MINUS}${formatCurrency(Math.abs(gainOnValue))}`;

  return (
    <div
      className="rounded-xl border"
      style={{ background: "var(--card)", borderColor: "var(--border)", padding: "20px 22px" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "14px",
        }}
      >
        <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--foreground)" }}>
          Capital structure
        </div>
        <div style={{ fontSize: "12px", color: "var(--foreground-muted)" }}>as of today</div>
      </div>

      {/* Amount labels above bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "6px",
          fontSize: "11px",
          color: "var(--foreground-muted)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <span>
          Debt{" "}
          <strong style={{ color: "var(--foreground)" }}>{formatCurrency(debt)}</strong>
        </span>
        <span>
          Equity{" "}
          <strong style={{ color: "var(--foreground)" }}>{formatCurrency(equity)}</strong>
        </span>
      </div>

      {/* Segmented bar */}
      <div
        style={{
          height: "10px",
          borderRadius: "5px",
          display: "flex",
          overflow: "hidden",
          gap: "2px",
          background: "var(--border)",
        }}
      >
        <div
          style={{
            width: `${debtPct}%`,
            background: "oklch(0.55 0.15 260)",
            borderRadius: "5px 0 0 5px",
            transition: "width 0.4s",
            flexShrink: 0,
          }}
        />
        <div
          style={{
            flex: 1,
            background: "oklch(0.65 0.14 162)",
            borderRadius: "0 5px 5px 0",
          }}
        />
      </div>

      {/* Percentage labels below bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "5px",
          fontSize: "10.5px",
          color: "var(--fg-dimmer)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <span>{debtPct.toFixed(1)}%</span>
        <span>{equityPct.toFixed(1)}%</span>
      </div>

      {/* Footer stats */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: "12px",
          marginTop: "12px",
          display: "flex",
          gap: "16px",
        }}
      >
        <div>
          <div style={{ fontSize: "10.5px", color: "var(--foreground-muted)", marginBottom: "2px" }}>
            Total debt
          </div>
          <div
            style={{
              fontSize: "14px",
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
              color: "var(--foreground)",
            }}
          >
            {formatCurrency(debt)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: "10.5px", color: "var(--foreground-muted)", marginBottom: "2px" }}>
            Purchase price
          </div>
          <div
            style={{
              fontSize: "14px",
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
              color: "var(--foreground)",
            }}
          >
            {formatCurrency(purchasePrice)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: "10.5px", color: "var(--foreground-muted)", marginBottom: "2px" }}>
            Gain on value
          </div>
          <div
            style={{
              fontSize: "14px",
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
              color: gainIsPositive ? "var(--positive)" : "var(--negative)",
            }}
          >
            {gainFormatted}
          </div>
        </div>
      </div>
    </div>
  );
}
