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
  Building2,
  ChevronRight,
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
    description: "Equity, debt, and cash flow across every property — always current. No manual updates.",
    icon: LayoutGrid,
  },
  {
    title: "Rent & value estimates",
    description: "See what your property could rent for today, pulled from live market data. Know if you're above or below market.",
    icon: TrendingUp,
  },
  {
    title: "Deal analyzer",
    description: "Enter purchase price, rent, and expenses. Get cash flow, cap rate, DSCR, and CoC return instantly before you commit.",
    icon: Calculator,
  },
  {
    title: "Scenario modeling",
    description: "What-if sliders for rent, value, and mortgage. See how changes in assumptions affect your returns.",
    icon: SlidersHorizontal,
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Add your properties",
    description: "Enter purchase price, estimated value, rent, expenses, and mortgage details. Takes about 2 minutes per property.",
    icon: Building2,
  },
  {
    step: "02",
    title: "See your portfolio clearly",
    description: "Equity, cash flow, cap rate, and LTV across every property in one dashboard — always current, never a spreadsheet.",
    icon: LayoutGrid,
  },
  {
    step: "03",
    title: "Analyze and model",
    description: "Run deal analyses before buying, model what-if scenarios with sliders, and simulate mortgage payoff.",
    icon: SlidersHorizontal,
  },
];

