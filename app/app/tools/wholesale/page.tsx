import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { LandingNav } from "@/components/landing-nav";
import { Footer } from "@/components/footer";
import { WholesaleSlot as WholesaleCalculator } from "@/components/marketing/calculator-page-slots";
import { PlanIntentUrlSync } from "@/components/analytics/plan-intent-url-sync";
import {
  CalculatorFaqJsonLd,
  CalculatorFaqSection,
} from "@/components/marketing/calculator-faq";
import { WHOLESALE_CALCULATOR_FAQ } from "@/lib/marketing/calculator-faqs";
import { getAppOrigin } from "@/lib/app-url";
import { FunnelCtaLink } from "@/components/marketing/funnel-cta-link";

const APP_URL = getAppOrigin();

export const metadata: Metadata = {
  title: "Wholesale Real Estate Calculator",
  description:
    "Free wholesale real estate calculator: compute Maximum Allowable Offer (MAO), assignment fee, and equity cushion using the 70% rule. Analyze deals with Veld.",
  alternates: { canonical: `${APP_URL}/tools/wholesale` },
  openGraph: {
    title: "Wholesale Real Estate Calculator | Veld Portfolio",
    description: "Compute MAO and assignment economics with an adjustable ARV multiplier.",
    url: "/tools/wholesale",
  },
};

export default async function WholesaleCalculatorPage() {
  const { userId } = await auth();
  const supportEmail = process.env.SUPPORT_EMAIL ?? null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Suspense fallback={null}>
        <PlanIntentUrlSync />
      </Suspense>
      <LandingNav userId={userId} landingVariant="wholesale_v1" />
      <main className="flex-1 px-4 py-12 md:py-14">
        <div className="mx-auto max-w-6xl">
          <CalculatorFaqJsonLd items={WHOLESALE_CALCULATOR_FAQ} />
          <nav className="flex items-center gap-1.5 text-sm text-muted" aria-label="Breadcrumb">
            <Link href="/tools" className="transition-colors duration-150 hover:text-foreground">
              Calculators
            </Link>
            <ChevronRight className="size-3.5 text-muted/50" aria-hidden />
            <span className="text-foreground">Wholesale</span>
          </nav>
          <header className="hero-animate mt-4 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Wholesale real estate calculator
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base text-muted">
              Estimate maximum allowable offer (MAO), assignment fee economics, and end-buyer
              equity cushion with a market-adjustable multiplier.
            </p>
          </header>

          <div className="reveal-up reveal-up-d1 mt-8">
            <WholesaleCalculator showCta landingVariant="wholesale_v1" />
          </div>

          <div className="reveal-up reveal-up-d2">
            <CalculatorFaqSection items={WHOLESALE_CALCULATOR_FAQ} />
          </div>

          {!userId ? (
            <div className="reveal-up reveal-up-d3 mt-10 rounded-xl border border-accent/20 bg-accent/5 p-6 text-center">
              <p className="text-base font-semibold text-foreground">Ready to track this deal?</p>
              <p className="mt-1 text-sm text-muted">
                Save assumptions, compare scenarios, and monitor your portfolio in one place.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <FunnelCtaLink
                  href="/sign-up?intent=free"
                  placement="wholesale_footer"
                  ctaId="get_started_free"
                  planIntent="free"
                  landingVariant="wholesale_v1"
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
          ) : (
            <div className="reveal-up reveal-up-d3 mt-10 text-center">
              <Link
                href="/calculators/wholesale"
                className="inline-flex items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover"
              >
                Continue in app
              </Link>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-muted">
            <Link href="/tools" className="font-medium text-foreground hover:underline">
              All calculators
            </Link>
            {" · "}
            <Link href="/tools/cap-rate" className="font-medium text-foreground hover:underline">
              Cap rate calculator
            </Link>
            {" · "}
            <Link href="/tools/cash-on-cash" className="font-medium text-foreground hover:underline">
              Cash-on-cash return
            </Link>
            {" · "}
            <Link href="/tools/fix-and-flip" className="font-medium text-foreground hover:underline">
              Fix and flip
            </Link>
            . State pages:{" "}
            <Link href="/tools/wholesale/texas" className="font-medium text-foreground hover:underline">
              Texas
            </Link>
            ,{" "}
            <Link href="/tools/wholesale/florida" className="font-medium text-foreground hover:underline">
              Florida
            </Link>
            ,{" "}
            <Link href="/tools/wholesale/georgia" className="font-medium text-foreground hover:underline">
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
