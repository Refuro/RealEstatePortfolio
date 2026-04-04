import Link from "next/link";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Check, X } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { Footer } from "@/components/footer";
import { LandingNav } from "@/components/landing-nav";
import { PlanIntentUrlSync } from "@/components/analytics/plan-intent-url-sync";
import { FunnelCtaLink } from "@/components/marketing/funnel-cta-link";
import { AnimatedSection } from "@/components/marketing/animated-section";
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

  const eyebrowLabel =
    config.kind === "alternatives"
      ? `Alternative to ${config.competitorColumnLabel}`
      : `vs ${config.competitorColumnLabel}`;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Suspense fallback={null}>
        <PlanIntentUrlSync />
      </Suspense>
      <LandingNav userId={userId} landingVariant={config.landingVariant} />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <CalculatorFaqJsonLd items={config.faqs} />

          {/* Breadcrumb */}
          <nav className="text-sm text-muted" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors duration-150 hover:text-foreground hover:underline">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href={breadcrumbParentHref} className="transition-colors duration-150 hover:text-foreground hover:underline">
              {breadcrumbParent}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{config.competitorColumnLabel}</span>
          </nav>

          {/* Hero */}
          <header className="mt-8 text-center">
            <div
              className="hero-animate mb-3 flex justify-center"
              style={{ transitionDelay: "0ms" }}
            >
              <span className="inline-flex items-center rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent">
                {eyebrowLabel}
              </span>
            </div>
            <h1
              className="hero-animate mt-3 text-3xl font-semibold text-foreground md:text-4xl"
              style={{ transitionDelay: "80ms" }}
            >
              {config.h1}
            </h1>
            <p
              className="hero-animate mx-auto mt-4 max-w-2xl text-base text-muted"
              style={{ transitionDelay: "160ms" }}
            >
              {config.lede}
            </p>
            <div
              className="hero-animate mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
              style={{ transitionDelay: "220ms" }}
            >
              <FunnelCtaLink
                href="/sign-up"
                placement="competitor_alt_hero"
                ctaId="competitor_sign_up"
                landingVariant={config.landingVariant}
                className="cta-accent-glow inline-flex min-h-[44px] items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover"
              >
                Create free account
              </FunnelCtaLink>
              <FunnelCtaLink
                href="/pricing"
                placement="competitor_alt_hero_pricing"
                ctaId="view_pricing"
                planIntent="free"
                landingVariant={config.landingVariant}
                className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-default bg-transparent px-5 py-2.5 text-sm font-medium text-foreground transition-all duration-150 hover:bg-subtle"
              >
                View pricing
              </FunnelCtaLink>
            </div>
            {!userId && (
              <p
                className="hero-animate mt-4 text-sm text-muted"
                style={{ transitionDelay: "280ms" }}
              >
                Free plan —{" "}
                <span className="font-medium text-foreground">no card required</span>.
                Your first property in about 60 seconds.
              </p>
            )}
          </header>
        </div>

        {/* Social proof strip */}
        <div
          className="border-y border-border bg-subtle px-4 py-6"
          aria-label="Product highlights"
          role="region"
        >
          <div className="mx-auto max-w-5xl">
            <div
              className="hero-animate flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center sm:gap-8"
              style={{ transitionDelay: "400ms" }}
            >
              <p className="text-sm text-muted">
                Built for landlords with{" "}
                <span className="font-medium text-foreground">1–5 properties</span>
                {" "}— no bank sync required
              </p>
              <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
              <p className="text-sm text-muted">
                <span className="font-medium text-foreground">Deal analysis, mortgage simulation, and rent estimates</span>
              </p>
              <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
              <p className="text-sm text-muted">
                Free plan —{" "}
                <span className="font-medium text-foreground">no card required</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4">
          {/* Comparison table */}
          <AnimatedSection>
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
                className="font-medium text-foreground transition-colors duration-150 hover:underline"
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
                  className="inline-flex rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover"
                >
                  Start free — no card required
                </FunnelCtaLink>
              </div>
            </div>
          </AnimatedSection>

          {/* Who this is for */}
          {config.fitFor && config.fitFor.length > 0 && (
            <section className="mt-12" aria-labelledby="fit-for-heading">
              <AnimatedSection>
                <div className="mb-3 flex justify-center">
                  <span className="inline-flex items-center rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent">
                    Who it&apos;s for
                  </span>
                </div>
                <h2
                  id="fit-for-heading"
                  className="text-center text-2xl font-semibold text-foreground"
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
              </AnimatedSection>
            </section>
          )}

          {/* Differentiators */}
          <section className="mt-12" aria-labelledby="differentiators-heading">
            <AnimatedSection>
              <div className="mb-3 flex justify-center">
                <span className="inline-flex items-center rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent">
                  Why Veld
                </span>
              </div>
              <h2
                id="differentiators-heading"
                className="text-center text-2xl font-semibold text-foreground"
              >
                Why investors choose Veld
              </h2>
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                {config.differentiators.map((d, i) => (
                  <div
                    key={d.title}
                    className="rounded-lg border border-default bg-card p-6 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <span className="text-xs font-medium text-accent">
                      0{i + 1}
                    </span>
                    <h3 className="mt-2 text-base font-semibold text-foreground">{d.title}</h3>
                    <p className="mt-2 text-sm text-muted">{d.body}</p>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </section>

          {/* Pricing transparency note */}
          <AnimatedSection>
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
          </AnimatedSection>

          {/* Calculator */}
          <section className="mt-14" aria-labelledby="try-calculator-heading">
            <AnimatedSection>
              <div className="mb-3 flex justify-center">
                <span className="inline-flex items-center rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent">
                  Free tool
                </span>
              </div>
              <h2
                id="try-calculator-heading"
                className="text-center text-2xl font-semibold text-foreground"
              >
                See your numbers before you sign up
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-center text-sm text-muted">
                Estimate cash flow and key rental metrics in minutes. No account required.
              </p>
              <div className="mt-6">
                <PublicCalculator compact showCta landingVariant={config.landingVariant} />
              </div>
            </AnimatedSection>
          </section>

          {/* FAQ */}
          <AnimatedSection>
            <CalculatorFaqSection items={config.faqs} />
          </AnimatedSection>

          <p className="mt-8 text-center text-sm text-muted">
            <Link href="/tools" className="font-medium text-foreground transition-colors duration-150 hover:underline">
              All calculators
            </Link>
            {" · "}
            <Link
              href="/investment-property-calculator"
              className="font-medium text-foreground transition-colors duration-150 hover:underline"
            >
              Investment property calculator
            </Link>
            {" · "}
            <Link href="/tools/brrr" className="font-medium text-foreground transition-colors duration-150 hover:underline">
              BRRRR calculator
            </Link>
          </p>
        </div>

        {/* Bottom CTA strip — signed-out only */}
        {!userId && (
          <section
            aria-labelledby="final-cta-heading"
            className="border-y border-border bg-subtle px-4 py-16 sm:py-20"
          >
            <AnimatedSection>
              <div className="mx-auto max-w-xl text-center">
                <h2
                  id="final-cta-heading"
                  className="text-2xl font-semibold text-foreground"
                >
                  Ready to try it?
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm text-muted">
                  Free plan, no card required. Upgrade when you need more properties or deals.
                </p>
                <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <FunnelCtaLink
                    href="/sign-up"
                    placement="competitor_alt_footer"
                    ctaId="competitor_sign_up_footer"
                    landingVariant={config.landingVariant}
                    className="cta-accent-glow inline-flex min-h-[44px] items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover"
                  >
                    Create free account
                  </FunnelCtaLink>
                  <FunnelCtaLink
                    href="/pricing"
                    placement="competitor_alt_footer_pricing"
                    ctaId="view_pricing_footer"
                    planIntent="free"
                    landingVariant={config.landingVariant}
                    className="inline-flex min-h-[44px] items-center justify-center text-sm font-medium text-muted transition-colors duration-150 hover:text-foreground"
                  >
                    View pricing
                  </FunnelCtaLink>
                </div>
              </div>
            </AnimatedSection>
          </section>
        )}
      </main>
      <Footer supportEmail={supportEmail} />
    </div>
  );
}
