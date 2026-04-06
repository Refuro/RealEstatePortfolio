"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { captureClientEvent } from "@/lib/analytics-client";
import { AnalyticsEvents } from "@/lib/analytics-events";
import {
  hasFiredOnboardingStep,
  markFiredOnboardingStep,
} from "@/lib/analytics-dedup";
import { getPlanIntentForAnalytics } from "@/lib/plan-intent";

/** After dismissing with 0 properties, re-show a nudge banner after this window. */
const SNOOZE_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

type OnboardingProgress = {
  welcomeSeenAt: string | null;
  dismissedAt: string | null;
};

async function patchOnboarding(
  action: "mark_welcome_seen" | "dismiss_modal"
): Promise<OnboardingProgress | null> {
  const res = await fetch("/api/onboarding", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });
  if (!res.ok) return null;
  return (await res.json()) as OnboardingProgress;
}

export function OnboardingPanel({
  initialProgress,
  propertyCount,
}: {
  initialProgress: OnboardingProgress;
  propertyCount: number;
}) {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [progress, setProgress] = useState(initialProgress);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // A user who has added a property never sees any onboarding surface again,
  // regardless of dismissal state or snooze expiry.
  const hasNoProperties = propertyCount === 0;

  const showWelcomeModal = hasNoProperties && !progress.welcomeSeenAt && !progress.dismissedAt;

  const snoozeExpired =
    progress.dismissedAt !== null &&
    Date.now() - new Date(progress.dismissedAt).getTime() >= SNOOZE_DURATION_MS;

  // Lighter re-engagement strip shown after the snooze expires, only when still no properties.
  const showReEngagementNudge =
    hasNoProperties &&
    progress.welcomeSeenAt !== null &&
    progress.dismissedAt !== null &&
    snoozeExpired;

  useEffect(() => {
    if (!isLoaded || !user?.id || !showWelcomeModal) return;
    if (hasFiredOnboardingStep(user.id, "welcome_modal_viewed")) return;
    markFiredOnboardingStep(user.id, "welcome_modal_viewed");
    const pi = getPlanIntentForAnalytics();
    captureClientEvent(AnalyticsEvents.ONBOARDING_STEP_COMPLETED, {
      step: "welcome_modal_viewed",
      plan_intent: pi.plan_intent,
      plan_intent_source: pi.plan_intent_source,
    });
  }, [isLoaded, user?.id, showWelcomeModal]);

  const handleWelcome = useCallback(
    async (startNow: boolean) => {
      if (busy) return;
      setBusy(true);
      setErrorMessage(null);
      try {
        const next = await patchOnboarding("mark_welcome_seen");
        if (!next) {
          setErrorMessage("We couldn't save your onboarding step. Please try again.");
          return;
        }

        if (!startNow) {
          const dismissed = await patchOnboarding("dismiss_modal");
          if (!dismissed) {
            setErrorMessage("We couldn't dismiss the welcome modal. Please try again.");
            return;
          }
          setProgress(dismissed);
          if (user?.id && !hasFiredOnboardingStep(user.id, "welcome_maybe_later")) {
            markFiredOnboardingStep(user.id, "welcome_maybe_later");
            const pi = getPlanIntentForAnalytics();
            captureClientEvent(AnalyticsEvents.ONBOARDING_STEP_COMPLETED, {
              step: "welcome_maybe_later",
              plan_intent: pi.plan_intent,
              plan_intent_source: pi.plan_intent_source,
            });
          }
          router.refresh();
        } else {
          setProgress(next);
          if (user?.id && !hasFiredOnboardingStep(user.id, "welcome_add_first_property")) {
            markFiredOnboardingStep(user.id, "welcome_add_first_property");
            const pi = getPlanIntentForAnalytics();
            captureClientEvent(AnalyticsEvents.ONBOARDING_STEP_COMPLETED, {
              step: "welcome_add_first_property",
              plan_intent: pi.plan_intent,
              plan_intent_source: pi.plan_intent_source,
            });
          }
          router.push("/properties/new?mode=quick");
        }
      } catch {
        setErrorMessage("Something went wrong while saving onboarding. Please try again.");
      } finally {
        setBusy(false);
      }
    },
    [busy, router, user?.id]
  );

  const handleDismissNudge = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setErrorMessage(null);
    try {
      const next = await patchOnboarding("dismiss_modal");
      if (!next) {
        setErrorMessage("We couldn't save your preference. Please try again.");
        return;
      }
      setProgress(next);
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }, [busy]);

  const dialogRef = useRef<HTMLDivElement>(null);
  const primaryActionRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!showWelcomeModal) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [showWelcomeModal]);

  useEffect(() => {
    if (!showWelcomeModal) return;
    const onDocKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        void handleWelcome(false);
      }
    };
    document.addEventListener("keydown", onDocKey);
    return () => document.removeEventListener("keydown", onDocKey);
  }, [showWelcomeModal, handleWelcome]);

  useEffect(() => {
    if (!showWelcomeModal || !dialogRef.current) return;
    const root = dialogRef.current;
    const getFocusable = () =>
      Array.from(
        root.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);

    const focusables = getFocusable();
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    primaryActionRef.current?.focus();

    const onTrap = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || focusables.length === 0) return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    root.addEventListener("keydown", onTrap);
    return () => root.removeEventListener("keydown", onTrap);
  }, [showWelcomeModal]);

  return (
    <>
      {showReEngagementNudge && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-accent/25 bg-accent/5 px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              Your portfolio dashboard is still empty
            </p>
            <p className="mt-0.5 text-xs text-muted">
              Add your first property to unlock live equity, cash flow, and rent benchmarks.
            </p>
            {errorMessage && (
              <p className="mt-1 text-xs text-negative" role="status" aria-live="polite">
                {errorMessage}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/properties/new?mode=quick"
              className="inline-flex min-h-[36px] items-center rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground transition-colors hover:bg-accent-hover"
            >
              Add property
            </Link>
            <button
              type="button"
              onClick={() => void handleDismissNudge()}
              disabled={busy}
              aria-label="Dismiss"
              className="flex size-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-subtle hover:text-foreground disabled:opacity-50"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-background/75 p-4 backdrop-blur-sm">
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card p-7 shadow-2xl outline-none"
          >
            <div className="pointer-events-none absolute -top-24 right-[-12%] h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 left-[-14%] h-60 w-60 rounded-full bg-primary/15 blur-3xl" />
            <div className="relative">
              <p className="inline-flex rounded-full border border-border/80 bg-background/60 px-3 py-1 text-xs font-medium text-muted">
                Welcome
              </p>
              <h2
                id={titleId}
                className="mt-4 text-2xl font-semibold leading-tight text-foreground"
              >
                Build your real estate portfolio in minutes
              </h2>
              <p className="mt-2 max-w-lg text-sm text-muted">
                Add your first property to unlock live equity, cash flow, and performance insights.
              </p>

              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                <ValueChip label="Track cash flow" />
                <ValueChip label="See equity growth" />
                <ValueChip label="Model upside" />
              </div>

              <p className="mt-4 text-xs text-muted">
                Takes about 5 minutes with your property details. You can start with just the
                basics and fill in the rest later.
              </p>
              {errorMessage ? (
                <p className="mt-3 text-sm text-negative" role="status" aria-live="polite">
                  {errorMessage}
                </p>
              ) : null}
            </div>

            <div className="relative mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={() => void handleWelcome(false)}
                disabled={busy}
                className="min-h-[44px] rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-subtle disabled:opacity-60"
              >
                Maybe later
              </button>
              <button
                ref={primaryActionRef}
                type="button"
                onClick={() => void handleWelcome(true)}
                disabled={busy}
                className="min-h-[44px] rounded-md bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground shadow-lg shadow-accent/25 transition-all hover:bg-accent-hover disabled:opacity-60"
              >
                Add first property
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ValueChip({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md px-1 py-1 text-sm">
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent">
        ✓
      </span>
      <span className="font-medium text-foreground/90">{label}</span>
    </div>
  );
}
