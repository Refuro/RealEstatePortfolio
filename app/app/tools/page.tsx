import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { LandingNav } from "@/components/landing-nav";
import { Footer } from "@/components/footer";
import { PlanIntentUrlSync } from "@/components/analytics/plan-intent-url-sync";
import { CalculatorsHubCards } from "@/components/calculators/calculators-hub-cards";
import { getAppOrigin } from "@/lib/app-url";

const APP_URL = getAppOrigin();

export const metadata: Metadata = {
  title: "Free real estate calculators",
  description:
    "BRRRR, fix-and-flip, STR vs LTR, rental cash flow, cap rate, and more. Use Veld’s calculators for quick estimates, then save your work in the portfolio workspace.",
  alternates: { canonical: `${APP_URL}/tools` },
  openGraph: {
    title: "Calculators | Veld Portfolio",
    description: "Free calculators for rental, STR vs LTR, BRRRR, and fix-and-flip analysis.",
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
      <main className="flex-1 px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <header>
            <p className="text-sm font-medium uppercase tracking-wide text-muted">Calculators</p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground">Free real estate calculators</h1>
            <p className="mt-3 text-base text-muted">
              Quick, transparent math you can share. Open any calculator below—no account required for
              core estimates. Sign in to save analyses in the full deal workspace.
            </p>
            {userId && (
              <p className="mt-3 text-sm text-muted">
                <Link href="/calculators" className="font-medium text-foreground hover:underline">
                  Continue in app (sidebar)
                </Link>{" "}
                for the same calculators inside your workspace.
              </p>
            )}
          </header>

          <CalculatorsHubCards variant="public" />
        </div>
      </main>
      <Footer supportEmail={supportEmail} />
    </div>
  );
}
