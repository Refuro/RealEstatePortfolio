import { formatCurrency } from "@/lib/format-currency";

const MINUS = "−";

export type MortgageDetail = {
  /** Annual interest rate as decimal (0.0625 = 6.25%). When multiple loans, pass weighted-by-balance. */
  rate: number;
  /** Already ownership-scaled monthly P&I. */
  monthlyPi: number;
  /** Already ownership-scaled total monthly payment (incl. escrow). */
  monthlyPayment: number;
  /** Resolved payoff date, or null if neg-amortizing / unresolvable. */
  payoffDate: Date | null;
  /** Approximate years remaining; null if payoff can't be projected. */
  yearsRemaining: number | null;
  /** True when payment doesn't cover interest. */
  negativeAmortizing: boolean;
  /** Number of loans (for the "weighted across N loans" hint). */
  loanCount: number;
};

/** Sampled balance trajectory from origination → payoff. Pre-scaled for ownership/display mode. */
export type PaydownProjection = {
  /** Sampled points along the schedule. Ordered by date ascending. */
  points: { date: Date; balance: number }[];
  /** Ms timestamp considered "today" (used to draw the today marker). */
  todayMs: number;
  /** Original loan amount at origination (sum across loans, ownership-scaled). */
  originalBalance: number;
};

type CapitalStructureCardProps = {
  debt: number;
  equity: number;
  purchasePrice: number;
  gainOnValue: number;
  /** Optional mortgage details strip rendered inside the card. Hidden when absent. */
  mortgage?: MortgageDetail;
  /** Optional paydown chart between the bar and footer stats. Hidden when absent. */
  paydown?: PaydownProjection;
};

export function CapitalStructureCard({
  debt,
  equity,
  purchasePrice,
  gainOnValue,
  mortgage,
  paydown,
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
      className="flex h-full min-h-0 flex-col rounded-xl border"
      style={{ background: "var(--card)", borderColor: "var(--border)", padding: "20px 22px" }}
    >
      <div
        className="shrink-0"
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

      {/* Absorbs row height next to Cash flow card; keeps debt/equity visual vertically centered */}
      <div className="flex min-h-0 grow flex-col justify-center">
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

        {paydown && <PaydownChart paydown={paydown} />}
      </div>

      <div className="shrink-0">
        <FooterStats
          purchasePrice={purchasePrice}
          gainIsPositive={gainIsPositive}
          gainFormatted={gainFormatted}
          mortgage={mortgage}
        />
      </div>
    </div>
  );
}

type Cell = {
  label: string;
  value: string;
  hint?: string;
  valueColor?: string;
};

