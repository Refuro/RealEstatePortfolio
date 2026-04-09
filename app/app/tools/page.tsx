import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { LandingNav } from "@/components/landing-nav";
import { Footer } from "@/components/footer";
import { PlanIntentUrlSync } from "@/components/analytics/plan-intent-url-sync";
import { CalculatorsHubCards } from "@/components/calculators/calculators-hub-cards";
import { FunnelCtaLink } from "@/components/marketing/funnel-cta-link";
import { getAppOrigin } from "@/lib/app-url";

const APP_URL = getAppOrigin();

export const metadata: Metadata = {
  title: "Free real estate calculators",
  description:
    "Investment property, STR vs LTR, cap rate, cash-on-cash, DSCR, BRRRR, fix and flip, wholesale/MAO, and rent vs buy calculators. Use Veld to run quick estimates and save deals.",
  alternates: { canonical: `${APP_URL}/tools` },
  openGraph: {
    title: "Calculators | Veld Portfolio",
    description:
      "Free calculators for investment property, STR vs LTR, cap rate, cash-on-cash, DSCR, BRRRR, fix and flip, wholesale/MAO, and rent vs buy.",
    url: "/tools",
  },
};

export default async function ToolsHubPage() {
  const { userId } = await auth();
  const supportEmail = process.env.SUPPORT_EMAIL ?? null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Suspense fallback={null}>
        <PlanIntentUrlSync />
      </Suspense>
      <LandingNav userId={userId} landingVariant="tools_hub_v1" />
      <main className="flex-1 px-4 py-12 md:py-14">
        <div className="mx-auto max-w-6xl">
          <header className="hero-animate rounded-xl border border-border bg-card px-6 py-8 text-center shadow-sm md:px-8 md:py-10">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Free real estate calculators
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-base text-muted">
              Quick, transparent math you can share. No account required for core estimates.
              Sign in to save analyses in the full deal workspace.
            </p>
            {!userId && (
              <div className="mt-5">
                <FunnelCtaLink
                  href="/sign-up?intent=free"
                  placement="tools_hub_hero"
                  ctaId="get_started_free"
                  planIntent="free"
                  landingVariant="tools_hub_v1"
                  className="inline-flex items-center gap-1.5 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover"
                >
                  Get started free
                </FunnelCtaLink>
              </div>
            )}
            {userId && (
              <p className="mt-3 text-sm text-muted">
                <Link
                  href="/calculators"
                  className="inline-flex items-center gap-1 font-medium text-accent transition-colors hover:text-accent-hover"
                >
                  Continue in app
                  <ChevronRight className="size-3.5" aria-hidden />
                </Link>
              </p>
            )}
          </header>

          <CalculatorsHubCards variant="public" />

          <p className="reveal-up mt-10 text-center text-sm text-muted" style={{ animationDelay: "300ms" }}>
            <Link href="/resources" className="font-medium text-foreground hover:underline">
              Investor resources
            </Link>
            {" — DSCR, cap rate, cash-on-cash, BRRRR, metrics glossary. "}
            Evaluating other tools? See{" "}
            <Link href="/alternatives/stessa" className="font-medium text-foreground hover:underline">
              Stessa alternative
            </Link>{" "}
            and{" "}
            <Link href="/vs/spreadsheets" className="font-medium text-foreground hover:underline">
              spreadsheets vs Veld
            </Link>
            .
          </p>
        </div>
      </main>
      <Footer supportEmail={supportEmail} />
    </div>
  );
}
