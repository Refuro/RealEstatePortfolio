"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { syncPlanIntentFromSearchParams } from "@/lib/plan-intent";
import { syncUtmFromSearchParams } from "@/lib/utm-attribution";

/**
 * Reads `?intent=` on the current route and persists canonical plan intent (see `lib/plan-intent.ts`).
 * Mount inside a route segment that may include `intent` (pricing, sign-up, optional landing).
 */
export function PlanIntentUrlSync(): null {
  const searchParams = useSearchParams();

  useEffect(() => {
    syncPlanIntentFromSearchParams(searchParams);
    syncUtmFromSearchParams(searchParams);
  }, [searchParams]);

  return null;
}
