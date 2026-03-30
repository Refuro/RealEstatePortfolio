/**
 * Session-scoped deduplication for high-volume funnel events (Batch 10).
 * Keys are prefixed; scope = one fire per browser tab session unless noted in docs.
 */

const PREFIX = "veld_dedup_sess_";

function sessionKey(parts: string[]): string {
  return `${PREFIX}${parts.join("_")}`;
}

export function hasFiredSession(key: string): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.sessionStorage.getItem(key) === "1";
  } catch {
    return true;
  }
}

export function markFiredSession(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, "1");
  } catch {
    /* ignore */
  }
}

/** One funnel CTA capture per session per (placement, cta_id). */
export function funnelCtaDedupKey(placement: string, ctaId: string): string {
  return sessionKey(["funnel_cta", placement, ctaId]);
}

/** One onboarding step event per Clerk user id (persists across sessions in-tab). */
export function onboardingStepDedupKey(clerkUserId: string, step: string): string {
  return `veld_dedup_onb_${clerkUserId}_${step}`;
}

export function hasFiredOnboardingStep(clerkUserId: string, step: string): boolean {
  if (typeof window === "undefined") return true;
  const k = onboardingStepDedupKey(clerkUserId, step);
  try {
    return window.localStorage.getItem(k) === "1";
  } catch {
    return true;
  }
}

export function markFiredOnboardingStep(clerkUserId: string, step: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(onboardingStepDedupKey(clerkUserId, step), "1");
  } catch {
    /* ignore */
  }
}

/** Wizard milestone once per session per milestone id. */
export function addPropertyMilestoneKey(milestone: string): string {
  return sessionKey(["apm", milestone]);
}
