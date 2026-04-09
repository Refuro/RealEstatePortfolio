"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { MobileCollapsible } from "@/components/mobile-collapsible";
import { MobilePageSection } from "@/components/mobile-page-section";
import { MobileToolShell } from "@/components/mobile-tool-shell";
import { CalculatorMetric } from "@/components/calculators/calculator-metric";
import { FunnelCtaLink } from "@/components/marketing/funnel-cta-link";
import { getCapRateTone, getMonthlyCashFlowTone } from "@/lib/calculator-metric-tones";
import { formatCurrency } from "@/lib/format-currency";
import { computeCapRateResult } from "@/lib/cap-rate-calculator";

type CapRateCalculatorProps = {
  compact?: boolean;
  showCta?: boolean;
  landingVariant?: string;
  surface?: "marketing" | "app";
  initialPurchasePrice?: number;
  initialMonthlyRent?: number;
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
  purchasePrice: "300000",
  monthlyRent: "2200",
  vacancyPercent: "5",
  monthlyOperatingExpenses: "400",
  annualPropertyTaxes: "4500",
  annualInsurance: "1800",
  otherMonthlyCosts: "0",
};

export function CapRateCalculator({
  compact = false,
  showCta = false,
  landingVariant,
  surface = "marketing",
  initialPurchasePrice,
  initialMonthlyRent,
}: CapRateCalculatorProps) {
  const { user } = useUser();
  const isSignedIn = Boolean(user?.id);
  const isAppShell = surface === "app";

  const [purchasePrice, setPurchasePrice] = useState(
    initialPurchasePrice != null ? String(initialPurchasePrice) : DEFAULTS.purchasePrice
  );
  const [monthlyRent, setMonthlyRent] = useState(
    initialMonthlyRent != null ? String(initialMonthlyRent) : DEFAULTS.monthlyRent
  );
  const [vacancyPercent, setVacancyPercent] = useState(DEFAULTS.vacancyPercent);
  const [monthlyOperatingExpenses, setMonthlyOperatingExpenses] = useState(
    DEFAULTS.monthlyOperatingExpenses
  );
  const [annualPropertyTaxes, setAnnualPropertyTaxes] = useState(DEFAULTS.annualPropertyTaxes);
  const [annualInsurance, setAnnualInsurance] = useState(DEFAULTS.annualInsurance);
  const [otherMonthlyCosts, setOtherMonthlyCosts] = useState(DEFAULTS.otherMonthlyCosts);

  const result = useMemo(
    () =>
      computeCapRateResult({
        purchasePrice: numberOrFallback(purchasePrice, 0),
        monthlyRent: numberOrFallback(monthlyRent, 0),
        vacancyPercent: numberOrFallback(vacancyPercent, 5),
        monthlyOperatingExpenses: numberOrFallback(monthlyOperatingExpenses, 0),
        annualPropertyTaxes: numberOrFallback(annualPropertyTaxes, 0),
        annualInsurance: numberOrFallback(annualInsurance, 0),
        otherMonthlyCosts: numberOrFallback(otherMonthlyCosts, 0),
      }),
    [
      purchasePrice,
      monthlyRent,
      vacancyPercent,
      monthlyOperatingExpenses,
      annualPropertyTaxes,
      annualInsurance,
      otherMonthlyCosts,
    ]
  );

  const capRateDisplay = result.capRate != null ? `${(result.capRate * 100).toFixed(2)}%` : "—";
  const grmDisplay =
    result.grossRentMultiplier != null ? result.grossRentMultiplier.toFixed(2) : "—";

  const inputClass =
    "mt-1 block min-h-[44px] w-full rounded-md border border-border bg-background px-3 py-2 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-accent/20";
  const labelClass = "block text-xs font-medium text-muted";

  const inputsContent = (
    <div>
      <h2 className="text-base font-semibold text-foreground">Cap rate calculator</h2>
      <p className="mt-1 text-sm text-muted">
        Estimate NOI, cap rate, and gross rent multiplier from purchase price, rent, vacancy, and
        annual operating costs.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="cap-purchase">
            Purchase price
          </label>
          <input
            id="cap-purchase"
            type="number"
            min={0}
            step={1000}
            className={inputClass}
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="cap-rent">
            Monthly rent
          </label>
          <input
            id="cap-rent"
            type="number"
            min={0}
            step={25}
            className={inputClass}
            value={monthlyRent}
            onChange={(e) => setMonthlyRent(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="cap-vacancy">
            Vacancy %
          </label>
          <input
            id="cap-vacancy"
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
          <label className={labelClass} htmlFor="cap-opex">
            Operating expenses / mo
          </label>
          <input
            id="cap-opex"
            type="number"
            min={0}
            step={25}
            className={inputClass}
            value={monthlyOperatingExpenses}
            onChange={(e) => setMonthlyOperatingExpenses(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="cap-taxes">
            Property taxes / yr
          </label>
          <input
            id="cap-taxes"
            type="number"
            min={0}
            step={50}
            className={inputClass}
            value={annualPropertyTaxes}
            onChange={(e) => setAnnualPropertyTaxes(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="cap-insurance">
            Insurance / yr
          </label>
          <input
            id="cap-insurance"
            type="number"
            min={0}
            step={50}
            className={inputClass}
            value={annualInsurance}
            onChange={(e) => setAnnualInsurance(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="cap-other">
            Other costs / mo
          </label>
          <input
            id="cap-other"
            type="number"
            min={0}
            step={25}
            className={inputClass}
            value={otherMonthlyCosts}
            onChange={(e) => setOtherMonthlyCosts(e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const resultsContent = (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Results</h3>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <CalculatorMetric label="Cap rate" value={capRateDisplay} tone={getCapRateTone()} />
          <CalculatorMetric label="Annual NOI" value={formatCurrency(result.annualNoi)} />
          <CalculatorMetric
            label="Monthly NOI"
            value={formatCurrency(result.monthlyNoi)}
            tone={getMonthlyCashFlowTone(result.monthlyNoi)}
          />
          <CalculatorMetric label="Gross rent multiplier" value={grmDisplay} />
          <CalculatorMetric
            label="Effective gross income (annual)"
            value={formatCurrency(result.effectiveGrossIncome)}
          />
          <CalculatorMetric
            label="Total annual expenses"
            value={formatCurrency(result.totalAnnualExpenses)}
          />
        </div>
      </div>

      <p className="text-xs text-muted">
        NOI = effective gross income minus operating expenses. Cap rate = NOI / purchase price.
        This does not include financing terms.
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
                placement="cap_rate_inline"
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
                  placement="cap_rate_inline"
                  ctaId="cap_rate_signup_investor"
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
    { label: "Cap rate", value: capRateDisplay, tone: "default" as const },
    { label: "Annual NOI", value: formatCurrency(result.annualNoi), tone: "default" as const },
    { label: "GRM", value: grmDisplay, tone: "default" as const },
  ];

  const mobileSurface = (
    <div className="space-y-0">
      <MobilePageSection title="Property & rent" variant="grouped">
        <div className="grid grid-cols-2 gap-3 rounded-lg bg-subtle/40 p-4">
          <div className="col-span-2">
            <label className={labelClass} htmlFor="cap-purchase-m">
              Purchase
            </label>
            <input
              id="cap-purchase-m"
              type="number"
              min={0}
              step={1000}
              className={inputClass}
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="cap-rent-m">
              Rent / mo
            </label>
            <input
              id="cap-rent-m"
              type="number"
              min={0}
              step={25}
              className={inputClass}
              value={monthlyRent}
              onChange={(e) => setMonthlyRent(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="cap-vacancy-m">
              Vacancy %
            </label>
            <input
              id="cap-vacancy-m"
              type="number"
              min={0}
              max={100}
              step={0.5}
              className={inputClass}
              value={vacancyPercent}
              onChange={(e) => setVacancyPercent(e.target.value)}
            />
          </div>
        </div>
      </MobilePageSection>

      <MobilePageSection variant="flat">
        <MobileCollapsible label="Expenses">
          <div className="grid grid-cols-2 gap-3 rounded-lg bg-subtle/40 p-3 pt-6">
            <div className="col-span-2">
              <label className={labelClass} htmlFor="cap-opex-m">
                Operating expenses / mo
              </label>
              <input
                id="cap-opex-m"
                type="number"
                min={0}
                step={25}
                className={inputClass}
                value={monthlyOperatingExpenses}
                onChange={(e) => setMonthlyOperatingExpenses(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="cap-taxes-m">
                Taxes / yr
              </label>
              <input
                id="cap-taxes-m"
                type="number"
                min={0}
                step={50}
                className={inputClass}
                value={annualPropertyTaxes}
                onChange={(e) => setAnnualPropertyTaxes(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="cap-insurance-m">
                Insurance / yr
              </label>
              <input
                id="cap-insurance-m"
                type="number"
                min={0}
                step={50}
                className={inputClass}
                value={annualInsurance}
                onChange={(e) => setAnnualInsurance(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <label className={labelClass} htmlFor="cap-other-m">
                Other costs / mo
              </label>
              <input
                id="cap-other-m"
                type="number"
                min={0}
                step={25}
                className={inputClass}
                value={otherMonthlyCosts}
                onChange={(e) => setOtherMonthlyCosts(e.target.value)}
              />
            </div>
          </div>
        </MobileCollapsible>
      </MobilePageSection>

      <MobilePageSection title="Results" variant="grouped">
        <div className="grid grid-cols-2 gap-2 p-4">
          <CalculatorMetric label="Cap rate" value={capRateDisplay} tone={getCapRateTone()} />
          <CalculatorMetric label="GRM" value={grmDisplay} />
          <CalculatorMetric label="Annual NOI" value={formatCurrency(result.annualNoi)} />
          <CalculatorMetric
            label="Monthly NOI"
            value={formatCurrency(result.monthlyNoi)}
            tone={getMonthlyCashFlowTone(result.monthlyNoi)}
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
              placement="cap_rate_inline"
              ctaId="get_started_free"
              planIntent="free"
              landingVariant={landingVariant}
              className={appCtaClassFullWidth}
            >
              Create a free account
            </FunnelCtaLink>
            <FunnelCtaLink
              href="/sign-up?intent=investor"
              placement="cap_rate_inline"
              ctaId="cap_rate_signup_investor_m"
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
          title="Cap Rate"
          description="Estimate NOI and cap rate from purchase price, rent, vacancy, and operating costs."
          context={
            <p className="text-sm text-muted">
              Cap rate {capRateDisplay} - NOI {formatCurrency(result.annualNoi)}
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
