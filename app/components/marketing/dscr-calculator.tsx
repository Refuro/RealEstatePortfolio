"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { MobileCollapsible } from "@/components/mobile-collapsible";
import { MobilePageSection } from "@/components/mobile-page-section";
import { MobileToolShell } from "@/components/mobile-tool-shell";
import { CalculatorMetric } from "@/components/calculators/calculator-metric";
import { FunnelCtaLink } from "@/components/marketing/funnel-cta-link";
import { getDscrTone } from "@/lib/calculator-metric-tones";
import { formatCurrency } from "@/lib/format-currency";
import { computeDscrResult } from "@/lib/dscr-calculator";

type DscrCalculatorProps = {
  compact?: boolean;
  showCta?: boolean;
  landingVariant?: string;
  surface?: "marketing" | "app";
  initialMonthlyRent?: number;
  initialLoanAmount?: number;
};

function numberOrFallback(value: string, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

const appCtaClass =
  "inline-flex rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover";
const appCtaClassFullWidth =
  "inline-flex w-full items-center justify-center rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover";

const DEFAULTS = {
  monthlyRent: "2200",
  vacancyPercent: "5",
  monthlyOperatingExpenses: "650",
  loanAmount: "240000",
  interestRatePercent: "7.5",
  loanTermYears: "30",
};

export function DscrCalculator({
  compact = false,
  showCta = false,
  landingVariant,
  surface = "marketing",
  initialMonthlyRent,
  initialLoanAmount,
}: DscrCalculatorProps) {
  const { user } = useUser();
  const isSignedIn = Boolean(user?.id);
  const isAppShell = surface === "app";

  const [monthlyRent, setMonthlyRent] = useState(
    initialMonthlyRent != null ? String(initialMonthlyRent) : DEFAULTS.monthlyRent
  );
  const [vacancyPercent, setVacancyPercent] = useState(DEFAULTS.vacancyPercent);
  const [monthlyOperatingExpenses, setMonthlyOperatingExpenses] = useState(
    DEFAULTS.monthlyOperatingExpenses
  );
  const [loanAmount, setLoanAmount] = useState(
    initialLoanAmount != null ? String(initialLoanAmount) : DEFAULTS.loanAmount
  );
  const [interestRatePercent, setInterestRatePercent] = useState(DEFAULTS.interestRatePercent);
  const [loanTermYears, setLoanTermYears] = useState(DEFAULTS.loanTermYears);
  const [interestOnly, setInterestOnly] = useState(false);

  const result = useMemo(
    () =>
      computeDscrResult({
        monthlyRent: numberOrFallback(monthlyRent, 0),
        vacancyPercent: numberOrFallback(vacancyPercent, 5),
        monthlyOperatingExpenses: numberOrFallback(monthlyOperatingExpenses, 0),
        loanAmount: numberOrFallback(loanAmount, 0),
        interestRatePercent: numberOrFallback(interestRatePercent, 7.5),
        loanTermYears: numberOrFallback(loanTermYears, 30),
        interestOnly,
      }),
    [
      monthlyRent,
      vacancyPercent,
      monthlyOperatingExpenses,
      loanAmount,
      interestRatePercent,
      loanTermYears,
      interestOnly,
    ]
  );

  const dscrDisplay = result.dscr != null ? result.dscr.toFixed(2) : "—";
  const maxLoan125Display =
    result.maxLoanAt1_25 != null ? formatCurrency(result.maxLoanAt1_25) : "—";

  const inputClass =
    "mt-1 block min-h-[44px] w-full rounded-md border border-border bg-background px-3 py-2 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-accent/20";
  const labelClass = "block text-xs font-medium text-muted";

  const inputsContent = (
    <div>
      <h2 className="text-base font-semibold text-foreground">DSCR calculator</h2>
      <p className="mt-1 text-sm text-muted">
        Calculate debt service coverage ratio and estimate max qualifying loan at 1.25 DSCR.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="dscr-rent">
            Monthly rent
          </label>
          <input
            id="dscr-rent"
            type="number"
            min={0}
            step={25}
            className={inputClass}
            value={monthlyRent}
            onChange={(e) => setMonthlyRent(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="dscr-vacancy">
            Vacancy %
          </label>
          <input
            id="dscr-vacancy"
            type="number"
            min={0}
            max={100}
            step={0.5}
            className={inputClass}
            value={vacancyPercent}
            onChange={(e) => setVacancyPercent(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="dscr-opex">
            Operating expenses / mo
          </label>
          <input
            id="dscr-opex"
            type="number"
            min={0}
            step={25}
            className={inputClass}
            value={monthlyOperatingExpenses}
            onChange={(e) => setMonthlyOperatingExpenses(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="dscr-loan">
            Loan amount
          </label>
          <input
            id="dscr-loan"
            type="number"
            min={0}
            step={1000}
            className={inputClass}
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="dscr-rate">
            Interest rate %
          </label>
          <input
            id="dscr-rate"
            type="number"
            min={0}
            max={30}
            step={0.1}
            className={inputClass}
            value={interestRatePercent}
            onChange={(e) => setInterestRatePercent(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="dscr-term">
            Loan term (years)
          </label>
          <input
            id="dscr-term"
            type="number"
            min={1}
            max={50}
            step={1}
            className={inputClass}
            value={loanTermYears}
            onChange={(e) => setLoanTermYears(e.target.value)}
          />
        </div>
      </div>

      <label
        htmlFor="dscr-io"
        className="mt-4 flex min-h-[44px] cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
      >
        <input
          id="dscr-io"
          type="checkbox"
          checked={interestOnly}
          onChange={(e) => setInterestOnly(e.target.checked)}
          className="size-4 rounded border-border text-accent focus:ring-accent/30"
        />
        Interest-only payments
      </label>
    </div>
  );

  const passTone10 = getDscrTone(result.passesAt1_0 ? 1 : 0.85);
  const passTone125 = getDscrTone(result.passesAt1_25 ? 1.25 : 0.85);

  const resultsContent = (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Results</h3>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <CalculatorMetric label="DSCR ratio" value={dscrDisplay} tone={getDscrTone(result.dscr)} />
          <CalculatorMetric
            label="Max qualifying loan (1.25 DSCR)"
            value={maxLoan125Display}
            tone={getDscrTone(result.passesAt1_25 ? 1.25 : 0.95)}
          />
          <CalculatorMetric
            label="Passes at 1.00"
            value={result.passesAt1_0 ? "Pass" : "Fail"}
            tone={passTone10}
          />
          <CalculatorMetric
            label="Passes at 1.25"
            value={result.passesAt1_25 ? "Pass" : "Fail"}
            tone={passTone125}
          />
          <CalculatorMetric label="Annual NOI" value={formatCurrency(result.annualNoi)} />
          <CalculatorMetric
            label="Annual debt service"
            value={formatCurrency(result.annualDebtService)}
          />
        </div>
      </div>

      <p className="text-xs text-muted">
        DSCR = annual NOI / annual debt service. Max qualifying loan uses the same rate, term, and IO
        mode.
      </p>

      {showCta && (
        <div className="mt-4">
          {isAppShell ? (
            <div className="flex flex-col gap-2">
              <Link href="/analyze" className={`${appCtaClass} w-fit`}>
                Open deal analyzer
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted hover:text-foreground hover:underline"
              >
                Dashboard
              </Link>
            </div>
          ) : isSignedIn ? null : (
            <>
              <FunnelCtaLink
                href="/sign-up?intent=free"
                placement="dscr_inline"
                ctaId="get_started_free"
                planIntent="free"
                landingVariant={landingVariant}
                className="inline-flex rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover"
              >
                Create a free account
              </FunnelCtaLink>
              <div className="mt-2">
                <FunnelCtaLink
                  href="/sign-up?intent=investor"
                  placement="dscr_inline"
                  ctaId="dscr_signup_investor"
                  planIntent="investor"
                  landingVariant={landingVariant}
                  className="text-sm font-medium text-muted hover:text-foreground hover:underline"
                >
                  Track deals & portfolio - see plans
                </FunnelCtaLink>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );

  const mobileSummaryItems = [
    { label: "DSCR", value: dscrDisplay, tone: getDscrTone(result.dscr) },
    {
      label: "1.25 threshold",
      value: result.passesAt1_25 ? "Pass" : "Fail",
      tone: passTone125,
    },
    { label: "Max loan (1.25)", value: maxLoan125Display, tone: "default" as const },
  ];

  const mobileSurface = (
    <div className="space-y-0">
      <MobilePageSection title="Income & expenses" variant="grouped">
        <div className="grid grid-cols-2 gap-3 rounded-lg bg-subtle/40 p-4">
          <div className="col-span-2">
            <label className={labelClass} htmlFor="dscr-rent-m">
              Rent / mo
            </label>
            <input
              id="dscr-rent-m"
              type="number"
              min={0}
              step={25}
              className={inputClass}
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="dscr-vacancy-m">
              Vacancy %
            </label>
            <input
              id="dscr-vacancy-m"
              type="number"
              min={0}
              max={100}
              step={0.5}
              className={inputClass}
              value={vacancyPercent}
              onChange={(e) => setVacancyPercent(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="dscr-opex-m">
              OpEx / mo
            </label>
            <input
              id="dscr-opex-m"
              type="number"
              min={0}
              step={25}
              className={inputClass}
              value={monthlyOperatingExpenses}
              onChange={(e) => setMonthlyOperatingExpenses(e.target.value)}
            />
          </div>
        </div>
      </MobilePageSection>

      <MobilePageSection variant="flat">
        <MobileCollapsible label="Loan assumptions">
          <div className="grid grid-cols-2 gap-3 rounded-lg bg-subtle/40 p-3 pt-6">
            <div className="col-span-2">
              <label className={labelClass} htmlFor="dscr-loan-m">
                Loan amount
              </label>
              <input
                id="dscr-loan-m"
                type="number"
                min={0}
                step={1000}
                className={inputClass}
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="dscr-rate-m">
                Rate %
              </label>
              <input
                id="dscr-rate-m"
                type="number"
                min={0}
                max={30}
                step={0.1}
                className={inputClass}
                value={interestRatePercent}
                onChange={(e) => setInterestRatePercent(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="dscr-term-m">
                Term years
              </label>
              <input
                id="dscr-term-m"
                type="number"
                min={1}
                max={50}
                step={1}
                className={inputClass}
                value={loanTermYears}
                onChange={(e) => setLoanTermYears(e.target.value)}
              />
            </div>
            <label
              htmlFor="dscr-io-m"
              className="col-span-2 mt-1 flex min-h-[44px] items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            >
              <input
                id="dscr-io-m"
                type="checkbox"
                checked={interestOnly}
                onChange={(e) => setInterestOnly(e.target.checked)}
                className="size-4 rounded border-border text-accent focus:ring-accent/30"
              />
              Interest-only payments
            </label>
          </div>
        </MobileCollapsible>
      </MobilePageSection>

      <MobilePageSection title="Results" variant="grouped">
        <div className="grid grid-cols-2 gap-2 p-4">
          <CalculatorMetric label="DSCR" value={dscrDisplay} tone={getDscrTone(result.dscr)} />
          <CalculatorMetric label="Max loan 1.25" value={maxLoan125Display} tone={passTone125} />
          <CalculatorMetric
            label="Pass 1.00"
            value={result.passesAt1_0 ? "Pass" : "Fail"}
            tone={passTone10}
          />
          <CalculatorMetric
            label="Pass 1.25"
            value={result.passesAt1_25 ? "Pass" : "Fail"}
            tone={passTone125}
          />
        </div>
      </MobilePageSection>

      {showCta &&
        (isAppShell ? (
          <div className="space-y-2">
            <Link href="/analyze" className={appCtaClassFullWidth}>
              Open deal analyzer
            </Link>
            <Link
              href="/dashboard"
              className="block text-center text-sm font-medium text-muted hover:text-foreground hover:underline"
            >
              Dashboard
            </Link>
          </div>
        ) : isSignedIn ? null : (
          <div className="space-y-2">
            <FunnelCtaLink
              href="/sign-up?intent=free"
              placement="dscr_inline"
              ctaId="get_started_free"
              planIntent="free"
              landingVariant={landingVariant}
              className={appCtaClassFullWidth}
            >
              Create a free account
            </FunnelCtaLink>
            <FunnelCtaLink
              href="/sign-up?intent=investor"
              placement="dscr_inline"
              ctaId="dscr_signup_investor_m"
              planIntent="investor"
              landingVariant={landingVariant}
              className="block text-center text-sm font-medium text-muted hover:text-foreground hover:underline"
            >
              Track deals & portfolio - see plans
            </FunnelCtaLink>
          </div>
        ))}
    </div>
  );

  return (
    <section className="border-0 bg-transparent p-0 shadow-none md:rounded-xl md:border md:border-border md:bg-card md:p-5 md:shadow-sm">
      <div className="md:hidden">
        <MobileToolShell
          eyebrow="Calculator"
          title="DSCR"
          description="Check debt service coverage and max qualifying loan using rent, expenses, and loan terms."
          context={
            <p className="text-sm text-muted">
              DSCR {dscrDisplay} - Max loan (1.25) {maxLoan125Display}
            </p>
          }
          summaryItems={[...mobileSummaryItems]}
          contentClassName="pt-3"
        >
          {mobileSurface}
        </MobileToolShell>
      </div>

      <div className={`hidden gap-5 md:grid md:grid-cols-12 ${compact ? "" : ""}`}>
        <div className={compact ? "md:col-span-7" : "md:col-span-8"}>{inputsContent}</div>
        <div className={compact ? "md:col-span-5" : "md:col-span-4"}>{resultsContent}</div>
      </div>
    </section>
  );
}
