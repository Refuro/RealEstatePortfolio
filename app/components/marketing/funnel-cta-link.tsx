"use client";

import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";
import { captureClientEvent } from "@/lib/analytics-client";
import { AnalyticsEvents } from "@/lib/analytics-events";
import {
  funnelCtaDedupKey,
  hasFiredSession,
  markFiredSession,
} from "@/lib/analytics-dedup";
import { setPlanIntent, type PlanIntentValue } from "@/lib/plan-intent";

type FunnelCtaLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  /** e.g. `landing_hero`, `landing_nav`, `pricing_footer` */
  placement: string;
  /** Stable id for dedup, e.g. `get_started_free` */
  ctaId: string;
  /** When set, persists plan intent (landing CTA path). */
  planIntent?: PlanIntentValue;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

/**
 * Tracked marketing link: one `funnel_cta_clicked` per session per (placement, cta_id).
 */
export function FunnelCtaLink({
  placement,
  ctaId,
  planIntent,
  onClick,
  href,
  children,
  className,
}: FunnelCtaLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={(e) => {
        const key = funnelCtaDedupKey(placement, ctaId);
        if (!hasFiredSession(key)) {
          markFiredSession(key);
          captureClientEvent(AnalyticsEvents.FUNNEL_CTA_CLICKED, {
            placement,
            cta_id: ctaId,
            href: typeof href === "string" ? href : "",
          });
        }
        if (planIntent) {
          setPlanIntent(planIntent, "landing_cta");
        }
        onClick?.(e);
      }}
    >
      {children}
    </Link>
  );
}
