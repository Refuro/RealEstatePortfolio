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
import { BrrrCalculator } from "@/components/marketing/brrr-calculator";
import { StrLtrCalculator } from "@/components/marketing/str-ltr-calculator";
import { FixAndFlipCalculator } from "@/components/marketing/fix-and-flip-calculator";
import { PublicCalculator } from "@/components/marketing/public-calculator";
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
  const faqItems = mergeLocationFaqs(def, location.extraFaqs);
  const variant = buildLocationLandingVariant(calculator, location.slug);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Suspense fallback={null}>
        <PlanIntentUrlSync />
      </Suspense>
      <LandingNav userId={userId} landingVariant={variant} />
      <main className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <CalculatorFaqJsonLd items={faqItems} />

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

          <header className="mt-4 text-center">
            <p className="text-sm font-medium uppercase tracking-wide text-muted">
              Calculator · {location.name}
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground md:text-3xl">
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

          <div className="mt-8">
            {calculator === "brrr" && (
              <BrrrCalculator
                showCta
                landingVariant={variant}
                initialMonthlyRent={location.avgMonthlyRent}
              />
            )}
            {calculator === "str-vs-ltr" && (
              <StrLtrCalculator
                showCta
                landingVariant={variant}
                initialLtrRent={location.avgMonthlyRent}
              />
            )}
            {calculator === "fix-and-flip" && (
              <FixAndFlipCalculator showCta landingVariant={variant} />
            )}
            {calculator === "investment-property" && (
              <PublicCalculator
                showCta
                landingVariant={variant}
                initialMonthlyRent={location.avgMonthlyRent}
              />
            )}
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
              <div className="rounded-lg border border-default bg-card p-6">
                <p className="text-sm font-semibold uppercase tracking-wide text-muted">
                  Real estate investing in {location.name}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted">{location.localContext}</p>
                {(location.avgEffectivePropertyTaxRate != null ||
                  location.stateIncomeTax != null ||
                  location.avgMonthlyRent != null) && (
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
