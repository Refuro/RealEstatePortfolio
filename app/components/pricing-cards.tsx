"use client";

import Link from "next/link";
import { useState } from "react";
import { PLAN_DEAL_LIMITS, PLAN_PROPERTY_LIMITS } from "@/lib/plans";
import { PRICING_DISPLAY, getAnnualSavings } from "@/lib/pricing-display";
import { captureClientEvent } from "@/lib/analytics-client";
import { AnalyticsEvents } from "@/lib/analytics-events";

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
}: {
  currentTier: string;
  className?: string;
  /** When true, show "Sign up" link instead of "Upgrade" (for unauthenticated visitors). */
  showSignUp?: boolean;
}) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const signedInMode = !showSignUp;

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
    if (msg.includes("stripe")) {
      return "Billing provider is temporarily unavailable. Please retry in a moment.";
    }
    return "We couldn’t open checkout right now. Please try again.";
  }

  async function handleUpgrade(plan: "investor" | "pro") {
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
        captureClientEvent(AnalyticsEvents.CHECKOUT_STARTED, {
          plan,
          billing_cycle: billingCycle,
        });
        window.location.href = data.url;
      } else throw new Error("No checkout URL returned");
    } catch (e) {
      const raw = e instanceof Error ? e.message : "Something went wrong";
      setError(getCheckoutErrorMessage(raw));
      setLoading(null);
    }
  }

  const investorSavings = getAnnualSavings("investor");
  const proSavings = getAnnualSavings("pro");
  const maxAnnualSavings = Math.max(investorSavings, proSavings);

  return (
    <div className={className}>
      <div className="mb-10">
        <div className="mx-auto flex w-fit items-center rounded-lg border border-border/70 bg-card p-1">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              billingCycle === "monthly"
                ? "bg-accent text-accent-foreground"
                : "text-muted hover:bg-subtle hover:text-foreground"
            }`}
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
            }`}
          >
            <span>Annual billing</span>
            <span className="ml-1 rounded-full bg-positive/15 px-1.5 py-0.5 text-[10px] font-semibold text-positive">
              Save
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
      <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-3">
      {PLANS.map((plan) => {
        const isCurrent =
          currentTier && currentTier.toLowerCase() === plan.tier;
        const canUpgrade =
          (plan.tier === "investor" || plan.tier === "pro") &&
          !isCurrent;
        const highlightInvestor = signedInMode && currentTier.toLowerCase() === "free" && plan.tier === "investor";
        const cardBorder = isCurrent
          ? "border-positive ring-1 ring-positive/60"
          : highlightInvestor
            ? "border-accent/60 ring-1 ring-accent/30"
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
            className={`rounded-xl border bg-card/95 p-5 shadow-sm ${cardBorder}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-foreground">{plan.name}</h2>
                <p className="mt-1 text-sm text-muted">{plan.description}</p>
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
                <span className="rounded-md bg-accent/10 px-2 py-0.5 text-xs font-medium text-foreground">
                  Recommended next
                </span>
              )}
            </div>
            {plan.tier === "free" && (
              <p className="mt-3 text-xl font-semibold text-foreground">Free</p>
            )}
            {plan.tier === "investor" && (
              <p className="mt-3 text-xl font-semibold text-foreground">
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
              <p className="mt-3 text-xl font-semibold text-foreground">
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
            <ul className="mt-4 space-y-1.5 text-sm text-muted">
              {(showSignUp ? plan.publicFeatures : plan.features).map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-border" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5">
              {plan.tier === "free" && !showSignUp && (
                <span className="inline-block rounded-md bg-subtle px-3 py-1.5 text-sm text-muted">
                  {isCurrent ? "Current plan" : "Default"}
                </span>
              )}
              {plan.tier === "free" && showSignUp && (
                <Link
                  href="/sign-up"
                  className="inline-block rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
                >
                  Choose Free
                </Link>
              )}
              {canUpgrade && showSignUp && (
                <Link
                  href="/sign-up"
                  className="inline-block rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
                >
                  {plan.tier === "investor" ? "Choose Investor" : "Choose Pro"}
                </Link>
              )}
              {canUpgrade && !showSignUp && (
                <button
                  type="button"
                  onClick={() => handleUpgrade(plan.tier as "investor" | "pro")}
                  disabled={!!loading}
                  className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover disabled:opacity-50"
                >
                  {loading === plan.tier
                    ? "Redirecting…"
                    : plan.tier === "investor"
                      ? "Choose Investor"
                      : "Choose Pro"}
                </button>
              )}
              {isCurrent && plan.tier !== "free" && (
                <span className="inline-block rounded-md bg-positive/10 px-3 py-1.5 text-sm text-positive">
                  Current plan
                </span>
              )}
            </div>
            {signedInMode && !isCurrent && canUpgrade && (
              <p className="mt-2 text-xs text-muted">
                Upgrades open checkout in a new Stripe session.
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
            className="mt-2 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-subtle"
          >
            Dismiss
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
