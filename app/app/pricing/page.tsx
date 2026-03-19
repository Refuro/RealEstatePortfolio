import Link from "next/link";
import type { Metadata } from "next";
import { getAppUser } from "@/lib/auth";
import { getEffectiveTier } from "@/lib/plans";
import { PricingCards } from "@/components/pricing-cards";
import { Footer } from "@/components/footer";
import { LandingNav } from "@/components/landing-nav";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://veldportfolio.com";

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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingNav userId={user?.id ?? null} />
      <main className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="text-3xl font-semibold text-foreground">Pricing</h1>
            <p className="mx-auto mt-2 max-w-2xl text-base text-muted">
              {user
                ? "Choose a plan based on how many properties you track."
                : "Simple pricing for serious portfolio tracking. Start free, then scale as your portfolio grows."}
            </p>
            {!user && (
              <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm text-muted">
                <span className="rounded-full border border-border/70 px-3 py-1">
                  Secure billing via Stripe
                </span>
                <span className="rounded-full border border-border/70 px-3 py-1">
                  No card required for Free
                </span>
                <span className="rounded-full border border-border/70 px-3 py-1">
                  Cancel anytime
                </span>
              </div>
            )}
          </div>
          <PricingCards
            currentTier={user ? getEffectiveTier(user) : ""}
            className="mt-10"
            showSignUp={!user}
          />
          {!user && (
            <section className="mt-12 rounded-2xl border border-border/70 bg-card/95 p-6 shadow-sm md:p-8">
              <div className="grid gap-6 md:grid-cols-[1.3fr_0.7fr] md:items-center">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Start free and make your first property decision with confidence.
                  </h2>
                  <p className="mt-2 text-sm text-muted">
                    Create your account in under a minute. Track properties, analyze
                    deals, and model scenarios right away.
                  </p>
                  <div className="mt-6 space-y-2">
                    <details className="group rounded-lg border border-border/70 p-3">
                      <summary className="cursor-pointer list-none text-sm font-medium text-foreground">
                        Do I need a credit card to start?
                      </summary>
                      <p className="mt-2 text-sm text-muted">
                        No. Free accounts start without a credit card.
                      </p>
                    </details>
                    <details className="group rounded-lg border border-border/70 p-3">
                      <summary className="cursor-pointer list-none text-sm font-medium text-foreground">
                        What changes between monthly and annual billing?
                      </summary>
                      <p className="mt-2 text-sm text-muted">
                        Features and plan limits are the same. Annual billing lowers
                        total cost.
                      </p>
                    </details>
                    <details className="group rounded-lg border border-border/70 p-3">
                      <summary className="cursor-pointer list-none text-sm font-medium text-foreground">
                        Can I cancel or upgrade later?
                      </summary>
                      <p className="mt-2 text-sm text-muted">
                        Yes. You can update your plan anytime from account settings.
                      </p>
                    </details>
                  </div>
                </div>
                <div className="rounded-xl border border-border/70 bg-background/45 p-4 md:self-center">
                  <p className="text-sm font-medium text-foreground">New to Veld?</p>
                  <Link
                    href="/sign-up"
                    className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
                  >
                    Create free account
                  </Link>
                  <p className="mt-4 text-sm font-medium text-foreground">
                    Returning user?
                  </p>
                  <Link
                    href="/sign-in"
                    className="mt-2 inline-flex w-full items-center justify-center rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-subtle"
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
