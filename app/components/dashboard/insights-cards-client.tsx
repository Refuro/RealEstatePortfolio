"use client";

/**
 * Client wrapper for InsightCards that owns the dismissal contract.
 *
 * Dismissal model (per discussion doc decision #6):
 *   - Storage: localStorage only (key = STORAGE_KEY).
 *   - Dismiss = button click → write { dismissedAt, contextUpdatedAt } per dismissKey.
 *   - Re-surface triggers (a dismissed insight becomes visible again) when ANY of:
 *       1. Month boundary — current month differs from the month of dismissedAt.
 *       2. Updated-at — the relevant property/portfolio updatedAt is newer than
 *          the contextUpdatedAt captured at dismissal time.
 *
 * Hydration: while the localStorage hasn't been read yet (first SSR paint), all
 * server-rendered insights show. Once the effect runs, the visible list is
 * filtered. This means a flash of un-dismissed insights, but it's better than
 * a flash of zero insights and matches React's progressive-enhancement model.
 */

import { useEffect, useMemo, useState } from "react";
import { InsightCards } from "./insight-cards";
import type { Insight } from "@/lib/insights/types";

const STORAGE_KEY = "veld:insight-dismissals:v1";

type DismissedRecord = {
  dismissedAt: string; // ISO
  contextUpdatedAt: string; // ISO — relevant property/portfolio updatedAt at dismissal time
};

type Dismissals = Record<string, DismissedRecord>;

function readDismissals(): Dismissals {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null) return {};
    return parsed as Dismissals;
  } catch {
    return {};
  }
}

function writeDismissals(d: Dismissals): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
  } catch {
    // Quota or private mode — silently no-op.
  }
}

function getMonthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/**
 * Resolve which timestamp to compare against for a given dismissKey.
 * Property-scoped keys use that property's updatedAt; portfolio-scoped keys
 * use the max updatedAt across the portfolio.
 */
function getContextUpdatedAt(
  dismissKey: string,
  propertyUpdatedAt: Record<string, string>,
  portfolioUpdatedAt: string
): string {
  const idx = dismissKey.indexOf(":");
  const scope = idx === -1 ? "" : dismissKey.slice(idx + 1);
  if (scope === "portfolio") return portfolioUpdatedAt;
  return propertyUpdatedAt[scope] ?? portfolioUpdatedAt;
}

function isStillDismissed(
  record: DismissedRecord,
  contextUpdatedAt: string,
  nowMs: number
): boolean {
  // Month boundary expiry: dismissal stops applying once the month changes.
  const dismissedMonth = getMonthKey(record.dismissedAt);
  const nowMonth = getMonthKey(new Date(nowMs).toISOString());
  if (nowMonth !== dismissedMonth) return false;

  // Updated-at expiry: re-surface if relevant data has been updated since dismissal.
  const ctxMs = new Date(contextUpdatedAt).getTime();
  const recordedMs = new Date(record.contextUpdatedAt).getTime();
  if (ctxMs > recordedMs) return false;

  return true;
}

type InsightsCardsClientProps = {
  insights: Insight[];
  propertyUpdatedAt: Record<string, string>;
  portfolioUpdatedAt: string;
};

export function InsightsCardsClient({
  insights,
  propertyUpdatedAt,
  portfolioUpdatedAt,
}: InsightsCardsClientProps) {
  const [dismissals, setDismissals] = useState<Dismissals>({});
  const [hydrated, setHydrated] = useState(false);
  const [nowMs] = useState(Date.now);

  useEffect(() => {
    // localStorage is unavailable during SSR — this mount effect is the correct place to read it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDismissals(readDismissals());
    setHydrated(true);
  }, []);

  const visibleInsights = useMemo(() => {
    if (!hydrated) return insights;
    return insights.filter((insight) => {
      const record = dismissals[insight.dismissKey];
      if (!record) return true;
      const ctxUpdatedAt = getContextUpdatedAt(
        insight.dismissKey,
        propertyUpdatedAt,
        portfolioUpdatedAt
      );
      return !isStillDismissed(record, ctxUpdatedAt, nowMs);
    });
  }, [insights, dismissals, propertyUpdatedAt, portfolioUpdatedAt, hydrated, nowMs]);

  function handleDismiss(dismissKey: string): void {
    const ctxUpdatedAt = getContextUpdatedAt(
      dismissKey,
      propertyUpdatedAt,
      portfolioUpdatedAt
    );
    const next = {
      ...dismissals,
      [dismissKey]: {
        dismissedAt: new Date().toISOString(),
        contextUpdatedAt: ctxUpdatedAt,
      },
    };
    setDismissals(next);
    writeDismissals(next);
  }

  return <InsightCards insights={visibleInsights} onDismiss={handleDismiss} />;
}
