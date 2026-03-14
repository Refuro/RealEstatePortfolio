/**
 * Display prices for pricing page. Uses env vars with defaults.
 * Investor: $10/mo, $100/yr (2 months free)
 * Pro: $20/mo, $200/yr (2 months free)
 */

function getNum(key: string, defaultVal: number): number {
  const v = process.env[key];
  if (v == null || v === "") return defaultVal;
  const n = Number(v);
  return Number.isFinite(n) ? n : defaultVal;
}

export const PRICING_DISPLAY = {
  investorMonthly: getNum("NEXT_PUBLIC_PRICE_INVESTOR_MONTHLY", 10),
  investorYearly: getNum("NEXT_PUBLIC_PRICE_INVESTOR_YEARLY", 100),
  proMonthly: getNum("NEXT_PUBLIC_PRICE_PRO_MONTHLY", 20),
  proYearly: getNum("NEXT_PUBLIC_PRICE_PRO_YEARLY", 200),
} as const;

/** Savings when choosing annual (vs 12 × monthly). */
export function getAnnualSavings(plan: "investor" | "pro"): number {
  const monthly = plan === "investor" ? PRICING_DISPLAY.investorMonthly : PRICING_DISPLAY.proMonthly;
  const yearly = plan === "investor" ? PRICING_DISPLAY.investorYearly : PRICING_DISPLAY.proYearly;
  return Math.max(0, monthly * 12 - yearly);
}
