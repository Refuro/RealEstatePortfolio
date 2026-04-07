"use client";

import { useCallback, useEffect, useState } from "react";
import { formatCurrency } from "@/lib/format-currency";

type SummaryPayload = {
  totalMarketValue: number;
  totalDebt: number;
  totalEquity: number;
  totalMonthlyCashFlow: number;
  totalNoi: number;
  weightedCapRate: number | null;
  portfolioLtv: number | null;
  portfolioCashOnCashReturn: number | null;
  dscr: number | null;
  propertyCount: number;
  slice: {
    propertyCountTotal: number;
    propertyCountIncluded: number;
    propertyLimit: number;
    truncated: boolean;
  };
};

async function fetchPortfolioSummary(): Promise<SummaryPayload> {
  const res = await fetch("/api/export/portfolio-summary");
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<SummaryPayload>;
}

export default function PortfolioSummaryPrintPage() {
  const [data, setData] = useState<SummaryPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchPortfolioSummary()
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchPortfolioSummary()
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 print:max-w-none print:py-4">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <h1 className="text-2xl font-semibold text-foreground">Portfolio summary</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePrint}
            disabled={!data}
            className="inline-flex min-h-[44px] items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover disabled:opacity-50"
          >
            Print or save as PDF
          </button>
        </div>
      </div>

      {loading && <p className="text-muted">Loading…</p>}
      {error && (
        <p className="text-negative">
          {error}{" "}
          <button type="button" onClick={load} className="underline">
            Retry
          </button>
        </p>
      )}

      {data && (
        <div className="print-optimized rounded-xl border border-border bg-card p-6 print:border-0 print:bg-white print:p-0">
          <header className="border-b border-border pb-4 print:border-border">
            <p className="text-sm font-medium uppercase tracking-wide text-muted">Veld Portfolio</p>
            <h2 className="mt-1 text-xl font-semibold text-foreground">Portfolio summary</h2>
            <p className="mt-1 text-sm text-muted">
              Generated {new Date().toLocaleString()} · {data.slice.propertyCountIncluded} propert
              {data.slice.propertyCountIncluded === 1 ? "y" : "ies"} included
              {data.slice.truncated ? ` of ${data.slice.propertyCountTotal} total (plan limit)` : ""}
            </p>
          </header>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-muted">
                Total market value
              </dt>
              <dd className="mt-1 text-lg font-semibold text-foreground">
                {formatCurrency(data.totalMarketValue)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">Total debt</dt>
              <dd className="mt-1 text-lg font-semibold text-foreground">
                {formatCurrency(data.totalDebt)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">Total equity</dt>
              <dd className="mt-1 text-lg font-semibold text-foreground">
                {formatCurrency(data.totalEquity)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">
                Monthly cash flow
              </dt>
              <dd className="mt-1 text-lg font-semibold text-foreground">
                {formatCurrency(data.totalMonthlyCashFlow)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">NOI (annual)</dt>
              <dd className="mt-1 text-lg font-semibold text-foreground">
                {formatCurrency(data.totalNoi)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">
                Weighted cap rate
              </dt>
              <dd className="mt-1 text-lg font-semibold text-foreground">
                {data.weightedCapRate != null
                  ? `${(data.weightedCapRate * 100).toFixed(2)}%`
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">Portfolio LTV</dt>
              <dd className="mt-1 text-lg font-semibold text-foreground">
                {data.portfolioLtv != null ? `${(data.portfolioLtv * 100).toFixed(2)}%` : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">
                Portfolio cash-on-cash
              </dt>
              <dd className="mt-1 text-lg font-semibold text-foreground">
                {data.portfolioCashOnCashReturn != null
                  ? `${(data.portfolioCashOnCashReturn * 100).toFixed(2)}%`
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-muted">DSCR</dt>
              <dd className="mt-1 text-lg font-semibold text-foreground">
                {data.dscr != null ? data.dscr.toFixed(2) : "—"}
              </dd>
            </div>
          </dl>

          <footer className="mt-8 border-t border-border pt-4 text-xs text-muted print:mt-6">
            <p className="font-semibold text-foreground">Assumptions</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>
                Figures match your dashboard portfolio aggregates (ownership display mode, vacancy on
                rent, effective mortgage balances).
              </li>
              <li>
                Not tax, legal, or investment advice. Reconcile with your records before sharing.
              </li>
            </ul>
          </footer>
        </div>
      )}

    </div>
  );
}
