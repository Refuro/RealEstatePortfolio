/**
 * Cash-flow recent-improvement check for the Properties task center.
 *
 * Decision #7 (claudeCode/PropertyRedesign): the cash-flow health card's green
 * variant only fires on a recent improvement — a property that crossed from
 * negative to non-negative cash flow between the prior month's snapshot and
 * the most recent one. Without this gate the card becomes always-on wallpaper
 * for healthy portfolios.
 */

export type SnapshotCashFlowRow = {
  /** Most recent month's `PropertySnapshot.monthlyCashFlow`, full-liability scaled per row. */
  monthlyCashFlow: number;
};

/**
 * True when the property crossed from negative to non-negative cash flow
 * between the prior snapshot and the latest snapshot.
 *
 * Caller passes the two newest snapshots ordered newest-first. Both must be
 * present — a single-snapshot history can't represent an improvement.
 */
export function hasRecentCashFlowImprovement(
  latest: SnapshotCashFlowRow | null,
  prior: SnapshotCashFlowRow | null
): boolean {
  if (!latest || !prior) return false;
  return prior.monthlyCashFlow < 0 && latest.monthlyCashFlow >= 0;
}
