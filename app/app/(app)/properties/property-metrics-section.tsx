"use client";

import { useState } from "react";

type Metrics = {
  monthlyCashFlow: number;
  annualCashFlow: number;
  equity: number;
  capRate: number | null;
  ltv: number | null;
  cashOnCashReturn: number | null;
};

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export function PropertyMetricsSection({ metrics }: { metrics: Metrics }) {
  const [showMore, setShowMore] = useState(false);
  const hasAdvanced =
    metrics.capRate != null || metrics.ltv != null || metrics.cashOnCashReturn != null;

  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted mb-4">
        Investment metrics
      </h2>
      <dl className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        <div>
          <dt className="text-base font-medium text-muted">Monthly cash flow</dt>
          <dd
            className={`text-base font-medium ${metrics.monthlyCashFlow >= 0 ? "text-positive" : "text-negative"}`}
          >
            {formatCurrency(metrics.monthlyCashFlow)}
          </dd>
        </div>
        <div>
          <dt className="text-base font-medium text-muted">Annual cash flow</dt>
          <dd
            className={`text-base font-medium ${metrics.annualCashFlow >= 0 ? "text-positive" : "text-negative"}`}
          >
            {formatCurrency(metrics.annualCashFlow)}
          </dd>
        </div>
        <div>
          <dt className="text-base font-medium text-muted">Equity</dt>
          <dd className="text-base font-medium text-foreground">{formatCurrency(metrics.equity)}</dd>
        </div>
        {showMore && metrics.capRate != null && (
          <div>
            <dt className="text-base font-medium text-muted">Cap rate</dt>
            <dd className="text-base font-medium text-foreground">{(metrics.capRate * 100).toFixed(2)}%</dd>
          </div>
        )}
        {showMore && metrics.ltv != null && (
          <div>
            <dt className="text-base font-medium text-muted">Loan-to-value</dt>
            <dd className="text-base font-medium text-foreground">{(metrics.ltv * 100).toFixed(1)}%</dd>
          </div>
        )}
        {showMore && metrics.cashOnCashReturn != null && (
          <div>
            <dt className="text-base font-medium text-muted">Cash-on-cash return</dt>
            <dd className="text-base font-medium text-foreground">
              {(metrics.cashOnCashReturn * 100).toFixed(2)}%
            </dd>
          </div>
        )}
      </dl>
      {hasAdvanced && (
        <button
          type="button"
          onClick={() => setShowMore(!showMore)}
          className="mt-4 text-sm font-medium text-muted hover:text-foreground"
        >
          {showMore ? "Show fewer metrics" : "Show more metrics"}
        </button>
      )}
    </section>
  );
}
