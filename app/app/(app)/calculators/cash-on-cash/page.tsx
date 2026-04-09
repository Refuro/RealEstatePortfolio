import type { Metadata } from "next";
import Link from "next/link";
import { CashOnCashCalculator } from "@/components/marketing/cash-on-cash-calculator";

export const metadata: Metadata = {
  title: "Cash-on-cash return calculator",
  robots: { index: false, follow: true },
};

export default function AppCashOnCashCalculatorPage() {
  return (
    <div className="px-4 py-8 md:px-6">
      <nav className="text-sm text-muted">
        <Link href="/calculators" className="hover:text-foreground hover:underline">
          Calculators
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Cash-on-cash</span>
      </nav>

      <header className="mt-6">
        <p className="text-sm font-medium text-muted">Calculator</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground md:text-3xl">
          Cash-on-cash return calculator
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted">
          Same cash-on-cash math as the public tool, inside your workspace.
        </p>
      </header>

      <div className="mt-8">
        <CashOnCashCalculator surface="app" landingVariant="cash_on_cash_app" />
      </div>
    </div>
  );
}
