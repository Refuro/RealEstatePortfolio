import { getAppUser } from "@/lib/auth";
import { PricingCards } from "./pricing-cards";

export default async function PricingPage() {
  const user = await getAppUser();
  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Pricing</h1>
      <p className="mt-1 text-base text-muted">
        Choose a plan based on how many properties you track.
      </p>
      <PricingCards currentTier={user.subscriptionTier} className="mt-8" />
    </div>
  );
}
