import type { Metadata } from "next";
import Link from "next/link";
import { StrLtrCalculator } from "@/components/marketing/str-ltr-calculator";

export const metadata: Metadata = {
  title: "STR vs LTR calculator",
  robots: { index: false, follow: true },
};

export default function AppStrVsLtrCalculatorPage() {
  return (
    <div className="px-4 py-8 md:px-6">
      <nav className="text-sm text-muted">
        <Link href="/calculators" className="hover:text-foreground hover:underline">
          Calculators
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">STR vs LTR</span>
      </nav>

      <header className="mt-6">
        <p className="text-sm font-medium text-muted">Calculator</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground md:text-3xl">
          STR vs LTR calculator
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted">
          Same math as the public tool—compare nightly and long-term rental scenarios without leaving
          your workspace.
        </p>
      </header>

      <div className="mt-8">
        <StrLtrCalculator surface="app" landingVariant="str_ltr_app" />
      </div>
    </div>
  );
}
