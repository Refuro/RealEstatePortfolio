"use client";

import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { captureClientEvent } from "@/lib/analytics-client";
import { AnalyticsEvents } from "@/lib/analytics-events";

const STORAGE_KEY = "veld:insights-locked-dismissed:v1";

type DismissedRecord = {
  dismissedAt: string;
};

function readDismissed(): DismissedRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "dismissedAt" in parsed &&
      typeof (parsed as { dismissedAt: unknown }).dismissedAt === "string"
    ) {
      return parsed as DismissedRecord;
    }
    return null;
  } catch {
    return null;
  }
}

function writeDismissed(record: DismissedRecord): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Quota or private mode — silently no-op.
  }
}

const DISMISS_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

function isStillDismissed(record: DismissedRecord, nowMs: number): boolean {
  const dismissedMs = Date.parse(record.dismissedAt);
  if (Number.isNaN(dismissedMs)) return false;
  return nowMs - dismissedMs < DISMISS_WINDOW_MS;
}

type Placement = "dashboard_single" | "dashboard_multi";

export function InsightsLockedCard({
  placement,
  postTrial = false,
}: {
  placement: Placement;
  /** When true, copy reframes around what the user saw during their trial. */
  postTrial?: boolean;
}) {
  const [{ hidden, hydrated }, setMountState] = useState({ hidden: false, hydrated: false });

  useEffect(() => {
    const record = readDismissed();
    const wasDismissed = !!(record && isStillDismissed(record, Date.now()));
    // localStorage is unavailable during SSR — this mount effect is the correct place to read it.
    // Functional update preserves a click-through-dismiss that may race with mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMountState((s) => ({ hidden: s.hidden || wasDismissed, hydrated: true }));
  }, []);

  useEffect(() => {
    if (!hydrated || hidden) return;
    captureClientEvent(AnalyticsEvents.INSIGHTS_LOCKED_VIEWED, {
      placement,
      post_trial: postTrial,
    });
  }, [hydrated, hidden, placement, postTrial]);

  if (hidden) return null;

  function handleDismiss(): void {
    captureClientEvent(AnalyticsEvents.INSIGHTS_LOCKED_DISMISSED, {
      placement,
      post_trial: postTrial,
    });
    writeDismissed({ dismissedAt: new Date().toISOString() });
    setMountState((s) => ({ ...s, hidden: true }));
  }

  function handleCtaClick(): void {
    captureClientEvent(AnalyticsEvents.INSIGHTS_LOCKED_CTA_CLICKED, {
      placement,
      post_trial: postTrial,
    });
  }

  const scopePhrase =
    placement === "dashboard_multi" ? "across your portfolio" : "on this property";
  const description = postTrial
    ? `Your trial surfaced what's working, what's at risk, and where to focus next ${scopePhrase}. Subscribe to keep getting them.`
    : `Surface what's working, what's at risk, and where to focus next, flagged automatically ${scopePhrase}.`;

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-4 rounded-lg border px-5 py-4"
      style={{
        background:
          "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.04))",
        borderColor: "rgba(129,140,248,0.18)",
      }}
    >
      <div className="flex min-w-0 items-start gap-3.5">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{
            background: "rgba(129,140,248,0.12)",
            color: "var(--accent)",
          }}
          aria-hidden="true"
        >
          <Sparkles size={18} />
        </div>
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--foreground)",
              }}
            >
              Portfolio insights
            </span>
            <span
              className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5"
              style={{
                fontSize: "10.5px",
                fontWeight: 500,
                color: "var(--foreground-muted)",
                background: "var(--subtle)",
                borderColor: "var(--border)",
              }}
            >
              <Lock size={10} aria-hidden="true" />
              Investor &amp; Pro
            </span>
          </div>
          <p
            className="text-[12.5px]"
            style={{ color: "var(--foreground-muted)", lineHeight: 1.5 }}
          >
            {description}
          </p>
        </div>
      </div>

      <div className="ml-auto flex w-full shrink-0 items-center justify-end gap-3 sm:w-auto">
        <button
          type="button"
          onClick={handleDismiss}
          className="text-[11.5px] underline hover:text-foreground"
          style={{ color: "var(--foreground-muted)" }}
        >
          Not now
        </button>
        <Link
          href="/pricing?placement=dashboard_insights_locked"
          onClick={handleCtaClick}
          className="inline-flex min-h-[36px] items-center justify-center whitespace-nowrap rounded-md bg-accent px-4 py-2 text-[12.5px] font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
        >
          Unlock with Investor
        </Link>
      </div>
    </div>
  );
}
