import {
  PLAN_DEAL_LIMITS,
  PLAN_PROPERTY_LIMITS,
  RENTCAST_HOURLY_LIMITS,
} from "@/lib/plans";

/**
 * Single source for /pricing “Compare plans” (desktop table + mobile accordion).
 * `free` / `investor` / `pro`: `true` = checkmark, `false` = em dash, string = shown as text.
 */
export type PricingCompareRow = {
  labelHtml: string;
  /** Same label without HTML entities (mobile). */
  labelPlain: string;
  free: string | boolean;
  investor: string | boolean;
  pro: string | boolean;
};

export const PRICING_COMPARE_ROWS: PricingCompareRow[] = [
  {
    labelHtml: "Properties tracked",
    labelPlain: "Properties tracked",
    free: String(PLAN_PROPERTY_LIMITS.free),
    investor: String(PLAN_PROPERTY_LIMITS.investor),
    pro: String(PLAN_PROPERTY_LIMITS.pro),
  },
  {
    labelHtml: "Saved deals",
    labelPlain: "Saved deals",
    free: String(PLAN_DEAL_LIMITS.free),
    investor: String(PLAN_DEAL_LIMITS.investor),
    pro: String(PLAN_DEAL_LIMITS.pro),
  },
  {
    labelHtml: "Rent &amp; value estimates",
    labelPlain: "Rent & value estimates",
    free: true,
    investor: true,
    pro: true,
  },
  {
    labelHtml: "Estimate pool (per hour)",
    labelPlain: "Estimate pool (per hour)",
    free: `${RENTCAST_HOURLY_LIMITS.free}/hr`,
    investor: `${RENTCAST_HOURLY_LIMITS.investor}/hr`,
    pro: `${RENTCAST_HOURLY_LIMITS.pro}/hr`,
  },
  {
    labelHtml: "Deal analyzer",
    labelPlain: "Deal analyzer",
    free: true,
    investor: true,
    pro: true,
  },
  {
    labelHtml: "Scenario modeling",
    labelPlain: "Scenario modeling",
    free: true,
    investor: true,
    pro: true,
  },
  {
    labelHtml: "Mortgage simulator",
    labelPlain: "Mortgage simulator",
    free: true,
    investor: true,
    pro: true,
  },
  {
    labelHtml: "Portfolio charts",
    labelPlain: "Portfolio charts",
    free: true,
    investor: true,
    pro: true,
  },
  {
    labelHtml: "Portfolio insights",
    labelPlain: "Portfolio insights",
    free: false,
    investor: true,
    pro: true,
  },
];

/** Mobile accordion: compact tick / dash / text. */
export function pricingCompareCellMobile(val: string | boolean): string {
  if (val === true) return "✓";
  if (val === false) return "—";
  return val;
}
