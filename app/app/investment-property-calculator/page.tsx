import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
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
      <main className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <CalculatorFaqJsonLd items={INVESTMENT_PROPERTY_CALCULATOR_FAQ} />
          <header className="text-center">
            <p className="text-sm font-medium uppercase tracking-wide text-muted">Calculator</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">
              Investment Property Calculator
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base text-muted">
              Estimate rental property performance on this page. With a free account, save deals in
              Analyze and track owned properties in your portfolio.
            </p>
          </header>

          <div className="mt-8">
            <PublicCalculator showCta landingVariant="calc_control_v1" />
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
            . For saved deals, portfolio tracking, and comparisons in the app,{" "}
            <Link href="/sign-up?intent=free" className="font-medium text-foreground hover:underline">
              create a free account
            </Link>{" "}
            (calculator inputs are not transferred automatically). Comparing products? See the{" "}
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
        </div>
      </main>
      <Footer supportEmail={supportEmail} />
    </div>
  );
}
