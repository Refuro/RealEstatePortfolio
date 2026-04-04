/**
 * Persists last-seen marketing `landingVariant` for signup-time analytics (see PostHog `user_signed_up`).
 * URL param `lv` / `landing_variant` wins on sync (same session as PlanIntentUrlSync).
 */

const STORAGE_KEY = "veld_landing_variant_v1";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

type Stored = { variant: string; updated_at: number };

function normalize(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const v = raw.trim();
  return v.length > 0 ? v : null;
}

function readRaw(): Stored | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Stored;
    if (!p || typeof p.updated_at !== "number" || typeof p.variant !== "string") return null;
    if (Date.now() - p.updated_at > TTL_MS) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return p;
  } catch {
    return null;
  }
}

function writeRaw(variant: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ variant, updated_at: Date.now() } satisfies Stored)
    );
  } catch {
    /* ignore */
  }
}

/** Call when a marketing page renders with a known variant (e.g. LandingNav). */
export function persistLandingVariantFromPageView(variant: string | undefined | null): void {
  const v = normalize(variant ?? undefined);
  if (!v) return;
  writeRaw(v);
}

/** Persist when a tracked CTA carries an explicit variant (reinforces last-touch). */
export function touchLandingVariantFromTrackedCta(variant: string | undefined | null): void {
  persistLandingVariantFromPageView(variant);
}

export function syncLandingVariantFromSearchParams(searchParams: URLSearchParams): void {
  const v = normalize(searchParams.get("lv") ?? searchParams.get("landing_variant"));
  if (v) writeRaw(v);
}

export function getLandingVariantForAnalytics(): { landing_variant?: string } {
  const row = readRaw();
  if (!row?.variant) return {};
  return { landing_variant: row.variant };
}
