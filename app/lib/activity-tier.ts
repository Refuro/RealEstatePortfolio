export type ActivityTier = "active" | "cooling" | "dormant" | "cold" | "gone";

const DAY_MS = 24 * 60 * 60 * 1000;

export function getActivityTier(
  lastActiveAt: Date | null | undefined,
  createdAt: Date,
  now: Date = new Date()
): ActivityTier {
  const anchor = lastActiveAt ?? createdAt;
  const ageDays = Math.floor((now.getTime() - anchor.getTime()) / DAY_MS);

  if (ageDays <= 30) return "active";
  if (ageDays <= 90) return "cooling";
  if (ageDays <= 180) return "dormant";
  if (ageDays <= 365) return "cold";
  return "gone";
}