function FooterStats({
  purchasePrice,
  gainIsPositive,
  gainFormatted,
  mortgage,
}: {
  purchasePrice: number;
  gainIsPositive: boolean;
  gainFormatted: string;
  mortgage?: MortgageDetail;
}) {
  const cells: Cell[] = [
    {
      label: "Purchase price",
      value: formatCurrency(purchasePrice),
    },
    {
      label: "Gain on value",
      value: gainFormatted,
      valueColor: gainIsPositive ? "var(--positive)" : "var(--negative)",
    },
  ];

  if (mortgage) {
    const escrowDelta = mortgage.monthlyPayment - mortgage.monthlyPi;
    const piHint =
      escrowDelta > 1
        ? `${formatCurrency(mortgage.monthlyPayment)} incl. escrow`
        : "Principal + interest";
    const payoffLabel = mortgage.payoffDate
      ? new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(
          mortgage.payoffDate
        )
      : "—";
    const payoffHint = mortgage.negativeAmortizing
      ? "Payment doesn't cover interest"
      : mortgage.yearsRemaining != null
        ? mortgage.yearsRemaining <= 1
          ? "Less than a year left"
          : `~${mortgage.yearsRemaining} yrs left`
        : "—";
    const rateHint =
      mortgage.loanCount > 1
        ? `Weighted across ${mortgage.loanCount} loans`
        : "Annual";

    cells.push(
      {
        label: "Interest rate",
        value: `${(mortgage.rate * 100).toFixed(2)}%`,
        hint: rateHint,
      },
      {
        label: "Monthly P&I",
        value: formatCurrency(mortgage.monthlyPi),
        hint: piHint,
      },
      {
        label: "Payoff date",
        value: payoffLabel,
        hint: payoffHint,
        valueColor: mortgage.negativeAmortizing ? "var(--warning)" : undefined,
      }
    );
  }

  const cols = cells.length === 5 ? "md:grid-cols-5" : "md:grid-cols-2";

  return (
    <div
      className={`mt-3 pt-3 grid grid-cols-2 ${cols}`}
      style={{
        borderTop: "1px solid var(--border)",
        gap: "12px",
      }}
    >
      {cells.map((c, i) => (
        <div key={i}>
          <div
            style={{
              fontSize: "10.5px",
              color: "var(--foreground-muted)",
              marginBottom: "2px",
            }}
          >
            {c.label}
          </div>
          <div
            style={{
              fontSize: "14px",
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
              color: c.valueColor ?? "var(--foreground)",
            }}
          >
            {c.value}
          </div>
          {c.hint && (
            <div
              style={{
                fontSize: "10.5px",
                color: "var(--foreground-muted)",
                marginTop: "2px",
              }}
            >
              {c.hint}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const CHART_W = 400;
const CHART_H = 80;
const CHART_TOP = 6;
const CHART_BOTTOM = 64;
const CHART_INNER_H = CHART_BOTTOM - CHART_TOP;

function PaydownChart({ paydown }: { paydown: PaydownProjection }) {
  const { points, todayMs, originalBalance } = paydown;
  if (points.length < 2 || originalBalance <= 0) return null;

  const firstMs = points[0]!.date.getTime();
  const lastMs = points[points.length - 1]!.date.getTime();
  const span = Math.max(1, lastMs - firstMs);

  const xFor = (ms: number) => ((ms - firstMs) / span) * CHART_W;
  const yFor = (balance: number) =>
    CHART_TOP + (1 - balance / originalBalance) * CHART_INNER_H;

  const linePath = points
    .map((p, i) => {
      const x = xFor(p.date.getTime());
      const y = yFor(p.balance);
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  const fillPath = `${linePath} L${CHART_W},${CHART_BOTTOM} L0,${CHART_BOTTOM} Z`;

  const todayClamped = Math.min(Math.max(todayMs, firstMs), lastMs);
  const todayX = xFor(todayClamped);

  const fmtYear = (ms: number) =>
    new Intl.DateTimeFormat("en-US", { year: "numeric" }).format(new Date(ms));

  return (
    <div style={{ marginTop: "14px" }}>
      <div
        style={{
          fontSize: "10.5px",
          color: "var(--foreground-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "6px",
        }}
      >
        Loan paydown projection
      </div>
      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height: "80px", display: "block" }}
        role="img"
        aria-label="Projected mortgage balance over loan term"
      >
        <defs>
          <linearGradient id="paydownFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.55 0.15 260)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="oklch(0.55 0.15 260)" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Baseline */}
        <line
          x1="0"
          y1={CHART_BOTTOM}
          x2={CHART_W}
          y2={CHART_BOTTOM}
          stroke="var(--border)"
          strokeWidth="1"
        />

        {/* Filled debt area */}
        <path d={fillPath} fill="url(#paydownFill)" />

        {/* Debt curve */}
        <path
          d={linePath}
          fill="none"
          stroke="oklch(0.55 0.15 260)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />

        {/* Today marker */}
        <line
          x1={todayX}
          y1={CHART_TOP - 2}
          x2={todayX}
          y2={CHART_BOTTOM + 2}
          stroke="var(--foreground-muted)"
          strokeWidth="1"
          strokeDasharray="3 3"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "10px",
          color: "var(--foreground-muted)",
          fontVariantNumeric: "tabular-nums",
          marginTop: "2px",
        }}
      >
        <span>{fmtYear(firstMs)}</span>
        <span style={{ color: "var(--foreground)" }}>Today</span>
        <span>{fmtYear(lastMs)}</span>
      </div>
    </div>
  );
}
