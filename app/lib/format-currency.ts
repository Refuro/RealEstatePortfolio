/**
 * Format a number as USD currency using Intl.NumberFormat.
 * Used consistently across dashboard, properties, deals, charts, and metrics.
 */
export function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}
