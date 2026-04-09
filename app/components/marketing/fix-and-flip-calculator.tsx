"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { MobileCollapsible } from "@/components/mobile-collapsible";
import { MobilePageSection } from "@/components/mobile-page-section";
import { MobileToolShell } from "@/components/mobile-tool-shell";
import { CalculatorMetric } from "@/components/calculators/calculator-metric";
import { FunnelCtaLink } from "@/components/marketing/funnel-cta-link";
import { getCapRateTone, getCashOnCashTone, getMonthlyCashFlowTone } from "@/lib/calculator-metric-tones";
import { formatCurrency } from "@/lib/format-currency";
import { computeFixAndFlipResult } from "@/lib/fix-and-flip-calculator";

type FixAndFlipCalculatorProps = {
  compact?: boolean;
  showCta?: boolean;
  landingVariant?: string;
  surface?: "marketing" | "app";
  initialPurchasePrice?: number;
};

function numberOrFallback(value: string, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

const appCtaClass =
  "inline-flex rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover";
const appCtaClassFullWidth =
  "inline-flex w-full items-center justify-center rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover";

/** Defaults produce positive net profit (see `lib/fix-and-flip-calculator.test.ts` happy path). */
const DEFAULTS = {
  purchasePrice: "150000",
  rehabCost: "40000",
  holdMonths: "6",
  downPaymentPercent: "20",
  purchaseLoanRatePercent: "10",
  arv: "260000",
  sellingCostsPercent: "8",
  monthlyCarryingCosts: "400",
};

export function FixAndFlipCalculator({
  compact = false,
  showCta = false,
  landingVariant,
  surface = "marketing",
  initialPurchasePrice,
}: FixAndFlipCalculatorProps) {
  const { user } = useUser();
  const isSignedIn = Boolean(user?.id);
  const isAppShell = surface === "app";

  const [purchasePrice, setPurchasePrice] = useState(
    initialPurchasePrice != null ? String(initialPurchasePrice) : DEFAULTS.purchasePrice
  );
  const [rehabCost, setRehabCost] = useState(DEFAULTS.rehabCost);
  const [holdMonths, setHoldMonths] = useState(DEFAULTS.holdMonths);
  const [downPaymentPercent, setDownPaymentPercent] = useState(DEFAULTS.downPaymentPercent);
  const [purchaseLoanRatePercent, setPurchaseLoanRatePercent] = useState(
    DEFAULTS.purchaseLoanRatePercent
  );
  const [arv, setArv] = useState(DEFAULTS.arv);
  const [sellingCostsPercent, setSellingCostsPercent] = useState(DEFAULTS.sellingCostsPercent);
  const [monthlyCarryingCosts, setMonthlyCarryingCosts] = useState(DEFAULTS.monthlyCarryingCosts);

  const result = useMemo(
    () =>
      computeFixAndFlipResult({
        purchasePrice: numberOrFallback(purchasePrice, 0),
        rehabCost: numberOrFallback(rehabCost, 0),
        holdMonths: numberOrFallback(holdMonths, 6),
        downPaymentPercent: numberOrFallback(downPaymentPercent, 20),
        purchaseLoanRatePercent: numberOrFallback(purchaseLoanRatePercent, 10),
        arv: numberOrFallback(arv, 0),
        sellingCostsPercent: numberOrFallback(sellingCostsPercent, 8),
        monthlyCarryingCosts: numberOrFallback(monthlyCarryingCosts, 0),
      }),
    [
      purchasePrice,
      rehabCost,
      holdMonths,
      downPaymentPercent,
      purchaseLoanRatePercent,
      arv,
      sellingCostsPercent,
      monthlyCarryingCosts,
    ]
  );

  const inputClass =
    "mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-accent/20";
  const labelClass = "block text-xs font-medium text-muted";

  const cocDecimal =
    result.totalCashIn > 0 ? result.netProfit / result.totalCashIn : null;

  const inputsContent = (
    <div>
      <h2 className="text-base font-semibold text-foreground">Fix-and-flip calculator</h2>
      <p className="mt-1 text-sm text-muted">
        Interest-only loan during hold; sale at ARV net of selling costs; loan payoff equals initial
        loan. Illustrative only—add reserves, taxes, and contingencies in real underwriting.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="ff-purchase">
            Purchase price
          </label>
          <input
            id="ff-purchase"
            type="number"
            min={0}
            step={1000}
            className={inputClass}
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="ff-rehab">
            Rehab budget
          </label>
          <input
            id="ff-rehab"
            type="number"
            min={0}
            step={500}
            className={inputClass}
            value={rehabCost}
            onChange={(e) => setRehabCost(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="ff-arv">
            ARV (sale price)
          </label>
          <input
            id="ff-arv"
            type="number"
            min={0}
            step={1000}
            className={inputClass}
            value={arv}
            onChange={(e) => setArv(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="ff-hold">
            Hold (months)
          </label>
          <input
            id="ff-hold"
            type="number"
            min={0}
            max={120}
            step={1}
            className={inputClass}
            value={holdMonths}
            onChange={(e) => setHoldMonths(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="ff-down">
            Down payment %
          </label>
          <input
            id="ff-down"
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
          <label className={labelClass} htmlFor="ff-rate">
            Loan rate % (IO, annual)
          </label>
          <input
            id="ff-rate"
            type="number"
            min={0}
            max={50}
            step={0.1}
            className={inputClass}
            value={purchaseLoanRatePercent}
            onChange={(e) => setPurchaseLoanRatePercent(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="ff-sell-pct">
            Selling costs % of ARV
          </label>
          <input
            id="ff-sell-pct"
            type="number"
            min={0}
            max={100}
            step={0.5}
            className={inputClass}
            value={sellingCostsPercent}
            onChange={(e) => setSellingCostsPercent(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="ff-carry">
            Carrying costs / mo
          </label>
          <input
            id="ff-carry"
            type="number"
            min={0}
            step={25}
            className={inputClass}
            value={monthlyCarryingCosts}
            onChange={(e) => setMonthlyCarryingCosts(e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const resultsContent = (
    <div>
      <h3 className="text-sm font-semibold text-foreground">Results</h3>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <CalculatorMetric
          label="Net profit"
          value={formatCurrency(result.netProfit)}
          tone={getMonthlyCashFlowTone(result.netProfit)}
        />
        <CalculatorMetric
          label="Total ROI"
          value={`${result.roiPercent.toFixed(1)}%`}
          tone={getMonthlyCashFlowTone(result.roiPercent)}
        />
        <CalculatorMetric
          label="Annualized ROI"
          value={
            result.annualizedRoiPercent != null ? `${result.annualizedRoiPercent.toFixed(1)}%` : "—"
          }
          helper={result.holdMonths < 1 ? "Add hold months to annualize" : undefined}
          tone={getCapRateTone()}
        />
        <CalculatorMetric
          label="Cash-on-cash (total)"
          value={`${result.cashOnCashReturnPercent.toFixed(1)}%`}
          tone={getCashOnCashTone(cocDecimal)}
        />
      </div>
      <p className="mt-3 text-xs text-muted">
        Cash in {formatCurrency(result.totalCashIn)} · Hold {result.holdMonths} mo · Selling costs{" "}
        {formatCurrency(result.sellingCosts)} · Net sale before payoff{" "}
        {formatCurrency(result.grossSaleProceeds)}
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
                placement="fix_flip_inline"
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
                  placement="fix_flip_inline"
                  ctaId="fix_flip_signup_investor"
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

  const holdM = Math.round(numberOrFallback(holdMonths, 0));

  const mobileSummaryItems = [
    {
      label: "Net profit",
      value: formatCurrency(result.netProfit),
      tone: getMonthlyCashFlowTone(result.netProfit),
    },
    {
      label: "ROI",
      value: `${result.roiPercent.toFixed(1)}%`,
      tone: getMonthlyCashFlowTone(result.roiPercent),
    },
    {
      label: "Ann. ROI",
      value: result.annualizedRoiPercent != null ? `${result.annualizedRoiPercent.toFixed(1)}%` : "—",
      tone: "default" as const,
    },
    {
      label: "Hold (mo)",
      value: String(holdM),
      tone: "default" as const,
    },
  ];

  const mobileSurface = (
    <div className="space-y-0">
      <MobilePageSection title="Deal" variant="grouped">
        <div className="grid grid-cols-2 gap-3 rounded-lg bg-subtle/40 p-4">
          <div className="col-span-2">
            <label className={labelClass} htmlFor="ff-purchase-m">
              Purchase
            </label>
            <input
              id="ff-purchase-m"
              type="number"
              min={0}
              step={1000}
              className={inputClass}
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="ff-rehab-m">
              Rehab
            </label>
            <input
              id="ff-rehab-m"
              type="number"
              min={0}
              step={500}
              className={inputClass}
              value={rehabCost}
              onChange={(e) => setRehabCost(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="ff-arv-m">
              ARV
            </label>
            <input
              id="ff-arv-m"
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
        <MobileCollapsible label="Financing & hold">
          <div className="grid grid-cols-2 gap-3 rounded-lg bg-subtle/40 p-3 pt-6">
            <div>
              <label className={labelClass} htmlFor="ff-hold-m">
                Hold mo
              </label>
              <input
                id="ff-hold-m"
                type="number"
                min={0}
                max={120}
                className={inputClass}
                value={holdMonths}
                onChange={(e) => setHoldMonths(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="ff-down-m">
                Down %
              </label>
              <input
                id="ff-down-m"
                type="number"
                min={0}
                max={100}
                className={inputClass}
                value={downPaymentPercent}
                onChange={(e) => setDownPaymentPercent(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <label className={labelClass} htmlFor="ff-rate-m">
                Loan rate % (IO)
              </label>
              <input
                id="ff-rate-m"
                type="number"
                min={0}
                max={50}
                step={0.1}
                className={inputClass}
                value={purchaseLoanRatePercent}
                onChange={(e) => setPurchaseLoanRatePercent(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="ff-sell-m">
                Sell % ARV
              </label>
              <input
                id="ff-sell-m"
                type="number"
                min={0}
                max={100}
                step={0.5}
                className={inputClass}
                value={sellingCostsPercent}
                onChange={(e) => setSellingCostsPercent(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="ff-carry-m">
                Carry / mo
              </label>
              <input
                id="ff-carry-m"
                type="number"
                min={0}
                className={inputClass}
                value={monthlyCarryingCosts}
                onChange={(e) => setMonthlyCarryingCosts(e.target.value)}
              />
            </div>
          </div>
        </MobileCollapsible>
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
              placement="fix_flip_inline"
              ctaId="get_started_free"
              planIntent="free"
              landingVariant={landingVariant}
              className={appCtaClassFullWidth}
            >
              Create a free account
            </FunnelCtaLink>
            <FunnelCtaLink
              href="/sign-up?intent=investor"
              placement="fix_flip_inline"
              ctaId="fix_flip_signup_investor_m"
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
    <section className="border-0 bg-transparent p-0 shadow-none md:rounded-xl md:border md:border-border md:bg-card md:p-5 md:shadow-sm">
      <div className="md:hidden">
        <MobileToolShell
          eyebrow="Calculator"
          title="Fix and flip"
          description="Purchase, rehab, hold with IO financing, then sell at ARV. See profit and return on cash invested."
          context={
            <p className="text-sm text-muted">
              Net profit {formatCurrency(result.netProfit)} · Cash in {formatCurrency(result.totalCashIn)}
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
