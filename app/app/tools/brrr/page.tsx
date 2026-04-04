import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { LandingNav } from "@/components/landing-nav";
import { Footer } from "@/components/footer";
import { BrrrCalculator } from "@/components/marketing/brrr-calculator";
import { PlanIntentUrlSync } from "@/components/analytics/plan-intent-url-sync";
import {
  CalculatorFaqJsonLd,
  CalculatorFaqSection,
} from "@/components/marketing/calculator-faq";
import { BRRR_CALCULATOR_FAQ } from "@/lib/marketing/calculator-faqs";
import { getAppOrigin } from "@/lib/app-url";
import { FunnelCtaLink } from "@/components/marketing/funnel-cta-link";

const APP_URL = getAppOrigin();

export const metadata: Metadata = {
  title: "BRRRR Calculator",
  description:
    "Free BRRRR calculator: estimate rehab hold costs, refinance cash-out, and stabilized rental performance. Save your work in Veld.",
  alternates: { canonical: `${APP_URL}/tools/brrr` },
  openGraph: {
    title: "BRRRR Calculator | Veld Portfolio",
    description: "Model buy–rehab–rent–refinance with transparent assumptions.",
    url: "/tools/brrr",
  },
};

export default async function BrrrCalculatorPage() {
  const { userId } = await auth();
  const supportEmail = process.env.SUPPORT_EMAIL ?? null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Suspense fallback={null}>
        <PlanIntentUrlSync />
      </Suspense>
      <LandingNav userId={userId} landingVariant="brrr_calc_v1" />
      <main className="flex-1 px-4 py-12 md:py-14">
        <div className="mx-auto max-w-6xl">
          <CalculatorFaqJsonLd items={BRRR_CALCULATOR_FAQ} />
          <nav className="flex items-center gap-1.5 text-sm text-muted" aria-label="Breadcrumb">
            <Link href="/tools" className="transition-colors duration-150 hover:text-foreground">
              Calculators
            </Link>
            <ChevronRight className="size-3.5 text-muted/50" aria-hidden />
            <span className="text-foreground">BRRRR</span>
          </nav>
          <header className="hero-animate mt-4 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              BRRRR calculator
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base text-muted">
              Interest-only during rehab, then a cash-out refinance at ARV. Numbers are educational—confirm
              with your lender and include reserves, taxes, and insurance in expenses.
            </p>
          </header>

          <div className="reveal-up reveal-up-d1 mt-8">
            <BrrrCalculator showCta landingVariant="brrr_calc_v1" />
          </div>

          <CalculatorFaqSection items={BRRR_CALCULATOR_FAQ} />

          {!userId && (
            <div className="mt-10 rounded-xl border border-accent/20 bg-accent/5 p-6 text-center">
              <p className="text-base font-semibold text-foreground">
                Ready to track this property?
              </p>
              <p className="mt-1 text-sm text-muted">
                Save your analysis, model scenarios, and track rent benchmarks.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <FunnelCtaLink
                  href="/sign-up?intent=free"
                  placement="brrr_footer"
                  ctaId="get_started_free"
                  planIntent="free"
                  landingVariant="brrr_calc_v1"
                  className="inline-flex items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover"
                >
                  Get started free
                </FunnelCtaLink>
                <Link
                  href="/pricing"
                  className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-subtle"
                >
                  See plans
                </Link>
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-muted">
            Assumptions: acquisition loan is interest-only until refi; refi pays off the acquisition loan
            balance; stabilized rent applies after rehab.{" "}
            <Link href="/tools" className="font-medium text-foreground hover:underline">
              All calculators
            </Link>
            {" · "}
            <Link href="/investment-property-calculator" className="font-medium text-foreground hover:underline">
              Rental calculator
            </Link>
            {" · "}
            <Link href="/tools/str-vs-ltr" className="font-medium text-foreground hover:underline">
              STR vs LTR
            </Link>
            {" · "}
            <Link href="/tools/fix-and-flip" className="font-medium text-foreground hover:underline">
              Fix and flip
            </Link>
            . State pages:{" "}
            <Link href="/tools/brrr/texas" className="font-medium text-foreground hover:underline">
              Texas
            </Link>
            ,{" "}
            <Link href="/tools/brrr/florida" className="font-medium text-foreground hover:underline">
              Florida
            </Link>
            ,{" "}
            <Link href="/tools/brrr/georgia" className="font-medium text-foreground hover:underline">
              Georgia
            </Link>
            .
          </p>
        </div>
      </main>
      <Footer supportEmail={supportEmail} />
    </div>
  );
}
