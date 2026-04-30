/**
 * Copy templates per insight type, per mode.
 *
 * Tone: direct, dollar-led, action-oriented. Names specific properties when it
 * adds clarity. Uses "~$X" with the tilde for approximations (mostly $-rounded
 * estimates like rent gaps and appreciation). Reframes negatives by surfacing
 * positives (the total_return + cash_flow_drag pairing).
 *
 * Plurality and small-portfolio adjustments live inside each template — most
 * variation is grammatical (1 property is / 3 properties are) plus naming the
 * single offset property by name when it exists.
 */

import { formatCurrency } from "@/lib/format-currency";

export type CopyOutput = {
  eyebrow: string;
  value: string;
  explanation: string;
  cta?: { label: string; href: string };
};

// ─── Formatting helpers ──────────────────────────────────────────────────────

const MINUS = "−"; // unicode minus, matches Veld design

function fmtMoney(amount: number): string {
  return formatCurrency(Math.abs(amount));
}

function fmtSignedAnnual(amount: number): string {
  if (amount === 0) return `${formatCurrency(0)} / yr`;
  const sign = amount < 0 ? MINUS : "+";
  return `${sign}${fmtMoney(amount)} / yr`;
}

function fmtSignedMonthly(amount: number): string {
  if (amount === 0) return `${formatCurrency(0)} / mo`;
  const sign = amount < 0 ? MINUS : "+";
  return `${sign}${fmtMoney(amount)} / mo`;
}

function fmtNegMonthly(amountAbs: number): string {
  return `${MINUS}${fmtMoney(amountAbs)} / mo`;
}

/** "1 property" / "3 properties". */
function pluralProperty(n: number): string {
  return n === 1 ? "1 property" : `${n} properties`;
}

/** "is" / "are" verb agreement to follow `pluralProperty`. */
function pluralIs(n: number): string {
  return n === 1 ? "is" : "are";
}

// ─── cash_flow_drag ──────────────────────────────────────────────────────────

export type CashFlowDragSingleData = {
  monthlyDrag: number; // positive magnitude
  annualDrag: number; // positive magnitude
};

export type CashFlowDragMultiData = {
  count: number; // number of negative-CF properties
  totalProperties: number; // total in portfolio (for "all" framing)
  totalMonthlyDrag: number; // positive magnitude
  totalAnnualDrag: number; // positive magnitude
  /** Worst 1-2 negative properties, sorted worst-first. */
  worstNames: string[];
  worstAmounts: number[]; // positive magnitudes, parallel to worstNames
  healthyCount: number;
  healthyMonthlyTotal: number; // positive
  /** When healthyCount === 1, the name of that property. Used for direct framing. */
  soloHealthyName?: string;
};

export const cashFlowDragCopy = {
  single: (data: CashFlowDragSingleData): CopyOutput => ({
    eyebrow: "Cash flow drag",
    value: fmtNegMonthly(data.monthlyDrag),
    explanation: `This property is bleeding ${fmtMoney(data.monthlyDrag)}/mo — ${fmtMoney(data.annualDrag)}/yr in operating costs above rent. Pair it with the total return view to see the full picture.`,
  }),

  multi: (data: CashFlowDragMultiData): CopyOutput => {
    const allNegative = data.count === data.totalProperties;

    // Subject clause
    const subject = allNegative
      ? `All ${data.count} of your ${pluralProperty(data.count).split(" ")[1]} are`
      : `${pluralProperty(data.count)} ${pluralIs(data.count)}`;

    // Worst-feature clause (handles 1 vs 2 worst)
    let worstClause: string;
    if (data.worstNames.length >= 2 && data.count >= 2) {
      const w1 = data.worstNames[0]!;
      const w2 = data.worstNames[1]!;
      const a1 = data.worstAmounts[0]!;
      const a2 = data.worstAmounts[1]!;
      worstClause = `${w1} (${MINUS}${fmtMoney(a1)}) and ${w2} (${MINUS}${fmtMoney(a2)}) are the biggest drags`;
    } else if (data.worstNames.length >= 1) {
      const w1 = data.worstNames[0]!;
      const a1 = data.worstAmounts[0]!;
      const tail = data.count > 1 ? "is the biggest drag" : "is the drag";
      worstClause = `${w1} (${MINUS}${fmtMoney(a1)}/mo) ${tail}`;
    } else {
      worstClause = "";
    }

    // Healthy offset clause
    let offsetClause = "";
    if (data.healthyCount === 1 && data.soloHealthyName) {
      offsetClause = ` ${data.soloHealthyName} offsets with +${fmtMoney(data.healthyMonthlyTotal)}/mo.`;
    } else if (data.healthyCount > 1) {
      offsetClause = ` Your other ${data.healthyCount} produce +${fmtMoney(data.healthyMonthlyTotal)}/mo.`;
    }

    const headline = `${subject} cash flow negative, costing ${fmtMoney(data.totalAnnualDrag)}/yr.`;
    const middle = worstClause ? ` ${worstClause}.` : "";

    return {
      eyebrow: "Cash flow drag",
      value: fmtNegMonthly(data.totalMonthlyDrag),
      explanation: `${headline}${middle}${offsetClause}`.trim(),
    };
  },
};

