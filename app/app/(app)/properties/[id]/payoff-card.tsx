"use client";

import { useState } from "react";
import {
  getExtraPaymentForYearsEarlierWithTolerance,
  getPayoffYearsWithExtraWithTolerance,
} from "@/lib/amortization";

const YEARS_EARLIER_OPTIONS = [5, 10, 15] as const;

const PAYOFF_TOLERANCE_HELP =
  "Strict amortization is used for API and export. Here, “pay off years earlier” and extra-payment estimates may treat a small remaining balance near the loan end as paid off for readability.";

export type PayoffProjection = {
  payoffDate: string | null;
  remainingAtTermEnd: number | null;
};

export type MortgageForPayoff = {
  id: string;
  originalLoanAmount: string;
  currentBalance: string;
  balanceAsOfDate?: string | null;
  interestRate: string;
  termYears: number;
  startDate: string;
  monthlyPayment: string;
  escrowIncluded?: boolean;
  escrowAmount?: string | null;
  effectiveBalance?: number;
  balanceSource?: "stored" | "stored_projected" | "projected";
  payoffProjection?: PayoffProjection;
};

function getBalanceSourceCopy(m: MortgageForPayoff): string {
  if (m.balanceSource === "stored" && m.balanceAsOfDate) {
    return `Based on stored balance as of ${new Date(m.balanceAsOfDate).toLocaleDateString()}.`;
  }
  if (m.balanceSource === "stored_projected" && m.balanceAsOfDate) {
    return `Based on statement balance from ${new Date(m.balanceAsOfDate).toLocaleDateString()}, stepped forward to today.`;
  }
  return "Using projected balance from amortization.";
}

function PayoffInsightPerMortgage({ m }: { m: MortgageForPayoff }) {
  const [yearsEarlierSelected, setYearsEarlierSelected] = useState<
    number | null
  >(null);
  const [extraInput, setExtraInput] = useState("");

  const balance = m.effectiveBalance ?? Number(m.currentBalance);
  const payment = Number(m.monthlyPayment);
  const projection = m.payoffProjection;

  if (balance <= 0) {
    return <p className="text-sm text-muted">This mortgage is paid off.</p>;
  }

  if (payment <= 0 || !projection) {
    return (
      <p className="text-sm text-muted">
        Add mortgage details to see payoff timeline.
      </p>
    );
  }

  if (
    projection.remainingAtTermEnd != null &&
    projection.remainingAtTermEnd > 0
  ) {
    return (
      <div className="space-y-0.5">
        <p className="text-sm text-foreground">
          At your current payment, you&apos;ll have about{" "}
          <strong>${projection.remainingAtTermEnd.toLocaleString()}</strong>{" "}
          remaining at the end of the term.
        </p>
        <p className="text-xs text-muted">
          Consider increasing your payment to fully amortize.
        </p>
        <p className="text-xs text-muted">{getBalanceSourceCopy(m)}</p>
      </div>
    );
  }

  if (projection.payoffDate) {
    const payoffDate = new Date(projection.payoffDate);
    const today = new Date();
    const monthsRemaining =
      (payoffDate.getFullYear() - today.getFullYear()) * 12 +
      (payoffDate.getMonth() - today.getMonth());
    const yearsRemaining = Math.round(monthsRemaining / 12);
    const monthYear = payoffDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    const mortgageRecord = m as Parameters<
      typeof getExtraPaymentForYearsEarlierWithTolerance
    >[0];
    const validYearsOptions = YEARS_EARLIER_OPTIONS.filter(
      (y) => y < yearsRemaining,
    );

    const extraForSelected =
      yearsEarlierSelected != null
        ? getExtraPaymentForYearsEarlierWithTolerance(
            mortgageRecord,
            yearsEarlierSelected,
          )
        : null;

    const extraInputNum = extraInput.trim()
      ? parseFloat(extraInput.replace(/[^0-9.]/g, ""))
      : NaN;
    const payoffYearsWithExtra =
      !Number.isNaN(extraInputNum) && extraInputNum > 0
        ? getPayoffYearsWithExtraWithTolerance(mortgageRecord, extraInputNum)
        : null;

    return (
      <div className="space-y-2">
        <p className="text-sm text-foreground">
          At your current payment, you&apos;ll pay off this mortgage in{" "}
          <strong>{yearsRemaining} years</strong> (around{" "}
          <strong>{monthYear}</strong>).
        </p>
        <p className="text-xs text-muted">{getBalanceSourceCopy(m)}</p>

        {validYearsOptions.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <p className="text-xs text-muted" title={PAYOFF_TOLERANCE_HELP}>
              Pay off years earlier (tolerance-aware estimates; headline date
              above is strict amortization):
            </p>
            <div className="flex flex-wrap gap-2">
              {validYearsOptions.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() =>
                    setYearsEarlierSelected(
                      yearsEarlierSelected === y ? null : y,
                    )
                  }
                  className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                    yearsEarlierSelected === y
                      ? "bg-accent text-accent-foreground"
                      : "border border-border bg-subtle/50 hover:bg-subtle"
                  }`}
                >
                  {y} years
                </button>
              ))}
            </div>
            {extraForSelected != null && yearsEarlierSelected != null && (
              <p className="text-sm text-foreground">
                Add <strong>${extraForSelected.toLocaleString()}/month</strong>{" "}
                to pay off <strong>{yearsEarlierSelected} years</strong>{" "}
                earlier.
              </p>
            )}
          </div>
        )}

        <div className="space-y-1.5 pt-1">
          <p className="text-xs text-muted" title={PAYOFF_TOLERANCE_HELP}>
            Or enter extra monthly payment (estimates use end-of-term tolerance
            when applicable):
          </p>
          <input
            type="text"
            inputMode="decimal"
            placeholder="e.g. 200"
            value={extraInput}
            onChange={(e) => setExtraInput(e.target.value)}
            className="w-24 rounded-md border border-border bg-background px-2 py-1 text-sm"
          />
          {payoffYearsWithExtra != null && (
            <p className="text-sm text-foreground">
              Pay off in <strong>{payoffYearsWithExtra} years</strong>.
            </p>
          )}
        </div>
      </div>
    );
  }

  return null;
}

export function PayoffCard({ mortgages }: { mortgages: MortgageForPayoff[] }) {
  if (mortgages.length === 0) {
    return (
      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-sm font-semibold text-muted mb-4">
          Payoff & refinance
        </h2>
        <p className="text-sm text-muted">
          Add a mortgage to see payoff timeline and acceleration options.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <h2 className="text-sm font-semibold text-muted mb-4">
        Payoff & refinance
      </h2>
      <ul className="space-y-4">
        {mortgages.map((m) => (
          <li
            key={m.id}
            className="rounded-md border border-border bg-subtle/50 p-4"
          >
            <PayoffInsightPerMortgage m={m} />
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-muted">
        Estimates for informational purposes only. Not financial advice.
      </p>
    </section>
  );
}
