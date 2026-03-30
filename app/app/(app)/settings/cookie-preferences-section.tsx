"use client";

import { CookiePreferencesButton } from "@/components/consent/cookie-preferences-button";

export function CookiePreferencesSection() {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted mb-2">
        Cookies & optional analytics
      </h2>
      <p className="text-sm text-muted">
        Essential cookies keep you signed in. PostHog and Google Ads load only if you accept
        optional tracking in the cookie banner. You can change your choice anytime.
      </p>
      <p className="mt-4">
        <CookiePreferencesButton />
      </p>
    </div>
  );
}
