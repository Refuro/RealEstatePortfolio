/**
 * Format a date as a human-readable relative time string.
 * e.g. "2 days ago", "3 months ago", "1 year ago"
 */
export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? "" : "s"} ago`;
  if (diffDay === 0) return "today";
  if (diffDay === 1) return "yesterday";
  if (diffDay < 30) return `${diffDay} days ago`;
  if (diffMonth === 1) return "1 month ago";
  if (diffMonth < 12) return `${diffMonth} months ago`;
  if (diffYear === 1) return "1 year ago";
  return `${diffYear} years ago`;
}

/**
 * Relative label for PostgreSQL `DATE` / Prisma `@db.Date` fields.
 *
 * Those values are persisted without a time-of-day; clients typically see them as UTC midnight.
 * {@link formatTimeAgo} would then report misleading spans like "2 hours ago" on the same
 * calendar day. This helper compares **UTC calendar dates** only.
 */
export function formatDateOnlyRelative(date: Date | string, now: Date = new Date()): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const startUtcMs = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const nowUtcMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const diffDays = Math.floor((nowUtcMs - startUtcMs) / (24 * 60 * 60 * 1000));

  if (diffDays <= 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 30) return `${diffDays} days ago`;
  const diffMonth = Math.floor(diffDays / 30);
  if (diffMonth === 1) return "1 month ago";
  if (diffMonth < 12) return `${diffMonth} months ago`;
  const diffYear = Math.floor(diffDays / 365);
  if (diffYear === 1) return "1 year ago";
  return `${diffYear} years ago`;
}

const STALE_THRESHOLD_MS = 180 * 24 * 60 * 60 * 1000; // 6 months

/** Returns true if the date is more than 6 months ago (data may be stale). */
export function isDataStale(date: Date): boolean {
  return date.getTime() < Date.now() - STALE_THRESHOLD_MS;
}
