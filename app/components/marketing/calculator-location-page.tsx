import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { Footer } from "@/components/footer";
import { LandingNav } from "@/components/landing-nav";
import { PlanIntentUrlSync } from "@/components/analytics/plan-intent-url-sync";
import {
  CalculatorFaqJsonLd,
  CalculatorFaqSection,
} from "@/components/marketing/calculator-faq";
import { BreadcrumbJsonLd } from "@/components/marketing/breadcrumb-jsonld";
import { CalculatorLocationSlot } from "@/components/marketing/calculator-location-slot";
import { MobileCollapsible } from "@/components/mobile-collapsible";
import type { LocationData } from "@/lib/marketing/location-data";
import {
  buildLocationLandingVariant,
  CALCULATOR_LOCATION_DEFS,
  mergeLocationFaqs,
  type CalculatorLocationSlug,
} from "@/lib/marketing/calculator-location-pages";

const SIBLING_CALCULATORS: CalculatorLocationSlug[] = [
  "brrr",
  "str-vs-ltr",
  "fix-and-flip",
  "investment-property",
  "cap-rate",
  "cash-on-cash",
  "dscr",
  "wholesale",
  "rent-vs-buy",
];

function siblingLinks(current: CalculatorLocationSlug): {
  slug: CalculatorLocationSlug;
  label: string;
}[] {
  return SIBLING_CALCULATORS.filter((s) => s !== current)
    .slice(0, 2)
    .map((slug) => ({
      slug,
      label: CALCULATOR_LOCATION_DEFS[slug].metaTitleShort,
    }));
}

function formatPercentFromDecimal(value: number, digits = 2): string {
  return `${(value * 100).toFixed(digits)}%`;
}

function buildStateCalculatorFaq(
  calculator: CalculatorLocationSlug,
  location: LocationData
): { question: string; answer: string } {
  const rentText =
    location.avgMonthlyRent != null ? `about $${location.avgMonthlyRent.toLocaleString()}/month` : "local comps";
  const priceText =
    location.medianHomePrice != null
      ? `$${location.medianHomePrice.toLocaleString()} median home prices`
      : "current purchase prices";
  const taxText =
    location.avgEffectivePropertyTaxRate != null
      ? `${formatPercentFromDecimal(location.avgEffectivePropertyTaxRate)} effective property tax`
      : "local property taxes";

  if (calculator === "investment-property") {
    return {
      question: `What should I benchmark first in ${location.name} rental underwriting?`,
      answer: `Start with ${rentText}, ${taxText}, and your financing terms, then compare multiple vacancy and repair scenarios. This calculator is educational and should be validated with local rent comps and lender terms.`,
    };
  }

  if (calculator === "brrr") {
    return {
      question: `How should I adapt BRRRR assumptions in ${location.name}?`,
      answer: `Anchor stabilized rent to ${rentText}, then stress rehab timeline, refinance terms, and ${taxText}. BRRRR outcomes are highly sensitive to actual rehab scope and refinance appraisal.`,
    };
  }

  if (calculator === "str-vs-ltr") {
    return {
      question: `How should I compare STR vs LTR in ${location.name}?`,
      answer: `Use realistic occupancy and fee assumptions for STR, then compare against a long-term baseline near ${rentText}. Include cleaner turnover, management, and regulation-related costs before deciding.`,
    };
  }

  if (calculator === "fix-and-flip") {
    return {
      question: `How should I set a fix-and-flip target in ${location.name}?`,
      answer: `Base your model on ${priceText}, then stress sale timeline, financing carry, and selling costs. A conservative resale and hold assumption matters more than headline ROI.`,
    };
  }

  if (calculator === "cap-rate") {
    const capRateText =
      location.avgCapRate != null ? `near ${formatPercentFromDecimal(location.avgCapRate, 1)}` : "by submarket";
    return {
      question: `What cap rate benchmark should I use in ${location.name}?`,
      answer: `Recent residential cap rates in ${location.name} are often ${capRateText}, but deal quality and neighborhood risk can move that range. Underwrite with your actual ${taxText} and insurance quotes to avoid overstating NOI.`,
    };
  }

  if (calculator === "cash-on-cash") {
    return {
      question: `What drives cash-on-cash return most in ${location.name}?`,
      answer: `In ${location.name}, cash-on-cash is most sensitive to your entry basis (${priceText}), interest rate, and true operating costs like ${taxText}. Stress test rent, vacancy, and maintenance before relying on one output.`,
    };
  }

  if (calculator === "dscr") {
    return {
      question: `How should I set DSCR assumptions for ${location.name} rentals?`,
      answer: `Most lenders look for DSCR around 1.20 to 1.25, but program terms vary. In ${location.name}, use realistic rent near ${rentText} and include full operating costs (especially ${taxText}) before sizing leverage.`,
    };
  }

  if (calculator === "wholesale") {
    return {
      question: `How should I set MAO in ${location.name} wholesale deals?`,
      answer: `Start from realistic ARV around ${priceText}, then subtract repairs, holding, and transaction costs before assignment fee. Adjust your ARV multiplier for local buyer demand and renovation risk, not a one-size national rule.`,
    };
  }

  return {
    question: `How should I evaluate rent vs buy in ${location.name}?`,
    answer: `Use local rent near ${rentText}, purchase levels around ${priceText}, and realistic mortgage assumptions. Break-even timing changes quickly when appreciation, rent growth, and opportunity cost assumptions shift.`,
  };
}

