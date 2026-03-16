import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getAppUser } from "@/lib/auth";
import { PricingCards } from "@/components/pricing-cards";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Veld Portfolio plans: Free, Investor, and Pro. Track 1–20 properties. Rent and value estimates. Sign up to get started.",
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
      <nav className="flex items-center justify-between border-b border-border px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Veld" width={28} height={28} className="shrink-0" />
          <span className="text-lg font-semibold text-foreground">Veld</span>
        </Link>
        <div className="flex items-center gap-6 text-sm">
          {user && (
            <Link href="/dashboard" className="text-muted hover:text-foreground">
              Dashboard
            </Link>
          )}
          <Link href="/pricing" className="font-medium text-foreground">
            Pricing
          </Link>
          <Link href="/privacy" className="text-muted hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="text-muted hover:text-foreground">
            Terms
          </Link>
          {!user && (
            <>
              <Link href="/sign-in" className="text-muted hover:text-foreground">
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
      <main className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-semibold text-foreground">Pricing</h1>
          <p className="mt-1 text-base text-muted">
            {user
              ? "Choose a plan based on how many properties you track."
              : "Simple pricing. Start free, upgrade as you grow."}
          </p>
          {!user && (
            <p className="mt-2 text-sm text-muted">
              No credit card required for Free.
            </p>
          )}
          <PricingCards
            currentTier={user ? (user.subscriptionTier ?? "free") : ""}
            className="mt-8"
            showSignUp={!user}
          />
          {!user && (
            <div className="mt-12 flex flex-col items-center gap-4 text-center">
              <p className="text-base font-medium text-foreground">
                Ready to get started?
              </p>
              <Link
                href="/sign-up"
                className="rounded-lg bg-accent px-8 py-3 text-base font-medium text-accent-foreground hover:bg-accent-hover"
              >
                Create free account
              </Link>
              <p className="text-sm text-muted">
                Already have an account?{" "}
                <Link href="/sign-in" className="text-foreground underline hover:no-underline">
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer supportEmail={supportEmail} />
    </div>
  );
}
