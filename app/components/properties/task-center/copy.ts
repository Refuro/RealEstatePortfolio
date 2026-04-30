/**
 * Task center copy — properties-specific.
 *
 * Per Decision #7: properties task center reuses the same math as the dashboard
 * insights engine (status / refi-ready), but the copy lives here, in
 * per-property action framing rather than portfolio framing.
 *
 * Tone rules (mirrors lib/insights/copy.ts):
 *   - Negative cash flow framed as "plan for renewal" not "fix now"
 *   - Refi-ready framed as opportunity ("you can refi now"), never warning
 *   - No emoji, no exclamation marks
 */

const MINUS = "−";

function pluralProperty(n: number): string {
  return n === 1 ? "1 property" : `${n} properties`;
}

// ─── Incomplete profiles ─────────────────────────────────────────────────────

export function incompleteProfilesCopy(incompleteCount: number): {
  title: string;
  subtitle: string;
  cta: string;
} {
  const subtitle =
    incompleteCount === 1
      ? "Adding the missing details unlocks accurate cash flow, equity, and refinance modeling."
      : "Adding the missing details unlocks accurate cash flow, equity, and refinance modeling on each.";
  return {
    title: `${pluralProperty(incompleteCount)} ${incompleteCount === 1 ? "is" : "are"} missing details`,
    subtitle,
    cta: incompleteCount === 1 ? "Continue completing" : "Complete profiles",
  };
}

export const INCOMPLETE_UNLOCKS = [
  {
    label: "Mortgage details",
    unlocks: "DSCR, LTV, refi modeling",
  },
  {
    label: "Investment details",
    unlocks: "Equity, cash-on-cash return",
  },
  {
    label: "Rent benchmark",
    unlocks: "Rent vs. market signal",
  },
] as const;

// ─── Cash flow health ────────────────────────────────────────────────────────

export function cashFlowNegativeCopy(negativeCount: number): {
  title: string;
  subtitle: string;
  cta: string;
} {
  return {
    title: `${pluralProperty(negativeCount)} ${negativeCount === 1 ? "is" : "are"} cash flow negative`,
    subtitle:
      negativeCount === 1
        ? "Plan renewal rent or review expenses when the lease comes up."
        : "Plan renewal rent or review expenses on each at lease end.",
    cta: "Filter to cash flow negative",
  };
}

export const CASH_FLOW_POSITIVE_COPY = {
  title: "Cash flow turned positive",
  subtitle: "A property crossed back into positive cash flow this month.",
  cta: "View cash flow breakdown",
} as const;

// ─── Refi-ready ──────────────────────────────────────────────────────────────

export function refiReadyCopy(qualifyingCount: number): {
  title: string;
  subtitle: string;
  cta: string;
} {
  return {
    title: `${pluralProperty(qualifyingCount)} ready for refi`,
    subtitle:
      qualifyingCount === 1
        ? "Equity is high enough and DSCR clears the bar — cash-out is on the table."
        : "Each clears the equity threshold and DSCR bar — cash-out is on the table.",
    cta: qualifyingCount === 1 ? "Open in Refinance" : "See refi-ready properties",
  };
}

export { MINUS };
