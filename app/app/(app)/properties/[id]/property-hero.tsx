"use client";

import { formatCurrency } from "@/lib/format-currency";

export type PropertyHeroProps = {
  nickname: string | null;
  address: string;
  equity: number;
  monthlyCashFlow: number;
  ltv: number | null;
  dscr?: number | null;
};

export function PropertyHero({
  nickname,
  address,
  equity,
  monthlyCashFlow,
  ltv,
  dscr,
}: PropertyHeroProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex flex-wrap items-center">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            {nickname || address || "Property"}
          </h2>
          {address && nickname && (
            <p className="mt-0.5 text-sm text-muted">{address}</p>
          )}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div>
          <p className="text-sm font-medium text-muted">Cash flow</p>
          <p
            className={`mt-0.5 text-lg font-semibold ${
              monthlyCashFlow >= 0 ? "text-positive" : "text-negative"
            }`}
          >
            {formatCurrency(monthlyCashFlow)}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted">DSCR</p>
          <p
            className={`mt-0.5 text-lg font-semibold ${
              dscr != null && dscr >= 1 ? "text-positive" : "text-negative"
            }`}
          >
            {dscr != null ? dscr.toFixed(2) : "—"}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted">Equity</p>
          <p className="mt-0.5 text-lg font-semibold text-foreground">
            {formatCurrency(equity)}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted">Loan-to-value</p>
          <p className="mt-0.5 text-lg font-semibold text-foreground">
            {ltv != null ? `${(ltv * 100).toFixed(1)}%` : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
