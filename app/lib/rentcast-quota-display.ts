/**
 * When to show rolling-hour RentCast quota copy in the UI.
 * Always show when exhausted; otherwise only when remaining uses are within the last ~25% of the pool.
 */
export function shouldShowRentCastQuotaHint(remaining: number, limit: number): boolean {
  if (limit <= 0) return false;
  if (remaining <= 0) return true;
  const threshold = Math.max(2, Math.ceil(limit * 0.25));
  return remaining <= threshold;
}
