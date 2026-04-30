"use client";

import { formatCurrency } from "@/lib/format-currency";

export type PerformanceCardProps = {
  capRate: number | null;
  cashOnCashReturn: number | null;
  noi: number;
  grossAnnualRent: number;
  dscr: number | null;
  ltv: number | null;
  hasMortgage: boolean | null;
};

export function PerformanceCard({
  capRate,
  cashOnCashReturn,
  noi,
  grossAnnualRent,
  dscr,
  ltv,
  hasMortgage,
}: PerformanceCardProps) {
  const dscrValue =
    hasMortgage === false
      ? "N/A"
      : dscr != null
      ? dscr.toFixed(2)
      : "—";
  const dscrHint =
    hasMortgage === false
      ? "No active loan"
      : dscr == null
      ? "Add mortgage to calculate"
      : undefined;

  const ltvValue =
    hasMortgage === false
      ? "N/A"
      : ltv != null
      ? `${(ltv * 100).toFixed(1)}%`
      : "—";
  const ltvHint =
    hasMortgage === false
      ? "No active loan"
      : ltv == null
      ? "Add mortgage to calculate"
      : undefined;

  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold text-foreground">Performance</h2>
      </div>
      <dl className="divide-y divide-border-subtle">
        <Row
          label="Annual rent"
          value={formatCurrency(grossAnnualRent)}
          hint={`${formatCurrency(grossAnnualRent / 12)}/mo`}
        />
        <Row
          label="NOI"
          value={formatCurrency(noi)}
          hint="Net operating income"
        />
        <Row
          label="Cap rate"
          value={capRate != null ? `${(capRate * 100).toFixed(2)}%` : "—"}
          hint={capRate == null ? "Set value and rent" : "Gross yield on value"}
        />
        <Row
          label="Cash-on-cash return"
          value={
            cashOnCashReturn != null
              ? `${(cashOnCashReturn * 100).toFixed(2)}%`
              : "—"
          }
          hint={cashOnCashReturn == null ? "Add cash invested" : undefined}
        />
        <Row label="DSCR" value={dscrValue} hint={dscrHint} />
        <Row label="Loan-to-value (LTV)" value={ltvValue} hint={ltvHint} />
      </dl>
    </section>
  );
}

function Row({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  const isEmpty = value === "—";
  return (
    <div className="flex items-baseline justify-between gap-4 px-5 py-3">
      <div className="min-w-0 flex-1">
        <dt className="text-sm text-foreground">{label}</dt>
        {hint && (
          <p className="mt-0.5 text-[11px] leading-snug text-muted">{hint}</p>
        )}
      </div>
      <dd
        className={`shrink-0 tabular-nums text-sm font-semibold ${
          isEmpty ? "text-muted" : "text-foreground"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
