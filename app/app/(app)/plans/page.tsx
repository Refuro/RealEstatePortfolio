import type { Metadata } from "next";
import { getAppUser } from "@/lib/auth";
import { PricingCards } from "@/components/pricing-cards";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Veld Portfolio plans: Free, Investor, and Pro. Upgrade to track more properties.",
};

export default async function PlansPage() {
  const user = await getAppUser();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Pricing</h1>
      <p className="mt-1 text-base text-muted">
        Choose a plan based on how many properties you track.
      </p>
      <PricingCards
        currentTier={user?.subscriptionTier ?? "free"}
        className="mt-8"
        showSignUp={false}
      />
    </div>
  );
}
