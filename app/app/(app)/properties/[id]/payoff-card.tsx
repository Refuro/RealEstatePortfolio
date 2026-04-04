"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import { CalculatorMetric } from "@/components/calculators/calculator-metric";
import { captureClientEvent } from "@/lib/analytics-client";
import { AnalyticsEvents } from "@/lib/analytics-events";
import {
  getExtraPaymentForYearsEarlierWithTolerance,
  getPayoffYearsWithExtraWithTolerance,
  getRefinanceProjection,
} from "@/lib/amortization";
import type { CalculatorMetricTone } from "@/lib/calculator-metric-tones";

const YEARS_EARLIER_OPTIONS = [5, 10, 15] as const;

const PAYOFF_TOLERANCE_HELP =
  "Strict amortization is used for API and export. Here, “pay off years earlier” and extra-payment estimates may treat a small remaining balance near the loan end as paid off for readability.";

function cashFlowTone(n: number): CalculatorMetricTone {
  if (!Number.isFinite(n)) return "default";
  if (n > 0) return "positive";
  if (n < 0) return "negative";
  return "default";
}

function formatMoneySigned(n: number): string {
  const sign = n < 0 ? "−" : "";
  const abs = Math.abs(n);
  return `${sign}$${abs.toLocaleString(undefined, {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })}`;
}

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

