/**
 * Display prices for pricing page. Uses env vars with defaults.
 * Investor: $15/mo, $150/yr (2 months free)
 * Pro: $29/mo, $290/yr (2 months free)
 */

function getNum(key: string, defaultVal: number): number {
  const v = process.env[key];
  if (v == null || v === "") return defaultVal;
  const n = Number(v);
  return Number.isFinite(n) ? n : defaultVal;
}

export const PRICING_DISPLAY = {
  investorMonthly: getNum("NEXT_PUBLIC_PRICE_INVESTOR_MONTHLY", 15),
  investorYearly: getNum("NEXT_PUBLIC_PRICE_INVESTOR_YEARLY", 150),
  proMonthly: getNum("NEXT_PUBLIC_PRICE_PRO_MONTHLY", 29),
  proYearly: getNum("NEXT_PUBLIC_PRICE_PRO_YEARLY", 290),
} as const;

/** Savings when choosing annual (vs 12 × monthly). */
export function getAnnualSavings(plan: "investor" | "pro"): number {
  const monthly = plan === "investor" ? PRICING_DISPLAY.investorMonthly : PRICING_DISPLAY.proMonthly;
  const yearly = plan === "investor" ? PRICING_DISPLAY.investorYearly : PRICING_DISPLAY.proYearly;
  return Math.max(0, monthly * 12 - yearly);
}
