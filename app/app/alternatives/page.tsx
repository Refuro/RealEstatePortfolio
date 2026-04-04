import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { Footer } from "@/components/footer";
import { LandingNav } from "@/components/landing-nav";
import { PlanIntentUrlSync } from "@/components/analytics/plan-intent-url-sync";
import { FunnelCtaLink } from "@/components/marketing/funnel-cta-link";
import { AnimatedSection } from "@/components/marketing/animated-section";
import { COMPETITOR_ALTERNATIVES } from "@/lib/marketing/competitor-data";
import { getAppOrigin } from "@/lib/app-url";

const APP_URL = getAppOrigin();

export const metadata: Metadata = {
  title: "Veld Alternatives — Compare Rental Property Tools",
  description:
    "Compare Veld Portfolio to other rental tracking tools—honest capability snapshots and links to full comparison pages.",
  alternates: { canonical: `${APP_URL}/alternatives` },
  openGraph: {
    title: "Alternatives | Veld Portfolio",
    description: "Compare Veld to other tools for rental investors.",
    url: "/alternatives",
  },
};

export default async function AlternativesHubPage() {
  const { userId } = await auth();
  const supportEmail = process.env.SUPPORT_EMAIL ?? null;
  const entries = Object.values(COMPETITOR_ALTERNATIVES);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Suspense fallback={null}>
        <PlanIntentUrlSync />
      </Suspense>
      <LandingNav userId={userId} landingVariant="alt_hub_v1" />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <nav className="text-sm text-muted">
            <Link href="/" className="transition-colors duration-150 hover:text-foreground hover:underline">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Alternatives</span>
          </nav>
          <header className="mt-6">
            <div
              className="hero-animate mb-3 flex justify-center"
              style={{ transitionDelay: "0ms" }}
            >
              <span className="inline-flex items-center rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent">
                Compare
              </span>
            </div>
            <h1
              className="hero-animate text-center text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
              style={{ transitionDelay: "80ms" }}
            >
              Alternatives
            </h1>
            <p
              className="hero-animate mx-auto mt-3 max-w-xl text-center text-base text-muted"
              style={{ transitionDelay: "160ms" }}
            >
              Side-by-side capability pages for investors evaluating Veld against other products.
            </p>
          </header>

          <AnimatedSection>
            <ul className="mt-8 space-y-4">
              {entries.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/alternatives/${c.slug}`}
                    className="block rounded-lg border border-default bg-card p-5 shadow-sm transition-all duration-150 hover:bg-subtle hover:shadow-md"
                  >
                    <span className="font-semibold text-foreground">
                      {c.competitorColumnLabel} alternative
                    </span>
                    <p className="mt-1 text-sm text-muted">{c.lede}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </AnimatedSection>

          <p className="mt-8 text-center text-sm text-muted">
            <Link href="/tools" className="font-medium text-foreground transition-colors duration-150 hover:underline">
              All calculators
            </Link>
            {" · "}
            <FunnelCtaLink
              href="/pricing"
              placement="alternatives_hub_footer"
              ctaId="pricing"
              planIntent="free"
              landingVariant="alt_hub_v1"
              className="font-medium text-foreground transition-colors duration-150 hover:underline"
            >
              Pricing
            </FunnelCtaLink>
          </p>
        </div>

        {!userId && (
          <section
            aria-labelledby="hub-bottom-cta-heading"
            className="border-y border-border bg-subtle px-4 py-16 sm:py-20"
          >
            <AnimatedSection>
              <div className="mx-auto max-w-xl text-center">
                <h2
                  id="hub-bottom-cta-heading"
                  className="text-2xl font-semibold text-foreground"
                >
                  Ready to see for yourself?
                </h2>
                <p className="mx-auto mt-3 max-w-sm text-base text-muted">
                  Free plan. Full features. No card required.
                </p>
                <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <FunnelCtaLink
                    href="/sign-up?intent=free"
                    placement="alternatives_hub_bottom_cta"
                    ctaId="create_free_account"
                    planIntent="free"
                    landingVariant="alt_hub_v1"
                    className="cta-accent-glow inline-flex min-h-[44px] items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover"
                  >
                    Create free account
                  </FunnelCtaLink>
                  <FunnelCtaLink
                    href="/pricing"
                    placement="alternatives_hub_bottom_cta"
                    ctaId="view_pricing"
                    planIntent="free"
                    landingVariant="alt_hub_v1"
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
