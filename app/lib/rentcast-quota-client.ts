"use client";

import { useEffect, useReducer } from "react";

export type RentCastQuotaPayload = { limit: number; used: number; remaining: number };

const quotaCache = new Map<number, RentCastQuotaPayload | null>();
const inflight = new Map<number, Promise<RentCastQuotaPayload | null>>();

/**
 * Deduplicates `/api/rentcast-quota` fetches: multiple mounts with the same `refreshKey`
 * share one in-flight request and cached result.
 */
export function useRentCastQuota(refreshKey: number): RentCastQuotaPayload | null {
  const [, bump] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    if (quotaCache.has(refreshKey)) return;

    let cancelled = false;

    let p = inflight.get(refreshKey);
    if (!p) {
      p = (async (): Promise<RentCastQuotaPayload | null> => {
        try {
          const res = await fetch("/api/rentcast-quota");
          if (!res.ok) return null;
          const j = (await res.json()) as RentCastQuotaPayload;
          if (
            typeof j.limit !== "number" ||
            typeof j.used !== "number" ||
            typeof j.remaining !== "number"
          ) {
            return null;
          }
          return j;
        } catch {
          return null;
        }
      })();
      inflight.set(refreshKey, p);
      void p.then((data) => {
        quotaCache.set(refreshKey, data);
        inflight.delete(refreshKey);
      });
    }

    void p.then(() => {
      if (!cancelled) bump();
    });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return quotaCache.has(refreshKey) ? (quotaCache.get(refreshKey) ?? null) : null;
}
