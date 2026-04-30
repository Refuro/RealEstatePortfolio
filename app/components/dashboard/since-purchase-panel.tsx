import { formatCurrency } from "@/lib/format-currency";

const MINUS = "−";

type SincePurchasePanelProps = {
  purchaseDate: Date;
  purchasePrice: number;
  downPayment: number;
  currentEquity: number;
  /** Use the page-level nowMs to keep this component pure across renders. */
  nowMs: number;
};

function fmtSigned(n: number): string {
  if (n === 0) return formatCurrency(0);
  const sign = n < 0 ? MINUS : "+";
  return `${sign}${formatCurrency(Math.abs(n))}`;
}

function describeOwnedFor(months: number): string {
  if (months < 1) return "Less than a month";
  if (months < 12) return `${months} mo`;
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  if (remMonths === 0) return `${years} ${years === 1 ? "yr" : "yrs"}`;
  return `${years} ${years === 1 ? "yr" : "yrs"} ${remMonths} mo`;
}

export function SincePurchasePanel({
  purchaseDate,
  purchasePrice,
  downPayment,
  currentEquity,
  nowMs,
}: SincePurchasePanelProps) {
  const equityBuilt = currentEquity - downPayment;
  const equityIsPos = equityBuilt >= 0;

  const purchaseMs = purchaseDate.getTime();
  const monthsOwned = Math.max(
    0,
    Math.floor((nowMs - purchaseMs) / (30.44 * 24 * 60 * 60 * 1000))
  );

  const purchaseLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(purchaseDate);

  return (
    <div
      className="w-full text-left md:ml-auto md:w-fit md:text-right"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "4px",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          color: "var(--foreground-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        Since purchase
      </div>
      <div
        style={{
          fontSize: "18px",
          fontWeight: 600,
          color: equityIsPos ? "var(--positive)" : "var(--negative)",
          fontVariantNumeric: "tabular-nums",
          lineHeight: 1.15,
        }}
      >
        {fmtSigned(equityBuilt)}
        <span
          style={{
            fontSize: "11px",
            fontWeight: 500,
            color: "var(--foreground-muted)",
            marginLeft: "5px",
          }}
        >
          equity built
        </span>
      </div>
      <div
        style={{
          fontSize: "11.5px",
          color: "var(--foreground-muted)",
          fontVariantNumeric: "tabular-nums",
          marginTop: "2px",
        }}
      >
        Owned{" "}
        <strong style={{ color: "var(--foreground)", fontWeight: 600 }}>
          {describeOwnedFor(monthsOwned)}
        </strong>{" "}
        · Bought {purchaseLabel} for{" "}
        <strong style={{ color: "var(--foreground)", fontWeight: 600 }}>
          {formatCurrency(purchasePrice)}
        </strong>
      </div>
    </div>
  );
}
