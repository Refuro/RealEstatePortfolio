"use client";

import { formatCurrency } from "@/lib/format-currency";

/** Investment metrics. Property detail: Cap rate, LTV, NOI, Cash-on-cash, Annual rent only (no Equity, cash flow, DSCR — those live in Hero). Deal analyzer: may pass optional monthlyCashFlow, annualCashFlow, equity, dscr. */
type Metrics = {
  noi?: number;
  capRate: number | null;
  ltv: number | null;
  cashOnCashReturn: number | null;
  /** Annual rent (grossAnnualRent from computePropertyMetrics). */
  annualRent?: number | null;
  /** Optional — for deal analyzer and other contexts without a Hero. */
  monthlyCashFlow?: number;
  annualCashFlow?: number;
  equity?: number;
  dscr?: number | null;
};

export function PropertyMetricsSection({ metrics }: { metrics: Metrics }) {
  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted mb-4">
        Investment metrics
      </h2>
      <dl className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
        {metrics.monthlyCashFlow != null && (
          <div>
            <dt className="text-base font-medium text-muted">Monthly cash flow</dt>
            <dd
              className={`text-base font-medium ${metrics.monthlyCashFlow >= 0 ? "text-positive" : "text-negative"}`}
            >
              {formatCurrency(metrics.monthlyCashFlow)}
            </dd>
          </div>
        )}
        {metrics.annualCashFlow != null && (
          <div>
            <dt className="text-base font-medium text-muted">Annual cash flow</dt>
            <dd
              className={`text-base font-medium ${metrics.annualCashFlow >= 0 ? "text-positive" : "text-negative"}`}
            >
              {formatCurrency(metrics.annualCashFlow)}
            </dd>
          </div>
        )}
        {metrics.equity != null && (
          <div>
            <dt className="text-base font-medium text-muted">Equity</dt>
            <dd className="text-base font-medium text-foreground">{formatCurrency(metrics.equity)}</dd>
          </div>
        )}
        {metrics.capRate != null && (
          <div>
            <dt className="text-base font-medium text-muted">Cap rate</dt>
            <dd className="text-base font-medium text-foreground">{(metrics.capRate * 100).toFixed(2)}%</dd>
          </div>
        )}
        {metrics.ltv != null && (
          <div>
            <dt className="text-base font-medium text-muted">Loan-to-value</dt>
            <dd className="text-base font-medium text-foreground">{(metrics.ltv * 100).toFixed(1)}%</dd>
          </div>
        )}
        {metrics.noi != null && (
          <div>
            <dt className="text-base font-medium text-muted">NOI</dt>
            <dd className="text-base font-medium text-foreground">{formatCurrency(metrics.noi)}</dd>
          </div>
        )}
        {metrics.cashOnCashReturn != null && (
          <div>
            <dt className="text-base font-medium text-muted">Cash-on-cash return</dt>
            <dd className="text-base font-medium text-foreground">
              {(metrics.cashOnCashReturn * 100).toFixed(2)}%
            </dd>
          </div>
        )}
        {metrics.dscr != null && (
          <div>
            <dt className="text-base font-medium text-muted">DSCR</dt>
            <dd
              className={`text-base font-medium ${
                metrics.dscr >= 1 ? "text-positive" : "text-negative"
              }`}
            >
              {metrics.dscr.toFixed(2)}
            </dd>
          </div>
        )}
        {metrics.annualRent != null && metrics.annualRent > 0 && (
          <div>
            <dt className="text-base font-medium text-muted">Annual rent</dt>
            <dd className="text-base font-medium text-foreground">
              {formatCurrency(metrics.annualRent)}
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}
