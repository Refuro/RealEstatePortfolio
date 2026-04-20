import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { LandingNav } from "@/components/landing-nav";
import { Footer } from "@/components/footer";
import { StrLtrSlot as StrLtrCalculator } from "@/components/marketing/calculator-page-slots";
import { PlanIntentUrlSync } from "@/components/analytics/plan-intent-url-sync";
import {
  CalculatorFaqJsonLd,
  CalculatorFaqSection,
} from "@/components/marketing/calculator-faq";
import { BreadcrumbJsonLd } from "@/components/marketing/breadcrumb-jsonld";
import { STR_VS_LTR_CALCULATOR_FAQ } from "@/lib/marketing/calculator-faqs";
import { getAppOrigin } from "@/lib/app-url";
import { FunnelCtaLink } from "@/components/marketing/funnel-cta-link";

const APP_URL = getAppOrigin();

export const metadata: Metadata = {
  title: "STR vs LTR Calculator",
  description:
    "Free short-term vs long-term rental calculator: compare cash flow, NOI, DSCR, and cap rate on the same property. Use a free Veld account for saved deals and portfolio tracking.",
  alternates: { canonical: `${APP_URL}/tools/str-vs-ltr` },
  openGraph: {
    title: "STR vs LTR Calculator | Veld Portfolio",
    description:
      "Compare short-term and long-term rental performance with transparent assumptions.",
    url: "/tools/str-vs-ltr",
  },
};

export default async function StrVsLtrCalculatorPage() {
  const { userId } = await auth();
  const supportEmail = process.env.SUPPORT_EMAIL ?? null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Suspense fallback={null}>
        <PlanIntentUrlSync />
      </Suspense>
      <LandingNav userId={userId} landingVariant="str_ltr_v1" />
      <main className="flex-1 px-4 py-12 md:py-14">
        <div className="mx-auto max-w-6xl">
          <CalculatorFaqJsonLd items={STR_VS_LTR_CALCULATOR_FAQ} />
          <BreadcrumbJsonLd
            items={[
              { name: "Calculators", path: "/tools" },
              { name: "STR vs LTR", path: "/tools/str-vs-ltr" },
            ]}
          />
          <nav className="flex items-center gap-1.5 text-sm text-muted" aria-label="Breadcrumb">
            <Link href="/tools" className="transition-colors duration-150 hover:text-foreground">
              Calculators
            </Link>
            <ChevronRight className="size-3.5 text-muted/50" aria-hidden />
            <span className="text-foreground">STR vs LTR</span>
          </nav>
          <header className="hero-animate mt-4 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              STR vs LTR calculator
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base text-muted">
              Compare short-term (nightly) and long-term rent on the same purchase and mortgage.
              Adjust occupancy, platform fees, and rent to see cash flow and coverage.
            </p>
          </header>

          <div className="reveal-up reveal-up-d1 mt-8">
            <StrLtrCalculator showCta landingVariant="str_ltr_v1" />
          </div>

          <CalculatorFaqSection items={STR_VS_LTR_CALCULATOR_FAQ} />

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
                  placement="str_ltr_footer"
                  ctaId="get_started_free"
                  planIntent="free"
                  landingVariant="str_ltr_v1"
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
            <Link href="/tools" className="font-medium text-foreground hover:underline">
              All calculators
            </Link>
            {" · "}
            <Link href="/tools/brrr" className="font-medium text-foreground hover:underline">
              BRRRR calculator
            </Link>
            {" · "}
            <Link
              href="/investment-property-calculator"
              className="font-medium text-foreground hover:underline"
            >
              Investment property calculator
            </Link>
            {" · "}
            <Link href="/tools/fix-and-flip" className="font-medium text-foreground hover:underline">
              Fix and flip
            </Link>
            {" · "}
            <Link href="/tools/dscr" className="font-medium text-foreground hover:underline">
              DSCR
            </Link>
            {" · "}
            <Link href="/tools/cap-rate" className="font-medium text-foreground hover:underline">
              Cap rate calculator
            </Link>
            . State pages:{" "}
            <Link
              href="/tools/str-vs-ltr/florida"
              className="font-medium text-foreground hover:underline"
            >
              Florida
            </Link>
            ,{" "}
            <Link
              href="/tools/str-vs-ltr/arizona"
              className="font-medium text-foreground hover:underline"
            >
              Arizona
            </Link>
            .
          </p>
        </div>
      </main>
      <Footer supportEmail={supportEmail} />
    </div>
  );
}
