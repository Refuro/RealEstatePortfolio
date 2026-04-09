import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { LandingNav } from "@/components/landing-nav";
import { Footer } from "@/components/footer";
import { CashOnCashSlot as CashOnCashCalculator } from "@/components/marketing/calculator-page-slots";
import { PlanIntentUrlSync } from "@/components/analytics/plan-intent-url-sync";
import {
  CalculatorFaqJsonLd,
  CalculatorFaqSection,
} from "@/components/marketing/calculator-faq";
import { CASH_ON_CASH_CALCULATOR_FAQ } from "@/lib/marketing/calculator-faqs";
import { getAppOrigin } from "@/lib/app-url";
import { FunnelCtaLink } from "@/components/marketing/funnel-cta-link";

const APP_URL = getAppOrigin();

export const metadata: Metadata = {
  title: "Cash-on-Cash Return Calculator",
  description:
    "Free cash-on-cash return calculator: break out down payment, closing costs, and rehab to compute annual CoC return and break-even. Track deals in Veld.",
  alternates: { canonical: `${APP_URL}/tools/cash-on-cash` },
  openGraph: {
    title: "Cash-on-Cash Return Calculator | Veld Portfolio",
    description: "Calculate cash-on-cash return with a clear upfront cash breakdown.",
    url: "/tools/cash-on-cash",
  },
};

export default async function CashOnCashCalculatorPage() {
  const { userId } = await auth();
  const supportEmail = process.env.SUPPORT_EMAIL ?? null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Suspense fallback={null}>
        <PlanIntentUrlSync />
      </Suspense>
      <LandingNav userId={userId} landingVariant="cash_on_cash_v1" />
      <main className="flex-1 px-4 py-12 md:py-14">
        <div className="mx-auto max-w-6xl">
          <CalculatorFaqJsonLd items={CASH_ON_CASH_CALCULATOR_FAQ} />
          <nav className="flex items-center gap-1.5 text-sm text-muted" aria-label="Breadcrumb">
            <Link href="/tools" className="transition-colors duration-150 hover:text-foreground">
              Calculators
            </Link>
            <ChevronRight className="size-3.5 text-muted/50" aria-hidden />
            <span className="text-foreground">Cash-on-cash</span>
          </nav>
          <header className="hero-animate mt-4 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Cash-on-cash return calculator
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base text-muted">
              Break out cash invested and monthly cash flow to estimate annual return on invested
              capital and your payback timeline.
            </p>
          </header>

          <div className="reveal-up reveal-up-d1 mt-8">
            <CashOnCashCalculator showCta landingVariant="cash_on_cash_v1" />
          </div>

          <div className="reveal-up reveal-up-d2">
            <CalculatorFaqSection items={CASH_ON_CASH_CALCULATOR_FAQ} />
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
                  placement="cash_on_cash_footer"
                  ctaId="get_started_free"
                  planIntent="free"
                  landingVariant="cash_on_cash_v1"
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
                href="/calculators/cash-on-cash"
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
            <Link href="/tools/fix-and-flip" className="font-medium text-foreground hover:underline">
              Fix and flip
            </Link>
            {" · "}
            <Link href="/tools/str-vs-ltr" className="font-medium text-foreground hover:underline">
              STR vs LTR
            </Link>
            . State pages:{" "}
            <Link
              href="/tools/cash-on-cash/texas"
              className="font-medium text-foreground hover:underline"
            >
              Texas
            </Link>
            ,{" "}
            <Link
              href="/tools/cash-on-cash/florida"
              className="font-medium text-foreground hover:underline"
            >
              Florida
            </Link>
            ,{" "}
            <Link
              href="/tools/cash-on-cash/georgia"
              className="font-medium text-foreground hover:underline"
            >
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