// ─── rent_opportunity ────────────────────────────────────────────────────────

export type RentOpportunitySingleData = {
  pctBelow: number; // 12 means 12% below
  monthlyGap: number; // positive
  annualGap: number; // positive
};

export type RentOpportunityMultiData = {
  count: number;
  totalMonthlyGap: number; // positive
  worstNames: string[]; // up to 4
  worstPcts: number[]; // matching, e.g. 30.2 means 30.2% below
};

export const rentOpportunityCopy = {
  single: (data: RentOpportunitySingleData): CopyOutput => ({
    eyebrow: "Rent opportunity",
    value: `~${fmtMoney(data.monthlyGap)} / mo`,
    explanation: `Rent is ${data.pctBelow.toFixed(1)}% below market — closing the gap would add ~${fmtMoney(data.monthlyGap)}/mo (${fmtMoney(data.annualGap)}/yr) to your cash flow.`,
    cta: { label: "Update rent →", href: "" }, // href filled by UI per property; left empty here
  }),

  multi: (data: RentOpportunityMultiData): CopyOutput => {
    // Format the property list with pcts
    const namedList = data.worstNames
      .slice(0, 4)
      .map((name, i) => `${name} (${(data.worstPcts[i] ?? 0).toFixed(1)}%)`)
      .join(", ");

    const lead = `${pluralProperty(data.count)} ${pluralIs(data.count)} below market.`;
    const action = namedList
      ? ` Closing the gaps on ${namedList} would add ~${fmtMoney(data.totalMonthlyGap)}/mo in revenue.`
      : ` Closing the gaps would add ~${fmtMoney(data.totalMonthlyGap)}/mo.`;

    return {
      eyebrow: "Rent opportunity",
      value: `~${fmtMoney(data.totalMonthlyGap)} / mo`,
      explanation: `${lead}${action}`,
      cta: { label: "View underperforming →", href: "/properties" },
    };
  },
};

// ─── refi_gap (single only) ──────────────────────────────────────────────────

export type RefiGapSingleData = {
  rentIncreaseNeeded: number;
  currentDscr: number;
  /** Used to vary tone: urgent (<1.0) vs opportunity (1.0–1.25). */
  belowAccessMinimum: boolean;
};

export const refiGapCopy = {
  single: (data: RefiGapSingleData): CopyOutput => {
    const rentDelta = `~${fmtMoney(data.rentIncreaseNeeded)}/mo`;
    const dscrFmt = data.currentDscr.toFixed(2);
    const explanation = data.belowAccessMinimum
      ? `Currently at DSCR ${dscrFmt} — below the 1.0 access minimum. Rent would need to increase ${rentDelta} to reach DSCR 1.25, the threshold lenders use for competitive refi terms.`
      : `Currently at DSCR ${dscrFmt}. Rent would need to increase ${rentDelta} to hit DSCR 1.25, the threshold lenders use for competitive refi terms.`;
    return {
      eyebrow: "Refinance gap",
      value: `+${fmtMoney(data.rentIncreaseNeeded)} / mo`,
      explanation,
      cta: { label: "Model refinance scenarios →", href: "/modeling" },
    };
  },
};

// ─── incomplete_profile ──────────────────────────────────────────────────────

