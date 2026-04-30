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
  appreciationRatePct: number;
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
  appreciationRatePct,
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
          marginTop: "14px",
          paddingTop: "12px",
          borderTop: "1px solid var(--border)",
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
            marginBottom: "8px",
          }}
        >
          Total return (est. annual)
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1px",
            background: "var(--border)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <ReturnTile
            label="Cash flow"
            value={fmtSigned(annualCashFlow)}
            valueColor={annualCashFlow >= 0 ? "var(--positive)" : "var(--negative)"}
          />
          <ReturnTile
            label="Appreciation"
            sublabel={`est. ${appreciationRatePct.toFixed(1)}% / yr`}
            value={`+${formatCurrency(Math.abs(annualAppreciation))}`}
            valueColor="var(--positive)"
          />
          {monthlyMortgage > 0 ? (
            <ReturnTile
              label="Paydown"
              sublabel="principal / yr"
              value={`+${formatCurrency(Math.abs(annualPaydown))}`}
              valueColor="var(--positive)"
            />
          ) : (
            <ReturnTile
              label="Paydown"
              value="Paid off"
              valueColor="var(--foreground-muted)"
            />
          )}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontWeight: 600,
            fontSize: "12.5px",
            marginTop: "10px",
          }}
        >
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

function ReturnTile({
  label,
  sublabel,
  value,
  valueColor,
}: {
  label: string;
  sublabel?: string;
  value: string;
  valueColor: string;
}) {
  return (
    <div
      style={{
        background: "var(--card)",
        padding: "10px 12px",
        display: "flex",
        flexDirection: "column",
        gap: "2px",
      }}
    >
      <div
        style={{
          fontSize: "10.5px",
          color: "var(--foreground-muted)",
          fontWeight: 500,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "13.5px",
          fontWeight: 600,
          color: valueColor,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
      {sublabel && (
        <div
          style={{
            fontSize: "10.5px",
            color: "var(--foreground-muted)",
          }}
        >
          {sublabel}
        </div>
      )}
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
