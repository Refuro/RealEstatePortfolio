"use client";

import { shouldShowRentCastQuotaHint } from "@/lib/rentcast-quota-display";
import { useRentCastQuota } from "@/lib/rentcast-quota-client";

/**
 * Shows rolling-hour RentCast quota when exhausted or near limit. Fetches `/api/rentcast-quota`
 * via a shared cache so multiple hints on the same page do not duplicate requests.
 * Bump `refreshKey` after a successful estimate/refresh so the count updates.
 */
export function RentCastQuotaHint({
  refreshKey = 0,
  className = "",
  forceVisible = false,
}: {
  /** Increment after a successful rent/value/benchmark call to refetch. */
  refreshKey?: number;
  className?: string;
  forceVisible?: boolean;
}) {
  const quota = useRentCastQuota(refreshKey);

  if (quota == null) return null;

  if (!forceVisible && !shouldShowRentCastQuotaHint(quota.remaining, quota.limit)) {
    return null;
  }

  const exhausted = quota.remaining <= 0;
  return (
    <p
      className={`text-xs ${exhausted ? "text-negative" : "text-muted"} ${className}`}
      role="status"
    >
      {quota.remaining} of {quota.limit} third-party estimate uses left this hour (shared: rent,
      value, benchmark refresh).
    </p>
  );
}
