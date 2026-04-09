"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { MobileCollapsible } from "@/components/mobile-collapsible";
import { MobilePageSection } from "@/components/mobile-page-section";
import { MobileToolShell } from "@/components/mobile-tool-shell";
import { CalculatorMetric } from "@/components/calculators/calculator-metric";
import { FunnelCtaLink } from "@/components/marketing/funnel-cta-link";
import { getMonthlyCashFlowTone } from "@/lib/calculator-metric-tones";
import { formatCurrency } from "@/lib/format-currency";
import { computeWholesaleResult } from "@/lib/wholesale-calculator";

type WholesaleCalculatorProps = {
  compact?: boolean;
  showCta?: boolean;
  landingVariant?: string;
  surface?: "marketing" | "app";
  initialArv?: number;
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
  arv: "250000",
  estimatedRepairs: "35000",
  assignmentFee: "10000",
  buyerClosingCosts: "3000",
  sellerClosingCosts: "5000",
  monthlyHoldingCosts: "800",
  holdMonths: "3",
  arvMultiplierPercent: "70",
};

export function WholesaleCalculator({
  compact = false,
  showCta = false,
  landingVariant,
  surface = "marketing",
  initialArv,
}: WholesaleCalculatorProps) {
  const { user } = useUser();
  const isSignedIn = Boolean(user?.id);
  const isAppShell = surface === "app";

  const [arv, setArv] = useState(initialArv != null ? String(initialArv) : DEFAULTS.arv);
  const [estimatedRepairs, setEstimatedRepairs] = useState(DEFAULTS.estimatedRepairs);
  const [assignmentFee, setAssignmentFee] = useState(DEFAULTS.assignmentFee);
  const [buyerClosingCosts, setBuyerClosingCosts] = useState(DEFAULTS.buyerClosingCosts);
  const [sellerClosingCosts, setSellerClosingCosts] = useState(DEFAULTS.sellerClosingCosts);
  const [monthlyHoldingCosts, setMonthlyHoldingCosts] = useState(DEFAULTS.monthlyHoldingCosts);
  const [holdMonths, setHoldMonths] = useState(DEFAULTS.holdMonths);
  const [arvMultiplierPercent, setArvMultiplierPercent] = useState(DEFAULTS.arvMultiplierPercent);

  const result = useMemo(
    () =>
      computeWholesaleResult({
        arv: numberOrFallback(arv, 0),
        estimatedRepairs: numberOrFallback(estimatedRepairs, 0),
        assignmentFee: numberOrFallback(assignmentFee, 0),
        buyerClosingCosts: numberOrFallback(buyerClosingCosts, 0),
        sellerClosingCosts: numberOrFallback(sellerClosingCosts, 0),
        monthlyHoldingCosts: numberOrFallback(monthlyHoldingCosts, 0),
        holdMonths: numberOrFallback(holdMonths, 3),
        arvMultiplier: numberOrFallback(arvMultiplierPercent, 70) / 100,
      }),
    [
      arv,
      estimatedRepairs,
      assignmentFee,
      buyerClosingCosts,
      sellerClosingCosts,
      monthlyHoldingCosts,
      holdMonths,
      arvMultiplierPercent,
    ]
  );

  const maoPercentDisplay =
    result.maoAsPercentArv != null ? `${(result.maoAsPercentArv * 100).toFixed(1)}%` : "—";

  const inputClass =
    "mt-1 block min-h-[44px] w-full rounded-md border border-border bg-background px-3 py-2 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-accent/20";
  const labelClass = "block text-xs font-medium text-muted";

  const inputsContent = (
    <div>
      <h2 className="text-base font-semibold text-foreground">Wholesale / MAO calculator</h2>
      <p className="mt-1 text-sm text-muted">
        Use the 70% rule baseline to estimate maximum allowable offer and assignment economics.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="wh-arv">
            ARV
          </label>
          <input
            id="wh-arv"
            type="number"
            min={0}
            step={1000}
            className={inputClass}
            value={arv}
            onChange={(e) => setArv(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="wh-repairs">
            Estimated repairs
          </label>
          <input
            id="wh-repairs"
            type="number"
            min={0}
            step={500}
            className={inputClass}
            value={estimatedRepairs}
            onChange={(e) => setEstimatedRepairs(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="wh-assignment">
            Assignment fee
          </label>
          <input
            id="wh-assignment"
            type="number"
            min={0}
            step={500}
            className={inputClass}
            value={assignmentFee}
            onChange={(e) => setAssignmentFee(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="wh-buyer-close">
            Buyer closing costs
          </label>
          <input
            id="wh-buyer-close"
            type="number"
            min={0}
            step={250}
            className={inputClass}
            value={buyerClosingCosts}
            onChange={(e) => setBuyerClosingCosts(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="wh-seller-close">
            Seller closing costs
          </label>
          <input
            id="wh-seller-close"
            type="number"
            min={0}
            step={250}
            className={inputClass}
            value={sellerClosingCosts}
            onChange={(e) => setSellerClosingCosts(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="wh-holding">
            Holding costs / mo
          </label>
          <input
            id="wh-holding"
            type="number"
            min={0}
            step={50}
            className={inputClass}
            value={monthlyHoldingCosts}
            onChange={(e) => setMonthlyHoldingCosts(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="wh-hold-months">
            Hold months
          </label>
          <input
            id="wh-hold-months"
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
          <label className={labelClass} htmlFor="wh-multiplier">
            ARV multiplier %
          </label>
          <input
            id="wh-multiplier"
            type="number"
            min={0}
            max={150}
            step={1}
            className={inputClass}
            value={arvMultiplierPercent}
            onChange={(e) => setArvMultiplierPercent(e.target.value)}
          />
          <p className="mt-1 text-[11px] text-muted">
            70% rule is the common wholesale baseline - adjust for your market.
          </p>
        </div>
      </div>
    </div>
  );

  const resultsContent = (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Results</h3>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <CalculatorMetric
            label="Maximum allowable offer (MAO)"
            value={formatCurrency(result.mao)}
            helper={result.mao < 0 ? "Deal doesn't work at these numbers" : undefined}
            tone={getMonthlyCashFlowTone(result.mao)}
          />
          <CalculatorMetric label="MAO as % of ARV" value={maoPercentDisplay} />
          <CalculatorMetric label="Assignment fee" value={formatCurrency(result.wholesalerNetProfit)} />
          <CalculatorMetric
            label="End buyer equity cushion"
            value={formatCurrency(result.endBuyerEquityCushion)}
            tone={getMonthlyCashFlowTone(result.endBuyerEquityCushion)}
          />
          <CalculatorMetric label="Total deal costs" value={formatCurrency(result.totalDealCosts)} />
          <CalculatorMetric label="Gross spread" value={formatCurrency(result.grossSpread)} />
        </div>
      </div>

      <p className="text-xs text-muted">
        MAO = (ARV × multiplier) − repairs − closing costs − holding costs − assignment fee.
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
                placement="wholesale_inline"
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
                  placement="wholesale_inline"
                  ctaId="wholesale_signup_investor"
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
    { label: "MAO", value: formatCurrency(result.mao), tone: getMonthlyCashFlowTone(result.mao) },
    { label: "Assignment fee", value: formatCurrency(result.wholesalerNetProfit), tone: "default" as const },
    { label: "MAO % ARV", value: maoPercentDisplay, tone: "default" as const },
  ];

  const mobileSurface = (
    <div className="space-y-0">
      <MobilePageSection title="Deal assumptions" variant="grouped">
        <div className="grid grid-cols-2 gap-3 rounded-lg bg-subtle/40 p-4">
          <div className="col-span-2">
            <label className={labelClass} htmlFor="wh-arv-m">
              ARV
            </label>
            <input
              id="wh-arv-m"
              type="number"
              min={0}
              step={1000}
              className={inputClass}
              value={arv}
              onChange={(e) => setArv(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="wh-repairs-m">
              Repairs
            </label>
            <input
              id="wh-repairs-m"
              type="number"
              min={0}
              step={500}
              className={inputClass}
              value={estimatedRepairs}
              onChange={(e) => setEstimatedRepairs(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="wh-assignment-m">
              Assignment fee
            </label>
            <input
              id="wh-assignment-m"
              type="number"
              min={0}
              step={500}
              className={inputClass}
              value={assignmentFee}
              onChange={(e) => setAssignmentFee(e.target.value)}
            />
          </div>
        </div>
      </MobilePageSection>

      <MobilePageSection variant="flat">
        <MobileCollapsible label="Costs & multiplier">
          <div className="grid grid-cols-2 gap-3 rounded-lg bg-subtle/40 p-3 pt-6">
            <div>
              <label className={labelClass} htmlFor="wh-buyer-close-m">
                Buyer closing
              </label>
              <input
                id="wh-buyer-close-m"
                type="number"
                min={0}
                step={250}
                className={inputClass}
                value={buyerClosingCosts}
                onChange={(e) => setBuyerClosingCosts(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="wh-seller-close-m">
                Seller closing
              </label>
              <input
                id="wh-seller-close-m"
                type="number"
                min={0}
                step={250}
                className={inputClass}
                value={sellerClosingCosts}
                onChange={(e) => setSellerClosingCosts(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="wh-holding-m">
                Holding / mo
              </label>
              <input
                id="wh-holding-m"
                type="number"
                min={0}
                step={50}
                className={inputClass}
                value={monthlyHoldingCosts}
                onChange={(e) => setMonthlyHoldingCosts(e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="wh-hold-months-m">
                Hold months
              </label>
              <input
                id="wh-hold-months-m"
                type="number"
                min={0}
                max={120}
                step={1}
                className={inputClass}
                value={holdMonths}
                onChange={(e) => setHoldMonths(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <label className={labelClass} htmlFor="wh-multiplier-m">
                ARV multiplier %
              </label>
              <input
                id="wh-multiplier-m"
                type="number"
                min={0}
                max={150}
                step={1}
                className={inputClass}
                value={arvMultiplierPercent}
                onChange={(e) => setArvMultiplierPercent(e.target.value)}
              />
              <p className="mt-1 text-[11px] text-muted">
                70% rule is the common wholesale baseline - adjust for your market.
              </p>
            </div>
          </div>
        </MobileCollapsible>
      </MobilePageSection>

      <MobilePageSection title="Results" variant="grouped">
        <div className="grid grid-cols-2 gap-2 p-4">
          <CalculatorMetric
            label="MAO"
            value={formatCurrency(result.mao)}
            helper={result.mao < 0 ? "Deal doesn't work at these numbers" : undefined}
            tone={getMonthlyCashFlowTone(result.mao)}
          />
          <CalculatorMetric label="MAO % ARV" value={maoPercentDisplay} />
          <CalculatorMetric label="Assign fee" value={formatCurrency(result.wholesalerNetProfit)} />
          <CalculatorMetric label="Equity cushion" value={formatCurrency(result.endBuyerEquityCushion)} />
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
              placement="wholesale_inline"
              ctaId="get_started_free"
              planIntent="free"
              landingVariant={landingVariant}
              className={appCtaClassFullWidth}
            >
              Create a free account
            </FunnelCtaLink>
            <FunnelCtaLink
              href="/sign-up?intent=investor"
              placement="wholesale_inline"
              ctaId="wholesale_signup_investor_m"
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
          title="Wholesale / MAO"
          description="Estimate maximum allowable offer, assignment fee, and equity cushion using an adjustable ARV multiplier."
          context={
            <p className="text-sm text-muted">
              MAO {formatCurrency(result.mao)} - Assignment {formatCurrency(result.wholesalerNetProfit)}
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
