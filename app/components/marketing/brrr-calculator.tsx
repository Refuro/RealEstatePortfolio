"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { MobileCollapsible } from "@/components/mobile-collapsible";
import { MobilePageSection } from "@/components/mobile-page-section";
import { MobileToolShell } from "@/components/mobile-tool-shell";
import { CalculatorMetric } from "@/components/calculators/calculator-metric";
import { formatCurrency } from "@/lib/format-currency";
import { computeBrrrCalculatorResult } from "@/lib/brrr-calculator";
import {
  getCapRateTone,
  getCashOnCashTone,
  getDscrTone,
  getMonthlyCashFlowTone,
} from "@/lib/calculator-metric-tones";
import { FunnelCtaLink } from "@/components/marketing/funnel-cta-link";

type BrrrCalculatorProps = {
  compact?: boolean;
  showCta?: boolean;
  landingVariant?: string;
  /** `app` = signed-in shell; marketing CTAs hidden in favor of workspace links. */
  surface?: "marketing" | "app";
  /** State-typical monthly rent pre-fill from HUD FMR data. Overrides the generic default. */
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

export function BrrrCalculator({
  compact = false,
  showCta = false,
  landingVariant,
  surface = "marketing",
  initialMonthlyRent,
}: BrrrCalculatorProps) {
  const { user } = useUser();
  const isSignedIn = Boolean(user?.id);
  const isAppShell = surface === "app";
  const [purchasePrice, setPurchasePrice] = useState("150000");
  const [rehabCost, setRehabCost] = useState("35000");
  const [rehabMonths, setRehabMonths] = useState("4");
  const [downPaymentPercent, setDownPaymentPercent] = useState("20");
  const [purchaseLoanRate, setPurchaseLoanRate] = useState("10");
  const [arv, setArv] = useState("275000");
  const [refiLtv, setRefiLtv] = useState("75");
  const [refiRate, setRefiRate] = useState("7");
  const [refiTermYears, setRefiTermYears] = useState("30");
  const [refiClosingPercent, setRefiClosingPercent] = useState("1");
  const [monthlyRent, setMonthlyRent] = useState(String(initialMonthlyRent ?? 2200));
  const [monthlyExpenses, setMonthlyExpenses] = useState("650");
  const [vacancyPercent, setVacancyPercent] = useState("5");

  const result = useMemo(
    () =>
      computeBrrrCalculatorResult({
        purchasePrice: numberOrFallback(purchasePrice, 0),
        rehabCost: numberOrFallback(rehabCost, 0),
        rehabMonths: numberOrFallback(rehabMonths, 4),
        downPaymentPercent: numberOrFallback(downPaymentPercent, 20),
        purchaseLoanInterestRatePercent: numberOrFallback(purchaseLoanRate, 10),
        arv: numberOrFallback(arv, 0),
        refinanceLtvPercent: numberOrFallback(refiLtv, 75),
        refinanceInterestRatePercent: numberOrFallback(refiRate, 7),
        refinanceTermYears: numberOrFallback(refiTermYears, 30),
        refinanceClosingCostPercent: numberOrFallback(refiClosingPercent, 1),
        monthlyRent: numberOrFallback(monthlyRent, 0),
        monthlyExpenses: numberOrFallback(monthlyExpenses, 0),
        vacancyPercent: numberOrFallback(vacancyPercent, 5),
      }),
    [
      purchasePrice,
      rehabCost,
      rehabMonths,
      downPaymentPercent,
      purchaseLoanRate,
      arv,
      refiLtv,
      refiRate,
      refiTermYears,
      refiClosingPercent,
      monthlyRent,
      monthlyExpenses,
      vacancyPercent,
    ]
  );

  const inputClass =
    "mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-accent/20";
  const labelClass = "block text-xs font-medium text-muted";

  const m = result.metricsAfterRefi;
  const dscr = result.dscrAfterRefi;

  const inputsContent = (
    <div>
      <h2 className="text-base font-semibold text-foreground">BRRRR calculator</h2>
      <p className="mt-1 text-sm text-muted">
        Interest-only during rehab, then refinance at ARV. Outputs are illustrative—verify with your
        lender and local costs.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="brrr-purchase">
            Purchase price
          </label>
          <input
            id="brrr-purchase"
            type="number"
            min={0}
            step={1000}
            className={inputClass}
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="brrr-rehab">
            Rehab budget
          </label>
          <input
            id="brrr-rehab"
            type="number"
            min={0}
            step={500}
            className={inputClass}
            value={rehabCost}
            onChange={(e) => setRehabCost(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="brrr-rehab-mo">
            Rehab months
          </label>
          <input
            id="brrr-rehab-mo"
            type="number"
            min={0}
            max={120}
            step={1}
            className={inputClass}
            value={rehabMonths}
            onChange={(e) => setRehabMonths(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="brrr-down">
            Down payment %
          </label>
          <input
            id="brrr-down"
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
          <label className={labelClass} htmlFor="brrr-purchase-rate">
            Purchase loan rate % (IO)
          </label>
          <input
            id="brrr-purchase-rate"
            type="number"
            min={0}
            max={50}
            step={0.1}
            className={inputClass}
            value={purchaseLoanRate}
            onChange={(e) => setPurchaseLoanRate(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="brrr-arv">
            ARV (after repair)
          </label>
          <input
            id="brrr-arv"
            type="number"
            min={0}
            step={1000}
            className={inputClass}
            value={arv}
            onChange={(e) => setArv(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="brrr-ltv">
            Refi LTV %
          </label>
          <input
            id="brrr-ltv"
            type="number"
            min={0}
            max={100}
            step={1}
            className={inputClass}
            value={refiLtv}
            onChange={(e) => setRefiLtv(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="brrr-refi-rate">
            Refi rate %
          </label>
          <input
            id="brrr-refi-rate"
            type="number"
            min={0}
            max={50}
            step={0.1}
            className={inputClass}
            value={refiRate}
            onChange={(e) => setRefiRate(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="brrr-refi-term">
            Refi term (years)
          </label>
          <input
            id="brrr-refi-term"
            type="number"
            min={1}
            max={40}
            step={1}
            className={inputClass}
            value={refiTermYears}
            onChange={(e) => setRefiTermYears(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="brrr-close">
            Refi closing %
          </label>
          <input
            id="brrr-close"
            type="number"
            min={0}
            max={10}
            step={0.1}
            className={inputClass}
            value={refiClosingPercent}
            onChange={(e) => setRefiClosingPercent(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="brrr-rent">
            Monthly rent (stabilized)
          </label>
          <input
            id="brrr-rent"
            type="number"
            min={0}
            step={50}
            className={inputClass}
            value={monthlyRent}
            onChange={(e) => setMonthlyRent(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="brrr-exp">
            Monthly expenses
          </label>
          <input
            id="brrr-exp"
            type="number"
            min={0}
            step={50}
            className={inputClass}
            value={monthlyExpenses}
            onChange={(e) => setMonthlyExpenses(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="brrr-vac">
            Vacancy %
          </label>
          <input
            id="brrr-vac"
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
      <h3 className="text-sm font-semibold text-foreground">After refinance</h3>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <CalculatorMetric label="Cash out at refi" value={formatCurrency(result.cashOutAtRefi)} />
        <CalculatorMetric
          label="Cash left in deal"
          value={formatCurrency(result.netCashLeftInDeal)}
          helper="After estimated refi proceeds vs. cash invested"
        />
        <CalculatorMetric
          label="Monthly cash flow"
          value={formatCurrency(m.monthlyCashFlow)}
          tone={getMonthlyCashFlowTone(m.monthlyCashFlow)}
        />
        <CalculatorMetric
          label="Cap rate (vs ARV)"
          value={m.capRate != null ? `${(m.capRate * 100).toFixed(2)}%` : "—"}
          tone={getCapRateTone()}
        />
        <CalculatorMetric
          label="DSCR"
          value={dscr != null ? dscr.toFixed(2) : "—"}
          helper={dscr != null ? (dscr >= 1 ? "Stabilized coverage" : "Tight coverage") : undefined}
          tone={getDscrTone(dscr)}
        />
        <CalculatorMetric
          label="Cash-on-cash"
          value={
            m.cashOnCashReturn != null ? `${(m.cashOnCashReturn * 100).toFixed(2)}%` : "—"
          }
          helper={result.netCashLeftInDeal <= 0 ? "No equity left in—verify refi math" : undefined}
          tone={getCashOnCashTone(m.cashOnCashReturn)}
        />
      </div>
      <p className="mt-3 text-xs text-muted">
        New loan {formatCurrency(result.newLoanAmount)} · Payment{" "}
        {formatCurrency(result.monthlyPaymentAfterRefi)}/mo · Holding interest{" "}
        {formatCurrency(result.totalHoldingInterest)}
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
          ) : !isSignedIn ? (
            <FunnelCtaLink
              href="/sign-up?intent=free"
              placement="brrr_inline"
              ctaId="get_started_free"
              planIntent="free"
              landingVariant={landingVariant}
              className="inline-flex rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover"
            >
              Track this property in Veld after you close
            </FunnelCtaLink>
          ) : null}
        </div>
      )}
    </div>
  );

  const mobileSummaryItems = [
    {
      label: "Cash out",
      value: formatCurrency(result.cashOutAtRefi),
      tone: "default" as const,
    },
    {
      label: "Cash flow",
      value: formatCurrency(m.monthlyCashFlow),
      tone: getMonthlyCashFlowTone(m.monthlyCashFlow),
    },
    {
      label: "Cap rate",
      value: m.capRate != null ? `${(m.capRate * 100).toFixed(2)}%` : "—",
      tone: getCapRateTone(),
    },
    {
      label: "DSCR",
      value: dscr != null ? dscr.toFixed(2) : "—",
      tone: getDscrTone(dscr),
    },
  ];

  const mobileSurface = (
    <div className="space-y-0">
      <MobilePageSection title="Acquisition & rehab" variant="grouped">
        <div className="grid grid-cols-2 gap-3 rounded-lg bg-subtle/40 p-4">
          <div className="col-span-2">
            <label className={labelClass} htmlFor="brrr-purchase-m">Purchase price</label>
            <input
              id="brrr-purchase-m"
              type="number"
              min={0}
              step={1000}
              className={inputClass}
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="brrr-rehab-m">Rehab</label>
            <input
              id="brrr-rehab-m"
              type="number"
              min={0}
              step={500}
              className={inputClass}
              value={rehabCost}
              onChange={(e) => setRehabCost(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="brrr-arv-m">ARV</label>
            <input
              id="brrr-arv-m"
              type="number"
              min={0}
              step={1000}
              className={inputClass}
              value={arv}
              onChange={(e) => setArv(e.target.value)}
            />
          </div>
        </div>
      </MobilePageSection>

      <MobilePageSection variant="flat">
          <MobileCollapsible label="Rent, refi & financing">
            <div className="grid grid-cols-2 gap-3 rounded-lg bg-subtle/40 p-3 pt-6">
              <div>
                <label className={labelClass} htmlFor="brrr-rent-m">Monthly rent</label>
                <input
                  id="brrr-rent-m"
                  type="number"
                  min={0}
                  step={50}
                  className={inputClass}
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="brrr-exp-m">Monthly expenses</label>
                <input
                  id="brrr-exp-m"
                  type="number"
                  min={0}
                  step={50}
                  className={inputClass}
                  value={monthlyExpenses}
                  onChange={(e) => setMonthlyExpenses(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="brrr-rehab-mo-m">Rehab months</label>
                <input
                  id="brrr-rehab-mo-m"
                  type="number"
                  min={0}
                  max={120}
                  className={inputClass}
                  value={rehabMonths}
                  onChange={(e) => setRehabMonths(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="brrr-down-m">Down %</label>
                <input
                  id="brrr-down-m"
                  type="number"
                  min={0}
                  max={100}
                  className={inputClass}
                  value={downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="brrr-purchase-rate-m">Purchase rate %</label>
                <input
                  id="brrr-purchase-rate-m"
                  type="number"
                  min={0}
                  step={0.1}
                  className={inputClass}
                  value={purchaseLoanRate}
                  onChange={(e) => setPurchaseLoanRate(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="brrr-ltv-m">Refi LTV %</label>
                <input
                  id="brrr-ltv-m"
                  type="number"
                  min={0}
                  max={100}
                  className={inputClass}
                  value={refiLtv}
                  onChange={(e) => setRefiLtv(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="brrr-refi-rate-m">Refi rate %</label>
                <input
                  id="brrr-refi-rate-m"
                  type="number"
                  min={0}
                  step={0.1}
                  className={inputClass}
                  value={refiRate}
                  onChange={(e) => setRefiRate(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="brrr-refi-term-m">Refi term</label>
                <input
                  id="brrr-refi-term-m"
                  type="number"
                  min={1}
                  max={40}
                  className={inputClass}
                  value={refiTermYears}
                  onChange={(e) => setRefiTermYears(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="brrr-close-m">Closing %</label>
                <input
                  id="brrr-close-m"
                  type="number"
                  min={0}
                  max={10}
                  step={0.1}
                  className={inputClass}
                  value={refiClosingPercent}
                  onChange={(e) => setRefiClosingPercent(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="brrr-vac-m">Vacancy %</label>
                <input
                  id="brrr-vac-m"
                  type="number"
                  min={0}
                  max={100}
                  className={inputClass}
                  value={vacancyPercent}
                  onChange={(e) => setVacancyPercent(e.target.value)}
                />
              </div>
            </div>
          </MobileCollapsible>
      </MobilePageSection>

      <MobilePageSection title="Stabilized result" variant="grouped">
        <div className="space-y-3 p-4">
        <div className="grid grid-cols-2 gap-2">
          <CalculatorMetric label="Cash out" value={formatCurrency(result.cashOutAtRefi)} />
          <CalculatorMetric label="Cash left in" value={formatCurrency(result.netCashLeftInDeal)} />
          <CalculatorMetric
            label="Monthly CF"
            value={formatCurrency(m.monthlyCashFlow)}
            tone={getMonthlyCashFlowTone(m.monthlyCashFlow)}
          />
          <CalculatorMetric
            label="Cap rate"
            value={m.capRate != null ? `${(m.capRate * 100).toFixed(2)}%` : "—"}
            tone={getCapRateTone()}
          />
        </div>
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
          ) : !isSignedIn ? (
            <FunnelCtaLink
              href="/sign-up?intent=free"
              placement="brrr_inline"
              ctaId="get_started_free"
              planIntent="free"
              landingVariant={landingVariant}
              className={appCtaClassFullWidth}
            >
              Track this property in Veld after you close
            </FunnelCtaLink>
          ) : null)}
        </div>
      </MobilePageSection>
    </div>
  );

  return (
    <section className="border-0 bg-transparent p-0 shadow-none md:rounded-xl md:border md:border-border md:bg-card md:p-5 md:shadow-sm">
      <div className="md:hidden">
        <MobileToolShell
          eyebrow="Calculator"
          title="BRRRR"
          description="Buy, rehab, rent, then refinance. Preview cash-out and stabilized performance with your assumptions."
          context={
            <p className="text-sm text-muted">
              Cash out {formatCurrency(result.cashOutAtRefi)} · Loan {formatCurrency(result.newLoanAmount)}
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
