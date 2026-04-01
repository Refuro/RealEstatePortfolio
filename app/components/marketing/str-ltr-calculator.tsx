"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { MobileCollapsible } from "@/components/mobile-collapsible";
import { MobileSectionCard } from "@/components/mobile-section-card";
import { MobileToolShell } from "@/components/mobile-tool-shell";
import { CalculatorMetric } from "@/components/calculators/calculator-metric";
import { FunnelCtaLink } from "@/components/marketing/funnel-cta-link";
import {
  getCapRateTone,
  getCashOnCashTone,
  getDscrTone,
  getMonthlyCashFlowTone,
} from "@/lib/calculator-metric-tones";
import { formatCurrency } from "@/lib/format-currency";
import { computeStrLtrResult } from "@/lib/str-ltr-calculator";

type StrLtrCalculatorProps = {
  compact?: boolean;
  showCta?: boolean;
  landingVariant?: string;
  surface?: "marketing" | "app";
};

function numberOrFallback(value: string, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

const appCtaClass =
  "inline-flex rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover";
const appCtaClassFullWidth =
  "inline-flex w-full items-center justify-center rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover";

/** Defaults tuned for healthy STR vs LTR (see `lib/str-ltr-calculator.test.ts` base fixture). */
const DEFAULTS = {
  nightlyRate: "195",
  annualOccupancyPercent: "68",
  platformFeePercent: "12",
  monthlyStrExpenses: "400",
  monthlyLtrRent: "2800",
  monthlyLtrVacancyPercent: "5",
  monthlyLtrExpenses: "400",
  monthlySharedExpenses: "400",
  monthlyMortgagePayment: "1597",
  purchasePrice: "300000",
  downPaymentPercent: "20",
  ownershipPercent: "100",
};

export function StrLtrCalculator({
  compact = false,
  showCta = false,
  landingVariant,
  surface = "marketing",
}: StrLtrCalculatorProps) {
  const { user } = useUser();
  const isSignedIn = Boolean(user?.id);
  const isAppShell = surface === "app";

  const [nightlyRate, setNightlyRate] = useState(DEFAULTS.nightlyRate);
  const [annualOccupancyPercent, setAnnualOccupancyPercent] = useState(
    DEFAULTS.annualOccupancyPercent
  );
  const [platformFeePercent, setPlatformFeePercent] = useState(DEFAULTS.platformFeePercent);
  const [monthlyStrExpenses, setMonthlyStrExpenses] = useState(DEFAULTS.monthlyStrExpenses);
  const [monthlyLtrRent, setMonthlyLtrRent] = useState(DEFAULTS.monthlyLtrRent);
  const [monthlyLtrVacancyPercent, setMonthlyLtrVacancyPercent] = useState(
    DEFAULTS.monthlyLtrVacancyPercent
  );
  const [monthlyLtrExpenses, setMonthlyLtrExpenses] = useState(DEFAULTS.monthlyLtrExpenses);
  const [monthlySharedExpenses, setMonthlySharedExpenses] = useState(DEFAULTS.monthlySharedExpenses);
  const [monthlyMortgagePayment, setMonthlyMortgagePayment] = useState(
    DEFAULTS.monthlyMortgagePayment
  );
  const [purchasePrice, setPurchasePrice] = useState(DEFAULTS.purchasePrice);
  const [downPaymentPercent, setDownPaymentPercent] = useState(DEFAULTS.downPaymentPercent);
  const [ownershipPercent, setOwnershipPercent] = useState(DEFAULTS.ownershipPercent);

  const result = useMemo(
    () =>
      computeStrLtrResult({
        nightlyRate: numberOrFallback(nightlyRate, 0),
        annualOccupancyPercent: numberOrFallback(annualOccupancyPercent, 0),
        platformFeePercent: numberOrFallback(platformFeePercent, 0),
        monthlyStrExpenses: numberOrFallback(monthlyStrExpenses, 0),
        monthlyLtrRent: numberOrFallback(monthlyLtrRent, 0),
        monthlyLtrVacancyPercent: numberOrFallback(monthlyLtrVacancyPercent, 5),
        monthlyLtrExpenses: numberOrFallback(monthlyLtrExpenses, 0),
        monthlySharedExpenses: numberOrFallback(monthlySharedExpenses, 0),
        monthlyMortgagePayment: numberOrFallback(monthlyMortgagePayment, 0),
        purchasePrice: numberOrFallback(purchasePrice, 0),
        downPaymentPercent: numberOrFallback(downPaymentPercent, 20),
        ownershipPercent: numberOrFallback(ownershipPercent, 100),
      }),
    [
      nightlyRate,
      annualOccupancyPercent,
      platformFeePercent,
      monthlyStrExpenses,
      monthlyLtrRent,
      monthlyLtrVacancyPercent,
      monthlyLtrExpenses,
      monthlySharedExpenses,
      monthlyMortgagePayment,
      purchasePrice,
      downPaymentPercent,
      ownershipPercent,
    ]
  );

  const inputClass =
    "mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-accent/20";
  const labelClass = "block text-xs font-semibold uppercase tracking-wide text-muted";

  const { str, ltr, delta } = result;

  const inputsContent = (
    <div>
      <h2 className="text-base font-semibold text-foreground">STR vs LTR calculator</h2>
      <p className="mt-1 text-sm text-muted">
        Compare short-term (nightly) and long-term rent on the same property. STR uses annual
        occupancy and platform fees; LTR uses contract rent and vacancy. Shared mortgage and
        purchase price apply to both—numbers are illustrative.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Short-term (STR)</p>
        </div>
        <div>
          <label className={labelClass} htmlFor="str-nightly">
            Nightly rate ($)
          </label>
          <input
            id="str-nightly"
            type="number"
            min={0}
            step={5}
            className={inputClass}
            value={nightlyRate}
            onChange={(e) => setNightlyRate(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="str-occ">
            Annual occupancy %
          </label>
          <input
            id="str-occ"
            type="number"
            min={0}
            max={100}
            step={1}
            className={inputClass}
            value={annualOccupancyPercent}
            onChange={(e) => setAnnualOccupancyPercent(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="str-platform">
            Platform fee % (of gross)
          </label>
          <input
            id="str-platform"
            type="number"
            min={0}
            max={100}
            step={0.5}
            className={inputClass}
            value={platformFeePercent}
            onChange={(e) => setPlatformFeePercent(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="str-exp">
            STR-only monthly expenses
          </label>
          <input
            id="str-exp"
            type="number"
            min={0}
            step={25}
            className={inputClass}
            value={monthlyStrExpenses}
            onChange={(e) => setMonthlyStrExpenses(e.target.value)}
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-3 mt-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Long-term (LTR)</p>
        </div>
        <div>
          <label className={labelClass} htmlFor="ltr-rent">
            Monthly rent ($)
          </label>
          <input
            id="ltr-rent"
            type="number"
            min={0}
            step={50}
            className={inputClass}
            value={monthlyLtrRent}
            onChange={(e) => setMonthlyLtrRent(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="ltr-vac">
            Vacancy %
          </label>
          <input
            id="ltr-vac"
            type="number"
            min={0}
            max={100}
            step={1}
            className={inputClass}
            value={monthlyLtrVacancyPercent}
            onChange={(e) => setMonthlyLtrVacancyPercent(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="ltr-exp">
            LTR-only monthly expenses
          </label>
          <input
            id="ltr-exp"
            type="number"
            min={0}
            step={25}
            className={inputClass}
            value={monthlyLtrExpenses}
            onChange={(e) => setMonthlyLtrExpenses(e.target.value)}
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-3 mt-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Shared</p>
        </div>
        <div>
          <label className={labelClass} htmlFor="str-shared-exp">
            Shared monthly expenses
          </label>
          <input
            id="str-shared-exp"
            type="number"
            min={0}
            step={25}
            className={inputClass}
            value={monthlySharedExpenses}
            onChange={(e) => setMonthlySharedExpenses(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="str-mortgage">
            Total mortgage payment / mo
          </label>
          <input
            id="str-mortgage"
            type="number"
            min={0}
            step={10}
            className={inputClass}
            value={monthlyMortgagePayment}
            onChange={(e) => setMonthlyMortgagePayment(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="str-purchase">
            Purchase price
          </label>
          <input
            id="str-purchase"
            type="number"
            min={0}
            step={1000}
            className={inputClass}
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="str-down">
            Down payment %
          </label>
          <input
            id="str-down"
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
          <label className={labelClass} htmlFor="str-own">
            Ownership %
          </label>
          <input
            id="str-own"
            type="number"
            min={1}
            max={100}
            step={1}
            className={inputClass}
            value={ownershipPercent}
            onChange={(e) => setOwnershipPercent(e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const resultsContent = (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Comparison</h3>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <CalculatorMetric
            label="Δ Monthly cash flow (STR − LTR)"
            value={formatCurrency(delta.monthlyCashFlow)}
            tone={getMonthlyCashFlowTone(delta.monthlyCashFlow)}
          />
          <CalculatorMetric
            label="Δ NOI (annual, STR − LTR)"
            value={formatCurrency(delta.noi)}
            tone={getMonthlyCashFlowTone(delta.noi / 12)}
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Short-term (STR)</h3>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <CalculatorMetric
            label="Effective monthly income"
            value={formatCurrency(str.effectiveMonthlyIncome)}
          />
          <CalculatorMetric
            label="Monthly cash flow"
            value={formatCurrency(str.monthlyCashFlow)}
            tone={getMonthlyCashFlowTone(str.monthlyCashFlow)}
          />
          <CalculatorMetric
            label="NOI (annual)"
            value={formatCurrency(str.noi)}
          />
          <CalculatorMetric
            label="Cap rate"
            value={str.capRate != null ? `${(str.capRate * 100).toFixed(2)}%` : "—"}
            tone={getCapRateTone()}
          />
          <CalculatorMetric
            label="DSCR"
            value={str.dscr != null ? str.dscr.toFixed(2) : "—"}
            helper={str.dscr != null ? (str.dscr >= 1 ? "Above 1.0 covers debt" : "Below 1.0 is tight") : undefined}
            tone={getDscrTone(str.dscr)}
          />
          <CalculatorMetric
            label="Cash-on-cash"
            value={
              str.metrics.cashOnCashReturn != null
                ? `${(str.metrics.cashOnCashReturn * 100).toFixed(2)}%`
                : "—"
            }
            tone={getCashOnCashTone(str.metrics.cashOnCashReturn)}
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Long-term (LTR)</h3>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <CalculatorMetric
            label="Effective monthly rent"
            value={formatCurrency(ltr.effectiveMonthlyIncome)}
          />
          <CalculatorMetric
            label="Monthly cash flow"
            value={formatCurrency(ltr.monthlyCashFlow)}
            tone={getMonthlyCashFlowTone(ltr.monthlyCashFlow)}
          />
          <CalculatorMetric label="NOI (annual)" value={formatCurrency(ltr.noi)} />
          <CalculatorMetric
            label="Cap rate"
            value={ltr.capRate != null ? `${(ltr.capRate * 100).toFixed(2)}%` : "—"}
            tone={getCapRateTone()}
          />
          <CalculatorMetric
            label="DSCR"
            value={ltr.dscr != null ? ltr.dscr.toFixed(2) : "—"}
            helper={ltr.dscr != null ? (ltr.dscr >= 1 ? "Above 1.0 covers debt" : "Below 1.0 is tight") : undefined}
            tone={getDscrTone(ltr.dscr)}
          />
          <CalculatorMetric
            label="Cash-on-cash"
            value={
              ltr.metrics.cashOnCashReturn != null
                ? `${(ltr.metrics.cashOnCashReturn * 100).toFixed(2)}%`
                : "—"
            }
            tone={getCashOnCashTone(ltr.metrics.cashOnCashReturn)}
          />
        </div>
      </div>

      <p className="text-xs text-muted">
        STR gross bookings = nights booked × nightly rate (nights = 365 × occupancy %). Net of platform
        fees = gross × (1 − fee %). LTR uses contract rent with vacancy. Loan balance = purchase × (1
        − down %).
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
                placement="str_ltr_calculator"
                ctaId="str_ltr_signup_free"
                planIntent="free"
                landingVariant={landingVariant}
                className="inline-flex rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
              >
                Create a free account
              </FunnelCtaLink>
              <div className="mt-2">
                <FunnelCtaLink
                  href="/sign-up?intent=investor"
                  placement="str_ltr_calculator"
                  ctaId="str_ltr_signup_investor"
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
      label: "STR cash flow",
      value: formatCurrency(str.monthlyCashFlow),
      tone: getMonthlyCashFlowTone(str.monthlyCashFlow),
    },
    {
      label: "LTR cash flow",
      value: formatCurrency(ltr.monthlyCashFlow),
      tone: getMonthlyCashFlowTone(ltr.monthlyCashFlow),
    },
    {
      label: "STR DSCR",
      value: str.dscr != null ? str.dscr.toFixed(2) : "—",
      tone: getDscrTone(str.dscr),
    },
    {
      label: "LTR DSCR",
      value: ltr.dscr != null ? ltr.dscr.toFixed(2) : "—",
      tone: getDscrTone(ltr.dscr),
    },
  ];

  const mobileSurface = (
    <div className="space-y-3">
      <MobileSectionCard className="space-y-3.5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">STR assumptions</h3>
        <MobileSectionCard tone="subtle" className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="str-nightly-m">Nightly ($)</label>
            <input
              id="str-nightly-m"
              type="number"
              min={0}
              step={5}
              className={inputClass}
              value={nightlyRate}
              onChange={(e) => setNightlyRate(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="str-occ-m">Occupancy %</label>
            <input
              id="str-occ-m"
              type="number"
              min={0}
              max={100}
              className={inputClass}
              value={annualOccupancyPercent}
              onChange={(e) => setAnnualOccupancyPercent(e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <label className={labelClass} htmlFor="str-platform-m">Platform fee %</label>
            <input
              id="str-platform-m"
              type="number"
              min={0}
              max={100}
              step={0.5}
              className={inputClass}
              value={platformFeePercent}
              onChange={(e) => setPlatformFeePercent(e.target.value)}
            />
          </div>
        </MobileSectionCard>
      </MobileSectionCard>

      <MobileSectionCard className="space-y-3.5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">LTR assumptions</h3>
        <MobileSectionCard tone="subtle" className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass} htmlFor="ltr-rent-m">Monthly rent</label>
            <input
              id="ltr-rent-m"
              type="number"
              min={0}
              step={50}
              className={inputClass}
              value={monthlyLtrRent}
              onChange={(e) => setMonthlyLtrRent(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="ltr-vac-m">Vacancy %</label>
            <input
              id="ltr-vac-m"
              type="number"
              min={0}
              max={100}
              className={inputClass}
              value={monthlyLtrVacancyPercent}
              onChange={(e) => setMonthlyLtrVacancyPercent(e.target.value)}
            />
          </div>
        </MobileSectionCard>
      </MobileSectionCard>

      <MobileSectionCard>
        <MobileCollapsible label="Expenses & financing">
          <div className="grid grid-cols-2 gap-3 pt-3">
            <div className="col-span-2">
              <label className={labelClass} htmlFor="str-exp-m">STR-only $/mo</label>
              <input
                id="str-exp-m"
                type="number"
                min={0}
                className={inputClass}
                value={monthlyStrExpenses}
                onChange={(e) => setMonthlyStrExpenses(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <label className={labelClass} htmlFor="ltr-exp-m">LTR-only $/mo</label>
              <input
                id="ltr-exp-m"
                type="number"
                min={0}
                className={inputClass}
                value={monthlyLtrExpenses}
                onChange={(e) => setMonthlyLtrExpenses(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <label className={labelClass} htmlFor="shared-exp-m">Shared $/mo</label>
              <input
                id="shared-exp-m"
                type="number"
                min={0}
                className={inputClass}
                value={monthlySharedExpenses}
                onChange={(e) => setMonthlySharedExpenses(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <label className={labelClass} htmlFor="mortgage-m">Mortgage $/mo</label>
              <input
                id="mortgage-m"
                type="number"
                min={0}
                className={inputClass}
                value={monthlyMortgagePayment}
                onChange={(e) => setMonthlyMortgagePayment(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="purchase-m">Purchase</label>
              <input
                id="purchase-m"
                type="number"
                min={0}
                step={1000}
                className={inputClass}
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="down-m">Down %</label>
              <input
                id="down-m"
                type="number"
                min={0}
                max={100}
                className={inputClass}
                value={downPaymentPercent}
                onChange={(e) => setDownPaymentPercent(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <label className={labelClass} htmlFor="own-m">Ownership %</label>
              <input
                id="own-m"
                type="number"
                min={1}
                max={100}
                className={inputClass}
                value={ownershipPercent}
                onChange={(e) => setOwnershipPercent(e.target.value)}
              />
            </div>
          </div>
        </MobileCollapsible>
      </MobileSectionCard>

      <MobileSectionCard className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Results</h3>
        <div className="grid grid-cols-2 gap-2">
          <CalculatorMetric
            label="Δ Cash flow"
            value={formatCurrency(delta.monthlyCashFlow)}
            tone={getMonthlyCashFlowTone(delta.monthlyCashFlow)}
          />
          <CalculatorMetric
            label="Δ NOI/yr"
            value={formatCurrency(delta.noi)}
            tone={getMonthlyCashFlowTone(delta.noi / 12)}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <CalculatorMetric
            label="STR CF"
            value={formatCurrency(str.monthlyCashFlow)}
            tone={getMonthlyCashFlowTone(str.monthlyCashFlow)}
          />
          <CalculatorMetric
            label="LTR CF"
            value={formatCurrency(ltr.monthlyCashFlow)}
            tone={getMonthlyCashFlowTone(ltr.monthlyCashFlow)}
          />
        </div>
      </MobileSectionCard>

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
              placement="str_ltr_calculator"
              ctaId="str_ltr_signup_free_m"
              planIntent="free"
              landingVariant={landingVariant}
              className={appCtaClassFullWidth}
            >
              Create a free account
            </FunnelCtaLink>
            <FunnelCtaLink
              href="/sign-up?intent=investor"
              placement="str_ltr_calculator"
              ctaId="str_ltr_signup_investor_m"
              planIntent="investor"
              landingVariant={landingVariant}
              className="block text-center text-sm font-medium text-muted hover:text-foreground hover:underline"
            >
              Track deals & portfolio — see plans
            </FunnelCtaLink>
          </div>
        ))}
    </div>
  );

  return (
    <section className="border-0 bg-transparent p-0 shadow-none md:rounded-xl md:border md:border-border/70 md:bg-card/95 md:p-5 md:shadow-sm">
      <div className="md:hidden">
        <MobileToolShell
          eyebrow="Calculator"
          title="STR vs LTR"
          description="Compare operating scenarios on the same financing. Adjust occupancy, fees, and rent to see cash flow and coverage."
          context={
            <p className="text-sm text-muted">
              Δ cash flow {formatCurrency(delta.monthlyCashFlow)} · Purchase{" "}
              {formatCurrency(numberOrFallback(purchasePrice, 0))}
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
