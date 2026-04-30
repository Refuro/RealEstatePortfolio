import { TrendingDown } from "lucide-react";
import { getBenchmarkPct } from "@/lib/benchmark-utils";

/**
 * Renders only when the caller has already determined eligibility
 * (`getBenchmarkEligibility === "eligible_fresh"`) AND tone is negative.
 * Per Decision #8D — small inline chip beside the Cash flow column.
 */
export function BelowMarketIndicator({
  userRent,
  marketRent,
}: {
  userRent: number;
  marketRent: number;
}) {
  const pctBelow = Math.abs(getBenchmarkPct(userRent, marketRent));
  const label = `Rent ${pctBelow.toFixed(0)}% below market`;
  return (
    <span
      title={label}
      aria-label={label}
      className="inline-flex items-center gap-1 rounded-md border border-warning/30 bg-warning/10 px-1.5 py-0.5 text-[10.5px] font-medium text-warning"
    >
      <TrendingDown className="size-3" aria-hidden />
      Below market
    </span>
  );
}
