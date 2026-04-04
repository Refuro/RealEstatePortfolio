"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import { MobileCollapsible } from "@/components/mobile-collapsible";
import { PLAN_DEAL_LIMITS, PLAN_PROPERTY_LIMITS } from "@/lib/plans";
import { PRICING_DISPLAY, getAnnualSavings } from "@/lib/pricing-display";
import { captureClientEvent } from "@/lib/analytics-client";
import { AnalyticsEvents } from "@/lib/analytics-events";
import { getPlanIntentForAnalytics, setPlanIntent } from "@/lib/plan-intent";

type PlanTier = keyof typeof PLAN_PROPERTY_LIMITS;
type BillingCycle = "monthly" | "yearly";

const PLANS: {
  tier: PlanTier;
  name: string;
  propertyLimit: number;
  dealLimit: number;
  description: string;
  features: string[];
  publicBestFor: string;
  publicFeatures: string[];
}[] = [
  {
    tier: "free",
    name: "Free",
    propertyLimit: PLAN_PROPERTY_LIMITS.free,
    dealLimit: PLAN_DEAL_LIMITS.free,
    description: "1 property · 5 saved deals",
    features: [
      "Track one property with full metrics",
      "Analyze and save up to 5 deals",
      "Modeling and mortgage workspaces included",
    ],
    publicBestFor: "Best for first-time rental analysis",
    publicFeatures: [
      "Launch your first property dashboard quickly",
      "Analyze deals before you buy",
      "Use modeling and mortgage tools from day one",
    ],
  },
  {
    tier: "investor",
    name: "Investor",
    propertyLimit: PLAN_PROPERTY_LIMITS.investor,
    dealLimit: PLAN_DEAL_LIMITS.investor,
    description: "5 properties · 20 saved deals",
    features: [
      "Track up to 5 properties",
      "Save up to 20 analyzed deals",
      "Best fit for active small portfolios",
    ],
    publicBestFor: "Best for active small portfolios",
    publicFeatures: [
      "Manage multiple rentals without spreadsheet sprawl",
      "Compare more deals as you grow",
      "Keep financing assumptions centralized",
    ],
  },
  {
    tier: "pro",
    name: "Pro",
    propertyLimit: PLAN_PROPERTY_LIMITS.pro,
    dealLimit: PLAN_DEAL_LIMITS.pro,
    description: "20 properties · 50 saved deals",
    features: [
      "Track up to 20 properties",
      "Save up to 50 analyzed deals",
      "Designed for serious portfolio operators",
    ],
    publicBestFor: "Best for scaling operators and partners",
    publicFeatures: [
      "Operate a larger portfolio with cleaner visibility",
      "Stress-test acquisitions and debt strategy faster",
      "Consolidate analysis across properties",
    ],
  },
];