export async function CalculatorLocationPage({
  calculator,
  location,
}: {
  calculator: CalculatorLocationSlug;
  location: LocationData;
}) {
  const { userId } = await auth();
  const supportEmail = process.env.SUPPORT_EMAIL ?? null;
  const def = CALCULATOR_LOCATION_DEFS[calculator];
  const mergedFaqItems = mergeLocationFaqs(def, location.extraFaqs);
  const stateCalculatorFaq = buildStateCalculatorFaq(calculator, location);
  const faqItems = mergedFaqItems.some((item) => item.question === stateCalculatorFaq.question)
    ? mergedFaqItems
    : [...mergedFaqItems, stateCalculatorFaq];
  const variant = buildLocationLandingVariant(calculator, location.slug);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Suspense fallback={null}>
        <PlanIntentUrlSync />
      </Suspense>
      <LandingNav userId={userId} landingVariant={variant} />
      <main className="flex-1 px-4 py-12 md:py-14">
        <div className="mx-auto max-w-6xl">
          <CalculatorFaqJsonLd items={faqItems} />
          <BreadcrumbJsonLd
            items={[
              { name: "Calculators", path: "/tools" },
              { name: def.metaTitleShort, path: def.basePath },
              {
                name: location.name,
                path: `/tools/${calculator}/${location.slug}`,
              },
            ]}
          />

          <nav
            className="flex overflow-x-auto whitespace-nowrap text-sm text-muted"
            aria-label="Breadcrumb"
          >
            <Link href="/tools" className="shrink-0 hover:text-foreground hover:underline">
              Calculators
            </Link>
            <span className="mx-2 shrink-0">/</span>
            <Link
              href={def.basePath}
              className="shrink-0 hover:text-foreground hover:underline"
            >
              {def.metaTitleShort}
            </Link>
            <span className="mx-2 shrink-0">/</span>
            <span className="shrink-0 text-foreground">{location.name}</span>
          </nav>

          <header className="hero-animate mt-4 text-center">
            <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent">
                Calculator
              </span>
              <span className="text-sm font-medium text-muted">{location.name}</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              {def.h1Short} — {location.name}
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted md:text-base">
              {location.investorContext}{" "}
              Same math as the{" "}
              <Link href={def.basePath} className="font-medium text-foreground hover:underline">
                national {def.h1Short}
              </Link>
              ; numbers are educational—not lender instructions.
            </p>
          </header>

          <div className="reveal-up reveal-up-d1 mt-8">
            <CalculatorLocationSlot
              calculator={calculator}
              landingVariant={variant}
              avgMonthlyRent={location.avgMonthlyRent}
              medianHomePrice={location.medianHomePrice}
            />
          </div>

          <CalculatorFaqSection items={faqItems} />

          <section className="mt-10" aria-labelledby="local-context-heading">
            <h2 id="local-context-heading" className="sr-only">
              Real estate investing in {location.name}
            </h2>
            <MobileCollapsible
              label={`Real estate investing in ${location.name}`}
              defaultOpen={false}
            >
              <div className="rounded-lg bg-subtle/40 p-5 md:p-6">
                <p className="text-xs font-medium text-muted">
                  Real estate investing in {location.name}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted">{location.localContext}</p>
                {(location.avgEffectivePropertyTaxRate != null ||
                  location.stateIncomeTax != null ||
                  location.avgMonthlyRent != null ||
                  (calculator === "cap-rate" && location.avgCapRate != null) ||
                  ((calculator === "cash-on-cash" ||
                    calculator === "wholesale" ||
                    calculator === "rent-vs-buy") &&
                    location.medianHomePrice != null) ||
                  calculator === "dscr") && (
                  <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
                    {location.avgMonthlyRent != null && (
                      <>
                        <dt className="text-muted">Typical 2BR rent</dt>
                        <dd className="font-medium text-foreground sm:col-span-2">
                          ~${location.avgMonthlyRent.toLocaleString()}/mo
                        </dd>
                      </>
                    )}
                    {location.avgEffectivePropertyTaxRate != null && (
                      <>
                        <dt className="text-muted">Effective property tax</dt>
                        <dd className="font-medium text-foreground sm:col-span-2">
                          ~{(location.avgEffectivePropertyTaxRate * 100).toFixed(2)}% of home value
                        </dd>
                      </>
                    )}
                    {location.stateIncomeTax != null && (
                      <>
                        <dt className="text-muted">State income tax</dt>
                        <dd className="font-medium text-foreground sm:col-span-2">
                          {location.stateIncomeTax}
                        </dd>
                      </>
                    )}
                    {calculator === "cap-rate" && location.avgCapRate != null && (
                      <>
                        <dt className="text-muted">Typical cap rate</dt>
                        <dd className="font-medium text-foreground sm:col-span-2">
                          ~{(location.avgCapRate * 100).toFixed(1)}%
                        </dd>
                      </>
                    )}
                    {(calculator === "cash-on-cash" ||
                      calculator === "wholesale" ||
                      calculator === "rent-vs-buy") &&
                      location.medianHomePrice != null && (
                        <>
                          <dt className="text-muted">Median home price</dt>
                          <dd className="font-medium text-foreground sm:col-span-2">
                            ~${location.medianHomePrice.toLocaleString()}
                          </dd>
                        </>
                      )}
                    {calculator === "dscr" && (
                      <>
                        <dt className="text-muted">Lender DSCR minimum</dt>
                        <dd className="font-medium text-foreground sm:col-span-2">
                          Typically 1.25 — confirm with your lender
                        </dd>
                      </>
                    )}
                  </dl>
                )}
                <p className="mt-4 text-xs text-muted">
                  Rent: HUD FMR 2025 · Property tax: Tax Foundation 2022 ·
                  Adjust all calculator inputs to match your specific deal.
                </p>
              </div>
            </MobileCollapsible>
          </section>

          <p className="mt-8 text-center text-sm text-muted">
            Other calculators for {location.name}:{" "}
            {siblingLinks(calculator).map(({ slug, label }, i) => (
              <span key={slug}>
                {i > 0 && " · "}
                <Link
                  href={`/tools/${slug}/${location.slug}`}
                  className="font-medium text-foreground hover:underline"
                >
                  {label}
                </Link>
              </span>
            ))}
            .{" "}
            <Link href="/tools" className="font-medium text-foreground hover:underline">
              All calculators
            </Link>
            {" · "}
            <Link
              href="/investment-property-calculator"
              className="font-medium text-foreground hover:underline"
            >
              Investment property calculator
            </Link>
          </p>
        </div>
      </main>
      <Footer supportEmail={supportEmail} />
    </div>
  );
}
