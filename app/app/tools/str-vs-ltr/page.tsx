import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { LandingNav } from "@/components/landing-nav";
import { Footer } from "@/components/footer";
import { StrLtrCalculator } from "@/components/marketing/str-ltr-calculator";
import { PlanIntentUrlSync } from "@/components/analytics/plan-intent-url-sync";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://veldportfolio.com";

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

function FaqJsonLd() {
  const payload = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do STR platform fees affect returns?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Platform fees reduce gross booking revenue before operating expenses. This calculator applies your fee percentage to gross nightly revenue after occupancy.",
        },
      },
      {
        "@type": "Question",
        name: "What occupancy makes short-term rental worth it vs long-term?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "It depends on nightly rate, fees, and expenses. Raise occupancy or nightly rate until STR cash flow and NOI beat your long-term rent scenario on the same financing.",
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

export default async function StrVsLtrCalculatorPage() {
  const { userId } = await auth();
  const supportEmail = process.env.SUPPORT_EMAIL ?? null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Suspense fallback={null}>
        <PlanIntentUrlSync />
      </Suspense>
      <LandingNav userId={userId} landingVariant="str_ltr_v1" />
      <main className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <FaqJsonLd />
          <nav className="text-sm text-muted">
            <Link href="/tools" className="hover:text-foreground hover:underline">
              Calculators
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">STR vs LTR</span>
          </nav>
          <header className="mt-4 text-center">
            <p className="text-sm font-medium uppercase tracking-wide text-muted">Calculator</p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground md:text-3xl">
              STR vs LTR calculator
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-base text-muted">
              Compare short-term (nightly) and long-term rent on the same purchase and mortgage.
              Adjust occupancy, platform fees, and rent to see cash flow and coverage side by side.
            </p>
          </header>

          <div className="mt-8">
            <StrLtrCalculator showCta landingVariant="str_ltr_v1" />
          </div>

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
          </p>
        </div>
      </main>
      <Footer supportEmail={supportEmail} />
    </div>
  );
}