export type IncompleteProfileSingleData = {
  /** 0–100 completeness score (matches getPropertyCompleteness). */
  score: number;
  /** Human-readable labels for missing metric-ready fields. */
  missingFields: string[];
};

export type IncompleteProfileMultiData = {
  count: number;
  /** The single incomplete property's name when count === 1, used for direct framing. */
  worstName?: string;
  /** Score of the worst-offending property (lowest), 0–100. */
  worstScore: number;
};

function joinAnd(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0]!;
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export const incompleteProfileCopy = {
  single: (data: IncompleteProfileSingleData): CopyOutput => {
    const missingClause = data.missingFields.length > 0
      ? `Add ${joinAnd(data.missingFields)} to unlock DSCR, LTV, and cash-on-cash.`
      : `Finish the property profile to unlock DSCR, LTV, and cash-on-cash.`;
    return {
      eyebrow: "Profile incomplete",
      value: `${data.score}% complete`,
      explanation: missingClause,
    };
  },

  multi: (data: IncompleteProfileMultiData): CopyOutput => {
    const explanation = data.count === 1 && data.worstName
      ? `${data.worstName} is at ${data.worstScore}% — finish its profile to unlock DSCR, LTV, and cash-on-cash on it.`
      : `${pluralProperty(data.count)} ${pluralIs(data.count)} missing details that unlock DSCR, LTV, and cash-on-cash. Lowest is at ${data.worstScore}%.`;
    return {
      eyebrow: "Profiles incomplete",
      value: `${data.count} ${data.count === 1 ? "property" : "properties"}`,
      explanation,
    };
  },
};

// ─── total_return ────────────────────────────────────────────────────────────

export type TotalReturnSingleData = {
  annualTotalReturn: number;
  annualCashFlow: number; // signed
  annualAppreciation: number; // signed
  annualPaydown: number; // positive
  pctOfEquity: number | null; // 0.039 means 3.9%
};

export type TotalReturnMultiData = TotalReturnSingleData;

function totalReturnExplanation(data: TotalReturnSingleData, scope: "single" | "multi"): string {
  const cfPart = `cash flow ${fmtSignedAnnual(data.annualCashFlow)}`;
  const apprPart = `~${fmtMoney(data.annualAppreciation)} appreciation`;
  const paydownPart = `~${fmtMoney(data.annualPaydown)} mortgage paydown`;

  const totalFmt = fmtSignedAnnual(data.annualTotalReturn);
  const pctSuffix =
    data.pctOfEquity != null
      ? ` (${(data.pctOfEquity * 100).toFixed(1)}% on equity)`
      : "";

  const subject = scope === "single" ? "This property's" : "Your portfolio's";

  // If CF is negative, lead with the reframe.
  if (data.annualCashFlow < 0) {
    return `${subject} ${cfPart}, but ${apprPart} + ${paydownPart} = ${totalFmt} total return${pctSuffix}.`;
  }
  // Otherwise, lead positive.
  return `${subject} ${cfPart}; with ${apprPart} + ${paydownPart}, total return is ${totalFmt}${pctSuffix}.`;
}

export const totalReturnCopy = {
  single: (data: TotalReturnSingleData): CopyOutput => ({
    eyebrow: "Total return",
    value: fmtSignedAnnual(data.annualTotalReturn),
    explanation: totalReturnExplanation(data, "single"),
  }),
  multi: (data: TotalReturnMultiData): CopyOutput => ({
    eyebrow: "Total return",
    value: fmtSignedAnnual(data.annualTotalReturn),
    explanation: totalReturnExplanation(data, "multi"),
  }),
};

// ─── best_performer (multi only) ─────────────────────────────────────────────

export type BestPerformerMultiData = {
  topNames: string[]; // 1–3 names
  topCapRates: number[]; // matching, decimals (0.072 for 7.2%)
  topMonthlyCashFlows: number[]; // matching, signed
  combinedMonthlyCashFlow: number;
  shareOfPortfolioCfPct: number; // 62 for 62%
};

