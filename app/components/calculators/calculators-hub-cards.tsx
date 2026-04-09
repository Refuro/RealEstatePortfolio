import Link from "next/link";
import {
  ArrowLeftRight,
  BarChart3,
  ChevronRight,
  Hammer,
  Home,
  Landmark,
  Percent,
  Scale,
  Wallet,
  Wrench,
} from "lucide-react";

export type CalculatorsHubVariant = "public" | "app";

/**
 * Shared calculator hub cards. Public variant uses SEO URLs; app variant keeps users in the shell.
 * Grouped by use case and ordered by priority in each category.
 */
export function CalculatorsHubCards({ variant }: { variant: CalculatorsHubVariant }) {
  const categories = [
    {
      title: "Rental strategy",
      calculators: [
        {
          slug: "investment-property",
          title: "Investment property calculator",
          description:
            "Monthly cash flow, cap rate, DSCR, and cash-on-cash for a stabilized rental.",
          icon: Home,
        },
        {
          slug: "str-vs-ltr",
          title: "STR vs LTR",
          description:
            "Compare short-term and long-term rental income, expenses, and cash flow side by side.",
          icon: ArrowLeftRight,
        },
        {
          slug: "cap-rate",
          title: "Cap rate",
          description:
            "Calculate NOI, cap rate, and gross rent multiplier from purchase, rent, and expenses.",
          icon: Percent,
        },
        {
          slug: "cash-on-cash",
          title: "Cash-on-cash return",
          description:
            "Break out down payment, closing costs, and rehab to estimate annual return on cash invested.",
          icon: Wallet,
        },
        {
          slug: "dscr",
          title: "DSCR",
          description:
            "Calculate debt-service coverage ratio and max qualifying loan at common lender thresholds.",
          icon: Landmark,
        },
      ],
    },
    {
      title: "Transaction",
      calculators: [
        {
          slug: "brrr",
          title: "BRRRR calculator",
          description:
            "Buy, rehab, rent, refinance - estimate cash-out at refi and stabilized cash flow vs ARV.",
          icon: Hammer,
        },
        {
          slug: "fix-and-flip",
          title: "Fix and flip",
          description: "Estimate net profit, ROI, and annualized return across purchase, rehab, and sale.",
          icon: Wrench,
        },
        {
          slug: "wholesale",
          title: "Wholesale / MAO",
          description:
            "Calculate maximum allowable offer with an adjustable ARV multiplier and assignment fee.",
          icon: BarChart3,
        },
      ],
    },
    {
      title: "Compare",
      calculators: [
        {
          slug: "rent-vs-buy",
          title: "Rent vs buy",
          description:
            "Find your break-even year and compare cumulative renting versus owning costs over time.",
          icon: Scale,
        },
      ],
    },
  ] as const;

  const getHref = (slug: string) => {
    if (slug === "investment-property") {
      return variant === "public"
        ? "/investment-property-calculator"
        : "/calculators/investment-property-calculator";
    }
    return variant === "public" ? `/tools/${slug}` : `/calculators/${slug}`;
  };

  const cardLinkClass =
    "block rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-150 hover:border-accent/30 hover:bg-subtle hover:shadow-md";

  return (
    <div className="mt-10 space-y-10">
      {categories.map((category, categoryIndex) => (
        <section key={category.title}>
          <h2
            className="reveal-up text-xl font-semibold text-foreground"
            style={{ animationDelay: `${categoryIndex * 150}ms` }}
          >
            {category.title}
          </h2>
          <ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:auto-rows-fr">
            {category.calculators.map((calculator, calculatorIndex) => {
              const Icon = calculator.icon;
              return (
                <li
                  key={calculator.slug}
                  className="reveal-up h-full"
                  style={{ animationDelay: `${categoryIndex * 150 + (calculatorIndex + 1) * 50}ms` }}
                >
                  <Link href={getHref(calculator.slug)} className={`${cardLinkClass} h-full`}>
                    <div className="flex items-start gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                        <Icon className="size-4 text-accent" aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-foreground">{calculator.title}</h3>
                        <p className="mt-1 text-sm text-muted">{calculator.description}</p>
                        <p className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent">
                          Open calculator
                          <ChevronRight className="size-3.5" aria-hidden />
                        </p>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
