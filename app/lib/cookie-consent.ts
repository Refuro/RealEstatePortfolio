/**
 * First-party cookie consent for optional analytics/ads (PostHog, Google Ads).
 * Essential auth cookies (Clerk) are unaffected.
 */
export const COOKIE_CONSENT_NAME = "veld_cookie_consent";

export type CookieConsentStored = "analytics" | "essential";

const MAX_AGE_SEC = 60 * 60 * 24 * 365;

export function parseConsentCookieValue(raw: string | undefined): CookieConsentStored | null {
  if (!raw) return null;
  const v = raw.trim();
  if (v === "analytics") return "analytics";
  if (v === "essential") return "essential";
  return null;
}

export function buildConsentCookieHeader(value: CookieConsentStored): string {
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:";
  return `${COOKIE_CONSENT_NAME}=${encodeURIComponent(value)};path=/;max-age=${MAX_AGE_SEC};SameSite=Lax${secure ? ";Secure" : ""}`;
}