export function PricingCards({
  currentTier,
  className = "",
  showSignUp = false,
  /** Same-origin path for Stripe Customer Portal `return_url` after plan changes. */
  billingPortalReturnPath = "/plans",
  /**
   * When provided, initialises the billing cycle toggle to match the user's
   * active subscription interval. Prevents a yearly subscriber from seeing
   * monthly prices highlighted as "Current plan".
   */
  currentBillingCycle,
}: {
  currentTier: string;
  className?: string;
  /** When true, show "Sign up" link instead of "Upgrade" (for unauthenticated visitors). */
  showSignUp?: boolean;
  billingPortalReturnPath?: string;
  currentBillingCycle?: "monthly" | "yearly" | null;
}) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(
    currentBillingCycle ?? "monthly"
  );
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const signedInMode = !showSignUp;

  function getPortalErrorMessage(raw: string): string {
    const msg = raw.toLowerCase();
    if (msg.includes("unauthorized")) {
      return "Please sign in again to manage billing.";
    }
    if (msg.includes("network") || msg.includes("fetch")) {
      return "Network issue while opening billing. Check your connection and retry.";
    }
    if (msg.includes("no billing customer") || msg.includes("subscribe first")) {
      return "No billing profile found yet. Choose a paid plan below to subscribe, or contact support.";
    }
    if (msg.includes("no portal url")) {
      return "Billing portal did not return a redirect URL. Please try again.";
    }
    return "Couldn't open billing portal right now. Please retry in a moment.";
  }

  function getCheckoutErrorMessage(raw: string): string {
    const msg = raw.toLowerCase();
    if (msg.includes("unauthorized")) {
      return "You need to sign in again before starting checkout.";
    }
    if (msg.includes("network") || msg.includes("fetch")) {
      return "Network issue while opening checkout. Check your connection and retry.";
    }
    if (msg.includes("no checkout url")) {
      return "Checkout session was created but no redirect URL was returned. Please try again.";
    }
    if (msg.includes("already have a subscription")) {
      return "You already have a subscription. Use Manage billing on this page or in Settings to change your plan.";
    }
    if (msg.includes("stripe")) {
      return "Billing provider is temporarily unavailable. Please retry in a moment.";
    }
    return "We couldn't open checkout right now. Please try again.";
  }

  async function handleOpenBillingPortalForPlanChange(
    targetPlan: "investor" | "pro",
    targetBillingCycle?: BillingCycle,
  ) {
    setError(null);
    // Use plan-specific loading key so each card button shows its own state.
    setLoading("portal_" + targetPlan);
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          returnPath: billingPortalReturnPath,
          targetPlan,
          targetBillingCycle: targetBillingCycle ?? billingCycle,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to open portal");
      if (data.url) {
        captureClientEvent(AnalyticsEvents.BILLING_PORTAL_OPENED, {
          placement: "pricing_cards",
          intent: "plan_change",
          target_plan: targetPlan,
          target_billing_cycle: targetBillingCycle ?? billingCycle,
        });
        window.location.href = data.url;
      } else throw new Error("No portal URL returned");
    } catch (e) {
      const raw = e instanceof Error ? e.message : "Something went wrong";
      setError(getPortalErrorMessage(raw));
      setLoading(null);
    }
  }

  async function handleCheckoutUpgrade(plan: "investor" | "pro") {
    setError(null);
    setLoading(plan);
    try {
      const res = await fetch("/api/billing/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, billingCycle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      if (data.url) {
        const pi = getPlanIntentForAnalytics();
        captureClientEvent(AnalyticsEvents.CHECKOUT_STARTED, {
          plan,
          billing_cycle: billingCycle,
          plan_intent: pi.plan_intent,
          plan_intent_source: pi.plan_intent_source,
        });
        window.location.href = data.url;
      } else throw new Error("No checkout URL returned");
    } catch (e) {
      const raw = e instanceof Error ? e.message : "Something went wrong";
      setError(getCheckoutErrorMessage(raw));
      setLoading(null);
    }
  }

  function handlePaidOrFreeUpgrade(plan: "investor" | "pro") {
    const tier = currentTier.toLowerCase();
    const isPaidTier = tier === "investor" || tier === "pro";
    if (isPaidTier) {
      void handleOpenBillingPortalForPlanChange(plan);
      return;
    }
    void handleCheckoutUpgrade(plan);
  }

  const investorSavings = getAnnualSavings("investor");
  const proSavings = getAnnualSavings("pro");
  const maxAnnualSavings = Math.max(investorSavings, proSavings);

  return (
    <div className={className}>
      <div className="mb-10">
        <div className="mx-auto flex w-full max-w-md items-center rounded-lg border border-border bg-card p-1 md:w-fit">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              billingCycle === "monthly"
                ? "bg-accent text-accent-foreground"
                : "text-muted hover:bg-subtle hover:text-foreground"
            } flex-1 md:flex-none`}
          >
            Monthly billing
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("yearly")}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              billingCycle === "yearly"
                ? "bg-accent text-accent-foreground"
                : "text-muted hover:bg-subtle hover:text-foreground"
            } flex-1 md:flex-none`}
          >
            <span className="inline-flex items-center gap-1.5">
              Annual billing
              {billingCycle !== "yearly" && (
                <span className="rounded-full bg-positive/15 px-1.5 py-0.5 text-[10px] font-semibold text-positive">
                  Save
                </span>
              )}
            </span>
          </button>
        </div>
        <p className="mt-2 text-center text-sm text-muted">
          {billingCycle === "yearly" ? (
            <>
              Annual billing active. Investor saves{" "}
              <span className="font-medium text-positive">${investorSavings}/yr</span>{" "}
              and Pro saves{" "}
              <span className="font-medium text-positive">${proSavings}/yr</span>.
            </>
          ) : (
            <>
              Monthly billing active. Switch to annual and save up to{" "}
              <span className="font-medium text-positive">${maxAnnualSavings}/yr</span>.
            </>
          )}
        </p>
      </div>
      <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
      {PLANS.map((plan) => {
        // Same tier as the user's active subscription.
        const isSameTier = !!(currentTier && currentTier.toLowerCase() === plan.tier);

        // "Current plan" = same tier AND the displayed billing cycle matches the
        // user's active cycle (or we don't know their cycle yet — old DB rows).
        const isCurrent =
          isSameTier && (!currentBillingCycle || billingCycle === currentBillingCycle);

        // Same tier, but viewing the other billing cycle in the toggle.
        // Show a portal button to let them switch monthly ↔ annual.
        const canSwitchCycle =
          signedInMode &&
          isSameTier &&
          !!currentBillingCycle &&
          billingCycle !== currentBillingCycle &&
          plan.tier !== "free";

        // Cross-tier upgrade (investor ↔ pro, or free → paid).
        const canUpgrade =
          (plan.tier === "investor" || plan.tier === "pro") && !isSameTier;

        const highlightInvestor = signedInMode && currentTier.toLowerCase() === "free" && plan.tier === "investor";
        const cardBorder = isCurrent
          ? "border-positive ring-1 ring-positive/60"
          : highlightInvestor
            ? "border-accent/50 ring-2 ring-accent/25 bg-accent/5"
            : "border-border";
        const annualSavingsForPlan =
          plan.tier === "investor"
            ? investorSavings
            : plan.tier === "pro"
              ? proSavings
              : 0;
        const annualPriceForPlan =
          plan.tier === "investor"
            ? PRICING_DISPLAY.investorYearly
            : plan.tier === "pro"
              ? PRICING_DISPLAY.proYearly
              : null;

        return (
          <div
            key={plan.tier}
            className={`flex flex-col rounded-xl border bg-card p-4 shadow-sm md:p-5 ${cardBorder}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-foreground">{plan.name}</h2>
                <p className="mt-1 hidden text-sm text-muted md:block">{plan.description}</p>
                {showSignUp && (
                  <p className="mt-2 text-xs font-medium text-foreground/90">
                    {plan.publicBestFor}
                  </p>
                )}
              </div>
              {isCurrent && (
                <span className="rounded-md bg-positive/10 px-2 py-0.5 text-xs font-medium text-positive">
                  Current plan
                </span>
              )}
              {highlightInvestor && (
                <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
                  Recommended
                </span>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-border bg-subtle px-2.5 py-1 text-muted">
                {plan.propertyLimit} {plan.propertyLimit === 1 ? "property" : "properties"}
              </span>
              <span className="rounded-full border border-border bg-subtle px-2.5 py-1 text-muted">
                {plan.dealLimit} saved deals
              </span>
            </div>
            {plan.tier === "free" && (
              <p className="mt-3 text-xl font-semibold tabular-nums text-foreground">
                $0<span className="ml-0.5 text-base font-medium text-muted">/mo</span>
              </p>
            )}
            {plan.tier === "investor" && (
              <p className="mt-3 text-xl font-semibold tabular-nums text-foreground">
                <span className={billingCycle === "yearly" ? "text-positive" : ""}>
                  $
                  {billingCycle === "monthly"
                    ? PRICING_DISPLAY.investorMonthly
                    : PRICING_DISPLAY.investorYearly}
                </span>
                <span className="ml-0.5 text-base font-medium text-muted">
                  {billingCycle === "monthly" ? "/mo" : "/yr"}
                </span>
              </p>
            )}
            {plan.tier === "pro" && (
              <p className="mt-3 text-xl font-semibold tabular-nums text-foreground">
                <span className={billingCycle === "yearly" ? "text-positive" : ""}>
                  $
                  {billingCycle === "monthly"
                    ? PRICING_DISPLAY.proMonthly
                    : PRICING_DISPLAY.proYearly}
                </span>
                <span className="ml-0.5 text-base font-medium text-muted">
                  {billingCycle === "monthly" ? "/mo" : "/yr"}
                </span>
              </p>
            )}
            {billingCycle === "monthly" && annualPriceForPlan && (
              <p className="mt-1 text-xs text-muted">
                or ${annualPriceForPlan}/yr (
                <span className="font-medium text-positive">
                  save ${annualSavingsForPlan}/yr
                </span>
                )
              </p>
            )}
            {billingCycle === "yearly" && annualSavingsForPlan > 0 && (
              <p className="mt-2 inline-flex rounded-md border border-positive/35 bg-positive/10 px-2 py-0.5 text-xs font-medium text-positive">
                Save ${annualSavingsForPlan}/yr
              </p>
            )}
            <ul className="mt-4 hidden space-y-1.5 text-sm text-muted md:block">
              {(showSignUp ? plan.publicFeatures : plan.features).map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-positive" aria-hidden="true" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 md:hidden">
              <MobileCollapsible label="What&apos;s included">
                <ul className="space-y-1.5 text-sm text-muted">
                  {(showSignUp ? plan.publicFeatures : plan.features).map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-positive" aria-hidden="true" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </MobileCollapsible>
            </div>
            <div className="mt-auto pt-5">
              {plan.tier === "free" && !showSignUp && isCurrent && (
                <span className="inline-flex w-full items-center justify-center rounded-md bg-subtle px-3 py-2 text-sm text-muted md:w-auto">
                  Current plan
                </span>
              )}
              {plan.tier === "free" && showSignUp && (
                <Link
                  href="/sign-up?intent=free"
                  className="inline-flex w-full items-center justify-center rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover md:w-auto"
                  onClick={() => setPlanIntent("free", "pricing_card")}
                >
                  Choose Free
                </Link>
              )}
              {canUpgrade && showSignUp && (
                <Link
                  href={
                    plan.tier === "investor"
                      ? "/sign-up?intent=investor"
                      : "/sign-up?intent=pro"
                  }
                  className="inline-flex w-full items-center justify-center rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover md:w-auto"
                  onClick={() =>
                    setPlanIntent(
                      plan.tier === "investor" ? "investor" : "pro",
                      "pricing_card"
                    )
                  }
                >
                  {plan.tier === "investor" ? "Choose Investor" : "Choose Pro"}
                </Link>
              )}
              {canUpgrade && !showSignUp && (
                <button
                  type="button"
                  onClick={() =>
                    handlePaidOrFreeUpgrade(plan.tier as "investor" | "pro")
                  }
                  disabled={!!loading}
                  className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover disabled:opacity-50 md:w-auto"
                >
                  {signedInMode &&
                  (currentTier.toLowerCase() === "investor" ||
                    currentTier.toLowerCase() === "pro")
                    ? loading === "portal_" + plan.tier
                      ? "Opening…"
                      : plan.tier === "investor"
                        ? "Switch to Investor"
                        : "Switch to Pro"
                    : loading === plan.tier
                      ? "Redirecting…"
                      : plan.tier === "investor"
                        ? "Choose Investor"
                        : "Choose Pro"}
                </button>
              )}
              {isCurrent && plan.tier !== "free" && (
                <span className="inline-flex w-full items-center justify-center rounded-md bg-positive/10 px-3 py-2 text-sm text-positive md:w-auto">
                  Current plan
                </span>
              )}
              {canSwitchCycle && (
                <button
                  type="button"
                  onClick={() =>
                    handleOpenBillingPortalForPlanChange(
                      plan.tier as "investor" | "pro",
                      billingCycle,
                    )
                  }
                  disabled={!!loading}
                  className="w-full rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover disabled:opacity-50 md:w-auto"
                >
                  {loading === "portal_" + plan.tier
                    ? "Opening…"
                    : billingCycle === "yearly"
                      ? "Switch to annual"
                      : "Switch to monthly"}
                </button>
              )}
            </div>
            {signedInMode && !isCurrent && canUpgrade && (
              <p className="mt-2 text-xs text-muted">
                {currentTier.toLowerCase() === "free"
                  ? "Upgrades open checkout in a new Stripe session."
                  : "Plan changes use Stripe's billing portal so you keep one subscription."}
              </p>
            )}
            {signedInMode && canSwitchCycle && (
              <p className="mt-2 text-xs text-muted">
                Billing cycle changes use Stripe&apos;s billing portal. Your plan stays the same.
              </p>
            )}
          </div>
        );
      })}
      {error && (
        <div
          className="col-span-full rounded-md border border-negative/30 bg-negative/10 p-3 text-sm"
          role="alert"
        >
          <p className="font-medium text-negative">{error}</p>
          <p className="mt-1 text-muted">
            If this keeps happening, refresh and try again, or use billing management in Settings.
          </p>
          <button
            type="button"
            onClick={() => setError(null)}
            className="mt-2 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground transition-colors duration-150 hover:bg-subtle"
          >
            Dismiss
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
