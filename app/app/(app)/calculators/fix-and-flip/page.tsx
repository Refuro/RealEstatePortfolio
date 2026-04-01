import type { Metadata } from "next";
import Link from "next/link";
import { FixAndFlipCalculator } from "@/components/marketing/fix-and-flip-calculator";

export const metadata: Metadata = {
  title: "Fix and flip calculator",
  robots: { index: false, follow: true },
};

export default function AppFixAndFlipCalculatorPage() {
  return (
    <div className="px-4 py-8 md:px-6">
      <nav className="text-sm text-muted">
        <Link href="/calculators" className="hover:text-foreground hover:underline">
          Calculators
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Fix and flip</span>
      </nav>

      <header className="mt-6">
        <p className="text-sm font-medium uppercase tracking-wide text-muted">Calculator</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground md:text-3xl">
          Fix and flip calculator
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted">
          Same flip math as the public tool—run scenarios without leaving your workspace.
        </p>
      </header>

      <div className="mt-8">
        <FixAndFlipCalculator surface="app" landingVariant="fix_flip_app" />
      </div>
    </div>
  );
}
