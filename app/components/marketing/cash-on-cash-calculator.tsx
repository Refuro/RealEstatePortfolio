"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { MobileCollapsible } from "@/components/mobile-collapsible";
import { MobilePageSection } from "@/components/mobile-page-section";
import { MobileToolShell } from "@/components/mobile-tool-shell";
import { CalculatorMetric } from "@/components/calculators/calculator-metric";
import { FunnelCtaLink } from "@/components/marketing/funnel-cta-link";
import { getCashOnCashTone, getMonthlyCashFlowTone } from "@/lib/calculator-metric-tones";
import { formatCurrency } from "@/lib/format-currency";
import { computeCashOnCashResult } from "@/lib/cash-on-cash-calculator";

type CashOnCashCalculatorProps = {
  compact?: boolean;
  showCta?: boolean;
  landingVariant?: string;
  surface?: "marketing" | "app";
  initialMonthlyRent?: number;
  initialCashInvested?: number;
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
  monthlyRent: "2000",
  vacancyPercent: "5",
  monthlyOperatingExpenses: "400",
  monthlyMortgagePayment: "1200",
  downPayment: "60000",
  closingCosts: "4000",
  rehabCapex: "0",
  otherUpfrontCosts: "0",
};

export function CashOnCashCalculator({
  compact = false,
  showCta = false,
  landingVariant,
  surface = "marketing",
  initialMonthlyRent,
  initialCashInvested,
}: CashOnCashCalculatorProps) {
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
  const [monthlyMortgagePayment, setMonthlyMortgagePayment] = useState(
    DEFAULTS.monthlyMortgagePayment
  );
  const [downPayment, setDownPayment] = useState(
    initialCashInvested != null ? String(initialCashInvested) : DEFAULTS.downPayment
  );
  const [closingCosts, setClosingCosts] = useState(DEFAULTS.closingCosts);
  const [rehabCapex, setRehabCapex] = useState(DEFAULTS.rehabCapex);
  const [otherUpfrontCosts, setOtherUpfrontCosts] = useState(DEFAULTS.otherUpfrontCosts);

  const result = useMemo(
    () =>
      computeCashOnCashResult({
        monthlyRent: numberOrFallback(monthlyRent, 0),
        vacancyPercent: numberOrFallback(vacancyPercent, 5),
        monthlyOperatingExpenses: numberOrFallback(monthlyOperatingExpenses, 0),
        monthlyMortgagePayment: numberOrFallback(monthlyMortgagePayment, 0),
        downPayment: numberOrFallback(downPayment, 0),
        closingCosts: numberOrFallback(closingCosts, 0),
        rehabCapex: numberOrFallback(rehabCapex, 0),
        otherUpfrontCosts: numberOrFallback(otherUpfrontCosts, 0),
      }),
    [
      monthlyRent,
      vacancyPercent,
      monthlyOperatingExpenses,
      monthlyMortgagePayment,
      downPayment,
      closingCosts,
      rehabCapex,
      otherUpfrontCosts,
    ]
  );

  const cocDisplay =
    result.cocReturnPercent != null ? `${result.cocReturnPercent.toFixed(2)}%` : "—";
  const breakEvenDisplay =
    result.breakEvenMonths != null ? `${result.breakEvenMonths.toFixed(1)} months` : "—";

  const inputClass =
    "mt-1 block min-h-[44px] w-full rounded-md border border-border bg-background px-3 py-2 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-accent/20";
  const labelClass = "block text-xs font-medium text-muted";

  const inputsContent = (
    <div>
      <h2 className="text-base font-semibold text-foreground">Cash-on-cash return calculator</h2>
      <p className="mt-1 text-sm text-muted">
        Break out your upfront cash and monthly cash flow to estimate annual return on invested
        capital.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="coc-rent">
            Monthly rent
          </label>
          <input
            id="coc-rent"
            type="number"
            min={0}
            step={25}
            className={inputClass}
            value={monthlyRent}
            onChange={(e) => setMonthlyRent(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="coc-vacancy">
            Vacancy %
          </label>
          <input
            id="coc-vacancy"
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
          <label className={labelClass} htmlFor="coc-opex">
            Operating expenses / mo
          </label>
          <input
            id="coc-opex"
            type="number"
            min={0}
            step={25}
            className={inputClass}
            value={monthlyOperatingExpenses}
            onChange={(e) => setMonthlyOperatingExpenses(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="coc-mortgage">
            Mortgage payment / mo
          </label>
          <input
            id="coc-mortgage"
            type="number"
            min={0}
            step={25}
            className={inputClass}
            value={monthlyMortgagePayment}
            onChange={(e) => setMonthlyMortgagePayment(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-subtle/40 p-4">
        <p className="text-sm font-semibold text-foreground">Cash invested</p>
        <p className="mt-1 text-xs text-muted">
          These upfront cash inputs drive total invested capital and your cash-on-cash return.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="coc-down">
              Down payment
            </label>
            <input
              id="coc-down"
              type="number"
              min={0}
              step={100}
              className={inputClass}
              value={downPayment}
              onChange={(e) => setDownPayment(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="coc-closing">
              Closing costs
            </label>
            <input
              id="coc-closing"
              type="number"
              min={0}
              step={100}
              className={inputClass}
              value={closingCosts}
              onChange={(e) => setClosingCosts(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="coc-rehab">
              Rehab / CapEx
            </label>
            <input
              id="coc-rehab"
              type="number"
              min={0}
              step={100}
              className={inputClass}
              value={rehabCapex}
              onChange={(e) => setRehabCapex(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="coc-other">
              Other upfront costs
            </label>
            <input
              id="coc-other"
              type="number"
              min={0}
              step={100}
              className={inputClass}
              value={otherUpfrontCosts}
              onChange={(e) => setOtherUpfrontCosts(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const cocDecimal = result.cocReturnPercent != null ? result.cocReturnPercent / 100 : null;

  const resultsContent = (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Results</h3>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <CalculatorMetric
            label="Cash-on-cash return"
            value={cocDisplay}
            tone={getCashOnCashTone(cocDecimal)}
          />
          <CalculatorMetric
            label="Monthly cash flow"
            value={formatCurrency(result.monthlyCashFlow)}
            tone={getMonthlyCashFlowTone(result.monthlyCashFlow)}
          />
          <CalculatorMetric label="Annual cash flow" value={formatCurrency(result.annualCashFlow)} />
          <CalculatorMetric
            label="Total cash invested"
            value={formatCurrency(result.totalCashInvested)}
          />
          <CalculatorMetric
            label="Gross yield on cash"
            value={
              result.grossYieldPercent != null ? `${result.grossYieldPercent.toFixed(2)}%` : "—"
            }
          />
          <CalculatorMetric label="Break-even period" value={breakEvenDisplay} />
        </div>
      </div>

      <p className="text-xs text-muted">
        Total cash invested = down payment + closing costs + rehab + other upfront costs.
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
                placement="cash_on_cash_inline"
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
                  placement="cash_on_cash_inline"
                  ctaId="cash_on_cash_signup_investor"
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
    { label: "CoC return", value: cocDisplay, tone: "default" as const },
    {
      label: "Monthly cash flow",
      value: formatCurrency(result.monthlyCashFlow),
      tone: getMonthlyCashFlowTone(result.monthlyCashFlow),
    },
    {
      label: "Cash invested",
      value: formatCurrency(result.totalCashInvested),
      tone: "default" as const,
    },
  ];

  const mobileSurface = (
    <div className="space-y-0">
      <MobilePageSection title="Income & expenses" variant="grouped">
        <div className="grid grid-cols-2 gap-3 rounded-lg bg-subtle/40 p-4">
          <div className="col-span-2">
            <label className={labelClass} htmlFor="coc-rent-m">
              Rent / mo
            </label>
            <input
              id="coc-rent-m"
              type="number"
              min={0}
              step={25}
              className={inputClass}
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="coc-vacancy-m">
              Vacancy %
            </label>
            <input
              id="coc-vacancy-m"
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
            <label className={labelClass} htmlFor="coc-opex-m">
              OpEx / mo
            </label>
            <input
              id="coc-opex-m"
              type="number"
              min={0}
              step={25}
              className={inputClass}
              value={monthlyOperatingExpenses}
              onChange={(e) => setMonthlyOperatingExpenses(e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <label className={labelClass} htmlFor="coc-mortgage-m">
              Mortgage / mo
            </label>
            <input
              id="coc-mortgage-m"
              type="number"
              min={0}
              step={25}
              className={inputClass}
              value={monthlyMortgagePayment}
              onChange={(e) => setMonthlyMortgagePayment(e.target.value)}
            />
          </div>
        </div>
      </MobilePageSection>

      <MobilePageSection variant="flat">
        <MobileCollapsible label="Cash invested">
          <div className="grid grid-cols-2 gap-3 rounded-lg bg-subtle/40 p-3 pt-6">
            <div className="col-span-2">
              <label className={labelClass} htmlFor="coc-down-m">
                Down payment
              </label>
              <input
                id="coc-down-m"
                type="number"
                min={0}
                step={100}
                className={inputClass}
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="coc-closing-m">
                Closing costs
              </label>
              <input
                id="coc-closing-m"
                type="number"
                min={0}
                step={100}
                className={inputClass}
                value={closingCosts}
                onChange={(e) => setClosingCosts(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="coc-rehab-m">
                Rehab / CapEx
              </label>
              <input
                id="coc-rehab-m"
                type="number"
                min={0}
                step={100}
                className={inputClass}
                value={rehabCapex}
                onChange={(e) => setRehabCapex(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <label className={labelClass} htmlFor="coc-other-m">
                Other upfront costs
              </label>
              <input
                id="coc-other-m"
                type="number"
                min={0}
                step={100}
                className={inputClass}
                value={otherUpfrontCosts}
                onChange={(e) => setOtherUpfrontCosts(e.target.value)}
              />
            </div>
          </div>
        </MobileCollapsible>
      </MobilePageSection>

      <MobilePageSection title="Results" variant="grouped">
        <div className="grid grid-cols-2 gap-2 p-4">
          <CalculatorMetric
            label="CoC return"
            value={cocDisplay}
            tone={getCashOnCashTone(cocDecimal)}
          />
          <CalculatorMetric
            label="Monthly cash flow"
            value={formatCurrency(result.monthlyCashFlow)}
            tone={getMonthlyCashFlowTone(result.monthlyCashFlow)}
          />
          <CalculatorMetric label="Cash invested" value={formatCurrency(result.totalCashInvested)} />
          <CalculatorMetric label="Break-even" value={breakEvenDisplay} />
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
              placement="cash_on_cash_inline"
              ctaId="get_started_free"
              planIntent="free"
              landingVariant={landingVariant}
              className={appCtaClassFullWidth}
            >
              Create a free account
            </FunnelCtaLink>
            <FunnelCtaLink
              href="/sign-up?intent=investor"
              placement="cash_on_cash_inline"
              ctaId="cash_on_cash_signup_investor_m"
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
          title="Cash-on-cash"
          description="Estimate annual return on invested cash from rent, expenses, financing, and upfront capital."
          context={
            <p className="text-sm text-muted">
              Return {cocDisplay} - Cash invested {formatCurrency(result.totalCashInvested)}
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
