import { formatCurrency } from "@/lib/format-currency";

const MINUS = "−";

type CashFlowBreakdownCardProps = {
  monthlyRent: number;
  monthlyExpenses: number;
  monthlyMortgage: number;
  annualCashFlow: number;
  annualAppreciation: number;
  annualPaydown: number;
  annualTotalReturn: number;
};

function fmtSigned(n: number, suffix = ""): string {
  if (n === 0) return `${formatCurrency(0)}${suffix}`;
  const sign = n > 0 ? "+" : MINUS;
  return `${sign}${formatCurrency(Math.abs(n))}${suffix}`;
}

export function CashFlowBreakdownCard({
  monthlyRent,
  monthlyExpenses,
  monthlyMortgage,
  annualCashFlow,
  annualAppreciation,
  annualPaydown,
  annualTotalReturn,
}: CashFlowBreakdownCardProps) {
  const netMonthly = monthlyRent - monthlyExpenses - monthlyMortgage;
  const netIsNeg = netMonthly < 0;
  const totalIsPos = annualTotalReturn >= 0;

  return (
    <div
      className="rounded-xl border"
      style={{ background: "var(--card)", borderColor: "var(--border)", padding: "16px 18px" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "10px",
        }}
      >
        <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--foreground)" }}>
          Cash flow breakdown
        </div>
        <span style={{ fontSize: "10.5px", color: "var(--foreground-muted)" }}>monthly</span>
      </div>

      {/* Monthly line items */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          fontSize: "12.5px",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <LineItem label="Monthly rent" value={`+${formatCurrency(monthlyRent)}`} />
        <LineItem
          label="Operating expenses"
          value={`${MINUS}${formatCurrency(Math.abs(monthlyExpenses))}`}
        />
        {monthlyMortgage !== 0 && (
          <LineItem
            label="Mortgage payment"
            value={`${MINUS}${formatCurrency(Math.abs(monthlyMortgage))}`}
          />
        )}
        <div style={{ height: "1px", background: "var(--border)", margin: "4px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
          <span style={{ color: "var(--foreground-muted)" }}>Net cash flow</span>
          <span style={{ color: netIsNeg ? "var(--negative)" : "var(--positive)" }}>
            {fmtSigned(netMonthly)}
          </span>
        </div>
      </div>

      {/* Total return bridge */}
      <div
        style={{
          marginTop: "12px",
          paddingTop: "10px",
          borderTop: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          gap: "5px",
          fontSize: "12px",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        <div
          style={{
            fontSize: "10.5px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--fg-dimmer)",
            marginBottom: "2px",
          }}
        >
          Total return (est. annual)
        </div>
        <LineItem
          label="Cash flow"
          value={fmtSigned(annualCashFlow)}
          valueColor={annualCashFlow >= 0 ? "var(--positive)" : "var(--negative)"}
        />
        <LineItem
          label="Appreciation (est.)"
          value={`+${formatCurrency(Math.abs(annualAppreciation))}`}
        />
        <LineItem
          label="Mortgage paydown"
          value={`+${formatCurrency(Math.abs(annualPaydown))}`}
        />
        <div style={{ height: "1px", background: "var(--border)", margin: "3px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
          <span style={{ color: "var(--foreground-muted)" }}>Total return</span>
          <span style={{ color: totalIsPos ? "var(--positive)" : "var(--negative)" }}>
            {fmtSigned(annualTotalReturn)}{" "}
            <span
              style={{ fontSize: "10.5px", fontWeight: 500, color: "var(--foreground-muted)" }}
            >
              / yr
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

function LineItem({
  label,
  value,
  valueColor = "var(--foreground)",
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--foreground-muted)" }}>
      <span>{label}</span>
      <span style={{ color: valueColor }}>{value}</span>
    </div>
  );
}
