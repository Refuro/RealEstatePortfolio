import type { Metadata } from "next";
import Link from "next/link";
import { RentVsBuyCalculator } from "@/components/marketing/rent-vs-buy-calculator";

export const metadata: Metadata = {
  title: "Rent vs buy calculator",
  robots: { index: false, follow: true },
};

export default function AppRentVsBuyCalculatorPage() {
  return (
    <div className="px-4 py-8 md:px-6">
      <nav className="text-sm text-muted">
        <Link href="/calculators" className="hover:text-foreground hover:underline">
          Calculators
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Rent vs buy</span>
      </nav>

      <header className="mt-6">
        <p className="text-sm font-medium text-muted">Calculator</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground md:text-3xl">
          Rent vs buy calculator
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted">
          Same break-even simulation and chart as the public tool, inside your workspace.
        </p>
      </header>

      <div className="mt-8">
        <RentVsBuyCalculator surface="app" landingVariant="rent_vs_buy_app" />
      </div>
    </div>
  );
}
