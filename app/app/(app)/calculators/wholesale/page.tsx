import type { Metadata } from "next";
import Link from "next/link";
import { WholesaleCalculator } from "@/components/marketing/wholesale-calculator";

export const metadata: Metadata = {
  title: "Wholesale / MAO calculator",
  robots: { index: false, follow: true },
};

export default function AppWholesaleCalculatorPage() {
  return (
    <div className="px-4 py-8 md:px-6">
      <nav className="text-sm text-muted">
        <Link href="/calculators" className="hover:text-foreground hover:underline">
          Calculators
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Wholesale</span>
      </nav>

      <header className="mt-6">
        <p className="text-sm font-medium text-muted">Calculator</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground md:text-3xl">
          Wholesale / MAO calculator
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted">
          Same MAO math as the public tool, inside your workspace.
        </p>
      </header>

      <div className="mt-8">
        <WholesaleCalculator surface="app" landingVariant="wholesale_app" />
      </div>
    </div>
  );
}