function PayoffInsightPerMortgage({
  m,
  propertyId,
}: {
  m: MortgageForPayoff;
  propertyId?: string;
}) {
  const [yearsEarlierSelected, setYearsEarlierSelected] = useState<
    number | null
  >(null);
  const [extraInput, setExtraInput] = useState("");
  const [refinanceOpen, setRefinanceOpen] = useState(false);
  const [rateInput, setRateInput] = useState("");
  const [newTermYears, setNewTermYears] = useState(30);
  const [costsInput, setCostsInput] = useState("");
  const [rateOutOfRange, setRateOutOfRange] = useState(false);

  const balance = m.effectiveBalance ?? Number(m.currentBalance);
  const payment = Number(m.monthlyPayment);
  const projection = m.payoffProjection;
  const refinanceMortgage = m as Parameters<typeof getRefinanceProjection>[0];

  const refinanceProjection = useMemo(() => {
    if (!projection?.payoffDate) return null;
    const rateRaw = rateInput.trim().replace(/[^0-9.]/g, "");
    if (!rateRaw) return null;
    const ratePct = parseFloat(rateRaw);
    if (!Number.isFinite(ratePct) || ratePct < 0 || ratePct > 30) {
      return null;
    }
    const costsTrim = costsInput.trim().replace(/[^0-9.]/g, "");
    const costsParsed = costsTrim ? parseFloat(costsTrim) : NaN;
    const closingCosts =
      Number.isFinite(costsParsed) && costsParsed > 0
        ? costsParsed
        : undefined;
    return getRefinanceProjection(refinanceMortgage, {
      newAnnualRate: ratePct / 100,
      newTermYears,
      closingCosts,
    });
  }, [projection?.payoffDate, rateInput, newTermYears, costsInput, refinanceMortgage]);

  const costsParsedForUi = useMemo(() => {
    const costsTrim = costsInput.trim().replace(/[^0-9.]/g, "");
    if (!costsTrim) return 0;
    const v = parseFloat(costsTrim);
    return Number.isFinite(v) && v > 0 ? v : 0;
  }, [costsInput]);

  useEffect(() => {
    if (!projection?.payoffDate) return;
    const rateRaw = rateInput.trim().replace(/[^0-9.]/g, "");
    if (!rateRaw) return;
    const ratePct = parseFloat(rateRaw);
    if (!Number.isFinite(ratePct) || ratePct < 0 || ratePct > 30) return;
    const clamped = Math.min(30, Math.max(0, ratePct));
    const id = setTimeout(() => {
      captureClientEvent(AnalyticsEvents.REFINANCE_SCENARIO_CHANGED, {
        placement: "payoff_card",
        newRate: clamped,
        newTermYears,
      });
    }, 500);
    return () => clearTimeout(id);
  }, [projection?.payoffDate, rateInput, newTermYears]);

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

        <div className="pt-1">
          <button
            type="button"
            onClick={() => setRefinanceOpen((o) => !o)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted motion-safe:transition-colors motion-safe:duration-150 hover:text-foreground min-h-[44px]"
          >
            What if I refinanced?
            {refinanceOpen ? (
              <ChevronUp className="size-3.5" aria-hidden />
            ) : (
              <ChevronDown className="size-3.5" aria-hidden />
            )}
          </button>
          <div
            className={`overflow-hidden motion-safe:transition-all motion-safe:duration-200 ${
              refinanceOpen ? "max-h-[2000px]" : "max-h-0"
            }`}
          >
            <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-muted">New rate</label>
                  <div className="relative mt-1.5">
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="e.g. 5.5"
                      value={rateInput}
                      onChange={(e) => setRateInput(e.target.value)}
                      onBlur={() => {
                        const trimmed = rateInput.trim();
                        if (!trimmed) {
                          setRateOutOfRange(false);
                          return;
                        }
                        const v = parseFloat(
                          trimmed.replace(/[^0-9.]/g, ""),
                        );
                        setRateOutOfRange(
                          !Number.isFinite(v) || v < 0 || v > 30,
                        );
                      }}
                      className="block w-full rounded-md border border-border bg-background px-3 py-2 pr-8 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted">%</span>
                  </div>
                  {rateOutOfRange ? (
                    <p className="mt-1 text-xs text-negative">
                      Enter a rate between 0 and 30.
                    </p>
                  ) : null}
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted">
                    New term
                  </label>
                  <select
                    value={newTermYears}
                    onChange={(e) =>
                      setNewTermYears(Number(e.target.value))
                    }
                    className="mt-1.5 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
                  >
                    <option value={30}>30 years</option>
                    <option value={25}>25 years</option>
                    <option value={20}>20 years</option>
                    <option value={15}>15 years</option>
                    <option value={10}>10 years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted">
                    Closing costs <span className="font-normal">(optional)</span>
                  </label>
                  <div className="relative mt-1.5">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted">$</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="e.g. 4000"
                      value={costsInput}
                      onChange={(e) => setCostsInput(e.target.value)}
                      className="block w-full rounded-md border border-border bg-background py-2 pl-6 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    Cash paid at closing, not rolled into the loan.
                  </p>
                </div>

                {refinanceProjection != null && !rateOutOfRange ? (
                  <div className="mt-3 rounded-lg bg-subtle/40 p-3 space-y-3">
                    {refinanceProjection.isNewLoanNegativeAmortizing ? (
                      <p className="text-sm text-warning">
                        This rate is too high to amortize the loan.
                      </p>
                    ) : (
                      <>
                        {refinanceProjection.remainingCurrentMonths < 24 ? (
                          <p className="text-sm text-muted">
                            Your loan has ~
                            <span className="tabular-nums">
                              {refinanceProjection.remainingCurrentMonths}
                            </span>{" "}
                            months remaining — a new {newTermYears}-year term
                            will cost significantly more total interest despite
                            a lower monthly payment.
                          </p>
                        ) : null}
                        <div className="flex flex-wrap gap-2">
                          <CalculatorMetric
                            label="New P&I"
                            value={`${formatMoneySigned(refinanceProjection.newMonthlyPayment)}/mo`}
                            tone="default"
                          />
                          <CalculatorMetric
                            label="Monthly savings"
                            value={`${formatMoneySigned(refinanceProjection.monthlySavings)}/mo`}
                            tone={cashFlowTone(
                              refinanceProjection.monthlySavings,
                            )}
                          />
                          <CalculatorMetric
                            label={
                              refinanceProjection.totalInterestSaved >= 0
                                ? "Total interest saved"
                                : "Total interest added"
                            }
                            value={formatMoneySigned(
                              Math.abs(refinanceProjection.totalInterestSaved),
                            )}
                            tone={cashFlowTone(
                              refinanceProjection.totalInterestSaved,
                            )}
                          />
                          {costsParsedForUi > 0 ? (
                            refinanceProjection.monthlySavings > 0 &&
                            refinanceProjection.breakEvenMonths != null ? (
                              <CalculatorMetric
                                label="Break-even"
                                value={`${refinanceProjection.breakEvenMonths} mo`}
                                helper={
                                  refinanceProjection.breakEvenDate
                                    ? refinanceProjection.breakEvenDate.toLocaleDateString(
                                        undefined,
                                        {
                                          month: "long",
                                          year: "numeric",
                                          day: "numeric",
                                        },
                                      )
                                    : undefined
                                }
                                tone="default"
                              />
                            ) : (
                              <CalculatorMetric
                                label="Break-even"
                                value="—"
                                helper="This refinance increases your monthly payment — no break-even."
                                tone="negative"
                              />
                            )
                          ) : null}
                        </div>
                        <p className="text-sm text-muted">
                          {refinanceProjection.totalInterestSaved >= 0
                            ? "Net interest vs. staying on your current loan: "
                            : "Net additional interest on the new loan: "}
                          <span className="tabular-nums font-medium text-foreground">
                            {formatMoneySigned(
                              Math.abs(refinanceProjection.totalInterestSaved),
                            )}
                          </span>
                        </p>
                        <p className="text-xs text-muted">
                          {getBalanceSourceCopy(m)}
                        </p>
                        {costsParsedForUi > 0 ? (
                          <p className="text-xs text-muted">
                            Assumes closing costs paid upfront. Rolling costs
                            into the loan changes these figures.
                          </p>
                        ) : null}
                        {propertyId && (
                          <Link
                            href={`/refinance?propertyId=${propertyId}`}
                            className="inline-flex items-center gap-1 text-xs text-muted motion-safe:transition-colors motion-safe:duration-150 hover:text-foreground"
                          >
                            <ChevronRight className="size-3" aria-hidden />
                            Full refinance workspace
                          </Link>
                        )}
                      </>
                    )}
                  </div>
                ) : null}
              </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export function PayoffCard({
  mortgages,
  propertyId,
}: {
  mortgages: MortgageForPayoff[];
  propertyId?: string;
}) {
  if (mortgages.length === 0) {
    return (
      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">
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
      <h2 className="text-sm font-semibold text-foreground mb-4">
        Payoff & refinance
      </h2>
      <ul className="space-y-4">
        {mortgages.map((m) => (
          <li
            key={m.id}
            className="rounded-md border border-border bg-subtle/50 p-4"
          >
            <PayoffInsightPerMortgage m={m} propertyId={propertyId} />
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-muted">
        Estimates for informational purposes only. Not financial advice.
      </p>
    </section>
  );
}
