import { formatCurrency } from "@/lib/format-currency";

const MINUS = "−";

const COLOR_CASHFLOW = "rgb(52, 211, 153)";
const COLOR_APPRECIATION = "rgb(139, 92, 246)";
const COLOR_PAYDOWN = "rgb(96, 165, 250)";

type AnnualReturnBarProps = {
  cashFlow: number;
  appreciation: number;
  paydown: number;
  total: number;
};

type Segment = {
  label: string;
  amount: number;
  color: string;
};

function fmtSigned(n: number): string {
  if (n === 0) return formatCurrency(0);
  const sign = n < 0 ? MINUS : "+";
  return `${sign}${formatCurrency(Math.abs(n))}`;
}

export function AnnualReturnBar({
  cashFlow,
  appreciation,
  paydown,
  total,
}: AnnualReturnBarProps) {
  const segments: Segment[] = [
    { label: "Cash flow", amount: cashFlow, color: COLOR_CASHFLOW },
    { label: "Appreciation", amount: appreciation, color: COLOR_APPRECIATION },
    { label: "Paydown", amount: paydown, color: COLOR_PAYDOWN },
  ];

  const positiveTotal = segments.reduce(
    (acc, s) => acc + Math.max(0, s.amount),
    0
  );
  const totalIsPos = total >= 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: "12px",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            color: "var(--foreground-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Annual return
        </span>
        <span
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: totalIsPos ? "var(--positive)" : "var(--negative)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {fmtSigned(total)}
          <span
            style={{
              fontSize: "10.5px",
              fontWeight: 500,
              color: "var(--foreground-muted)",
              marginLeft: "3px",
            }}
          >
            / yr
          </span>
        </span>
      </div>

      <div
        style={{
          display: "flex",
          height: "8px",
          borderRadius: "4px",
          overflow: "hidden",
          background: "var(--border)",
        }}
        role="img"
        aria-label={segments
          .map((s) => `${s.label} ${fmtSigned(s.amount)}`)
          .join(", ")}
      >
        {positiveTotal > 0 ? (
          segments.map((s, i) => {
            const positiveAmount = Math.max(0, s.amount);
            if (positiveAmount === 0) return null;
            const flex = positiveAmount / positiveTotal;
            return (
              <div
                key={i}
                style={{
                  flex,
                  background: s.color,
                }}
              />
            );
          })
        ) : (
          <div style={{ flex: 1 }} aria-hidden />
        )}
      </div>
    </div>
  );
}
