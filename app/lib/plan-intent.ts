/**
 * Logged-out plan selection intent for sign-up and post-auth analytics.
 * Browser-only; guard callers with `typeof window !== "undefined"`.
 *
 * Precedence (highest first):
 * 1. Valid `?intent=` on the current URL — canonical when present; overwrites storage and restarts TTL.
 * 2. Last explicit pricing-card or tracked CTA write in this browser (same storage).
 * 3. Stored record if `updated_at` is within {@link PLAN_INTENT_TTL_MS}.
 * 4. Otherwise `undecided` with source `unknown` for analytics payloads.
 *
 * Values: `free` | `investor` | `pro` | `undecided`
 */

export const PLAN_INTENT_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

const STORAGE_KEY = "veld_plan_intent_v1";

export const PLAN_INTENT_VALUES = ["free", "investor", "pro", "undecided"] as const;
export type PlanIntentValue = (typeof PLAN_INTENT_VALUES)[number];

export type PlanIntentSource = "url" | "pricing_card" | "landing_cta" | "unknown";

type StoredPayload = {
  intent: PlanIntentValue;
  source: PlanIntentSource;
  updated_at: number;
};

function isPlanIntentValue(s: string): s is PlanIntentValue {
  return (PLAN_INTENT_VALUES as readonly string[]).includes(s);
}

export function parseIntentQueryParam(raw: string | null | undefined): PlanIntentValue | null {
  if (!raw) return null;
  const n = raw.trim().toLowerCase();
  return isPlanIntentValue(n) ? n : null;
}

function readRaw(): StoredPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as StoredPayload;
    if (!p || typeof p.updated_at !== "number") return null;
    if (!isPlanIntentValue(p.intent)) return null;
    if (Date.now() - p.updated_at > PLAN_INTENT_TTL_MS) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return p;
  } catch {
    return null;
  }
}

function writeRaw(payload: StoredPayload): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* quota / private mode */
  }
}

/**
 * Apply `?intent=` from the current URL when valid — always wins over prior storage.
 */
export function syncPlanIntentFromSearchParams(searchParams: URLSearchParams): void {
  const q = parseIntentQueryParam(searchParams.get("intent"));
  if (!q) return;
  writeRaw({
    intent: q,
    source: "url",
    updated_at: Date.now(),
  });
}

/** Persist intent from pricing CTAs or landing tracked links (does not override URL on next navigation if URL absent). */
export function setPlanIntent(
  intent: PlanIntentValue,
  source: Extract<PlanIntentSource, "pricing_card" | "landing_cta">
): void {
  writeRaw({
    intent,
    source,
    updated_at: Date.now(),
  });
}

export type PlanIntentAnalyticsPayload = {
  plan_intent: PlanIntentValue;
  /** Where the resolved value came from for this payload. */
  plan_intent_source: PlanIntentSource;
};

/**
 * Resolved intent for PostHog person properties / event payloads.
 * Uses stored record after TTL and precedence rules; missing/expired → `undecided` + `unknown`.
 */
export function getPlanIntentForAnalytics(): PlanIntentAnalyticsPayload {
  const row = readRaw();
  if (!row) {
    return { plan_intent: "undecided", plan_intent_source: "unknown" };
  }
  return { plan_intent: row.intent, plan_intent_source: row.source };
}

/** Clear stored intent (e.g. after successful checkout) — optional; call from billing success if desired. */
export function clearPlanIntent(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
