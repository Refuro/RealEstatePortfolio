/**
 * Helpers for plan limit enforcement when users are over limit
 * (e.g. downgraded from Pro to Free with more items than allowed).
 * When over limit, only the first N items (by updatedAt desc) count for stats and display.
 */

export type ItemWithUpdatedAt = { updatedAt: Date };

/**
 * Given an array of items with updatedAt, sort by updatedAt descending
 * and take the first N. Use when over limit to restrict stats/display.
 */
export function takeFirstNByUpdatedAt<T extends ItemWithUpdatedAt>(
  items: T[],
  limit: number
): T[] {
  if (items.length <= limit) return items;
  return [...items]
    .sort((a, b) => {
      const aTime = a.updatedAt instanceof Date ? a.updatedAt.getTime() : new Date(a.updatedAt).getTime();
      const bTime = b.updatedAt instanceof Date ? b.updatedAt.getTime() : new Date(b.updatedAt).getTime();
      return bTime - aTime; // desc: most recent first
    })
    .slice(0, limit);
}