function ValuePropIcon({
  Icon,
}: {
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 sm:size-11">
      <Icon className="size-5 text-accent sm:size-5" aria-hidden />
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
        <section className="px-4 py-12 sm:py-16 md:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="grid items-center gap-12 lg:grid-cols-[3fr_2fr]">
              {/* Left: copy + CTAs */}
              <div className="flex flex-col items-start gap-5">
                <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                  Replace spreadsheet sprawl with one clear view of your rental portfolio
                </h1>
                <p className="max-w-lg text-base text-muted sm:text-lg">
                  All the numbers that matter — equity, cash flow, rent estimates, and deal analysis — without the spreadsheet chaos.
                </p>
                {deletedParam === "1" && (
                  <p className="max-w-md rounded-lg border border-border bg-card px-4 py-3 text-center text-sm text-foreground">
                    Your account has been deactivated. You can sign in again to restore it.
                  </p>
                )}
                {deletedParam === "permanent" && (
                  <p className="max-w-md rounded-lg border border-border bg-card px-4 py-3 text-center text-sm text-foreground">
                    Your account and data have been permanently deleted.
                  </p>
                )}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  {userId ? (
                    <>
                      <Link
                        href="/dashboard"
                        className="inline-flex items-center rounded-lg bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
                      >
                        Go to dashboard
                      </Link>
                      <Link
                        href="/pricing"
                        className="text-sm font-medium text-muted hover:text-foreground hover:underline"
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
                        className="inline-flex items-center rounded-lg bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
                      >
                        Get started free
                      </FunnelCtaLink>
                      <FunnelCtaLink
                        href="/pricing"
                        placement="landing_hero"
                        ctaId="view_pricing"
                        landingVariant="home_default_v2"
                        className="text-sm font-medium text-muted hover:text-foreground hover:underline"
                      >
                        See pricing
                      </FunnelCtaLink>
                    </>
                  )}
                </div>
                {!userId && (
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                    <span className="rounded-full border border-border/70 px-3 py-1">No card required for Free</span>
                    <span className="rounded-full border border-border/70 px-3 py-1">Start in about 60 seconds</span>
                    <span className="rounded-full border border-border/70 px-3 py-1">Cancel anytime</span>
                  </div>
                )}
              </div>

              {/* Right: product screenshot — hidden on < lg */}
              <div className="hidden lg:block">
                <div className="overflow-hidden rounded-xl border border-border/60 shadow-xl">
                  {/* Faux browser chrome */}
                  <div className="flex items-center gap-1.5 border-b border-border/60 bg-subtle px-3 py-2">
                    <span className="size-2.5 rounded-full bg-border" />
                    <span className="size-2.5 rounded-full bg-border" />
                    <span className="size-2.5 rounded-full bg-border" />
                  </div>
                  <Image
                    src="/ScreenDashboard.png"
                    alt="Veld Portfolio dashboard showing property value, equity, cash flow, and portfolio metrics"
                    className="h-auto w-full"
                    loading="eager"
                    width={1280}
                    height={800}
                    sizes="(max-width: 1280px) 50vw, 640px"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social proof strip */}
        <section className="border-y border-border bg-subtle px-4 py-6">
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center sm:gap-8">
              <p className="text-sm text-muted">
                <span className="font-semibold text-foreground">&ldquo;Finally replaced my spreadsheet.&rdquo;</span>
                {" "}— Small landlord, 4 properties
              </p>
              <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
              <p className="text-sm text-muted">
                <span className="font-semibold text-foreground">&ldquo;The deal analyzer alone is worth it.&rdquo;</span>
                {" "}— First-time investor
              </p>
              <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
              <p className="text-sm text-muted">
                <span className="font-semibold text-foreground">&ldquo;Clear numbers without the chaos.&rdquo;</span>
                {" "}— Portfolio of 8 rentals
              </p>
            </div>
          </div>
        </section>

        {/* Calculator section */}
        <section className="border-b border-border bg-card/40 px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-2xl font-semibold text-foreground">
              Try the free calculator
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted">
              Estimate cash flow, cap rate, DSCR, and cash-on-cash return before you commit to anything. No account required.
            </p>
            <div className="mt-6">
              <PublicCalculator compact />
            </div>
            <div className="mt-4">
              <FunnelCtaLink
                href="/investment-property-calculator"
                placement="landing_how_it_works"
                ctaId="open_public_calculator"
                landingVariant="home_default_v2"
                className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
              >
                Open full calculator
                <ChevronRight className="size-4" aria-hidden />
              </FunnelCtaLink>
            </div>
          </div>
        </section>

        {/* Value props */}
        <section className="border-b border-border px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-2 text-2xl font-semibold text-foreground">
              Everything your portfolio needs
            </h2>
            <p className="mb-8 text-base text-muted">Built for individual investors who want clarity, not complexity.</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-6">
              {VALUE_PROPS.map((prop) => (
                <div
                  key={prop.title}
                  className="flex flex-row items-start gap-4 rounded-xl border border-border bg-card p-5 shadow-sm sm:flex-col sm:gap-3"
                >
                  <ValuePropIcon Icon={prop.icon} />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-foreground">
                      {prop.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                      {prop.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-b border-border bg-card/40 px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-2 text-2xl font-semibold text-foreground">How it works</h2>
            <p className="mb-10 text-base text-muted">Set up your portfolio in minutes. No learning curve.</p>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {HOW_IT_WORKS.map((item) => (
                <div key={item.step} className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-full bg-accent/10 text-sm font-bold text-accent">
                      {item.step}
                    </span>
                    <item.icon className="size-5 text-muted" aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing preview */}
        <section className="px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-2 text-2xl font-semibold text-foreground">Simple pricing</h2>
            <p className="mb-8 text-base text-muted">
              Start free. Upgrade as your portfolio grows.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <p className="text-base font-semibold text-foreground">Free</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">$0<span className="text-base font-normal text-muted">/mo</span></p>
                <p className="mt-2 text-sm text-muted">{PLAN_PROPERTY_LIMITS.free} property · {PLAN_DEAL_LIMITS.free} saved deals</p>
              </div>
              <div className="rounded-xl border border-accent/40 bg-accent/5 p-5 shadow-sm ring-2 ring-accent/20">
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-base font-semibold text-foreground">Investor</p>
                  <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">Popular</span>
                </div>
                <p className="text-2xl font-semibold tabular-nums text-foreground">${PRICING_DISPLAY.investorMonthly}<span className="text-base font-normal text-muted">/mo</span></p>
                <p className="mt-2 text-sm text-muted">{PLAN_PROPERTY_LIMITS.investor} properties · {PLAN_DEAL_LIMITS.investor} saved deals</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <p className="text-base font-semibold text-foreground">Pro</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">${PRICING_DISPLAY.proMonthly}<span className="text-base font-normal text-muted">/mo</span></p>
                <p className="mt-2 text-sm text-muted">{PLAN_PROPERTY_LIMITS.pro} properties · {PLAN_DEAL_LIMITS.pro} saved deals</p>
              </div>
            </div>
            <div className="mt-6">
              <FunnelCtaLink
                href="/pricing"
                placement="landing_pricing_preview"
                ctaId="view_pricing"
                landingVariant="home_default_v2"
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-subtle"
              >
                See full pricing
                <ChevronRight className="size-4" aria-hidden />
              </FunnelCtaLink>
            </div>
          </div>
        </section>
      </main>

      <Footer supportEmail={supportEmail} />
    </div>
  );
}
