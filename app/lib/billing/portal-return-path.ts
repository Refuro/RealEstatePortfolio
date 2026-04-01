/** Allowed paths for Stripe Customer Portal `return_url` (same-origin path only). */
export const BILLING_PORTAL_RETURN_PATHS = new Set([
  "/settings",
  "/plans",
  "/pricing",
]);

export function resolveBillingPortalReturnPath(raw: unknown): string {
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/settings";
  }
  return BILLING_PORTAL_RETURN_PATHS.has(raw) ? raw : "/settings";
}
