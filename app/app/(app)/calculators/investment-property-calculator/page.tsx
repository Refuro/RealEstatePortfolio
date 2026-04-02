import type { Metadata } from "next";
import Link from "next/link";
import { PublicCalculator } from "@/components/marketing/public-calculator";

export const metadata: Metadata = {
  title: "Investment property calculator",
  robots: { index: false, follow: true },
};

export default function AppInvestmentPropertyCalculatorPage() {
  return (
    <div className="px-4 py-8 md:px-6">
      <nav className="text-sm text-muted">
        <Link href="/calculators" className="hover:text-foreground hover:underline">
          Calculators
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Investment property</span>
      </nav>

      <header className="mt-6 text-left">
        <p className="text-sm font-medium text-muted">Calculator</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground md:text-3xl">
          Investment property calculator
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted">
          Estimate rental performance with a quick calculator, then continue in Analyze or your
          portfolio when you are ready.
        </p>
      </header>

      <div className="mt-8">
        <PublicCalculator surface="app" landingVariant="calc_app_shell" />
      </div>
    </div>
  );
}
