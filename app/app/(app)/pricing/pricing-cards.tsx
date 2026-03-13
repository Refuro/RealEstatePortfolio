"use client";

import { useState } from "react";
import { PLAN_PROPERTY_LIMITS } from "@/lib/plans";

type PlanTier = keyof typeof PLAN_PROPERTY_LIMITS;

const PLANS: {
  tier: PlanTier;
  name: string;
  limit: number;
  description: string;
  price?: string;
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
    price: "Monthly",
  },
  {
    tier: "pro",
    name: "Pro",
    limit: PLAN_PROPERTY_LIMITS.pro,
    description: "Track up to 20 properties.",
    price: "Monthly",
  },
];

export function PricingCards({
  currentTier,
  className = "",
}: {
  currentTier: string;
  className?: string;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade(plan: "investor" | "pro") {
    setError(null);
    setLoading(plan);
    try {
      const res = await fetch("/api/billing/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
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

  return (
    <div className={`grid gap-6 sm:grid-cols-3 ${className}`}>
      {PLANS.map((plan) => {
        const isCurrent =
          currentTier.toLowerCase() === plan.tier;
        const canUpgrade =
          (plan.tier === "investor" || plan.tier === "pro") &&
          !isCurrent;

        return (
          <div
            key={plan.tier}
            className={`rounded-lg border bg-white p-6 shadow-sm ${
              isCurrent
                ? "border-emerald-500 ring-1 ring-emerald-500"
                : "border-zinc-200"
            }`}
          >
            <h2 className="text-lg font-semibold text-zinc-900">{plan.name}</h2>
            <p className="mt-1 text-sm text-zinc-600">{plan.description}</p>
            <p className="mt-2 font-medium text-zinc-900">
              {plan.limit} {plan.limit === 1 ? "property" : "properties"}
            </p>
            {plan.price && (
              <p className="mt-1 text-sm text-zinc-500">{plan.price}</p>
            )}
            <div className="mt-4">
              {plan.tier === "free" && (
                <span className="inline-block rounded-md bg-zinc-100 px-3 py-1.5 text-sm text-zinc-600">
                  {isCurrent ? "Current plan" : "Default"}
                </span>
              )}
              {canUpgrade && (
                <button
                  type="button"
                  onClick={() => handleUpgrade(plan.tier as "investor" | "pro")}
                  disabled={!!loading}
                  className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
                >
                  {loading === plan.tier ? "Redirecting…" : "Upgrade"}
                </button>
              )}
              {isCurrent && plan.tier !== "free" && (
                <span className="inline-block rounded-md bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700">
                  Current plan
                </span>
              )}
            </div>
          </div>
        );
      })}
      {error && (
        <p className="col-span-full text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
