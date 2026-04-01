/**
 * Fix-and-flip educational calculator — pure functions.
 * Model: interest-only purchase loan during hold; sale at ARV net of selling costs; loan payoff = initial loan balance.
 */

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export type FixAndFlipInput = {
  purchasePrice: number;
  rehabCost: number;
  holdMonths: number;
  downPaymentPercent: number;
  /** Annual rate on purchase loan (interest-only during hold). */
  purchaseLoanRatePercent: number;
  arv: number;
  /** Agent/closing as % of ARV. */
  sellingCostsPercent: number;
  /** Taxes, insurance, utilities, etc. per month during hold (excluding loan interest). */
  monthlyCarryingCosts: number;
};

export type FixAndFlipResult = {
  /** Echo of sanitized hold period (months). */
  holdMonths: number;
  downPaymentAmount: number;
  loanAmount: number;
  monthlyInterest: number;
  totalHoldingInterest: number;
  totalCarryingCosts: number;
  totalCashIn: number;
  grossSaleProceeds: number;
  sellingCosts: number;
  loanPayoff: number;
  netProfit: number;
  /** Net profit / total cash in × 100 */
  roiPercent: number;
  /** Compound annualized return on cash in; null if holdMonths is 0 or no cash in. */
  annualizedRoiPercent: number | null;
  /** Same basis as roiPercent for this model (profit / total out-of-pocket). */
  cashOnCashReturnPercent: number;
};

export function computeFixAndFlipResult(raw: FixAndFlipInput): FixAndFlipResult {
  const purchasePrice = Math.max(0, raw.purchasePrice);
  const rehabCost = Math.max(0, raw.rehabCost);
  const holdMonths = clamp(Math.round(raw.holdMonths), 0, 120);
  const downPaymentPercent = clamp(raw.downPaymentPercent, 0, 100);
  const rate = clamp(raw.purchaseLoanRatePercent, 0, 50);
  const arv = Math.max(0, raw.arv);
  const sellingCostsPercent = clamp(raw.sellingCostsPercent, 0, 100);
  const monthlyCarryingCosts = Math.max(0, raw.monthlyCarryingCosts);

  const downPaymentAmount = purchasePrice * (downPaymentPercent / 100);
  const loanAmount = Math.max(0, purchasePrice - downPaymentAmount);
  const monthlyRate = rate / 100 / 12;
  const monthlyInterest = loanAmount * monthlyRate;
  const totalHoldingInterest = monthlyInterest * holdMonths;
  const totalCarryingCosts = monthlyCarryingCosts * holdMonths;
  const totalCashIn = downPaymentAmount + rehabCost + totalHoldingInterest + totalCarryingCosts;

  const sellingCosts = arv * (sellingCostsPercent / 100);
  const grossSaleProceeds = Math.max(0, arv - sellingCosts);
  const loanPayoff = loanAmount;
  const netFromSale = grossSaleProceeds - loanPayoff;
  const netProfit = netFromSale - totalCashIn;

  const roiPercent = totalCashIn > 0 ? (netProfit / totalCashIn) * 100 : 0;
  const cashOnCashReturnPercent = roiPercent;

  let annualizedRoiPercent: number | null = null;
  if (holdMonths > 0 && totalCashIn > 0) {
    const totalReturnRatio = netProfit / totalCashIn;
    // When loss exceeds 100% of cash in, (1 + ratio) <= 0 and the power is not real → NaN.
    if (1 + totalReturnRatio > 0) {
      annualizedRoiPercent =
        (Math.pow(1 + totalReturnRatio, 12 / holdMonths) - 1) * 100;
    }
  }

  return {
    holdMonths,
    downPaymentAmount,
    loanAmount,
    monthlyInterest,
    totalHoldingInterest,
    totalCarryingCosts,
    totalCashIn,
    grossSaleProceeds,
    sellingCosts,
    loanPayoff,
    netProfit,
    roiPercent,
    annualizedRoiPercent,
    cashOnCashReturnPercent,
  };
}
