import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { LandingNav } from "@/components/landing-nav";
import { Footer } from "@/components/footer";
import { PublicCalculator } from "@/components/marketing/public-calculator";
import { PlanIntentUrlSync } from "@/components/analytics/plan-intent-url-sync";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://veldportfolio.com";

export const metadata: Metadata = {
  title: "Investment Property Calculator",
  description:
    "Free investment property calculator for monthly cash flow, cap rate, DSCR, and cash-on-cash return. Save your analysis by creating a free Veld account.",
  alternates: { canonical: `${APP_URL}/investment-property-calculator` },
  openGraph: {
    title: "Investment Property Calculator | Veld Portfolio",
    description:
      "Estimate rental cash flow and key real estate metrics in seconds. Save your analysis and compare deals in Veld.",
    url: "/investment-property-calculator",
  },
};

function FaqJsonLd() {
  const payload = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do you calculate rental property cash flow?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Cash flow is monthly rent minus monthly expenses and debt service, adjusted for vacancy assumptions.",
        },
      },
      {
        "@type": "Question",
        name: "What is a good DSCR for rental property?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A DSCR above 1.0 generally means NOI covers debt service. Many investors target 1.20 or higher for safety.",
        },
      },
      {
        "@type": "Question",
        name: "Can I save calculator results?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Create a free account to save analyses and continue in the full deal analyzer and portfolio workspace.",
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
          <FaqJsonLd />
          <header className="text-center">
            <p className="text-sm font-medium uppercase tracking-wide text-muted">
              Public calculator
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">
              Investment Property Calculator
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base text-muted">
              Estimate rental property performance with a quick calculator, then save your work in
              Veld to compare deals and track portfolio-level metrics.
            </p>
          </header>

          <div className="mt-8">
            <PublicCalculator showCta landingVariant="calc_control_v1" />
          </div>

          <p className="mt-5 text-center text-sm text-muted">
            Works for single-family and multifamily quick estimates. For scenario comparisons,
            saved analyses, and deal tracking,{" "}
            <Link href="/sign-up?intent=free" className="font-medium text-foreground hover:underline">
              create a free account
            </Link>{" "}
            and continue in the full deal analyzer.
          </p>
        </div>
      </main>
      <Footer supportEmail={supportEmail} />
    </div>
  );
}
