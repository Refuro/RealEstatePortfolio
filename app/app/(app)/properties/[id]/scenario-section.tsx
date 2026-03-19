"use client";

import { useState } from "react";
import { computePropertyMetrics } from "@/lib/metrics/property-metrics";
import type { OwnershipDisplayMode } from "@/lib/metrics/property-metrics";
import { formatCurrency } from "@/lib/format-currency";

type ScenarioSectionProps = {
  monthlyRent: number;
  monthlyExpenses: number;
  estimatedValue: number;
  cashInvested: number | null;
  totalMortgageBalance: number;
  totalMonthlyPayment: number;
  ownershipPercent: number;
  vacancyPercent: number;
  displayMode: OwnershipDisplayMode | null;
};

export function ScenarioSection({
  monthlyRent,
  monthlyExpenses,
  estimatedValue,
  cashInvested,
  totalMortgageBalance,
  totalMonthlyPayment,
  ownershipPercent,
  vacancyPercent,
  displayMode,
}: ScenarioSectionProps) {
  const [open, setOpen] = useState(true);
  const [rentChange, setRentChange] = useState(0);
  const [valueChange, setValueChange] = useState(0);
  const [mortgageChange, setMortgageChange] = useState(0);

  const hasOverrides = rentChange !== 0 || valueChange !== 0 || mortgageChange !== 0;
  const isFullLiability = displayMode === "full_liability";

  const adjustedRent = monthlyRent * (1 + rentChange / 100);
  const adjustedValue = estimatedValue * (1 + valueChange / 100);
  const adjustedPayment = totalMonthlyPayment * (1 + mortgageChange / 100);

  const metrics = computePropertyMetrics(
    {
      monthlyRent: adjustedRent,
      monthlyExpenses,
      estimatedValue: adjustedValue,
      cashInvested,
      totalMortgageBalance,
      totalMonthlyPayment: adjustedPayment,
      ownershipPercent,
      vacancyPercent,
    },
    displayMode ?? undefined
  );

  function handleReset() {
    setRentChange(0);
    setValueChange(0);
    setMortgageChange(0);
  }

  return (
    <section className="mt-8 rounded-lg border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-6 text-left"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Scenario
        </h2>
        <span className="text-muted">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="border-t border-border px-6 pb-6 pt-4">
          <p className="mb-4 text-sm text-muted">
            What if rent, value, or mortgage payment changed? Adjust the sliders to see recalculated metrics. This scenario affects metrics only — the amortization graph below shows your original mortgage schedule.
          </p>
          <details className="mb-4 group">
            <summary className="cursor-pointer text-sm font-medium text-muted hover:text-foreground">
              How is this calculated?
            </summary>
            <div className="mt-2 rounded-md border border-border bg-subtle/50 p-3 text-sm text-muted">
              <p className="font-medium text-foreground">Monthly cash flow</p>
              <p className="mt-1">
                Effective rent = monthly rent × (1 − vacancy %). Then:
              </p>
              <p className="mt-1 font-mono text-xs">
                {isFullLiability
                  ? "(effective rent × ownership %) − (expenses × ownership %) − mortgage"
                  : "(effective rent − expenses − mortgage) × ownership %"}
              </p>
              <p className="mt-2">
                {isFullLiability
                  ? "In full liability mode, rent and expenses are ownership-scaled, but debt payment remains 100% to reflect joint liability."
                  : "In proportional mode, rent, expenses, and mortgage payment are all scaled by your ownership %. Vacancy reduces rent before the calculation."}
              </p>
            </div>
          </details>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted">
                Rent % change ({rentChange > 0 ? "+" : ""}{rentChange}%)
              </label>
              <p className="mt-0.5 text-sm text-foreground">
                {formatCurrency(monthlyRent)}
                {rentChange !== 0 && (
                  <span className="text-muted">
                    {" → "}
                    {formatCurrency(adjustedRent)}
                  </span>
                )}
              </p>
              <input
                type="range"
                min={-20}
                max={20}
                value={rentChange}
                onChange={(e) => setRentChange(Number(e.target.value))}
                className="mt-1 w-full accent-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted">
                Value % change ({valueChange > 0 ? "+" : ""}{valueChange}%)
              </label>
              <p className="mt-0.5 text-sm text-foreground">
                {formatCurrency(estimatedValue)}
                {valueChange !== 0 && (
                  <span className="text-muted">
                    {" → "}
                    {formatCurrency(adjustedValue)}
                  </span>
                )}
              </p>
              <input
                type="range"
                min={-20}
                max={20}
                value={valueChange}
                onChange={(e) => setValueChange(Number(e.target.value))}
                className="mt-1 w-full accent-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted">
                Mortgage payment % change ({mortgageChange > 0 ? "+" : ""}{mortgageChange}%)
              </label>
              <p className="mt-0.5 text-sm text-foreground">
                {formatCurrency(totalMonthlyPayment)}
                {mortgageChange !== 0 && (
                  <span className="text-muted">
                    {" → "}
                    {formatCurrency(adjustedPayment)}
                  </span>
                )}
              </p>
              <input
                type="range"
                min={-20}
                max={20}
                value={mortgageChange}
                onChange={(e) => setMortgageChange(Number(e.target.value))}
                className="mt-1 w-full accent-accent"
              />
            </div>
          </div>
          {hasOverrides && (
            <button
              type="button"
              onClick={handleReset}
              className="mt-4 text-sm font-medium text-muted hover:text-foreground"
            >
              Reset
            </button>
          )}
          <dl className="mt-6 grid gap-4 sm:grid-cols-3 md:grid-cols-3">
            <div>
              <dt className="text-base font-medium text-muted">Monthly cash flow</dt>
              <dd
                className={`text-base font-medium ${metrics.monthlyCashFlow >= 0 ? "text-positive" : "text-negative"}`}
              >
                {formatCurrency(metrics.monthlyCashFlow)}
              </dd>
            </div>
            <div>
              <dt className="text-base font-medium text-muted">Cap rate</dt>
              <dd className="text-base font-medium text-foreground">
                {metrics.capRate != null
                  ? `${(metrics.capRate * 100).toFixed(2)}%`
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-base font-medium text-muted">Cash-on-cash return</dt>
              <dd className="text-base font-medium text-foreground">
                {metrics.cashOnCashReturn != null
                  ? `${(metrics.cashOnCashReturn * 100).toFixed(2)}%`
                  : "—"}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </section>
  );
}