export const bestPerformerCopy = {
  multi: (data: BestPerformerMultiData): CopyOutput => {
    const performerList = data.topNames
      .map((name, i) => {
        const capPct = ((data.topCapRates[i] ?? 0) * 100).toFixed(1);
        const cfFmt = fmtSignedMonthly(data.topMonthlyCashFlows[i] ?? 0);
        return `${name} (${capPct}% cap, ${cfFmt})`;
      })
      .join(", ");

    const shareFmt = data.shareOfPortfolioCfPct.toFixed(0);
    const verb = data.topNames.length === 1 ? "generates" : "generate";

    return {
      eyebrow: "Top performers",
      value: `${data.topNames.length} ${data.topNames.length === 1 ? "property" : "properties"}`,
      explanation: `${performerList} ${verb} ${fmtMoney(data.combinedMonthlyCashFlow)}/mo — ${shareFmt}% of your total cash flow.`,
    };
  },
};

// ─── ltv_risk ────────────────────────────────────────────────────────────────

export type LtvRiskSingleData = {
  ltvPct: number; // 87 for 87%
  severityLabel: "warning" | "negative";
};

export type LtvRiskMultiData = {
  count: number;
  worstNames: string[]; // up to 3
  worstLtvPcts: number[]; // matching
  severityLabel: "warning" | "negative";
};

export const ltvRiskCopy = {
  single: (data: LtvRiskSingleData): CopyOutput => {
    const isNegative = data.severityLabel === "negative";
    const tail = isNegative
      ? `LTV is in refi-locked territory — most lenders won't refinance above 90%.`
      : `LTV is above the 80% line lenders use for healthy refinance terms — getting into the 70s opens up better rates.`;
    return {
      eyebrow: "LTV risk",
      value: `${data.ltvPct.toFixed(1)}%`,
      explanation: `At ${data.ltvPct.toFixed(1)}%, this property's ${tail}`,
    };
  },

  multi: (data: LtvRiskMultiData): CopyOutput => {
    const namedList = data.worstNames
      .slice(0, 3)
      .map((name, i) => `${name} (${(data.worstLtvPcts[i] ?? 0).toFixed(1)}%)`)
      .join(", ");
    const isNegative = data.severityLabel === "negative";
    const tailPhrase = isNegative
      ? "in refi-locked territory above 90%"
      : "above the 80% line lenders use for healthy refinance terms";

    const lead = `${pluralProperty(data.count)} ${pluralIs(data.count)} ${tailPhrase}.`;
    const detail = namedList ? ` Highest: ${namedList}.` : "";
    return {
      eyebrow: "LTV risk",
      value: `${data.count} ${data.count === 1 ? "property" : "properties"}`,
      explanation: `${lead}${detail}`,
    };
  },
};

// ─── equity_built ────────────────────────────────────────────────────────────

export type EquityBuiltData = {
  equityBuilt: number; // positive
  cashInvested: number | null;
  multiplier: number | null; // current_equity / cash_invested when present
};

export const equityBuiltCopy = {
  single: (data: EquityBuiltData): CopyOutput => {
    const explanation =
      data.multiplier != null && data.cashInvested != null
        ? `You've built ${fmtMoney(data.equityBuilt)} in equity from your ${fmtMoney(data.cashInvested)} cash investment — a ${data.multiplier.toFixed(1)}× return on initial capital.`
        : `You've built ${fmtMoney(data.equityBuilt)} in equity since purchase — wealth created beyond what you paid in.`;
    return {
      eyebrow: "Equity built",
      value: `+${fmtMoney(data.equityBuilt)}`,
      explanation,
    };
  },

  multi: (data: EquityBuiltData): CopyOutput => {
    const explanation =
      data.multiplier != null && data.cashInvested != null
        ? `Your portfolio has built ${fmtMoney(data.equityBuilt)} in equity from ${fmtMoney(data.cashInvested)} total invested — a ${data.multiplier.toFixed(1)}× return on initial capital.`
        : `Your portfolio has built ${fmtMoney(data.equityBuilt)} in equity since purchase — wealth created beyond your initial investment.`;
    return {
      eyebrow: "Equity built",
      value: `+${fmtMoney(data.equityBuilt)}`,
      explanation,
    };
  },
};

/** Re-exported for tests / callers that want consistent monthly formatting. */
export const __INTERNAL = { fmtSignedMonthly, fmtSignedAnnual, fmtNegMonthly };
