import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { LandingNav } from "@/components/landing-nav";
import { Footer } from "@/components/footer";
import { FixAndFlipCalculator } from "@/components/marketing/fix-and-flip-calculator";
import { PlanIntentUrlSync } from "@/components/analytics/plan-intent-url-sync";
import {
  CalculatorFaqJsonLd,
  CalculatorFaqSection,
} from "@/components/marketing/calculator-faq";
import { FIX_AND_FLIP_CALCULATOR_FAQ } from "@/lib/marketing/calculator-faqs";
import { getAppOrigin } from "@/lib/app-url";

const APP_URL = getAppOrigin();

export const metadata: Metadata = {
  title: "Fix and Flip Calculator",
  description:
    "Free fix-and-flip calculator: estimate net profit, total ROI, and annualized return after purchase, rehab, hold, and sale. Educational—track real deals in Veld.",
  alternates: { canonical: `${APP_URL}/tools/fix-and-flip` },
  openGraph: {
    title: "Fix and Flip Calculator | Veld Portfolio",
    description: "Model a flip with IO financing during hold and sale at ARV.",
    url: "/tools/fix-and-flip",
  },
};

export default async function FixAndFlipCalculatorPage() {
  const { userId } = await auth();
  const supportEmail = process.env.SUPPORT_EMAIL ?? null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Suspense fallback={null}>
        <PlanIntentUrlSync />
      </Suspense>
      <LandingNav userId={userId} landingVariant="fix_flip_v1" />
      <main className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <CalculatorFaqJsonLd items={FIX_AND_FLIP_CALCULATOR_FAQ} />
          <nav className="text-sm text-muted">
            <Link href="/tools" className="hover:text-foreground hover:underline">
              Calculators
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Fix and flip</span>
          </nav>
          <header className="mt-4 text-center">
            <p className="text-sm font-medium uppercase tracking-wide text-muted">Calculator</p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground md:text-3xl">
              Fix and flip calculator
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base text-muted">
              Model purchase, rehab, interest-only holding costs, and sale at ARV. Numbers are
              educational—add reserves and verify with your lender and agent.
            </p>
          </header>

          <div className="mt-8">
            <FixAndFlipCalculator showCta landingVariant="fix_flip_v1" />
          </div>

          <CalculatorFaqSection items={FIX_AND_FLIP_CALCULATOR_FAQ} />

          <p className="mt-6 text-center text-sm text-muted">
            <Link href="/tools" className="font-medium text-foreground hover:underline">
              All calculators
            </Link>
            {" · "}
            <Link href="/tools/brrr" className="font-medium text-foreground hover:underline">
              BRRRR calculator
            </Link>
            {" · "}
            <Link href="/tools/str-vs-ltr" className="font-medium text-foreground hover:underline">
              STR vs LTR
            </Link>
            {" · "}
            <Link
              href="/investment-property-calculator"
              className="font-medium text-foreground hover:underline"
            >
              Investment property calculator
            </Link>
            . State pages:{" "}
            <Link
              href="/tools/fix-and-flip/georgia"
              className="font-medium text-foreground hover:underline"
            >
              Georgia
            </Link>
            ,{" "}
            <Link href="/tools/fix-and-flip/ohio" className="font-medium text-foreground hover:underline">
              Ohio
            </Link>
            .
          </p>
        </div>
      </main>
      <Footer supportEmail={supportEmail} />
    </div>
  );
}
