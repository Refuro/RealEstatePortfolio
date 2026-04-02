"use client";

import { useCookieConsent } from "./cookie-consent-provider";

export function CookiePreferencesButton({ className }: { className?: string }) {
  const { openPreferences } = useCookieConsent();
  return (
    <button
      type="button"
      onClick={openPreferences}
      className={className ?? "text-muted hover:text-foreground"}
    >
      Cookie preferences
    </button>
  );
}
