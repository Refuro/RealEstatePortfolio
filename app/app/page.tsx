import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { Footer } from "@/components/footer";
import { LandingNav } from "@/components/landing-nav";
import { PlanIntentUrlSync } from "@/components/analytics/plan-intent-url-sync";
import { FunnelCtaLink } from "@/components/marketing/funnel-cta-link";
const PublicCalculator = dynamic(() =>
  import("@/components/marketing/public-calculator").then((m) => m.PublicCalculator),
  { loading: () => <div className="min-h-[240px]" aria-hidden /> }
);
import {
  LayoutGrid,
  TrendingUp,
  Calculator,
  SlidersHorizontal,
} from "lucide-react";
import { PRICING_DISPLAY } from "@/lib/pricing-display";
import { PLAN_DEAL_LIMITS, PLAN_PROPERTY_LIMITS } from "@/lib/plans";
import { getAppOrigin } from "@/lib/app-url";

const APP_URL = getAppOrigin();

export const metadata: Metadata = {
  title: {
    absolute: "Veld Portfolio — Portfolio Analytics for Real Estate Investors",
  },
  description:
    "Track and analyze your rental property portfolio. Equity, cash flow, rent and value estimates. Replace spreadsheets with Veld.",
  alternates: { canonical: APP_URL + "/" },
  openGraph: {
    title: "Veld Portfolio — Portfolio Analytics for Real Estate Investors",
    description:
      "Track and analyze your rental property portfolio. Equity, cash flow, rent and value estimates.",
    url: "/",
  },
};

const VALUE_PROPS = [
  {
    title: "Replace spreadsheets",
    description: "Equity, debt, and cash flow across every property — always current",
    icon: LayoutGrid,
  },
  {
    title: "Rent & value estimates",
    description: "See what your property could rent for today, pulled from live market data",
    icon: TrendingUp,
  },
  {
    title: "Deal analyzer",
    description: "Analyze deals before you buy",
    icon: Calculator,
  },
  {
    title: "Scenario modeling",
    description: "What-if sliders for rent, value, mortgage",
    icon: SlidersHorizontal,
  },
];

