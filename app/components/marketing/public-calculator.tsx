"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { MobileCollapsible } from "@/components/mobile-collapsible";
import { MobileSectionCard } from "@/components/mobile-section-card";
import { MobileToolShell } from "@/components/mobile-tool-shell";
import { CalculatorMetric } from "@/components/calculators/calculator-metric";
import { formatCurrency } from "@/lib/format-currency";
import { computePublicCalculatorResult } from "@/lib/public-calculator";
import {
  calculatorToneValueClass,
  getCapRateTone,
  getCashOnCashTone,
  getDscrTone,
  getMonthlyCashFlowTone,
} from "@/lib/calculator-metric-tones";
import { FunnelCtaLink } from "@/components/marketing/funnel-cta-link";

type PublicCalculatorProps = {
  compact?: boolean;
  showCta?: boolean;
  landingVariant?: string;
  surface?: "marketing" | "app";
  /** State-typical monthly rent pre-fill from HUD FMR data. Overrides the generic default. */
  initialMonthlyRent?: number;
  /** Funnel analytics placement for inline CTAs (e.g. investment_property_inline on SEO page). */
  funnelPlacement?: string;
};

function numberOrFallback(value: string, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function PublicCalculator({
  compact = false,
  showCta = false,
  landingVariant,
  surface = "marketing",
  initialMonthlyRent,
  funnelPlacement = "public_calculator",
}: PublicCalculatorProps) {
  const { user } = useUser();
  const isSignedIn = Boolean(user?.id);
  const isAppShell = surface === "app";
  const [purchasePrice, setPurchasePrice] = useState("300000");
  const [monthlyRent, setMonthlyRent] = useState(String(initialMonthlyRent ?? 2500));
  const [monthlyExpenses, setMonthlyExpenses] = useState("700");
  const [downPaymentPercent, setDownPaymentPercent] = useState("20");
  const [interestRatePercent, setInterestRatePercent] = useState("7");
  const [termYears, setTermYears] = useState("30");
  const [vacancyPercent, setVacancyPercent] = useState("5");

  const result = useMemo(
    () =>
      computePublicCalculatorResult({
        purchasePrice: numberOrFallback(purchasePrice, 0),
        monthlyRent: numberOrFallback(monthlyRent, 0),
        monthlyExpenses: numberOrFallback(monthlyExpenses, 0),
        downPaymentPercent: numberOrFallback(downPaymentPercent, 20),
        interestRatePercent: numberOrFallback(interestRatePercent, 7),
        termYears: numberOrFallback(termYears, 30),
        vacancyPercent: numberOrFallback(vacancyPercent, 5),
      }),
    [
      purchasePrice,
      monthlyRent,
      monthlyExpenses,
      downPaymentPercent,
      interestRatePercent,
      termYears,
      vacancyPercent,
    ]
  );

  const inputClass =
    "mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-accent/20";
  const labelClass = "block text-xs font-medium text-muted";

  const inputsContent = (
    <div>
      <h2 className="text-base font-semibold text-foreground">Investment Property Calculator</h2>
      <p className="mt-1 text-sm text-muted">
        Enter assumptions to preview monthly cash flow, cap rate, DSCR, and cash-on-cash return.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="calc-purchase-price">
            Purchase price
          </label>
          <input
            id="calc-purchase-price"
            type="number"
            min={0}
            step={1000}
            className={inputClass}
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="calc-rent">
            Monthly rent
          </label>
          <input
            id="calc-rent"
            type="number"
            min={0}
            step={50}
            className={inputClass}
            value={monthlyRent}
            onChange={(e) => setMonthlyRent(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="calc-expenses">
            Monthly expenses
          </label>
          <input
            id="calc-expenses"
            type="number"
            min={0}
            step={50}
            className={inputClass}
            value={monthlyExpenses}
            onChange={(e) => setMonthlyExpenses(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="calc-down">
            Down payment %
          </label>
          <input
            id="calc-down"
            type="number"
            min={0}
            max={100}
            step={1}
            className={inputClass}
            value={downPaymentPercent}
            onChange={(e) => setDownPaymentPercent(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="calc-rate">
            Interest rate %
          </label>
          <input
            id="calc-rate"
            type="number"
            min={0}
            max={50}
            step={0.1}
            className={inputClass}
            value={interestRatePercent}
            onChange={(e) => setInterestRatePercent(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="calc-term">
            Term (years)
          </label>
          <input
            id="calc-term"
            type="number"
            min={1}
            max={40}
            step={1}
            className={inputClass}
            value={termYears}
            onChange={(e) => setTermYears(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="calc-vacancy">
            Vacancy %
          </label>
          <input
            id="calc-vacancy"
            type="number"
            min={0}
            max={100}
            step={1}
            className={inputClass}
            value={vacancyPercent}
            onChange={(e) => setVacancyPercent(e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const resultsContent = (
    <div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        <CalculatorMetric
          label="Monthly cash flow"
          value={formatCurrency(result.metrics.monthlyCashFlow)}
          tone={getMonthlyCashFlowTone(result.metrics.monthlyCashFlow)}
        />
        <CalculatorMetric
          label="Cap rate"
          value={result.metrics.capRate != null ? `${(result.metrics.capRate * 100).toFixed(2)}%` : "—"}
          tone={getCapRateTone()}
        />
        <CalculatorMetric
          label="DSCR"
          value={result.dscr != null ? result.dscr.toFixed(2) : "—"}
          helper={result.dscr != null ? (result.dscr >= 1 ? "Above 1.0 is stronger" : "Below 1.0 is tighter") : undefined}
          tone={getDscrTone(result.dscr)}
        />
        <CalculatorMetric
          label="Cash-on-cash"
          value={
            result.metrics.cashOnCashReturn != null
              ? `${(result.metrics.cashOnCashReturn * 100).toFixed(2)}%`
              : "—"
          }
          tone={getCashOnCashTone(result.metrics.cashOnCashReturn)}
        />
      </div>
      <p className="mt-3 text-xs text-muted">
        Loan amount {formatCurrency(result.loanAmount)} · payment{" "}
        {formatCurrency(result.monthlyPayment)}/mo
      </p>

      {showCta && (
        <div className="mt-4">
          {isAppShell ? (
            <div className="flex flex-col gap-2">
              <Link
                href="/analyze"
                className="inline-flex w-fit rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
              >
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
                placement={funnelPlacement}
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
                  placement={funnelPlacement}
                  ctaId="open_full_analyzer"
                  planIntent="investor"
                  landingVariant={landingVariant}
                  className="text-sm font-medium text-muted hover:text-foreground hover:underline"
                >
                  Track deals & portfolio — see plans
                </FunnelCtaLink>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );

  const mobileSummaryItems = [
    {
      label: "Cash flow",
      value: formatCurrency(result.metrics.monthlyCashFlow),
      tone: getMonthlyCashFlowTone(result.metrics.monthlyCashFlow),
    },
    {
      label: "Cap rate",
      value: result.metrics.capRate != null ? `${(result.metrics.capRate * 100).toFixed(2)}%` : "—",
      tone: getCapRateTone(),
    },
    {
      label: "DSCR",
      value: result.dscr != null ? result.dscr.toFixed(2) : "—",
      tone: getDscrTone(result.dscr),
    },
    {
      label: "Cash-on-cash",
      value:
        result.metrics.cashOnCashReturn != null
          ? `${(result.metrics.cashOnCashReturn * 100).toFixed(2)}%`
          : "—",
      tone: getCashOnCashTone(result.metrics.cashOnCashReturn),
    },
  ] as const;

  const mobileCalculatorSurface = (
    <div className="space-y-3">
      <MobileSectionCard className="space-y-3.5">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Core assumptions
          </h3>
          <p className="mt-1 text-sm text-muted">
            Start with price, rent, and expenses. Financing assumptions stay available when you want a deeper read.
          </p>
        </div>

        <MobileSectionCard tone="subtle" className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className={labelClass} htmlFor="calc-purchase-price-mobile">
              Purchase price
            </label>
            <input
              id="calc-purchase-price-mobile"
              type="number"
              min={0}
              step={1000}
              className={inputClass}
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="calc-rent-mobile">
              Monthly rent
            </label>
            <input
              id="calc-rent-mobile"
              type="number"
              min={0}
              step={50}
              className={inputClass}
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="calc-expenses-mobile">
              Monthly expenses
            </label>
            <input
              id="calc-expenses-mobile"
              type="number"
              min={0}
              step={50}
              className={inputClass}
              value={monthlyExpenses}
              onChange={(e) => setMonthlyExpenses(e.target.value)}
            />
          </div>
        </MobileSectionCard>

        <MobileSectionCard tone="subtle">
          <MobileCollapsible label="Financing assumptions">
            <div className="grid grid-cols-2 gap-3 pt-3">
              <div>
                <label className={labelClass} htmlFor="calc-down-mobile">
                  Down payment %
                </label>
                <input
                  id="calc-down-mobile"
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  className={inputClass}
                  value={downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="calc-rate-mobile">
                  Interest rate %
                </label>
                <input
                  id="calc-rate-mobile"
                  type="number"
                  min={0}
                  max={50}
                  step={0.1}
                  className={inputClass}
                  value={interestRatePercent}
                  onChange={(e) => setInterestRatePercent(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="calc-term-mobile">
                  Term (years)
                </label>
                <input
                  id="calc-term-mobile"
                  type="number"
                  min={1}
                  max={40}
                  step={1}
                  className={inputClass}
                  value={termYears}
                  onChange={(e) => setTermYears(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="calc-vacancy-mobile">
                  Vacancy %
                </label>
                <input
                  id="calc-vacancy-mobile"
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  className={inputClass}
                  value={vacancyPercent}
                  onChange={(e) => setVacancyPercent(e.target.value)}
                />
              </div>
            </div>
          </MobileCollapsible>
        </MobileSectionCard>
      </MobileSectionCard>

      <MobileSectionCard className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Live result
            </h3>
            <p className="mt-1 text-sm text-muted">
              Loan amount {formatCurrency(result.loanAmount)} · payment {formatCurrency(result.monthlyPayment)}/mo
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-muted">Cash flow</p>
            <p
              className={`mt-1 text-lg font-semibold ${calculatorToneValueClass[getMonthlyCashFlowTone(result.metrics.monthlyCashFlow)]}`}
            >
              {formatCurrency(result.metrics.monthlyCashFlow)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <CalculatorMetric
            label="Cap rate"
            value={result.metrics.capRate != null ? `${(result.metrics.capRate * 100).toFixed(2)}%` : "—"}
            tone={getCapRateTone()}
          />
          <CalculatorMetric
            label="DSCR"
            value={result.dscr != null ? result.dscr.toFixed(2) : "—"}
            helper={result.dscr != null ? (result.dscr >= 1 ? "Above 1.0 is stronger" : "Below 1.0 is tighter") : undefined}
            tone={getDscrTone(result.dscr)}
          />
          <CalculatorMetric
            label="Cash-on-cash"
            value={
              result.metrics.cashOnCashReturn != null
                ? `${(result.metrics.cashOnCashReturn * 100).toFixed(2)}%`
                : "—"
            }
            tone={getCashOnCashTone(result.metrics.cashOnCashReturn)}
          />
          <CalculatorMetric
            label="Monthly cash flow"
            value={formatCurrency(result.metrics.monthlyCashFlow)}
            tone={getMonthlyCashFlowTone(result.metrics.monthlyCashFlow)}
          />
        </div>

        {showCta &&
          (isAppShell ? (
            <div className="space-y-2 pt-1">
              <Link
                href="/analyze"
                className="inline-flex w-full items-center justify-center rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
              >
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
            <div className="space-y-2 pt-1">
              <FunnelCtaLink
                href="/sign-up?intent=free"
                placement={funnelPlacement}
                ctaId="get_started_free"
                planIntent="free"
                landingVariant={landingVariant}
                className="inline-flex w-full items-center justify-center rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover"
              >
                Create a free account
              </FunnelCtaLink>
              <FunnelCtaLink
                href="/sign-up?intent=investor"
                placement={funnelPlacement}
                ctaId="open_full_analyzer"
                planIntent="investor"
                landingVariant={landingVariant}
                className="block text-center text-sm font-medium text-muted hover:text-foreground hover:underline"
              >
                Track deals & portfolio — see plans
              </FunnelCtaLink>
            </div>
          ))}
      </MobileSectionCard>
    </div>
  );

  return (
    <section className="border-0 bg-transparent p-0 shadow-none md:rounded-xl md:border md:border-border md:bg-card md:p-5 md:shadow-sm">
      <div className="md:hidden">
        <MobileToolShell
          eyebrow="Calculator"
          title="Investment Property Calculator"
          description="Adjust assumptions quickly, keep the main KPIs visible, and jump into deeper analysis when you are ready."
          context={
            <p className="text-sm text-muted">
              Loan amount {formatCurrency(result.loanAmount)} · payment{" "}
              {formatCurrency(result.monthlyPayment)}/mo
            </p>
          }
          summaryItems={[...mobileSummaryItems]}
          contentClassName="pt-3"
        >
          {mobileCalculatorSurface}
        </MobileToolShell>
      </div>

      <div className="hidden gap-5 md:grid md:grid-cols-12">
        <div className={compact ? "md:col-span-7" : "md:col-span-8"}>{inputsContent}</div>
        <div className={compact ? "md:col-span-5" : "md:col-span-4"}>{resultsContent}</div>
      </div>
    </section>
  );
}
