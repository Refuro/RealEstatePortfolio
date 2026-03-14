"use client";

import { useState } from "react";
import { PLAN_PROPERTY_LIMITS } from "@/lib/plans";
import { PRICING_DISPLAY, getAnnualSavings } from "@/lib/pricing-display";

type PlanTier = keyof typeof PLAN_PROPERTY_LIMITS;
type BillingCycle = "monthly" | "yearly";

const PLANS: {
  tier: PlanTier;
  name: string;
  limit: number;
  description: string;
}[] = [
  {
    tier: "free",
    name: "Free",
    limit: PLAN_PROPERTY_LIMITS.free,
    description: "Get started with one property.",
  },
  {
    tier: "investor",
    name: "Investor",
    limit: PLAN_PROPERTY_LIMITS.investor,
    description: "Track up to 5 properties.",
  },
  {
    tier: "pro",
    name: "Pro",
    limit: PLAN_PROPERTY_LIMITS.pro,
    description: "Track up to 20 properties.",
  },
];

export function PricingCards({
  currentTier,
  className = "",
}: {
  currentTier: string;
  className?: string;
}) {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      if (data.url) window.location.href = data.url;
      else throw new Error("No checkout URL returned");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(null);
    }
  }

  const investorSavings = getAnnualSavings("investor");

  return (
    <div className={className}>
      <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setBillingCycle("monthly")}
          className={`rounded-md px-3 py-1.5 text-base font-medium transition-colors ${
            billingCycle === "monthly"
              ? "bg-accent text-accent-foreground"
              : "text-muted hover:bg-subtle"
          }`}
        >
          Monthly ${PRICING_DISPLAY.investorMonthly}
        </button>
        <button
          type="button"
          role="switch"
          aria-checked={billingCycle === "yearly"}
          onClick={() =>
            setBillingCycle((c) => (c === "monthly" ? "yearly" : "monthly"))
          }
          className="relative h-6 w-11 shrink-0 rounded-full bg-border transition-colors focus:outline-none focus:ring-2 focus:ring-accent/20"
          style={{
            backgroundColor: billingCycle === "yearly" ? "var(--accent)" : "var(--border)",
          }}
        >
          <span
            className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
            style={{
              transform: billingCycle === "yearly" ? "translateX(20px)" : "translateX(0)",
            }}
          />
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setBillingCycle("yearly")}
            className={`rounded-md px-3 py-1.5 text-base font-medium transition-colors ${
              billingCycle === "yearly"
                ? "bg-accent text-accent-foreground"
                : "text-muted hover:bg-subtle"
            }`}
          >
            Annual ${PRICING_DISPLAY.investorYearly}
            {investorSavings > 0 && (
              <span className="ml-1.5 text-sm">(Save ${investorSavings})</span>
            )}
          </button>
          <span className="rounded-md bg-positive/10 px-2 py-0.5 text-xs font-medium text-positive">
            Best value
          </span>
        </div>
      </div>
      <div className="mx-auto grid max-w-5xl xl:max-w-6xl gap-8 sm:grid-cols-3">
      {PLANS.map((plan) => {
        const isCurrent =
          currentTier.toLowerCase() === plan.tier;
        const canUpgrade =
          (plan.tier === "investor" || plan.tier === "pro") &&
          !isCurrent;

        return (
          <div
            key={plan.tier}
            className={`rounded-lg border bg-card p-8 ${
              isCurrent ? "border-positive ring-1 ring-positive" : "border-border"
            }`}
          >
            <h2 className="text-xl font-semibold text-foreground">{plan.name}</h2>
            <p className="mt-2 text-base text-muted">{plan.description}</p>
            <p className="mt-2 font-medium text-foreground">
              {plan.limit} {plan.limit === 1 ? "property" : "properties"}
            </p>
            {plan.tier === "free" && (
              <p className="mt-2 text-lg font-semibold text-foreground">Default</p>
            )}
            {plan.tier === "investor" && (
              <p className="mt-2 text-lg font-semibold text-foreground">
                {billingCycle === "monthly"
                  ? `$${PRICING_DISPLAY.investorMonthly}/mo`
                  : `$${PRICING_DISPLAY.investorYearly}/yr`}
              </p>
            )}
            {plan.tier === "pro" && (
              <p className="mt-2 text-lg font-semibold text-foreground">
                {billingCycle === "monthly"
                  ? `$${PRICING_DISPLAY.proMonthly}/mo`
                  : `$${PRICING_DISPLAY.proYearly}/yr`}
              </p>
            )}
            <div className="mt-4">
              {plan.tier === "free" && (
                <span className="inline-block rounded-md bg-subtle px-3 py-1.5 text-sm text-muted">
                  {isCurrent ? "Current plan" : "Default"}
                </span>
              )}
              {canUpgrade && (
                <button
                  type="button"
                  onClick={() => handleUpgrade(plan.tier as "investor" | "pro")}
                  disabled={!!loading}
                  className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover disabled:opacity-50"
                >
                  {loading === plan.tier ? "Redirecting…" : "Upgrade"}
                </button>
              )}
              {isCurrent && plan.tier !== "free" && (
                <span className="inline-block rounded-md bg-positive/10 px-3 py-1.5 text-sm text-positive">
                  Current plan
                </span>
              )}
            </div>
          </div>
        );
      })}
      {error && (
        <p className="col-span-full text-sm text-negative" role="alert">
          {error}
        </p>
      )}
      </div>
    </div>
  );
}
