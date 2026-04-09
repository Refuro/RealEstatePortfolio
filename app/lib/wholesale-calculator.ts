/**
 * Wholesale / MAO educational calculator — pure functions.
 * Model: MAO from ARV multiplier minus deal costs and assignment fee.
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export type WholesaleInput = {
  arv: number;
  estimatedRepairs: number;
  assignmentFee: number;
  buyerClosingCosts: number;
  sellerClosingCosts: number;
  monthlyHoldingCosts: number;
  holdMonths: number;
  arvMultiplier: number;
};

export type WholesaleResult = {
  mao: number;
  maoAsPercentArv: number | null;
  totalDealCosts: number;
  grossSpread: number;
  wholesalerNetProfit: number;
  endBuyerEquityCushion: number;
};

export function computeWholesaleResult(input: WholesaleInput): WholesaleResult {
  const arv = Math.max(0, input.arv);
  const estimatedRepairs = Math.max(0, input.estimatedRepairs);
  const assignmentFee = Math.max(0, input.assignmentFee);
  const buyerClosingCosts = Math.max(0, input.buyerClosingCosts);
  const sellerClosingCosts = Math.max(0, input.sellerClosingCosts);
  const monthlyHoldingCosts = Math.max(0, input.monthlyHoldingCosts);
  const holdMonths = clamp(Math.round(input.holdMonths), 0, 120);
  const arvMultiplier = clamp(input.arvMultiplier, 0, 1.5);

  const totalHoldingCosts = monthlyHoldingCosts * holdMonths;
  const totalDealCosts =
    estimatedRepairs +
    assignmentFee +
    buyerClosingCosts +
    sellerClosingCosts +
    totalHoldingCosts;

  const mao =
    arv * arvMultiplier -
    estimatedRepairs -
    buyerClosingCosts -
    sellerClosingCosts -
    totalHoldingCosts -
    assignmentFee;
  const grossSpread = arv - totalDealCosts;
  const wholesalerNetProfit = assignmentFee;
  const endBuyerEquityCushion = arv - mao - estimatedRepairs - buyerClosingCosts;
  const maoAsPercentArv = arv > 0 ? mao / arv : null;

  return {
    mao,
    maoAsPercentArv,
    totalDealCosts,
    grossSpread,
    wholesalerNetProfit,
    endBuyerEquityCushion,
  };
}
