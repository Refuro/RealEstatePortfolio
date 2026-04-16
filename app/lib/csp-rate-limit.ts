const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 240;

const buckets = new Map<string, number[]>();

/**
 * In-memory sliding window rate limiter for CSP violation reports.
 *
 * Intentionally not DB-backed: CSP reports are anonymous, fire-and-forget noise.
 * Per-container imprecision in serverless is acceptable — the limit exists only to
 * prevent a single source from hammering a single instance, not as a hard security gate.
 */
export function checkCspRateLimit(identifier: string): { allowed: boolean } {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;

  let timestamps = buckets.get(identifier);
  if (!timestamps) {
    timestamps = [];
    buckets.set(identifier, timestamps);
  }

  // Prune expired entries
  let start = 0;
  while (start < timestamps.length && timestamps[start] < cutoff) {
    start++;
  }
  if (start > 0) {
    timestamps.splice(0, start);
  }

  if (timestamps.length >= MAX_REQUESTS) {
    return { allowed: false };
  }

  timestamps.push(now);
  return { allowed: true };
}
