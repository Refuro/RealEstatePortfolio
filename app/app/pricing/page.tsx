import Link from "next/link";
import type { Metadata } from "next";
import { MockupFrame } from "@/components/mockups/mockup-frame";
import { DashboardMockup } from "@/components/mockups/dashboard-mockup";
import { MortgageMockup } from "@/components/mockups/mortgage-mockup";
import { DealAnalyzerMockup } from "@/components/mockups/deal-analyzer-mockup";
import { Suspense } from "react";
import { getAppUser } from "@/lib/auth";
import { PlanIntentUrlSync } from "@/components/analytics/plan-intent-url-sync";
import { getEffectiveTier, isOnTrial, trialDaysRemaining } from "@/lib/plans";
import { PricingCards } from "@/components/pricing-cards";
import { Footer } from "@/components/footer";
import { LandingNav } from "@/components/landing-nav";
import { FunnelCtaLink } from "@/components/marketing/funnel-cta-link";
import { CalculatorFaqJsonLd } from "@/components/marketing/calculator-faq";
import { PRICING_FAQ } from "@/lib/marketing/pricing-faqs";
import { getAppOrigin } from "@/lib/app-url";

const APP_URL = getAppOrigin();

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Veld Portfolio plans: Free, Investor, and Pro. Track 1–20 properties. Rent and value estimates. Sign up to get started.",
  alternates: { canonical: APP_URL + "/pricing" },
  openGraph: {
    title: "Pricing | Veld Portfolio",
    description:
      "Plans for real estate portfolio analytics. Free, Investor, and Pro tiers.",
    url: "/pricing",
  },
};

