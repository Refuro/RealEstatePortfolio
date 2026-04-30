"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { captureClientEvent } from "@/lib/analytics-client";
import { AnalyticsEvents } from "@/lib/analytics-events";

const STORAGE_KEY = "trial-banner-dismissed";

export function TrialBanner({
  isOnTrial,
  trialDaysRemaining,
  propertyCount,
}: {
  isOnTrial: boolean;
  trialDaysRemaining: number | null;
  propertyCount: number;
}) {
  const [dismissed, setDismissed] = useState(true);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem(STORAGE_KEY);
    const id = setTimeout(() => setDismissed(stored === "1"), 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!isOnTrial) return;
    const id = setTimeout(() => setDismissed(false), 0);
    return () => clearTimeout(id);
  }, [isOnTrial]);

  const handleDismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
  };
  const isFirstPropertyQuickAdd =
    propertyCount === 0 && pathname === "/properties/new" && searchParams.get("mode") === "quick";
  const isQuickMortgagePage = /^\/properties\/[^/]+\/mortgage\/quick$/.test(pathname ?? "");

  if (
    !isOnTrial ||
    dismissed ||
    isFirstPropertyQuickAdd ||
    isQuickMortgagePage ||
    (propertyCount > 1 && (trialDaysRemaining ?? 0) <= 0)
  ) {
    return null;
  }

  const days = Math.max(0, trialDaysRemaining ?? 0);
  const isFinalWindow = days <= 3;
  const hasEmptyPortfolio = propertyCount === 0;
  const className = isFinalWindow
    ? "border-amber-500/30 bg-amber-500/10"
    : "border-accent/20 bg-accent/5";
  const shouldShowUpgradeCta = !hasEmptyPortfolio || days <= 0;

  return (
    <div
      role="alert"
      className={`relative flex items-start gap-3 rounded-lg px-4 py-3 text-foreground ${className}`}
    >
      <p className="flex-1 text-sm">
        {isFinalWindow
          ? `Your free trial ends in ${days} ${days === 1 ? "day" : "days"}. Your data is safe, but portfolio access will be reduced. `
          : `You have ${days} ${days === 1 ? "day" : "days"} left on your free trial. `}
        {shouldShowUpgradeCta ? (
          <Link
            href="/plans"
            className="font-medium text-accent transition-colors duration-150 hover:underline"
            onClick={() =>
              captureClientEvent(AnalyticsEvents.TRIAL_BANNER_UPGRADE_CLICKED, {
                placement: "trial_banner",
                days_remaining: days,
              })
            }
          >
            {isFinalWindow ? "Upgrade now" : "Upgrade to keep access"}
          </Link>
        ) : (
          <span className="font-medium text-muted">
            Add your first property to unlock the full trial experience.
          </span>
        )}
      </p>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="shrink-0 rounded text-muted transition-colors duration-150 hover:bg-subtle hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center"
      >
        <X size={18} />
      </button>
    </div>
  );
}
