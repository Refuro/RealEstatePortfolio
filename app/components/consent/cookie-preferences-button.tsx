"use client";

import { useCookieConsent } from "./cookie-consent-provider";

export function CookiePreferencesButton() {
  const { openPreferences } = useCookieConsent();
  return (
    <button
      type="button"
      onClick={openPreferences}
      className="text-muted hover:text-foreground"
    >
      Cookie preferences
    </button>
  );
}