export default async function PricingPage() {
  const user = await getAppUser();
  const supportEmail = process.env.SUPPORT_EMAIL ?? null;
  const userOnTrial = user ? isOnTrial(user) : false;
  const daysRemaining = user ? trialDaysRemaining(user) : null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Suspense fallback={null}>
        <PlanIntentUrlSync />
      </Suspense>
      <LandingNav userId={user?.id ?? null} />
      <main className="flex-1 px-4 py-12 md:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <CalculatorFaqJsonLd items={PRICING_FAQ} />
          <div className="text-center">
            <h1 className="reveal-up text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Pricing
            </h1>
            <p className="reveal-up reveal-up-d1 mx-auto mt-3 max-w-2xl text-base text-muted md:text-lg">
              {user
                ? "Choose a plan based on how many properties you track."
                : "Every new account starts with 14 days of full Investor access. No credit card required."}
            </p>
            {user && (
              <p className="reveal-up reveal-up-d2 mx-auto mt-4 max-w-2xl text-center text-sm text-muted">
                Manage subscription and billing on{" "}
                <Link
                  href="/plans"
                  className="font-medium text-foreground underline underline-offset-2 transition-colors duration-150 hover:text-accent"
                >
                  Plans &amp; billing
                </Link>
                .
              </p>
            )}
            {!user && (
              <div className="reveal-up reveal-up-d2 mt-5 flex flex-wrap justify-center gap-2 text-sm text-muted">
                <span className="rounded-full border border-border bg-card px-3 py-1 shadow-sm">
                  Secure billing via Stripe
                </span>
                <span className="rounded-full border border-border bg-card px-3 py-1 shadow-sm">
                  No card required for Free
                </span>
                <span className="rounded-full border border-border bg-card px-3 py-1 shadow-sm">
                  Cancel anytime
                </span>
              </div>
            )}
          </div>
          <PricingCards
            currentTier={user ? getEffectiveTier(user) : ""}
            isOnTrial={userOnTrial}
            trialDaysRemaining={daysRemaining}
            className="reveal-up reveal-up-d3 mt-10"
            showSignUp={!user}
            billingPortalReturnPath="/pricing"
          />
          <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted">
            Third-party rent and value estimates share one hourly pool per account by plan: Free 5,
            Investor 10, Pro 20 successful requests. Paid plans renew until you cancel in Settings
            or the billing portal.{" "}
            <Link
              href="/terms#subscriptions-and-payments"
              className="underline underline-offset-2 transition-colors duration-150 hover:text-foreground"
            >
              Billing
            </Link>
            ,{" "}
            <Link
              href="/terms#refunds"
              className="underline underline-offset-2 transition-colors duration-150 hover:text-foreground"
            >
              refunds
            </Link>
            , and{" "}
            <Link
              href="/terms#cancellation"
              className="underline underline-offset-2 transition-colors duration-150 hover:text-foreground"
            >
              cancellation
            </Link>{" "}
            are covered in our Terms.
          </p>

          {/* Feature comparison — desktop table */}
          <section className="mt-16 hidden md:block">
            <div className="mb-3 flex justify-center">
              <span className="inline-flex items-center rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent">
                Features
              </span>
            </div>
            <h2 className="mb-6 text-center text-2xl font-semibold text-foreground">
              Compare plans
            </h2>
            <div className="overflow-hidden rounded-xl border border-border shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-subtle">
                    <th className="px-4 py-3 text-left font-medium text-muted">Feature</th>
                    <th className="px-4 py-3 text-center font-medium text-muted">Free</th>
                    <th className="px-4 py-3 text-center font-medium text-muted">Investor</th>
                    <th className="px-4 py-3 text-center font-medium text-foreground">Pro</th>
                  </tr>
                </thead>
                <tbody>
                  {(
                    [
                      ["Properties tracked", "1", "5", "20"],
                      ["Saved deals", "5", "20", "50"],
                      ["Rent &amp; value estimates", true, true, true],
                      ["Estimate pool (per hour)", "5/hr", "10/hr", "20/hr"],
                      ["Deal analyzer", true, true, true],
                      ["Scenario modeling", true, true, true],
                      ["Mortgage simulator", true, true, true],
                      ["Portfolio charts", true, true, true],
                    ] as [string, string | boolean, string | boolean, string | boolean][]
                  ).map(([feature, free, investor, pro], i) => (
                    <tr
                      key={i}
                      className={`border-b border-border last:border-0 ${i % 2 !== 0 ? "bg-subtle/30" : ""}`}
                    >
                      <td
                        className="px-4 py-3 text-foreground"
                        dangerouslySetInnerHTML={{ __html: feature }}
                      />
                      {([free, investor, pro] as (string | boolean)[]).map((val, j) => (
                        <td key={j} className="px-4 py-3 text-center">
                          {val === true ? (
                            <span className="font-semibold text-positive">✓</span>
                          ) : val === false ? (
                            <span className="text-muted/40">—</span>
                          ) : (
                            <span className={j === 2 ? "font-medium text-foreground" : "text-foreground"}>
                              {val as string}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Feature comparison — mobile accordion */}
          <section className="mt-10 md:hidden">
            <details className="rounded-xl border border-border">
              <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-muted">
                Compare all features
              </summary>
              <div className="divide-y divide-border px-4 pb-4">
                {[
                  ["Properties tracked", "1", "5", "20"],
                  ["Saved deals", "5", "20", "50"],
                  ["Rent & value estimates", "✓", "✓", "✓"],
                  ["Deal analyzer", "✓", "✓", "✓"],
                  ["Scenario modeling", "✓", "✓", "✓"],
                  ["Mortgage simulator", "✓", "✓", "✓"],
                  ["Portfolio charts", "✓", "✓", "✓"],
                ].map(([feature, free, investor, pro], i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-4 py-2.5 text-sm"
                  >
                    <span className="text-foreground">{feature}</span>
                    <div className="flex shrink-0 gap-4 text-xs text-muted">
                      <span>
                        Free: <span className="font-medium text-foreground">{free}</span>
                      </span>
                      <span>
                        Inv: <span className="font-medium text-foreground">{investor}</span>
                      </span>
                      <span>
                        Pro: <span className="font-medium text-foreground">{pro}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </section>

          {/* Pricing FAQ */}
          <section className="mt-16">
            <div className="mb-3 flex justify-center">
              <span className="inline-flex items-center rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent">
                FAQ
              </span>
            </div>
            <h2 className="mb-6 text-center text-2xl font-semibold text-foreground">
              Common questions
            </h2>
            <div className="mx-auto max-w-3xl space-y-2">
              {PRICING_FAQ.map(({ question, answer }) => (
                <details
                  key={question}
                  className="rounded-xl border border-border bg-card"
                >
                  <summary className="cursor-pointer px-5 py-4 text-sm font-medium text-foreground transition-colors duration-150 hover:text-foreground/80">
                    {question}
                  </summary>
                  <p className="px-5 pb-4 text-sm text-muted">{answer}</p>
                </details>
              ))}
            </div>
          </section>

          {!user && (
            <section className="mt-16">
              <div className="mb-3 flex justify-center">
                <span className="inline-flex items-center rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent">
                  Preview
                </span>
              </div>
              <h2 className="mb-8 text-center text-2xl font-semibold text-foreground">
                See it in action
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <MockupFrame
                  className="rounded-xl border border-border shadow-lg md:col-span-2"
                  ariaLabel="Veld Portfolio dashboard showing property value, equity, cash flow, and portfolio metrics"
                >
                  <DashboardMockup />
                </MockupFrame>
                <MockupFrame
                  fitToHeight
                  className="h-[340px] rounded-xl border border-border shadow-lg md:h-[380px] lg:h-[400px]"
                  ariaLabel="Mortgage workspace with payoff simulation and balance projection chart"
                >
                  <MortgageMockup />
                </MockupFrame>
                <MockupFrame
                  fitToHeight
                  className="h-[340px] rounded-xl border border-border shadow-lg md:h-[380px] lg:h-[400px]"
                  ariaLabel="Deal analyzer with income, expenses, deal signal metrics, and investment metrics"
                >
                  <DealAnalyzerMockup />
                </MockupFrame>
              </div>
            </section>
          )}
          {!user && (
            <section className="mt-16 rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
              <div className="grid gap-6 md:grid-cols-[1.3fr_0.7fr] md:items-center">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">
                    Start free. Your first property in under a minute.
                  </h2>
                  <p className="mt-2 text-sm text-muted">
                    Track properties, analyze deals, and model scenarios from day one.
                  </p>
                  <div className="mt-6 space-y-2">
                    <details className="group rounded-lg border border-border p-3 transition-colors duration-150 hover:bg-subtle">
                      <summary className="cursor-pointer list-none text-sm font-medium text-foreground">
                        What changes between monthly and annual billing?
                      </summary>
                      <p className="mt-2 text-sm text-muted">
                        Features and plan limits are the same. Annual billing lowers
                        total cost.
                      </p>
                    </details>
                    <details className="group rounded-lg border border-border p-3 transition-colors duration-150 hover:bg-subtle">
                      <summary className="cursor-pointer list-none text-sm font-medium text-foreground">
                        Can I cancel or upgrade later?
                      </summary>
                      <p className="mt-2 text-sm text-muted">
                        Yes. You can update your plan anytime from{" "}
                        <Link href="/plans" className="font-medium text-foreground underline">
                          Plans &amp; billing
                        </Link>{" "}
                        (or Settings → subscription).
                      </p>
                    </details>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-subtle p-4 md:self-center">
                  <p className="text-sm font-medium text-foreground">New to Veld?</p>
                  <FunnelCtaLink
                    href="/sign-up?intent=free"
                    placement="pricing_footer"
                    ctaId="create_free_account"
                    planIntent="free"
                    className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover"
                  >
                    Start your free trial
                  </FunnelCtaLink>
                  <p className="mt-4 text-sm font-medium text-foreground">
                    Returning user?
                  </p>
                  <Link
                    href="/sign-in"
                    className="mt-2 inline-flex w-full items-center justify-center rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-subtle"
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer supportEmail={supportEmail} />
    </div>
  );
}
