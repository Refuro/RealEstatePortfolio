"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { captureClientEvent } from "@/lib/analytics-client";
import { AnalyticsEvents } from "@/lib/analytics-events";

type UpgradePlanLinkProps = {
  /** Stable placement id for analytics, e.g. `properties_over_limit` */
  placement: string;
  children: ReactNode;
  className?: string;
};

/**
 * Link to `/plans` with PostHog capture for upgrade intent (paired with `plan_limit_hit`).
 */
export function UpgradePlanLink({ placement, children, className }: UpgradePlanLinkProps) {
  return (
    <Link
      href="/plans"
      className={className}
      onClick={() => {
        captureClientEvent(AnalyticsEvents.PLAN_LIMIT_UPGRADE_CTA_CLICKED, { placement });
      }}
    >
      {children}
    </Link>
  );
}
