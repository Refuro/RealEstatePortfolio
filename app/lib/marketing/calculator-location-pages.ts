import type { CalculatorFaqItem } from "@/lib/marketing/calculator-faqs";
import {
  BRRR_CALCULATOR_FAQ,
  FIX_AND_FLIP_CALCULATOR_FAQ,
  INVESTMENT_PROPERTY_CALCULATOR_FAQ,
  STR_VS_LTR_CALCULATOR_FAQ,
} from "@/lib/marketing/calculator-faqs";

/** URL segment under `/tools/[calculator]/[location]` (not the legacy `/investment-property-calculator` path). */
export const CALCULATOR_LOCATION_SLUGS = [
  "brrr",
  "str-vs-ltr",
  "fix-and-flip",
  "investment-property",
] as const;

export type CalculatorLocationSlug = (typeof CALCULATOR_LOCATION_SLUGS)[number];

export function isCalculatorLocationSlug(s: string): s is CalculatorLocationSlug {
  return (CALCULATOR_LOCATION_SLUGS as readonly string[]).includes(s);
}

export type CalculatorLocationDef = {
  /** URL segment */
  slug: CalculatorLocationSlug;
  /** H1 fragment, e.g. "BRRRR calculator" */
  h1Short: string;
  /** Title / OG fragment, e.g. "BRRRR Calculator" */
  metaTitleShort: string;
  /** One-line hook for meta description (≤ ~90 chars with state name) */
  metaHook: string;
  /** Canonical “national” page for this calculator (breadcrumb + links). */
  basePath: "/tools/brrr" | "/tools/str-vs-ltr" | "/tools/fix-and-flip" | "/investment-property-calculator";
  faqs: CalculatorFaqItem[];
};

export const CALCULATOR_LOCATION_DEFS: Record<CalculatorLocationSlug, CalculatorLocationDef> = {
  brrr: {
    slug: "brrr",
    h1Short: "BRRRR calculator",
    metaTitleShort: "BRRRR Calculator",
    metaHook: "Model rehab, refi, and stabilized rent—estimates only; confirm with your lender.",
    basePath: "/tools/brrr",
    faqs: BRRR_CALCULATOR_FAQ,
  },
  "str-vs-ltr": {
    slug: "str-vs-ltr",
    h1Short: "STR vs LTR calculator",
    metaTitleShort: "STR vs LTR Calculator",
    metaHook: "Compare short- and long-term rental cash flow and coverage—estimates only.",
    basePath: "/tools/str-vs-ltr",
    faqs: STR_VS_LTR_CALCULATOR_FAQ,
  },
  "fix-and-flip": {
    slug: "fix-and-flip",
    h1Short: "Fix and flip calculator",
    metaTitleShort: "Fix and Flip Calculator",
    metaHook: "Estimate flip profit, ROI, and hold costs—estimates only.",
    basePath: "/tools/fix-and-flip",
    faqs: FIX_AND_FLIP_CALCULATOR_FAQ,
  },
  "investment-property": {
    slug: "investment-property",
    h1Short: "Investment property calculator",
    metaTitleShort: "Investment Property Calculator",
    metaHook: "Estimate cash flow, cap rate, DSCR, and cash-on-cash—estimates only.",
    basePath: "/investment-property-calculator",
    faqs: INVESTMENT_PROPERTY_CALCULATOR_FAQ,
  },
};

/** Stable analytics / A/B variant id per calculator + state slug. */
export function buildLocationLandingVariant(
  calculator: CalculatorLocationSlug,
  locationSlug: string
): string {
  return `${calculator.replace(/-/g, "_")}_${locationSlug.replace(/-/g, "_")}_v1`;
}

const MAX_DESC = 160;

/** ≤160 chars; includes state + calculator + hook. */
export function buildLocationMetaDescription(
  def: CalculatorLocationDef,
  stateName: string
): string {
  const core = `Free ${def.metaTitleShort} for ${stateName}: ${def.metaHook}`;
  if (core.length <= MAX_DESC) return core;
  return core.slice(0, MAX_DESC - 1).trimEnd() + "…";
}

export function mergeLocationFaqs(
  def: CalculatorLocationDef,
  extra?: CalculatorFaqItem[]
): CalculatorFaqItem[] {
  if (!extra?.length) return def.faqs;
  return [...def.faqs, ...extra];
}
