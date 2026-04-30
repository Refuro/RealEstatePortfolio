/**
 * Types for the insights engine.
 *
 * Read `./README.md` for the rules these types serve. The shapes below are the
 * implementation contract — generators consume `InsightsContext`, the picker
 * orchestrates them, and callers (dashboard / digest / future insights page)
 * each construct `InsightsContext` from their own data sources.
 *
 * Decision references: see `claudeCode/veld-implementation-discussion.md`.
 */

export type Severity = "negative" | "warning" | "positive";

export type InsightType =
  | "cash_flow_drag"
  | "rent_opportunity"
  | "refi_gap"
  | "incomplete_profile"
  | "total_return"
  | "best_performer"
  | "ltv_risk"
  | "equity_built";
// Note: cap_rate_benchmark intentionally absent in v1. Deferred per discussion doc decision #3.

export type InsightMode = "single" | "multi";

/**
 * Source tag for the appreciation figure used by the total_return generator.
 * Allows callers/UI to vary tooltip copy ("based on tracked value updates" vs
 * "based on purchase delta" vs "estimated using long-term US average").
 */
export type AppreciationSource = "snapshot_derived" | "purchase_delta" | "default";

/**
 * A single insight ready for rendering. Generators emit these; the picker
 * collects, filters, ranks, and slot-fills them.
 *
 * Copy (eyebrow / value / explanation) is pre-formatted by the generator
 * (which delegates to `copy.ts`). The picker does not transform copy.
 */
export type Insight = {
  type: InsightType;
  severity: Severity;
  /** Short label, e.g. "Cash flow drag". Pre-formatted. */
  eyebrow: string;
  /** Headline number, e.g. "−$2,174 / mo". Pre-formatted. */
  value: string;
  /** Prose paragraph; may include property names. Pre-formatted. */
  explanation: string;
  /** Optional call-to-action link. */
  cta?: { label: string; href: string };
  /**
   * Stable key used by callers to filter dismissed insights.
   * Format: `${type}:${scope}` where scope is a property `id` for property-scoped
   * insights or the literal `"portfolio"` for portfolio-scoped insights.
   */
  dismissKey: string;
  /**
   * Threshold metadata for v2 dismissal logic ("re-surface only if condition
   * changes meaningfully"). Unused in v1 but populated by generators so v2
   * doesn't require a retrofit. See discussion doc decision #6.
   */
  dismissThreshold?: { metric: string; value: number; deltaPct: number };
  /**
   * Generator-native ranking score. Used to break ties WITHIN a single
   * generator (e.g. picking the worst-offending property to feature).
   * NOT used to compare across different generators — see README ¶ scoring.
   */
  score: number;
};

// ---------------------------------------------------------------------------
// InsightsContext — input shape passed to every generator.
// Slim by design: just what generators need. Callers build this from their
// own data (dashboard payload, digest job, etc.).
// ---------------------------------------------------------------------------

export type InsightsContextProperty = {
  id: string;
  name: string;
  addressLine1: string;
  city: string;
  state: string;
  isRented: boolean;
  purchasePrice: number;
  currentEstimatedValue: number;
  purchaseDate: Date;
  /** Total rent across units, vacancy NOT applied. */
  userRent: number;
  marketRent: number | null;
  marketRentAsOf: Date | null;
  monthlyExpenses: number;
  vacancyPercent: number;
  ownershipPercent: number;
  hasMortgage: boolean | null;
  totalMortgageBalance: number;
  totalMonthlyPayment: number;
  /** Number of mortgage records on the property. Used to gauge profile completeness. */
  mortgageCount: number;
  /** True if the user marked this property's mortgage as paid off. */
  mortgagePaidOff: boolean;
  cashInvested: number | null;
  updatedAt: Date;
};

export type InsightsContextMetrics = {
  /** Matches `properties[].id`. */
  id: string;
  equity: number;
  monthlyCashFlow: number;
  annualCashFlow: number;
  capRate: number | null;
  ltv: number | null;
  noi: number;
  /** Per-property DSCR. Null when no mortgage. */
  dscr: number | null;
  /** Annual debt service. Null when no mortgage. */
  annualDebtService: number | null;
  /**
   * Annual mortgage principal paydown (positive number; ownership-scaled).
   * Sum across all of the property's mortgages. Used by total_return.
   * Zero when no mortgage. Caller computes via the amortization library.
   */
  annualPaydown: number;
};

export type InsightsContextPortfolio = {
  totalEquity: number;
  totalMonthlyCashFlow: number;
  totalCashInvested: number;
  weightedCapRate: number | null;
  portfolioLtv: number | null;
  dscr: number | null;
};

export type InsightsContextSnapshot = {
  propertyId: string;
  snapshotMonth: Date;
  estimatedValue: number;
  equity: number;
  monthlyCashFlow: number;
};

export type InsightsContextAppreciation = {
  /** Pre-computed annual dollars: rate × current value. */
  annualDollars: number;
  source: AppreciationSource;
};

export type InsightsContextBenchmarks = {
  /** Reserved for future re-introduction of cap_rate_benchmark. Unused in v1. */
  capRateByLocation?: Record<string, number>;
};

/**
 * The full input to `pickInsights`. All generators receive this; each one
 * pulls only the slices it needs.
 */
export type InsightsContext = {
  mode: InsightMode;
  properties: InsightsContextProperty[];
  metrics: InsightsContextMetrics[];
  portfolio: InsightsContextPortfolio;
  snapshots?: InsightsContextSnapshot[];
  appreciationByPropertyId?: Record<string, InsightsContextAppreciation>;
  benchmarks?: InsightsContextBenchmarks;
};

// ---------------------------------------------------------------------------
// Generator interface
// ---------------------------------------------------------------------------

export type Generator = {
  type: InsightType;
  appliesTo: ReadonlyArray<InsightMode>;
  /** Returns 0..N candidate insights for this context. Empty array when not firing. */
  generate: (ctx: InsightsContext) => Insight[];
};

// ---------------------------------------------------------------------------
// Picker options
// ---------------------------------------------------------------------------

export type PickOptions = {
  /** Set of dismissKeys to filter out before slot-fill. */
  dismissed?: Set<string>;
  /** Override the default registry. Used by tests / digest variants. */
  generators?: Generator[];
  /** Maximum insights to return. Defaults to 3. */
  maxCount?: number;
};
