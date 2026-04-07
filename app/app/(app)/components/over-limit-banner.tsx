"use client";

import { useState, useEffect } from "react";
import { UpgradePlanLink } from "@/components/analytics/upgrade-plan-link";
import { X } from "lucide-react";
import { PLAN_DEAL_LIMITS, PLAN_PROPERTY_LIMITS } from "@/lib/plans";

const STORAGE_KEY = "over-limit-banner-dismissed";

export function OverLimitBanner({
  propertyCount,
  dealCount,
  propertyLimit,
  dealLimit,
  overLimit,
  hasTrialExpired = false,
}: {
  propertyCount: number;
  dealCount: number;
  propertyLimit: number;
  dealLimit: number;
  overLimit: boolean;
  hasTrialExpired?: boolean;
}) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem(STORAGE_KEY);
    const id = setTimeout(() => setDismissed(stored === "1"), 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!overLimit) {
      const id = setTimeout(() => setDismissed(false), 0);
      return () => clearTimeout(id);
    }
  }, [overLimit]);

  const handleDismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
  };

  if (!overLimit || dismissed) return null;

  const overPropertyLimit = propertyCount > propertyLimit;
  const overDealLimit = dealCount > dealLimit;
  const propertyOverage = Math.max(propertyCount - propertyLimit, 0);
  const dealOverage = Math.max(dealCount - dealLimit, 0);
  const currentTierLabel =
    propertyLimit === PLAN_PROPERTY_LIMITS.free && dealLimit === PLAN_DEAL_LIMITS.free
      ? "Free"
      : propertyLimit === PLAN_PROPERTY_LIMITS.investor &&
          dealLimit === PLAN_DEAL_LIMITS.investor
        ? "Investor"
        : propertyLimit === PLAN_PROPERTY_LIMITS.pro && dealLimit === PLAN_DEAL_LIMITS.pro
          ? "Pro"
          : "current";
  const propertyLimitText = `${propertyLimit} ${
    propertyLimit === 1 ? "property" : "properties"
  }`;
  const limitCopy =
    overPropertyLimit && overDealLimit
      ? `${currentTierLabel} includes up to ${propertyLimitText} and ${dealLimit} saved deals.`
      : overPropertyLimit
        ? `${currentTierLabel} includes up to ${propertyLimitText}.`
        : `${currentTierLabel} includes up to ${dealLimit} saved deals.`;

  return (
    <div
      role="alert"
      className="relative flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-foreground"
    >
      <p className="flex-1 text-sm">
        {hasTrialExpired ? (
          <>
            Your free trial has ended. Your data is safe
            {overPropertyLimit
              ? ` -- ${propertyOverage} of your ${propertyCount} properties ${
                  propertyOverage === 1 ? "is" : "are"
                } beyond the free plan limit. `
              : ` -- ${dealOverage} of your ${dealCount} saved deals are beyond the free plan limit. `}
            <UpgradePlanLink
              placement="dashboard_over_limit_banner"
              className="font-medium text-accent hover:underline"
            >
              Upgrade to unlock all your properties
            </UpgradePlanLink>
            .
          </>
        ) : (
          <>
            You&apos;re over your plan limit ({propertyCount} properties, {dealCount} saved deals).{" "}
            {limitCopy}{" "}
            <UpgradePlanLink
              placement="dashboard_over_limit_banner"
              className="font-medium text-accent hover:underline"
            >
              Upgrade to unlock everything
            </UpgradePlanLink>
            .
          </>
        )}
      </p>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="shrink-0 flex min-h-[44px] min-w-[44px] items-center justify-center rounded text-muted transition-colors duration-150 hover:bg-subtle hover:text-foreground"
      >
        <X size={18} />
      </button>
    </div>
  );
}
