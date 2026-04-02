import type { Metadata } from "next";
import Link from "next/link";
import { BrrrCalculator } from "@/components/marketing/brrr-calculator";

export const metadata: Metadata = {
  title: "BRRRR calculator",
  robots: { index: false, follow: true },
};

export default function AppBrrrCalculatorPage() {
  return (
    <div className="px-4 py-8 md:px-6">
      <nav className="text-sm text-muted">
        <Link href="/calculators" className="hover:text-foreground hover:underline">
          Calculators
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">BRRRR</span>
      </nav>

      <header className="mt-6">
        <p className="text-sm font-medium text-muted">Calculator</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground md:text-3xl">BRRRR calculator</h1>
        <p className="mt-3 max-w-2xl text-base text-muted">
          Interest-only during rehab, then a cash-out refinance at ARV. Confirm assumptions with your
          lender; include reserves, taxes, and insurance in expenses.
        </p>
      </header>

      <div className="mt-8">
        <BrrrCalculator surface="app" landingVariant="brrr_calc_app" />
      </div>
    </div>
  );
}
