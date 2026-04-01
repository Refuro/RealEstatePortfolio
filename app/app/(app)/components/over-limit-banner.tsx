"use client";

import { useState, useEffect } from "react";
import { UpgradePlanLink } from "@/components/analytics/upgrade-plan-link";
import { X } from "lucide-react";

const STORAGE_KEY = "over-limit-banner-dismissed";

export function OverLimitBanner({
  propertyCount,
  dealCount,
  propertyLimit,
  dealLimit,
  overLimit,
}: {
  propertyCount: number;
  dealCount: number;
  propertyLimit: number;
  dealLimit: number;
  overLimit: boolean;
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
  const limitCopy =
    overPropertyLimit && overDealLimit
      ? `Portfolio shows your first ${propertyLimit} properties and ${dealLimit} deals.`
      : overPropertyLimit
        ? `Portfolio shows your first ${propertyLimit} properties.`
        : `Portfolio shows your first ${dealLimit} deals.`;

  return (
    <div
      role="alert"
      className="relative flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-foreground"
    >
      <p className="flex-1 text-sm">
        You&apos;re over your plan limit ({propertyCount} properties, {dealCount} saved deals).{" "}
        {limitCopy}{" "}
        <UpgradePlanLink
          placement="dashboard_over_limit_banner"
          className="font-medium text-accent hover:underline"
        >
          Upgrade to see all
        </UpgradePlanLink>
        , or remove some to stay within your plan.
      </p>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="shrink-0 rounded p-1 text-muted hover:bg-subtle hover:text-foreground"
      >
        <X size={18} />
      </button>
    </div>
  );
}
