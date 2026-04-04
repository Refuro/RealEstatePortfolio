import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FunnelCtaLink } from "@/components/marketing/funnel-cta-link";
import { auth } from "@clerk/nextjs/server";
import { LandingNav } from "@/components/landing-nav";
import { Footer } from "@/components/footer";
import { PublicCalculator } from "@/components/marketing/public-calculator";
import { PlanIntentUrlSync } from "@/components/analytics/plan-intent-url-sync";
import {
  CalculatorFaqJsonLd,
  CalculatorFaqSection,
} from "@/components/marketing/calculator-faq";
import { INVESTMENT_PROPERTY_CALCULATOR_FAQ } from "@/lib/marketing/calculator-faqs";
import { getAppOrigin } from "@/lib/app-url";

const APP_URL = getAppOrigin();

export const metadata: Metadata = {
  title: "Investment Property Calculator",
  description:
    "Free investment property calculator for monthly cash flow, cap rate, DSCR, and cash-on-cash. Create a free Veld account to save deals in Analyze and track your portfolio.",
  alternates: { canonical: `${APP_URL}/investment-property-calculator` },
  openGraph: {
    title: "Investment Property Calculator | Veld Portfolio",
    description:
      "Estimate rental cash flow and key real estate metrics in seconds. Save your analysis and compare deals in Veld.",
    url: "/investment-property-calculator",
  },
};

export default async function InvestmentPropertyCalculatorPage() {
  const { userId } = await auth();
  const supportEmail = process.env.SUPPORT_EMAIL ?? null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Suspense fallback={null}>
        <PlanIntentUrlSync />
      </Suspense>
      <LandingNav userId={userId} landingVariant="calc_control_v1" />
      <main className="flex-1 px-4 py-12 md:py-14">
        <div className="mx-auto max-w-6xl">
          <CalculatorFaqJsonLd items={INVESTMENT_PROPERTY_CALCULATOR_FAQ} />
          <header className="hero-animate text-center">
            <div className="mb-3 flex justify-center">
              <span className="inline-flex items-center rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent">
                Calculator
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Investment property calculator
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base text-muted">
              Estimate rental property performance. With a free account, save deals in Analyze and track your portfolio.
            </p>
          </header>

          <div className="reveal-up reveal-up-d1 mt-8">
            <PublicCalculator
              showCta
              landingVariant="calc_control_v1"
              funnelPlacement="investment_property_inline"
            />
          </div>

          <CalculatorFaqSection items={INVESTMENT_PROPERTY_CALCULATOR_FAQ} />

          <p className="mt-5 text-center text-sm text-muted">
            Works for single-family and multifamily quick estimates. Compare STR vs long-term rent on{" "}
            <Link href="/tools/str-vs-ltr" className="font-medium text-foreground hover:underline">
              the STR vs LTR calculator
            </Link>
            ; model a flip with the{" "}
            <Link href="/tools/fix-and-flip" className="font-medium text-foreground hover:underline">
              fix-and-flip calculator
            </Link>
            ; or run a BRRRR scenario with the{" "}
            <Link href="/tools/brrr" className="font-medium text-foreground hover:underline">
              BRRRR calculator
            </Link>
            . Calculator inputs are not transferred when you sign up—re-enter key numbers in the app.
            Comparing products? See the{" "}
            <Link href="/alternatives/stessa" className="font-medium text-foreground hover:underline">
              Stessa alternative
            </Link>{" "}
            page or{" "}
            <Link href="/vs/spreadsheets" className="font-medium text-foreground hover:underline">
              spreadsheets vs Veld
            </Link>
            . State pages:{" "}
            <Link
              href="/tools/investment-property/texas"
              className="font-medium text-foreground hover:underline"
            >
              Texas
            </Link>
            ,{" "}
            <Link
              href="/tools/investment-property/florida"
              className="font-medium text-foreground hover:underline"
            >
              Florida
            </Link>
            ,{" "}
            <Link
              href="/tools/investment-property/california"
              className="font-medium text-foreground hover:underline"
            >
              California
            </Link>
            .
          </p>

          {!userId && (
            <div className="mt-10 rounded-xl border border-accent/20 bg-accent/5 p-6 text-center">
              <p className="text-base font-semibold text-foreground">
                Ready to track this property?
              </p>
              <p className="mt-1 text-sm text-muted">
                Save your analysis, model scenarios, and benchmark rent in one place.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <FunnelCtaLink
                  href="/sign-up?intent=free"
                  placement="investment_property_footer"
                  ctaId="get_started_free"
                  planIntent="free"
                  landingVariant="calc_control_v1"
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
        </div>
      </main>
      <Footer supportEmail={supportEmail} />
    </div>
  );
}
