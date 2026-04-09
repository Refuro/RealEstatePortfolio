import type { Metadata } from "next";
import Link from "next/link";
import { CalculatorsHubCards } from "@/components/calculators/calculators-hub-cards";

export const metadata: Metadata = {
  title: "Calculators",
  description:
    "Investment property, STR vs LTR, cap rate, cash-on-cash, DSCR, BRRRR, fix and flip, wholesale/MAO, and rent vs buy calculators inside your portfolio workspace.",
  robots: { index: false, follow: true },
};

export default function AppCalculatorsHubPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">Real estate calculators</h1>
        <p className="mt-3 max-w-2xl text-base text-muted">
          Run the same calculators as our public tools, with your portfolio context close at hand.
          Want a link you can send to someone? Use the{" "}
          <Link href="/tools" className="font-medium text-foreground hover:underline">
            public calculators hub
          </Link>
          .
        </p>
      </header>

      <CalculatorsHubCards variant="app" />
    </div>
  );
}
