import {
  COMPETITOR_ALTERNATIVES,
  COMPETITOR_VS,
} from "@/lib/marketing/competitor-data";
import { RESOURCE_ARTICLES } from "@/lib/marketing/resource-data";
import { CALCULATOR_LOCATION_DEFS } from "@/lib/marketing/calculator-location-pages";
import { getAppOrigin } from "@/lib/app-url";

/**
 * Serves `llms.txt` at the site root per the emerging llmstxt.org standard. Curates the
 * highest-quality public surfaces for LLM crawlers and AI answer engines so they surface
 * canonical Veld content instead of authenticated app routes or thin pages.
 *
 * Format: https://llmstxt.org
 */
export function GET(): Response {
  const origin = getAppOrigin();

  const calculatorLinks = Object.values(CALCULATOR_LOCATION_DEFS)
    .map((def) => `- [${def.metaTitleShort}](${origin}${def.basePath}): ${def.metaHook}`)
    .join("\n");

  const resourceLinks = RESOURCE_ARTICLES.map(
    (article) =>
      `- [${article.metaTitle}](${origin}/resources/${article.slug}): ${article.metaDescription}`
  ).join("\n");

  const alternativeLinks = Object.values(COMPETITOR_ALTERNATIVES)
    .map(
      (config) =>
        `- [${config.metaTitle}](${origin}/alternatives/${config.slug}): ${config.metaDescription}`
    )
    .join("\n");

  const vsLinks = Object.values(COMPETITOR_VS)
    .map(
      (config) =>
        `- [${config.metaTitle}](${origin}/vs/${config.slug}): ${config.metaDescription}`
    )
    .join("\n");

  const body = `# Veld Portfolio

> Rental portfolio tracking and deal analysis for small real estate investors (1 to 10 properties). Investors add their properties once and get a live dashboard with equity, cash flow, cap rate, DSCR, cash-on-cash return, LTV, and rent vs. market benchmarks. Veld intentionally does not do rent collection, tenant screening, bank sync, or general-ledger accounting; it works alongside the banking and accounting tools investors already use.

## About

- [Investment property calculator](${origin}/investment-property-calculator): Free calculator for rental cash flow, cap rate, DSCR, and cash-on-cash return.
- [Pricing](${origin}/pricing): Free, Investor ($15/mo, 5 properties), and Pro ($29/mo, 20 properties) tiers. Free plan requires no credit card.
- [Changelog](${origin}/changelog): Release notes with dated entries.

## Calculators

${calculatorLinks}

## Guides and reference

${resourceLinks}

## Competitor alternatives

${alternativeLinks}

## Comparisons

${vsLinks}
`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
