"use client";

import { useEffect, useState } from "react";

type QuotaPayload = { limit: number; used: number; remaining: number };

/**
 * Shows rolling-hour RentCast quota (shared pool). Fetches `/api/rentcast-quota`.
 * Bump `refreshKey` after a successful estimate/refresh so the count updates.
 */
export function RentCastQuotaHint({
  refreshKey = 0,
  className = "",
}: {
  /** Increment after a successful rent/value/benchmark call to refetch. */
  refreshKey?: number;
  className?: string;
}) {
  const [quota, setQuota] = useState<QuotaPayload | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/rentcast-quota");
        if (!res.ok) return;
        const j = (await res.json()) as QuotaPayload;
        if (
          typeof j.limit === "number" &&
          typeof j.used === "number" &&
          typeof j.remaining === "number" &&
          !cancelled
        ) {
          setQuota(j);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (quota == null) return null;

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
