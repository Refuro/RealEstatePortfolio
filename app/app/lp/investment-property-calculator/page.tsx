import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { LandingNav } from "@/components/landing-nav";
import { Footer } from "@/components/footer";
import { PublicCalculator } from "@/components/marketing/public-calculator";
import { PlanIntentUrlSync } from "@/components/analytics/plan-intent-url-sync";
import { FunnelCtaLink } from "@/components/marketing/funnel-cta-link";
import { getAppOrigin } from "@/lib/app-url";

const APP_URL = getAppOrigin();

export const metadata: Metadata = {
  title: "Investment Property Calculator",
  description:
    "Quick rental property calculator for investors: cash flow, cap rate, DSCR, and cash-on-cash return.",
  alternates: { canonical: `${APP_URL}/investment-property-calculator` },
  robots: { index: false, follow: true },
};

export default async function PaidCalculatorLandingPage() {
  const { userId } = await auth();
  const supportEmail = process.env.SUPPORT_EMAIL ?? null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Suspense fallback={null}>
        <PlanIntentUrlSync />
      </Suspense>
      <LandingNav userId={userId} landingVariant="calc_paid_v1" />
      <main className="flex-1 px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <header className="hero-animate text-center">
            <p className="text-sm font-medium uppercase tracking-wide text-muted">
              Rental deal math in seconds
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground sm:text-4xl">
              Investment Property Calculator
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base text-muted">
              Run a quick rental analysis, then save your assumptions and open the full deal
              analyzer in Veld.
            </p>
            {!userId && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-muted">
                <span className="rounded-full border border-border px-3 py-1">
                  No card required
                </span>
                <span className="rounded-full border border-border px-3 py-1">
                  Start in under 60 seconds
                </span>
              </div>
            )}
          </header>

          <div className="reveal-up reveal-up-d1 mt-8">
            <PublicCalculator showCta landingVariant="calc_paid_v1" />
          </div>

          <section className="mt-6 rounded-xl border border-border bg-card p-4 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Calculator or full deal analyzer?
            </h2>
            <p className="mt-2 text-sm text-muted">
              For quick estimates, stay here. For deeper analysis (multifamily, saved comparisons), create a free account and continue in the full analyzer.
            </p>
          </section>

          <section className="mt-8 rounded-xl border border-border bg-card p-4 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              What happens next
            </h2>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div className="rounded-md border border-border bg-background/45 p-3">
                <p className="text-xs font-semibold text-foreground">Calculator</p>
                <p className="mt-1 text-sm text-muted">
                  Quick estimate for cash flow, cap rate, DSCR, and cash-on-cash.
                </p>
              </div>
              <div className="rounded-md border border-border bg-background/45 p-3">
                <p className="text-xs font-semibold text-foreground">Deal analyzer</p>
                <p className="mt-1 text-sm text-muted">
                  Save assumptions, compare scenarios, and keep deals in one place.
                </p>
              </div>
              <div className="rounded-md border border-border bg-background/45 p-3">
                <p className="text-xs font-semibold text-foreground">Portfolio workspace</p>
                <p className="mt-1 text-sm text-muted">
                  Move from one deal to tracked properties and portfolio metrics.
                </p>
              </div>
            </div>
            {!userId && (
              <div className="mt-4 text-center">
                <FunnelCtaLink
                  href="/sign-up?intent=free"
                  placement="lp_calc_footer"
                  ctaId="create_account_footer"
                  planIntent="free"
                  landingVariant="calc_paid_v1"
                  className="inline-flex rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
                >
                  Create free account
                </FunnelCtaLink>
              </div>
            )}
            <div className="mt-4 text-center text-sm">
              <Link className="text-muted hover:text-foreground hover:underline" href="/investment-property-calculator">
                Prefer the full public calculator page?
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer supportEmail={supportEmail} />
    </div>
  );
}
