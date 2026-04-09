"use client";

import { useCookieConsent } from "./cookie-consent-provider";

/**
 * Bottom banner (non-modal). Shown until the user chooses, or when “Manage cookies” reopens preferences.
 */
export function CookieConsentBanner() {
  const {
    ready,
    consent,
    preferencesOpen,
    acceptAnalytics,
    rejectOptional,
    closePreferences,
  } = useCookieConsent();

  const visible = ready && (consent === null || preferencesOpen);
  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card px-4 py-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-card"
      role="dialog"
      aria-label="Cookie preferences"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-foreground">
          <p className="font-medium">
            {preferencesOpen && consent !== null
              ? "Update cookie preferences"
              : "Cookies and analytics"}
          </p>
          <p className="mt-1 text-muted">
            We use essential cookies to keep you signed in. Optional analytics and
            ads measurement are richer if you accept. Before optional consent,
            PostHog runs in anonymous non-persistent mode; Vercel and Google
            measurement scripts load only after acceptance. See our{" "}
            <a href="/privacy" className="font-medium text-foreground underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
        <div className="flex flex-shrink-0 flex-wrap gap-2">
          {preferencesOpen && consent !== null && (
            <button
              type="button"
              onClick={closePreferences}
              className="rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-subtle"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={rejectOptional}
            className="rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-subtle"
          >
            Reject optional
          </button>
          <button
            type="button"
            onClick={acceptAnalytics}
            className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
          >
            Accept optional
          </button>
        </div>
      </div>
    </div>
  );
}
