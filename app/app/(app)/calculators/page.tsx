import type { Metadata } from "next";
import Link from "next/link";
import { CalculatorsHubCards } from "@/components/calculators/calculators-hub-cards";

export const metadata: Metadata = {
  title: "Calculators",
  description: "BRRRR and rental calculators in your workspace.",
  robots: { index: false, follow: true },
};

export default function AppCalculatorsHubPage() {
  return (
    <div>
      <header>
        <p className="text-sm font-medium uppercase tracking-wide text-muted">Calculators</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Real estate calculators</h1>
        <p className="mt-3 max-w-2xl text-base text-muted">
          Quick estimates with the same math as our marketing pages—without leaving your portfolio
          workspace. For shareable, indexable pages (SEO), use{" "}
          <Link href="/tools" className="font-medium text-foreground hover:underline">
            the public calculators hub
          </Link>
          .
        </p>
      </header>

      <CalculatorsHubCards variant="app" />
    </div>
  );
}
