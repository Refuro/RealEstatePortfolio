import Link from "next/link";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Check, X } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { Footer } from "@/components/footer";
import { LandingNav } from "@/components/landing-nav";
import { PlanIntentUrlSync } from "@/components/analytics/plan-intent-url-sync";
import { FunnelCtaLink } from "@/components/marketing/funnel-cta-link";
import {
  CalculatorFaqJsonLd,
  CalculatorFaqSection,
} from "@/components/marketing/calculator-faq";
import type { CompetitorPageConfig } from "@/lib/marketing/competitor-data";

const PublicCalculator = dynamic(
  () => import("@/components/marketing/public-calculator").then((m) => m.PublicCalculator),
  { loading: () => <div className="min-h-[240px]" aria-hidden /> }
);

function FeatureCell({ value, isVeld }: { value: boolean; isVeld?: boolean }) {
  return (
    <td className={`px-3 py-3 text-center${isVeld ? " bg-subtle" : ""}`}>
      {value ? (
        <Check className="mx-auto size-5 text-positive" aria-label="Yes" />
      ) : (
        <X className="mx-auto size-5 text-negative" aria-label="No" />
      )}
    </td>
  );
}

export async function CompetitorAlternativePage({ config }: { config: CompetitorPageConfig }) {
  const { userId } = await auth();
  const supportEmail = process.env.SUPPORT_EMAIL ?? null;
  const breadcrumbParent = config.kind === "alternatives" ? "Alternatives" : "Compare";
  const breadcrumbParentHref = config.kind === "alternatives" ? "/alternatives" : "/vs";
  const switcherLabel =
    config.kind === "alternatives"
      ? `Looking to move off ${config.competitorColumnLabel}?`
      : "Compare";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Suspense fallback={null}>
        <PlanIntentUrlSync />
      </Suspense>
      <LandingNav userId={userId} landingVariant={config.landingVariant} />
      <main className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <CalculatorFaqJsonLd items={config.faqs} />

          {/* Breadcrumb */}
          <nav className="text-sm text-muted" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-foreground hover:underline">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href={breadcrumbParentHref} className="hover:text-foreground hover:underline">
              {breadcrumbParent}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{config.competitorColumnLabel}</span>
          </nav>

          {/* Hero */}
          <header className="mt-8 text-center">
            <p className="text-sm font-medium text-muted">{switcherLabel}</p>
            <h1 className="mt-3 text-3xl font-semibold text-foreground md:text-4xl">
              {config.h1}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted">{config.lede}</p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <FunnelCtaLink
                href="/sign-up"
                placement="competitor_alt_hero"
                ctaId="competitor_sign_up"
                landingVariant={config.landingVariant}
                className="inline-flex rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
              >
                Create free account
              </FunnelCtaLink>
              <FunnelCtaLink
                href="/pricing"
                placement="competitor_alt_hero_pricing"
                ctaId="view_pricing"
                planIntent="free"
                landingVariant={config.landingVariant}
                className="inline-flex rounded-md border border-default bg-transparent px-5 py-2.5 text-sm font-medium text-foreground hover:bg-subtle"
              >
                View pricing
              </FunnelCtaLink>
            </div>
          </header>

          {/* Comparison table */}
          <div className="mt-12 overflow-x-auto rounded-lg border border-default bg-card">
            <table className="w-full min-w-[320px] text-sm">
              <thead>
                <tr className="border-b border-default">
                  <th
                    scope="col"
                    className="px-3 py-3 text-left text-sm font-semibold uppercase tracking-wide text-muted"
                  >
                    Capability
                  </th>
                  <th
                    scope="col"
                    className="bg-subtle px-3 py-3 text-center text-sm font-semibold uppercase tracking-wide text-foreground"
                  >
                    Veld Portfolio
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3 text-center text-sm font-semibold uppercase tracking-wide text-muted"
                  >
                    {config.competitorColumnLabel}
                  </th>
                </tr>
              </thead>
              <tbody>
                {config.features.map((row) => (
                  <tr key={row.label} className="border-b border-default last:border-b-0">
                    <th scope="row" className="px-3 py-3 text-left font-medium text-foreground">
                      {row.label}
                    </th>
                    <FeatureCell value={row.veld} isVeld />
                    <FeatureCell value={row.competitor} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing note below table */}
          <p className="mt-3 text-center text-sm text-muted">
            Free plan available — no card required.{" "}
            <FunnelCtaLink
              href="/pricing"
              placement="competitor_alt_pricing_note"
              ctaId="see_full_pricing"
              planIntent="free"
              landingVariant={config.landingVariant}
              className="font-medium text-foreground hover:underline"
            >
              See full pricing.
            </FunnelCtaLink>
          </p>

          {/* Inline CTA after table */}
          <div className="mt-6 rounded-lg border border-default bg-card px-6 py-5 text-center">
            <p className="text-sm text-muted">
              Ready to see how Veld works for your portfolio?
            </p>
            <div className="mt-3">
              <FunnelCtaLink
                href="/sign-up"
                placement="competitor_alt_table"
                ctaId="competitor_sign_up_table"
                landingVariant={config.landingVariant}
                className="inline-flex rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
              >
                Start free — no card required
              </FunnelCtaLink>
            </div>
          </div>

          {/* Who this is for */}
          {config.fitFor && config.fitFor.length > 0 && (
            <section className="mt-12" aria-labelledby="fit-for-heading">
              <h2
                id="fit-for-heading"
                className="text-center text-sm font-semibold uppercase tracking-wide text-muted"
              >
                Who this is for
              </h2>
              <ul className="mx-auto mt-6 max-w-xl space-y-3">
                {config.fitFor.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-positive"
                      aria-hidden="true"
                    />
                    <span className="text-sm text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Differentiators */}
          <section className="mt-12" aria-labelledby="differentiators-heading">
            <h2
              id="differentiators-heading"
              className="text-center text-sm font-semibold uppercase tracking-wide text-muted"
            >
              Why investors choose Veld
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              {config.differentiators.map((d, i) => (
                <div key={d.title} className="rounded-lg border border-default bg-card p-6">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                    0{i + 1}
                  </span>
                  <h3 className="mt-2 text-base font-semibold text-foreground">{d.title}</h3>
                  <p className="mt-2 text-sm text-muted">{d.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing transparency note */}
          <aside className="mt-10 rounded-lg border border-default bg-subtle px-6 py-4 text-center">
            <p className="text-sm text-muted">
              Free plan includes 1 property and 5 saved deals — no card required.{" "}
              <FunnelCtaLink
                href="/pricing"
                placement="competitor_alt_transparency"
                ctaId="view_all_plans"
                planIntent="free"
                landingVariant={config.landingVariant}
                className="font-medium text-foreground hover:underline"
              >
                View all plans.
              </FunnelCtaLink>
            </p>
          </aside>

          {/* Calculator — reframed heading */}
          <section className="mt-14" aria-labelledby="try-calculator-heading">
            <h2
              id="try-calculator-heading"
              className="text-center text-sm font-semibold uppercase tracking-wide text-muted"
            >
              See your numbers before you sign up
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-sm text-muted">
              Estimate cash flow and key rental metrics in minutes. No account required.
            </p>
            <div className="mt-6">
              <PublicCalculator compact showCta landingVariant={config.landingVariant} />
            </div>
          </section>

          {/* Final CTA section */}
          <section
            className="mt-14 rounded-lg border border-default bg-card px-6 py-10 text-center"
            aria-labelledby="final-cta-heading"
          >
            <h2
              id="final-cta-heading"
              className="text-xl font-semibold text-foreground"
            >
              Ready to try it?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted">
              Free plan, no card required. Upgrade when you need more properties or deals.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <FunnelCtaLink
                href="/sign-up"
                placement="competitor_alt_footer"
                ctaId="competitor_sign_up_footer"
                landingVariant={config.landingVariant}
                className="inline-flex rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
              >
                Create free account
              </FunnelCtaLink>
              <FunnelCtaLink
                href="/pricing"
                placement="competitor_alt_footer_pricing"
                ctaId="view_pricing_footer"
                planIntent="free"
                landingVariant={config.landingVariant}
                className="inline-flex rounded-md border border-default bg-transparent px-5 py-2.5 text-sm font-medium text-foreground hover:bg-subtle"
              >
                View pricing
              </FunnelCtaLink>
            </div>
          </section>

          <CalculatorFaqSection items={config.faqs} />

          <p className="mt-8 text-center text-sm text-muted">
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
            {" · "}
            <Link href="/tools/brrr" className="font-medium text-foreground hover:underline">
              BRRRR calculator
            </Link>
          </p>
        </div>
      </main>
      <Footer supportEmail={supportEmail} />
    </div>
  );
}
