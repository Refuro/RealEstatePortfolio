"use client";

import { useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { MobileCollapsible } from "@/components/mobile-collapsible";
import { MobileSectionCard } from "@/components/mobile-section-card";
import { MobileToolShell } from "@/components/mobile-tool-shell";
import { formatCurrency } from "@/lib/format-currency";
import { computePublicCalculatorResult } from "@/lib/public-calculator";
import { FunnelCtaLink } from "@/components/marketing/funnel-cta-link";

type PublicCalculatorProps = {
  compact?: boolean;
  showCta?: boolean;
  landingVariant?: string;
};

function numberOrFallback(value: string, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function PublicCalculator({
  compact = false,
  showCta = false,
  landingVariant,
}: PublicCalculatorProps) {
  const { user } = useUser();
  const isSignedIn = Boolean(user?.id);
  const [purchasePrice, setPurchasePrice] = useState("300000");
  const [monthlyRent, setMonthlyRent] = useState("2400");
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
  const labelClass = "block text-xs font-semibold uppercase tracking-wide text-muted";

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
        <Metric label="Monthly cash flow" value={formatCurrency(result.metrics.monthlyCashFlow)} />
        <Metric
          label="Cap rate"
          value={result.metrics.capRate != null ? `${(result.metrics.capRate * 100).toFixed(2)}%` : "—"}
        />
        <Metric
          label="DSCR"
          value={result.dscr != null ? result.dscr.toFixed(2) : "—"}
          helper={result.dscr != null ? (result.dscr >= 1 ? "Above 1.0 is stronger" : "Below 1.0 is tighter") : undefined}
        />
        <Metric
          label="Cash-on-cash"
          value={
            result.metrics.cashOnCashReturn != null
              ? `${(result.metrics.cashOnCashReturn * 100).toFixed(2)}%`
              : "—"
          }
        />
      </div>
      <p className="mt-3 text-xs text-muted">
        Loan amount {formatCurrency(result.loanAmount)} · payment{" "}
        {formatCurrency(result.monthlyPayment)}/mo
      </p>

      {showCta && (
        <div className="mt-4">
          <FunnelCtaLink
            href={isSignedIn ? "/analyze" : "/sign-up?intent=free"}
            placement="public_calculator"
            ctaId="save_analysis_signup"
            planIntent="free"
            landingVariant={landingVariant}
            className="inline-flex rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
          >
            {isSignedIn ? "Save this analysis in full analyzer" : "Save this analysis"}
          </FunnelCtaLink>
          <div className="mt-2">
            <FunnelCtaLink
              href={isSignedIn ? "/analyze" : "/sign-up?intent=investor"}
              placement="public_calculator"
              ctaId="open_full_analyzer"
              planIntent="investor"
              landingVariant={landingVariant}
              className="text-sm font-medium text-muted hover:text-foreground hover:underline"
            >
              {isSignedIn ? "Open full deal analyzer" : "Need deeper analysis? Create free account"}
            </FunnelCtaLink>
          </div>
        </div>
      )}
    </div>
  );

  const mobileSummaryItems = [
    {
      label: "Cash flow",
      value: formatCurrency(result.metrics.monthlyCashFlow),
      tone: result.metrics.monthlyCashFlow >= 0 ? "positive" : "negative",
    },
    {
      label: "Cap rate",
      value: result.metrics.capRate != null ? `${(result.metrics.capRate * 100).toFixed(2)}%` : "—",
    },
    {
      label: "DSCR",
      value: result.dscr != null ? result.dscr.toFixed(2) : "—",
      tone:
        result.dscr == null
          ? "default"
          : result.dscr >= 1.2
            ? "positive"
            : result.dscr >= 1
              ? "warning"
              : "negative",
    },
    {
      label: "Cash-on-cash",
      value:
        result.metrics.cashOnCashReturn != null
          ? `${(result.metrics.cashOnCashReturn * 100).toFixed(2)}%`
          : "—",
    },
  ] as const;

  const mobileCalculatorSurface = (
    <div className="space-y-3">
      <MobileSectionCard className="space-y-3.5">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
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
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Live result
            </h3>
            <p className="mt-1 text-sm text-muted">
              Loan amount {formatCurrency(result.loanAmount)} · payment {formatCurrency(result.monthlyPayment)}/mo
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wide text-muted">Cash flow</p>
            <p className={`mt-1 text-lg font-semibold ${result.metrics.monthlyCashFlow >= 0 ? "text-positive" : "text-negative"}`}>
              {formatCurrency(result.metrics.monthlyCashFlow)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Metric
            label="Cap rate"
            value={result.metrics.capRate != null ? `${(result.metrics.capRate * 100).toFixed(2)}%` : "—"}
          />
          <Metric
            label="DSCR"
            value={result.dscr != null ? result.dscr.toFixed(2) : "—"}
            helper={result.dscr != null ? (result.dscr >= 1 ? "Above 1.0 is stronger" : "Below 1.0 is tighter") : undefined}
          />
          <Metric
            label="Cash-on-cash"
            value={
              result.metrics.cashOnCashReturn != null
                ? `${(result.metrics.cashOnCashReturn * 100).toFixed(2)}%`
                : "—"
            }
          />
          <Metric label="Monthly cash flow" value={formatCurrency(result.metrics.monthlyCashFlow)} />
        </div>

        {showCta && (
          <div className="space-y-2 pt-1">
            <FunnelCtaLink
              href={isSignedIn ? "/analyze" : "/sign-up?intent=free"}
              placement="public_calculator"
              ctaId="save_analysis_signup"
              planIntent="free"
              landingVariant={landingVariant}
              className="inline-flex w-full items-center justify-center rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
            >
              {isSignedIn ? "Save this analysis in full analyzer" : "Save this analysis"}
            </FunnelCtaLink>
            <FunnelCtaLink
              href={isSignedIn ? "/analyze" : "/sign-up?intent=investor"}
              placement="public_calculator"
              ctaId="open_full_analyzer"
              planIntent="investor"
              landingVariant={landingVariant}
              className="text-sm font-medium text-muted hover:text-foreground hover:underline"
            >
              {isSignedIn ? "Open full deal analyzer" : "Need deeper analysis? Create free account"}
            </FunnelCtaLink>
          </div>
        )}
      </MobileSectionCard>
    </div>
  );

  return (
    <section className="border-0 bg-transparent p-0 shadow-none md:rounded-xl md:border md:border-border/70 md:bg-card/95 md:p-5 md:shadow-sm">
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

      <div className="hidden gap-5 lg:grid lg:grid-cols-12">
        <div className={compact ? "lg:col-span-7" : "lg:col-span-8"}>{inputsContent}</div>
        <div className={compact ? "lg:col-span-5" : "lg:col-span-4"}>{resultsContent}</div>
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-md border border-border/70 bg-background/45 px-3 py-2">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-base font-semibold text-foreground">{value}</p>
      {helper ? <p className="mt-0.5 text-[11px] text-muted">{helper}</p> : null}
    </div>
  );
}
