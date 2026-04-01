import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { LandingNav } from "@/components/landing-nav";
import { Footer } from "@/components/footer";
import { BrrrCalculator } from "@/components/marketing/brrr-calculator";
import { PlanIntentUrlSync } from "@/components/analytics/plan-intent-url-sync";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://veldportfolio.com";

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

function FaqJsonLd() {
  const payload = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is BRRRR in real estate investing?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "BRRRR stands for Buy, Rehab, Rent, Refinance, Repeat: acquire a property, improve it, lease it, refinance into a new loan often sized to after-repair value, and redeploy capital. This calculator models interest-only rehab financing and a cash-out refinance at your stated ARV and LTV.",
        },
      },
      {
        "@type": "Question",
        name: "How is refinance cash-out estimated here?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The model applies your refinance LTV to ARV to estimate a new loan amount, then pays off the acquisition loan balance. Proceeds are before closing costs and reserves—add those in your own underwriting.",
        },
      },
      {
        "@type": "Question",
        name: "Will my lender approve these numbers?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. Outputs are educational; lenders use their own appraisal, DSCR, and underwriting rules. Confirm terms, reserves, taxes, and insurance with your lender before relying on any scenario.",
        },
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}

export default async function BrrrCalculatorPage() {
  const { userId } = await auth();
  const supportEmail = process.env.SUPPORT_EMAIL ?? null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Suspense fallback={null}>
        <PlanIntentUrlSync />
      </Suspense>
      <LandingNav userId={userId} landingVariant="brrr_calc_v1" />
      <main className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <FaqJsonLd />
          <nav className="text-sm text-muted">
            <Link href="/tools" className="hover:text-foreground hover:underline">
              Calculators
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">BRRRR</span>
          </nav>
          <header className="mt-4 text-center">
            <p className="text-sm font-medium uppercase tracking-wide text-muted">Calculator</p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground md:text-3xl">BRRRR calculator</h1>
            <p className="mx-auto mt-3 max-w-2xl text-base text-muted">
              Interest-only during rehab, then a cash-out refinance at ARV. Numbers are educational—confirm
              with your lender and include reserves, taxes, and insurance in expenses.
            </p>
          </header>

          <div className="mt-8">
            <BrrrCalculator showCta landingVariant="brrr_calc_v1" />
          </div>

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
          </p>
        </div>
      </main>
      <Footer supportEmail={supportEmail} />
    </div>
  );
}