function ValuePropIcon({
  Icon,
}: {
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card sm:size-12">
      <Icon className="size-5 text-muted sm:size-6" aria-hidden />
    </div>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  const { userId } = await auth();
  const params = await searchParams;
  const deletedParam = params.deleted;
  const supportEmail = process.env.SUPPORT_EMAIL ?? null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Suspense fallback={null}>
        <PlanIntentUrlSync />
      </Suspense>
      <LandingNav userId={userId} landingVariant="home_default_v2" />

      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="flex flex-col items-center justify-center gap-6 px-4 py-12 sm:py-16 md:py-20">
          <p className="text-sm font-medium uppercase tracking-wide text-muted">
            Veld Portfolio
          </p>
          <h1 className="max-w-2xl text-center text-3xl font-semibold text-foreground sm:text-4xl md:text-5xl">
            Replace spreadsheet sprawl with one clear view of your rental portfolio
          </h1>
          <p className="max-w-lg text-center text-base text-muted sm:text-lg">
            Equity, cash flow, deal analysis, and rent estimates — all in one workspace built for
            small investors.
          </p>
          {deletedParam === "1" && (
            <p className="max-w-md rounded-lg border border-border bg-card px-4 py-3 text-center text-sm text-foreground">
              Your account has been deactivated. You can sign in again to
              restore it.
            </p>
          )}
          {deletedParam === "permanent" && (
            <p className="max-w-md rounded-lg border border-border bg-card px-4 py-3 text-center text-sm text-foreground">
              Your account and data have been permanently deleted.
            </p>
          )}
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
            {userId ? (
              <>
                <Link
                  href="/dashboard"
                  className="w-full rounded-lg bg-accent px-6 py-3 text-center text-sm font-medium text-accent-foreground hover:bg-accent-hover sm:w-auto"
                >
                  Go to dashboard
                </Link>
                <Link
                  href="/pricing"
                  className="w-full text-center text-sm font-medium text-muted hover:text-foreground hover:underline sm:w-auto"
                >
                  View pricing plans
                </Link>
              </>
            ) : (
              <>
                <FunnelCtaLink
                  href="/sign-up?intent=free"
                  placement="landing_hero"
                  ctaId="get_started_free"
                  planIntent="free"
                  landingVariant="home_default_v2"
                  className="w-full rounded-lg bg-accent px-6 py-3 text-center text-sm font-medium text-accent-foreground hover:bg-accent-hover sm:w-auto"
                >
                  Get started free
                </FunnelCtaLink>
                <FunnelCtaLink
                  href="/pricing"
                  placement="landing_hero"
                  ctaId="view_pricing"
                  landingVariant="home_default_v2"
                  className="w-full text-center text-sm font-medium text-muted hover:text-foreground hover:underline sm:w-auto"
                >
                  See pricing
                </FunnelCtaLink>
              </>
            )}
          </div>
          {!userId && (
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted">
              <span className="rounded-full border border-border/70 px-3 py-1">
                No card required for Free
              </span>
              <span className="rounded-full border border-border/70 px-3 py-1">
                Start in about 60 seconds
              </span>
              <span className="rounded-full border border-border/70 px-3 py-1">Cancel anytime</span>
            </div>
          )}
        </section>

        {/* Calculator preview */}
        <section className="border-t border-border bg-card/30 px-4 py-10 sm:py-14">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-muted">
              Try the free calculator
            </h2>
            <p className="mt-2 text-center text-sm text-muted">
              Estimate cash flow, cap rate, DSCR, and cash-on-cash return before you commit to
              anything.
            </p>
            <div className="mt-6">
              <PublicCalculator compact />
            </div>
            <div className="mt-4 text-center">
              <FunnelCtaLink
                href="/investment-property-calculator"
                placement="landing_how_it_works"
                ctaId="open_public_calculator"
                landingVariant="home_default_v2"
                className="inline-flex rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-subtle"
              >
                Open full calculator
              </FunnelCtaLink>
            </div>
          </div>
        </section>

        {/* Product screenshot */}
        <section className="border-t border-border bg-card/30 px-4 py-10 sm:py-14">
          <div className="mx-auto max-w-5xl">
            <Image
              src="/ScreenDashboard.png"
              alt="Veld Portfolio dashboard showing property value, equity, cash flow, and portfolio metrics"
              className="h-auto w-full rounded-xl border border-border/70 shadow-lg"
              loading="lazy"
              width={1280}
              height={800}
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
            <p className="mt-3 text-center text-sm text-muted">
              One dashboard for equity, cash flow, rent estimates, and portfolio performance across
              all your properties.
            </p>
          </div>
        </section>

        {/* Value props */}
        <section className="border-t border-border bg-card/50 px-4 py-10 sm:py-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-6 text-center text-sm font-semibold uppercase tracking-wide text-muted sm:mb-8">
              What you get
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-8">
              {VALUE_PROPS.map((prop) => (
                <div
                  key={prop.title}
                  className="flex flex-row items-start gap-4 rounded-lg border border-border bg-card p-4 sm:flex-col sm:gap-3 sm:p-6"
                >
                  <ValuePropIcon Icon={prop.icon} />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-foreground">
                      {prop.title}
                    </h3>
                    <p className="mt-0.5 text-sm text-muted sm:mt-1">
                      {prop.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing preview */}
        <section className="border-t border-border px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-2xl font-semibold text-foreground">
              Simple pricing
            </h2>
            <p className="mb-6 text-base text-muted">
              Free, Investor, and Pro plans — start free.
            </p>
            <div className="mb-8 flex flex-wrap items-center justify-center gap-4 text-sm">
              <span className="rounded-md border border-border bg-card px-4 py-2 font-medium text-foreground">
                Free $0 · {PLAN_PROPERTY_LIMITS.free} property · {PLAN_DEAL_LIMITS.free} saved deals
              </span>
              <span className="rounded-md border border-border bg-card px-4 py-2 font-medium text-foreground">
                Investor ${PRICING_DISPLAY.investorMonthly}/mo · {PLAN_PROPERTY_LIMITS.investor} properties ·{" "}
                {PLAN_DEAL_LIMITS.investor} saved deals
              </span>
              <span className="rounded-md border border-border bg-card px-4 py-2 font-medium text-foreground">
                Pro ${PRICING_DISPLAY.proMonthly}/mo · {PLAN_PROPERTY_LIMITS.pro} properties ·{" "}
                {PLAN_DEAL_LIMITS.pro} saved deals
              </span>
            </div>
            <FunnelCtaLink
              href="/pricing"
              placement="landing_pricing_preview"
              ctaId="view_pricing"
              landingVariant="home_default_v2"
              className="inline-flex rounded-lg bg-accent px-6 py-3 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
            >
              View pricing
            </FunnelCtaLink>
          </div>
        </section>
      </main>

      <Footer supportEmail={supportEmail} />
    </div>
  );
}
